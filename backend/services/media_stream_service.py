"""
Twilio Media Stream service.

Handles:
- mulaw → PCM audio decoding (via audioop-lts for Python 3.13+)
- Audio buffering with configurable chunk duration
- Chunked transcription via faster-whisper
- Active stream registry to bridge Twilio media WS ↔ frontend WS
"""
import asyncio
import base64
import io
import logging
import struct
import tempfile
import time
import wave

try:
    import audioop          # Python ≤ 3.12
except ImportError:
    import audioop_lts as audioop   # Python 3.13+ — audioop-lts drop-in

from services.transcription_service import transcribe_audio, WHISPER_AVAILABLE

logger = logging.getLogger(__name__)

# --- Constants ---
TWILIO_SAMPLE_RATE = 8000      # Twilio sends 8kHz mulaw
WHISPER_SAMPLE_RATE = 16000    # Whisper expects 16kHz
SAMPLE_WIDTH = 2               # 16-bit PCM = 2 bytes per sample
CHUNK_DURATION_SECS = 3        # Transcribe every N seconds of audio


# --- Active Streams Registry ---
# Maps call_sid → dict with frontend websocket, transcript lines, etc.
_active_streams: dict = {}
_streams_lock = asyncio.Lock()


async def register_stream(call_sid: str, frontend_ws, name: str = None, phone: str = None):
    """Register a frontend WebSocket for a given call SID."""
    async with _streams_lock:
        _active_streams[call_sid] = {
            "frontend_ws": frontend_ws,
            "transcript_lines": [],
            "name": name or "Lead",
            "phone": phone or "N/A",
            "completed_event": asyncio.Event(),
            "status": "Calling",
        }
    logger.info(f"Registered stream for call SID {call_sid}")


async def unregister_stream(call_sid: str):
    """Remove a call SID from the active streams."""
    async with _streams_lock:
        if call_sid in _active_streams:
            del _active_streams[call_sid]
            logger.info(f"Unregistered stream for call SID {call_sid}")


async def get_stream(call_sid: str) -> dict | None:
    """Get the stream info for a call SID."""
    async with _streams_lock:
        return _active_streams.get(call_sid)


async def update_stream_status(call_sid: str, status: str):
    """Update the status of a call stream and notify frontend."""
    async with _streams_lock:
        stream = _active_streams.get(call_sid)
        if stream:
            stream["status"] = status

    if stream:
        try:
            await stream["frontend_ws"].send_json({"type": "status", "status": status})
            logger.info(f"Forwarded status '{status}' to frontend for call {call_sid}")
        except Exception as e:
            logger.error(f"Failed to send status to frontend: {e}")

        if status in ("Completed", "Failed"):
            stream["completed_event"].set()


async def send_transcript_to_frontend(call_sid: str, speaker: str, text: str):
    """Send a transcript line to the frontend WebSocket."""
    stream = await get_stream(call_sid)
    if not stream:
        return

    logger.info(f"Sending transcript for call {call_sid} speaker {speaker}: {text}")
    stream["transcript_lines"].append({"speaker": speaker, "text": text})
    try:
        await stream["frontend_ws"].send_json({
            "type": "transcript",
            "speaker": speaker,
            "text": text
        })
    except Exception as e:
        logger.error(f"Failed to send transcript to frontend: {e}")


async def get_all_transcripts(call_sid: str) -> list:
    """Get all transcript lines for a call."""
    stream = await get_stream(call_sid)
    if stream:
        return stream["transcript_lines"]
    return []


async def wait_for_completion(call_sid: str, timeout: float = 120.0) -> bool:
    """Wait until the call completes or timeout. Returns True if completed."""
    stream = await get_stream(call_sid)
    if not stream:
        return False
    try:
        await asyncio.wait_for(stream["completed_event"].wait(), timeout=timeout)
        return True
    except asyncio.TimeoutError:
        logger.warning(f"Timeout waiting for call {call_sid} to complete")
        return False


# --- Audio Processing ---

class AudioBuffer:
    """
    Accumulates decoded PCM audio and triggers transcription
    when enough audio has been buffered.
    """

    def __init__(self, call_sid: str, twilio_ws=None, stream_sid: str = None):
        self.call_sid = call_sid
        self.twilio_ws = twilio_ws
        self.stream_sid = stream_sid
        self.buffer = bytearray()
        self.last_transcribe_time = time.time()
        self._lock = asyncio.Lock()
        self.ratecv_state = None
        # Track turn-taking silence state
        self.silence_secs = 0.0
        self.has_speech = False
        # Buffer inbound audio for the frontend to avoid Web Audio API fatigue
        self.inbound_mulaw_buffer = bytearray()
        # Track total bytes needed for a chunk
        # 16kHz * 2 bytes/sample * CHUNK_DURATION_SECS
        self.chunk_bytes = WHISPER_SAMPLE_RATE * SAMPLE_WIDTH * CHUNK_DURATION_SECS

    async def add_audio(self, mulaw_base64: str):
        """
        Decode a base64 mulaw audio payload from Twilio,
        convert to 16kHz PCM, and add to buffer.
        Triggers transcription if enough audio accumulated.
        """
        try:
            # 1. Decode base64 → raw mulaw bytes
            raw_mulaw = base64.b64decode(mulaw_base64)

            # Buffer raw mulaw for the frontend to avoid browser audio context underruns on tiny 20ms chunks
            async with self._lock:
                self.inbound_mulaw_buffer.extend(raw_mulaw)
                if len(self.inbound_mulaw_buffer) >= 2000:  # 250ms of 8kHz audio (8000 bytes/sec)
                    payload_to_send = base64.b64encode(self.inbound_mulaw_buffer).decode("utf-8")
                    self.inbound_mulaw_buffer.clear()
                    # Forward as a background task to prevent blocking the stream processing
                    asyncio.create_task(self._forward_inbound_audio(payload_to_send))

            # 2. mulaw 8-bit → 16-bit linear PCM (8kHz)
            pcm_8k = audioop.ulaw2lin(raw_mulaw, SAMPLE_WIDTH)

            # 3. Resample 8kHz → 16kHz
            pcm_16k, self.ratecv_state = audioop.ratecv(
                pcm_8k, SAMPLE_WIDTH, 1,
                TWILIO_SAMPLE_RATE, WHISPER_SAMPLE_RATE, self.ratecv_state
            )

            # Calculate RMS of the newly added 20ms block to track silence
            block_rms = audioop.rms(pcm_16k, SAMPLE_WIDTH)
            block_duration = len(pcm_16k) / (WHISPER_SAMPLE_RATE * SAMPLE_WIDTH)

            async with self._lock:
                self.buffer.extend(pcm_16k)
                if block_rms >= 250:
                    self.silence_secs = 0.0
                    self.has_speech = True
                else:
                    self.silence_secs += block_duration

                # Check if we should trigger transcription:
                # 1. User started speaking and has now been silent for 1.2 seconds (end of utterance)
                # 2. Or the buffer has accumulated 15 seconds to prevent memory overflow
                buffer_duration = len(self.buffer) / (WHISPER_SAMPLE_RATE * SAMPLE_WIDTH)
                should_transcribe = False
                if self.has_speech and self.silence_secs >= 1.2:
                    should_transcribe = True
                elif buffer_duration >= 15.0:
                    should_transcribe = True

            if should_transcribe:
                await self._transcribe_buffer()

        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")

    async def flush(self):
        """Force-transcribe any remaining audio in the buffer."""
        async with self._lock:
            if len(self.buffer) > WHISPER_SAMPLE_RATE * SAMPLE_WIDTH:  # At least 1 second
                await self._transcribe_buffer_locked()
            if self.inbound_mulaw_buffer:
                payload_to_send = base64.b64encode(self.inbound_mulaw_buffer).decode("utf-8")
                self.inbound_mulaw_buffer.clear()
                asyncio.create_task(self._forward_inbound_audio(payload_to_send))

    async def _forward_inbound_audio(self, b64_payload: str):
        stream = await get_stream(self.call_sid)
        if stream and stream.get("frontend_ws"):
            try:
                await stream["frontend_ws"].send_json({
                    "type": "audio",
                    "payload": b64_payload
                })
            except Exception:
                pass

    async def _transcribe_buffer(self):
        """Transcribe the current buffer contents."""
        async with self._lock:
            await self._transcribe_buffer_locked()

    async def _transcribe_buffer_locked(self):
        """Internal: transcribe buffer (must hold lock)."""
        if not self.buffer:
            return

        if not WHISPER_AVAILABLE:
            logger.warning("Whisper not available, cannot transcribe audio chunk")
            self.buffer.clear()
            return

        # Copy buffer and clear
        audio_data = bytes(self.buffer)
        self.buffer.clear()
        self.last_transcribe_time = time.time()
        # Reset turn-taking state for the next turn
        self.has_speech = False
        self.silence_secs = 0.0

        # Check RMS volume to prevent Whisper hallucinating on silence/static line noise
        rms = audioop.rms(audio_data, SAMPLE_WIDTH)
        logger.info(f"Audio chunk RMS volume: {rms}")
        if rms < 250:
            logger.info("RMS volume is below speech threshold (250) — skipping transcription")
            return

        # Write to temp WAV and transcribe
        try:
            transcript = await asyncio.to_thread(
                _transcribe_pcm_chunk, audio_data
            )

            if transcript and transcript.strip():
                logger.info(f"Real-time transcript for {self.call_sid}: {transcript}")
                await send_transcript_to_frontend(
                    self.call_sid, "Lead", transcript
                )
                
                # If we have Twilio WS and Stream SID, generate and stream response back to Twilio
                if self.twilio_ws and self.stream_sid:
                    await self._generate_and_send_aura_response(transcript)
        except Exception as e:
            logger.error(f"Transcription failed for call {self.call_sid}: {e}")

    async def _generate_and_send_aura_response(self, lead_text: str):
        """Generate LLM response, send transcript to frontend, generate TTS, and send audio back to Twilio."""
        from services.llm_service import generate_sales_response
        from services.tts_service import text_to_mulaw_base64
        
        stream = await get_stream(self.call_sid)
        if not stream:
            logger.warning(f"No stream found in registry for {self.call_sid}")
            return
            
        class SimpleMessage:
            def __init__(self, role: str, content: str):
                self.role = role
                self.content = content
                
        # Build conversation history
        history = []
        lines = stream.get("transcript_lines", [])[:-1]  # Exclude the lead line we just added
        for line in lines:
            role = "assistant" if line.get("speaker") == "Aura" else "user"
            history.append(SimpleMessage(role, line.get("text", "")))
            
        try:
            logger.info(f"Generating Aura sales response for lead text: '{lead_text}'")
            aura_text = await generate_sales_response(lead_text, history)
            logger.info(f"Generated Aura text response: '{aura_text}'")
            
            # Send Aura transcript line to frontend
            await send_transcript_to_frontend(self.call_sid, "Aura", aura_text)
            
            # Generate TTS audio (mulaw base64)
            logger.info("Generating TTS audio from Aura response...")
            mulaw_b64 = await text_to_mulaw_base64(aura_text)
            
            if mulaw_b64:
                logger.info(f"Sending audio response to Twilio (stream SID: {self.stream_sid})")
                media_msg = {
                    "event": "media",
                    "streamSid": self.stream_sid,
                    "media": {
                        "payload": mulaw_b64
                    }
                }
                await self.twilio_ws.send_json(media_msg)
                
                # Mirror audio response to frontend WebSocket
                if stream and stream.get("frontend_ws"):
                    try:
                        await stream["frontend_ws"].send_json({
                            "type": "audio",
                            "payload": mulaw_b64
                        })
                    except Exception:
                        pass
            else:
                logger.error("TTS audio generation returned empty payload")
        except Exception as e:
            logger.error(f"Error in _generate_and_send_aura_response: {e}", exc_info=True)


def _transcribe_pcm_chunk(pcm_data: bytes) -> str:
    """
    Write PCM data to a temporary WAV file and transcribe with faster-whisper.
    Runs in a thread to avoid blocking the event loop.
    """
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

            # Write proper WAV header + data
            with wave.open(tmp.name, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(SAMPLE_WIDTH)
                wf.setframerate(WHISPER_SAMPLE_RATE)
                wf.writeframes(pcm_data)

        # Transcribe using the existing service
        result = transcribe_audio(tmp_path)
        return result

    except Exception as e:
        logger.error(f"Error in PCM transcription: {e}")
        return ""
    finally:
        if tmp_path:
            try:
                import os
                os.unlink(tmp_path)
            except Exception:
                pass
