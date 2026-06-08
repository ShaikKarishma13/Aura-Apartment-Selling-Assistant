import asyncio

from services.groq_service import (
    generate_ai_response
)

transcript = """
Hello, I would like to buy a 2BHK apartment in Hyderabad for 60 lakhs.
"""

prompt = f"""
You are a real estate lead analyzer.

Analyze the following transcript and return ONLY:

Property Type:
Budget:
Location:
Intent:
Sentiment:

Transcript:
{transcript}
"""

result = asyncio.run(
    generate_ai_response(
        prompt,
        "English"
    )
)

print(result)