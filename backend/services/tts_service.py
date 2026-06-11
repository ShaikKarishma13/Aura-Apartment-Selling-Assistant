import os
import base64
import logging
import asyncio
from google import genai
from google.genai import types

try:
    import audioop
except ImportError:
    import audioop_lts as audioop

logger = logging.getLogger(__name__)

# Initialize GenAI Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize GenAI client: {e}")

async def _google_translate_tts_fallback(text: str) -> str | None:
    try:
        import urllib.request
        import urllib.parse
        import miniaudio
        
        logger.info("Running Google Translate TTS fallback...")
        sentences = []
        current = ""
        for word in text.split():
            if len(current) + len(word) + 1 < 150:
                current += (" " if current else "") + word
            else:
                sentences.append(current)
                current = word
        if current:
            sentences.append(current)
            
        all_mulaw = bytearray()
        for idx, part_text in enumerate(sentences):
            encoded = urllib.parse.quote_plus(part_text)
            url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q={encoded}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            
            # Fetch without blocking async loop
            mp3_data = await asyncio.to_thread(
                lambda: urllib.request.urlopen(req, timeout=8).read()
            )
            
            decoded = miniaudio.decode(mp3_data)
            if decoded.nchannels == 2:
                mono = audioop.tomono(decoded.samples, 2, 0.5, 0.5)
            else:
                mono = decoded.samples
                
            pcm_8k, _ = audioop.ratecv(mono, 2, 1, decoded.sample_rate, 8000, None)
            mulaw = audioop.lin2ulaw(pcm_8k, 2)
            all_mulaw.extend(mulaw)
            
        if not all_mulaw:
            return None
            
        return base64.b64encode(all_mulaw).decode("utf-8")
        
    except Exception as err:
        logger.error(f"Google Translate TTS fallback failed: {err}", exc_info=True)
        return None

async def text_to_mulaw_base64(text: str) -> str | None:
    """
    Generates speech using Gemini's TTS model. If it fails (due to quota/etc),
    falls back to Google Translate TTS.
    """
    if not client:
        logger.warning("Gemini Client not initialized for TTS. Falling back to Google Translate...")
        return await _google_translate_tts_fallback(text)
        
    try:
        # Generate content with audio modality
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-preview-tts",
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["audio"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Aoede"
                        )
                    )
                )
            )
        )
        
        pcm_24k = None
        for candidate in response.candidates:
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if part.inline_data and part.inline_data.mime_type and "audio/L16" in part.inline_data.mime_type:
                        pcm_24k = part.inline_data.data
                        break
        
        if not pcm_24k:
            logger.error("No audio/L16 data found in Gemini response parts. Falling back to Google Translate...")
            return await _google_translate_tts_fallback(text)
            
        # Resample from 24000Hz to 8000Hz
        pcm_8k, _ = audioop.ratecv(pcm_24k, 2, 1, 24000, 8000, None)
        
        # Convert 16-bit linear PCM to mulaw
        mulaw_data = audioop.lin2ulaw(pcm_8k, 2)
        
        # Base64 encode
        return base64.b64encode(mulaw_data).decode("utf-8")
        
    except Exception as e:
        logger.warning(f"Gemini TTS request failed: {e}. Falling back to Google Translate...")
        return await _google_translate_tts_fallback(text)
