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
You are a persuasive, professional, and empathetic real estate sales agent named Aura.
Your primary goal is to sell luxury apartments by:
1. Asking qualifying questions (budget, timeline, preferred area).
2. Highlighting key property benefits that align with their answers.
3. Handling objections gracefully (e.g., if price is too high, stress value/amenities).
4. Pushing to schedule a physical site visit.

Keep your responses concise, natural, and highly conversational. Sound like a human on the phone, never a robotic AI. Do not use bullet points or markdown formatting as your responses will be spoken aloud.
"""

# Static fallback responses for when Groq API is not available
AURA_FALLBACK_RESPONSES = [
    "That's great to hear! We have some excellent 3BHK apartments available in Gachibowli with world-class amenities. What is your preferred move-in timeline?",
    "Absolutely! Our Skyline Heights project offers luxury apartments starting from 1.2 Crores. The amenities include a rooftop pool, gym, and 24/7 security. Would you like to schedule a site visit?",
    "I completely understand. Let me tell you about our EMI options — you can own this beautiful apartment for as low as 45,000 rupees per month. Does that sound workable for your budget?",
    "Our Gachibowli properties are in the heart of the IT corridor, close to all major tech parks. Many of our customers have seen excellent appreciation in property value. Shall I book you for this Sunday's open house?",
    "We also have properties in Hitec City and Kondapur if you prefer. Both are in premium locations with excellent connectivity. Which area interests you more?",
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
