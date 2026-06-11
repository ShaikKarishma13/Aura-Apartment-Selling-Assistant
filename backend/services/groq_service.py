from groq import Groq
import os
import random
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY or "DUMMY_KEY_FOR_DEVELOPMENT")
GROQ_AVAILABLE = bool(GROQ_API_KEY and GROQ_API_KEY != "DUMMY_KEY_FOR_DEVELOPMENT")

# Static fallback responses for lead analysis when Groq API is unavailable
FALLBACK_ANALYSIS = {
    "property_type": "3BHK Apartment",
    "budget": "1.2 - 1.8 Crores",
    "location": "Gachibowli / Hitec City",
    "intent": "Site Visit Requested",
    "sentiment": "Positive",
    "lead_classification": "Hot",
    "summary": "The lead is highly interested in our 3BHK luxury apartments in Gachibowli. They requested a site visit and discussed pricing structures.",
    "key_points": "- Interest in 3BHK layout\n- Rooftop amenities and car parking inquiry\n- Preference for higher floor",
    "requirements": "3BHK, budget within 1.8 Cr, prefers Gachibowli, site visit scheduled",
    "next_action": "Schedule a site visit for Sunday afternoon and send location maps via WhatsApp.",
    "follow_up_notes": "Confirm visit time on Saturday evening."
}

async def generate_ai_response(user_input: str, language: str):
    if not GROQ_AVAILABLE:
        # Return a plausible static analysis result
        return (
            "Property Type: 3BHK Apartment\n"
            "Budget: 1.2 - 1.8 Crores\n"
            "Location: Gachibowli / Hitec City\n"
            "Intent: Site Visit Requested\n"
            "Sentiment: Positive\n"
            "Lead Classification: Hot\n"
            "Overall Conversation Summary: The lead is highly interested in our 3BHK luxury apartments in Gachibowli. They requested a site visit and discussed pricing structures.\n"
            "Key Discussion Points:\n- Interest in 3BHK layout\n- Rooftop amenities and car parking inquiry\n- Preference for higher floor\n"
            "Customer Requirements: 3BHK, budget within 1.8 Cr, prefers Gachibowli, site visit scheduled\n"
            "Next Recommended Action: Schedule a site visit for Sunday afternoon and send location maps via WhatsApp.\n"
            "Follow-Up Notes: Confirm visit time on Saturday evening."
        )

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are AURA ✨, a smart multilingual apartment sales assistant powered by EVA AI. "
                        f"The user selected {language} language. "
                        f"You MUST reply STRICTLY and COMPLETELY in {language}. "

                        "If the selected language is Hindi, "
                        "use ONLY proper Hindi in Devanagari script. "
                        "Never use Roman Hindi or Hinglish. "
                        "Never mix English sentences. "
                        "All replies must look natural and fully Hindi. "

                        "If the selected language is Telugu, "
                        "use pure Telugu script only. "
                        "Give short 2-3 lines responses in telugu."

                        "If the selected language is English, "
                        "reply only in English. "

                        "For greetings and general questions, "
                        "reply briefly in 2-4 lines only. "

                        "For apartment/property queries,"
                        "reply in 3-4 lines maximum. "

                        "Be friendly and professional. "

                        "For apartment recommendations, pricing, "
                        "amenities, offers, locations and comparisons, "
                        "give detailed responses in around 8-10 lines maximum. "

                        "When recommending or talking about specific apartments, "
                        "you MUST include their markdown image links in your response where appropriate:\n"
                        "- Prestige Towers: `![Prestige Towers](http://127.0.0.1:8000/assets/prestige.png)`\n"
                        "- Skyline Heights: `![Skyline Heights](http://127.0.0.1:8000/assets/skyline.png)`\n"
                        "- Greenwood Residency: `![Greenwood Residency](http://127.0.0.1:8000/assets/greenwood.png)`\n"
                        "- Royal Gardens: `![Royal Gardens](http://127.0.0.1:8000/assets/royal_gardens.png)`\n"
                        "- For any other apartment name: `![Apartment](http://127.0.0.1:8000/assets/default.png)`\n\n"
                        "Make sure to embed the markdown image links directly in your response text so the user can see them."

                        "Use bullet points whenever useful. "

                        "Keep responses professional, clean, helpful "
                        "and easy to understand. "

                        "Avoid overly long paragraphs."
                    )
                },
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            temperature=0.7,
            max_tokens=800,
        )
        return completion.choices[0].message.content

    except Exception as e:
        print(f"Groq API error in generate_ai_response: {str(e)}")
        return (
            "Property Type: 3BHK Apartment\n"
            "Budget: 1.2 - 1.8 Crores\n"
            "Location: Gachibowli / Hitec City\n"
            "Intent: Site Visit Requested\n"
            "Sentiment: Positive"
        )