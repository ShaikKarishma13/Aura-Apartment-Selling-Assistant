import asyncio
import re

from services.groq_service import (
    generate_ai_response
)


async def analyze_lead(transcript):

    prompt = f"""
Analyze this real estate lead.

Return ONLY in this format:

Property Type: ...
Budget: ...
Location: ...
Intent: ...
Sentiment: ...

Transcript:
{transcript}
"""

    result = await generate_ai_response(
        prompt,
        "English"
    )

    return {
        "raw": result,

        "property_type":
            extract_field(
                result,
                "Property Type"
            ),

        "budget":
            extract_field(
                result,
                "Budget"
            ),

        "location":
            extract_field(
                result,
                "Location"
            ),

        "intent":
            extract_field(
                result,
                "Intent"
            ),

        "sentiment":
            extract_field(
                result,
                "Sentiment"
            ),
    }


def extract_field(text, field):

    match = re.search(
        rf"{field}:\s*(.*)",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return ""