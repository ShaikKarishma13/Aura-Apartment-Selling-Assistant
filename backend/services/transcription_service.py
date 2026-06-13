import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize Groq client if key is available
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None
if GROQ_API_KEY and GROQ_API_KEY != "DUMMY_KEY_FOR_DEVELOPMENT":
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialized for cloud Whisper transcription")
    except Exception as e:
        logger.error(f"Failed to initialize Groq client for transcription: {e}")

# Try to import faster_whisper, fall back gracefully if not installed
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("base", compute_type="int8")
    WHISPER_AVAILABLE = True
    logger.info("Local Whisper model loaded successfully")
except Exception as e:
    model = None
    WHISPER_AVAILABLE = False
    logger.warning(f"faster_whisper not available locally: {e}.")


def transcribe_audio(audio_path: str) -> str:
    # 1. Try Groq Whisper API (sub-second latency)
    if groq_client:
        try:
            logger.info(f"Transcribing audio using Groq Whisper API: {audio_path}")
            with open(audio_path, "rb") as audio_file:
                transcription = groq_client.audio.transcriptions.create(
                    file=(os.path.basename(audio_path), audio_file.read()),
                    model="whisper-large-v3",
                    language="en"
                )
            result = transcription.text.strip()
            logger.info(f"Groq Whisper transcription success: {result}")
            return result
        except Exception as e:
            logger.error(f"Groq Whisper transcription failed: {e}. Falling back to local/default...")

    # 2. Fallback to local faster-whisper
    if not WHISPER_AVAILABLE or model is None:
        logger.warning("Whisper not available — returning placeholder transcript")
        return "Transcript unavailable. Please install faster-whisper for full transcription support."

    try:
        segments, info = model.transcribe(audio_path, language="en", vad_filter=True)
        transcript = ""
        for segment in segments:
            transcript += segment.text + " "
        return transcript.strip()
    except Exception as e:
        logger.error(f"Local transcription error: {e}")
        return "Transcription failed. Please check the audio file."