from groq import Groq
import os

from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


async def generate_ai_response(user_input: str,language: str):


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
    "reply in 3-4 lines maximum"

    "Be friendly and professional"

    "For apartment recommendations, pricing, "
    "amenities, offers, locations and comparisons, "
    "give detailed responses in around 8-10 lines maximum. "

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