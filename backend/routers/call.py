from fastapi import APIRouter
from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(
    prefix="/api/call",
    tags=["Calling"]
)

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


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
        twiml="<Response><Say>Hello from Apartment AI Agent.</Say></Response>"
    )

    return {
        "message": "Call initiated",
        "call_sid": call.sid
    }