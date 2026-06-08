import asyncio

from services.lead_analysis_service import (
    analyze_lead
)
from services.transcription_service import (
    transcribe_audio
)
from fastapi import APIRouter
from twilio.rest import Client
from dotenv import load_dotenv
import os
from database.db import SessionLocal
from models.schema import CallHistory
from models.pydantic_schemas import CallHistoryCreate

load_dotenv()

router = APIRouter(
    prefix="/api/call",
    tags=["Calling"]
)

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
DEFAULT_RECORDING_URL = "http://127.0.0.1:8000/recordings/call1.mp3"


@router.post("/make-call")
def make_call(phone: str):
    print("PHONE RECEIVED:", phone)

    client = Client(
        ACCOUNT_SID,
        AUTH_TOKEN
    )
    phone = "+91" + phone

    call = client.calls.create(
        to=phone,
        from_=TWILIO_NUMBER,
        
        twiml="""
<Response>
<Record
    maxLength="120"
    playBeep="false"
/>


<Say voice="alice">
Hello. I am Aura, the Apartment Sales Assistant speaking.
</Say>

<Say voice="alice">
Hello. I am Aura, the Apartment Sales Assistant speaking.
</Say>

<Pause length="1"/>

<Say voice="alice">
Thank you for showing interest in our apartment listings.
</Say>

<Pause length="1"/>

<Gather
    input="speech"
    speechTimeout="auto"
    timeout="30"
>

<Say voice="alice">
Please tell us about your property requirements.

For example, you can tell us the apartment type,
budget, 
preferred location,
and whether you are interested in a site visit. 


After speaking, please wait a few seconds.
</Say>

</Gather>

<Say voice="alice">
Thank you for your response.
Our sales team will contact you shortly.
Goodbye.
</Say>

</Response> 
"""
    )
    print("CALL SID:", call.sid)

    return {
        "message": "Call initiated",
        "call_sid": call.sid
    }

@router.post("/save-history")
def save_call_history(data: dict):

    print("RECEIVED DATA:", data)

    audio_path = r"C:\Aura-Clean\recordings\call1.mp3"

    try:
        transcript = transcribe_audio(audio_path)
    except Exception as e:
        print("TRANSCRIPTION ERROR:", str(e))
        transcript = "Transcript unavailable. Please check the recording file."

    print("TRANSCRIPT:", transcript)

    try:
        analysis = asyncio.run(
            analyze_lead(transcript)
        )
    except Exception as e:
        print("ANALYSIS ERROR:", str(e))
        analysis = {
            "property_type": "",
            "budget": "",
            "location": "",
            "intent": "",
            "sentiment": data.get("sentiment", "")
        }

    db = SessionLocal()

    call = CallHistory(
        name=data.get("name"),
        phone=data.get("phone"),
        duration=data.get("duration"),

        transcript=transcript,

        recording_url=data.get("recording_url") or DEFAULT_RECORDING_URL,

        property_type=analysis.get("property_type"),
        budget=analysis.get("budget"),
        location=analysis.get("location"),
        intent=analysis.get("intent"),

        sentiment=analysis.get("sentiment"),

        status=data.get("status")
    )

    try:

        db.add(call)

        print("BEFORE COMMIT")

        db.commit()

        print("AFTER COMMIT")

        db.refresh(call)

        print("SAVED ID:", call.id)

        return {
            "message": "Call history saved",
            "id": call.id,
            "analysis": analysis
        }

    except Exception as e:

        print("DATABASE ERROR:", str(e))

        db.rollback()

        return {
            "error": str(e)
        }

    finally:

        db.close()
@router.get("/history")
def get_call_history():

    db = SessionLocal()

    calls = (
        db.query(CallHistory)
        .order_by(CallHistory.id.desc())
        .all()
    )

    for call in calls:
        if not call.recording_url:
            call.recording_url = DEFAULT_RECORDING_URL

    db.close()

    return calls
