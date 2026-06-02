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
        
        twiml="""
<Response>

<Say voice="alice">
Hello. I am Aura, the Apartment Sales Assistant speaking.
</Say>

<Pause length="1"/>

<Say voice="alice">
Thank you for showing interest in our apartment listings.
</Say>

<Pause length="1"/>

<Gather numDigits="1" timeout="10">

<Say voice="alice">
To schedule a site visit, press 1.

To receive a callback later, press 2.

If you are no longer interested, press 3.
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

    return {
        "message": "Call initiated",
        "call_sid": call.sid
    }