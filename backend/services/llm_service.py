import os
from groq import AsyncGroq
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Initialize Groq Client asynchronously. Requires GROQ_API_KEY in environment.
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

SYSTEM_PROMPT = """
You are a persuasive, professional, and empathetic real estate sales agent named Alex.
Your primary goal is to sell luxury apartments by:
1. Asking qualifying questions (budget, timeline, preferred area).
2. Highlighting key property benefits that align with their answers.
3. Handling objections gracefully (e.g., if price is too high, stress value/amenities).
4. Pushing to schedule a physical site visit.

Keep your responses concise, natural, and highly conversational. Sound like a human on the phone, never a robotic AI. Do not use bullet points or markdown formatting as your responses will be spoken aloud.
"""

async def generate_sales_response(user_input: str, history: list) -> str:
    try:
        # Format history for Groq API
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        
        messages.append({"role": "user", "content": user_input})
        
        response = await client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=200,
        )
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error generating LLM response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate conversational response.")
