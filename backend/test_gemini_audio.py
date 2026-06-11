import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from services.tts_service import text_to_mulaw_base64

async def test_service():
    print("Testing text_to_mulaw_base64...")
    res = await text_to_mulaw_base64("Hello, this is a test of the TTS service.")
    if res:
        print("Success! Mulaw base64 length:", len(res))
        print("Prefix:", res[:100])
    else:
        print("Failed to generate mulaw base64 audio.")

if __name__ == "__main__":
    asyncio.run(test_service())
