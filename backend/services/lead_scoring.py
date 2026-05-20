import os
import json
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

SCORING_PROMPT = """
You are an expert Real Estate Lead Analyst. 
Review the following conversation between an AI Sales Agent and a Customer.
Classify the lead based on their intent to buy or visit the property.

Categories:
- "Hot": Very interested, asked about pricing, ready for a site visit.
- "Warm": Interested but has reservations, needs more info, budget might be tight.
- "Cold": Not interested, hang up, annoyed, or clearly outside budget.

Reply ONLY with a valid JSON in exactly this format:
{"classification": "Hot|Warm|Cold", "reason": "<one short sentence explaining why>"}
"""

async def classify_lead(history: list) -> dict:
    """Evaluates the conversation history and scores the lead."""
    try:
        # Convert Pydantic history sequence into a readable text transcript
        conversation_script = "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in history])
        
        # If the conversation is empty or brand new, default to Warm
        if len(history) < 2:
           return {"classification": "Warm", "reason": "Conversation just started."}

        messages = [
            {"role": "system", "content": SCORING_PROMPT},
            {"role": "user", "content": f"Conversation Transcript:\n{conversation_script}"}
        ]
        
        response = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.1, # Low temperature forces deterministic JSON format
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        return json.loads(result_content)
        
    except Exception as e:
        logger.error(f"Lead Classification failed: {str(e)}")
        return {"classification": "Warm", "reason": "Analysis failed, defaulting to Warm"}
