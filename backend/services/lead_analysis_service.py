import asyncio
import re

from services.groq_service import (
    generate_ai_response
)


async def analyze_lead(transcript):

    prompt = f"""
Analyze this real estate call transcript between the AI agent (Aura) and a lead/customer.

Return ONLY in this format:
Property Type: <type of property desired, e.g. 3BHK Apartment>
Budget: <budget details, e.g. 1.5 Crores>
Location: <preferred location, e.g. Gachibowli>
Intent: <intent, e.g. Site Visit>
Sentiment: <sentiment, e.g. Positive>
Lead Classification: <Hot, Warm, or Cold based on interest level>
Overall Conversation Summary: <a concise summary of the entire conversation>
Key Discussion Points: <bulleted list of key discussion points>
Customer Requirements: <specific requirements mentioned by the customer>
Next Recommended Action: <what the agent should do next>
Follow-Up Notes: <any notes for follow-up>

Transcript:
{transcript}
"""

    result = await generate_ai_response(
        prompt,
        "English"
    )

    return {
        "raw": result,
        "property_type": extract_field(result, "Property Type"),
        "budget": extract_field(result, "Budget"),
        "location": extract_field(result, "Location"),
        "intent": extract_field(result, "Intent"),
        "sentiment": extract_field(result, "Sentiment"),
        "lead_classification": extract_field(result, "Lead Classification"),
        "summary": extract_field(result, "Overall Conversation Summary"),
        "key_points": extract_field(result, "Key Discussion Points"),
        "requirements": extract_field(result, "Customer Requirements"),
        "next_action": extract_field(result, "Next Recommended Action"),
        "follow_up_notes": extract_field(result, "Follow-Up Notes")
    }


def extract_field(text, field):
    # Regex to find field value up to next field name or end of text.
    # We look for a line starting with a capital word and a colon.
    pattern = rf"{field}:\s*(.*?)(?=\n[A-Za-z\s]+:|$)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    # Fallback to single-line match if pattern failed
    match = re.search(rf"{field}:\s*(.*)", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    return ""