import os
import json
import random
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY or "DUMMY_KEY_FOR_DEVELOPMENT")
GROQ_AVAILABLE = bool(GROQ_API_KEY and GROQ_API_KEY != "DUMMY_KEY_FOR_DEVELOPMENT")

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
    
    # If the conversation is empty or brand new, default to Warm
    if len(history) < 2:
        return {"classification": "Warm", "reason": "Conversation just started."}

    if not GROQ_AVAILABLE:
        logger.warning("GROQ_API_KEY not set — using static lead classification")
        # Simple keyword-based fallback classification
        full_text = " ".join([msg.content.lower() for msg in history])
        if any(w in full_text for w in ["site visit", "book", "interested", "yes", "schedule", "visit"]):
            return {"classification": "Hot", "reason": "Customer expressed interest in site visit."}
        elif any(w in full_text for w in ["maybe", "think", "budget", "consider", "later"]):
            return {"classification": "Warm", "reason": "Customer showed moderate interest but needs more time."}
        else:
            return {"classification": "Warm", "reason": "Standard engagement, follow up recommended."}

    try:
        # Convert Pydantic history sequence into a readable text transcript
        conversation_script = "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in history])
        
        messages = [
            {"role": "system", "content": SCORING_PROMPT},
            {"role": "user", "content": f"Conversation Transcript:\n{conversation_script}"}
        ]
        
        response = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.1,  # Low temperature forces deterministic JSON format
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        return json.loads(result_content)
        
    except Exception as e:
        logger.error(f"Lead Classification failed: {str(e)}")
        return {"classification": "Warm", "reason": "Analysis failed, defaulting to Warm"}
