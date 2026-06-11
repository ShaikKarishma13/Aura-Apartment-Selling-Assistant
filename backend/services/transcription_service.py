import logging

logger = logging.getLogger(__name__)

# Try to import faster_whisper, fall back gracefully if not installed
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("base", compute_type="int8")
    WHISPER_AVAILABLE = True
    logger.info("Whisper model loaded successfully")
except Exception as e:
    model = None
    WHISPER_AVAILABLE = False
    logger.warning(f"faster_whisper not available: {e}. Transcription will use fallback.")


def transcribe_audio(audio_path: str) -> str:
    if not WHISPER_AVAILABLE or model is None:
        logger.warning("Whisper not available — returning placeholder transcript")
        return "Transcript unavailable. Please install faster-whisper for full transcription support."

    try:
        segments, info = model.transcribe(audio_path, language="en")
        transcript = ""
        for segment in segments:
            transcript += segment.text + " "
        return transcript.strip()
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return "Transcription failed. Please check the audio file."