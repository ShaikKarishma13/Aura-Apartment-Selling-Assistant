import os
import random
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)

# Initialize Groq Client asynchronously. Requires GROQ_API_KEY in environment.
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY or "DUMMY_KEY_FOR_DEVELOPMENT")

GROQ_AVAILABLE = bool(GROQ_API_KEY and GROQ_API_KEY != "DUMMY_KEY_FOR_DEVELOPMENT")

SYSTEM_PROMPT = """
You are a persuasive, professional, and empathetic real estate sales agent named Aura, speaking to a lead on a live phone call.

CRITICAL INSTRUCTIONS FOR VOICE CALL BREVITY:
- You are on a phone call. Keep responses extremely short, natural, and conversational.
- Write AT MOST 1 or 2 short sentences per turn (under 25 words total).
- Never list multiple properties or long descriptions in a single turn. 
- Focus on one topic or ask one simple question at a time to keep the conversation turn-based.
- Do not use bullet points, markdown formatting, or list structures.
"""

# Static fallback responses for when Groq API is not available
AURA_FALLBACK_RESPONSES = [
    "That's great! We have excellent options in Gachibowli. What is your preferred move-in timeline?",
    "Absolutely! Our project has premium amenities. Would you like to schedule a site visit this Sunday?",
    "I understand. We also have flexible EMI options. Does that sound workable for your budget?",
    "Our properties are in the heart of the IT corridor. Shall I book you for a viewing this weekend?",
    "We have great options in Hitec City and Kondapur. Which area do you prefer?",
]

async def generate_sales_response(user_input: str, history: list) -> str:
    if not GROQ_AVAILABLE:
        logger.warning("GROQ_API_KEY not set — using static fallback responses")
        return random.choice(AURA_FALLBACK_RESPONSES)

    try:
        # Format history for Groq API
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        
        messages.append({"role": "user", "content": user_input})
        
        response = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=200,
        )
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error generating LLM response: {str(e)}")
        return random.choice(AURA_FALLBACK_RESPONSES)
