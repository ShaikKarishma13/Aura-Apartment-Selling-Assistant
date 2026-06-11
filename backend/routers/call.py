import asyncio
import json
import logging

logger = logging.getLogger(__name__)

from services.lead_analysis_service import analyze_lead
from services.transcription_service import transcribe_audio
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from dotenv import load_dotenv
import os
from database.db import SessionLocal
from models.schema import CallHistory
from models.pydantic_schemas import CallHistoryCreate

# Optional twilio import
try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TwilioClient = None
    TWILIO_AVAILABLE = False
    logger.warning("twilio package not installed — Twilio calling mode unavailable")

load_dotenv(override=True)

router = APIRouter(
    prefix="/api/call",
    tags=["Calling"]
)

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
# NGROK_URL is intentionally NOT cached here — it is re-read dynamically
# at every request so backend restarts are not needed when the URL changes.
DEFAULT_RECORDING_URL = "http://127.0.0.1:8000/recordings/call1.mp3"


# ---------------------------------------------------------------------------
# LEGACY: simple make-call endpoint (kept for backward compat)
# ---------------------------------------------------------------------------

@router.post("/make-call")
def make_call(phone: str):
    logger.info(f"Call initiation requested for phone: {phone}")

    if not TWILIO_AVAILABLE:
        logger.error("Twilio not installed. Run: pip install twilio")
        return {"error": "Twilio not installed. Run: pip install twilio"}

    client = TwilioClient(ACCOUNT_SID, AUTH_TOKEN)
    phone = "+91" + phone if not phone.startswith("+91") else phone

    load_dotenv(override=True)
    ngrok = os.getenv("NGROK_URL", "").rstrip("/")
    status_callback_url = f"{ngrok}/api/call/status-callback" if ngrok else None

    try:
        call_kwargs = {
            "to": phone,
            "from_": TWILIO_NUMBER,
            "twiml": """
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

</Response> """
        }
        
        if status_callback_url:
            call_kwargs["status_callback"] = status_callback_url
            call_kwargs["status_callback_event"] = ["initiated", "ringing", "answered", "completed"]
            call_kwargs["status_callback_method"] = "POST"

        call = client.calls.create(**call_kwargs)
        logger.info(f"Twilio Call SID: {call.sid} successfully created for {phone}")

        return {
            "message": "Call initiated",
            "call_sid": call.sid
        }
    except Exception as e:
        logger.error(f"Failed to initiate Twilio call: {str(e)}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# LEGACY: save-history / history endpoints
# ---------------------------------------------------------------------------

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
        analysis = asyncio.run(analyze_lead(transcript))
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
        return {"error": str(e)}
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


# ---------------------------------------------------------------------------
# PHASE 2 — TwiML webhook (Twilio fetches this when the call is answered)
# ---------------------------------------------------------------------------

@router.get("/twiml")
@router.post("/twiml")
async def twiml_handler(request: Request):
    """
    Twilio calls this URL when the lead answers.
    Returns TwiML that:
      1. Greets the lead with Aura's voice
      2. Opens a Media Stream websocket back to our backend for real-time audio
    """
    from services.media_stream_service import update_stream_status, send_transcript_to_frontend

    # Reload NGROK_URL in case it was set after startup
    load_dotenv(override=True)
    ngrok_url = os.getenv("NGROK_URL", "").rstrip("/")
    if not ngrok_url:
        logger.error("/twiml called but NGROK_URL is not set in .env")
        # Fallback: just say something so the call doesn't go silent
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, Aura is currently unavailable. Please try again later.</Say>
</Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Extract CallSid to send initial status update and greeting
    call_sid = ""
    if request.method == "POST":
        try:
            form = await request.form()
            call_sid = form.get("CallSid", "")
        except Exception:
            pass
    if not call_sid:
        call_sid = request.query_params.get("CallSid", "")

    # Convert https:// to wss:// for the WebSocket stream URL
    ws_base = ngrok_url.replace("https://", "wss://").replace("http://", "ws://")
    stream_url = f"{ws_base}/api/call/twilio-media-stream"

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="{stream_url}" />
  </Connect>
  <Say voice="alice">
    Thank you for speaking with us. Our sales team will be in touch shortly. Goodbye.
  </Say>
</Response>"""

    if call_sid:
        logger.info(f"Setting stream status for call {call_sid} to Answered")
        await update_stream_status(call_sid, "Answered")

    logger.info(f"TwiML served. Stream URL: {stream_url}")
    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# PHASE 2 — Status Callback (Twilio POSTs call status events here)
# ---------------------------------------------------------------------------

@router.post("/status-callback")
async def status_callback(request: Request):
    """
    Twilio posts call status events here:
    initiated → ringing → in-progress → completed / failed / busy / no-answer
    We map them to frontend-friendly labels and forward via the active stream registry.
    """
    from services.media_stream_service import update_stream_status

    form = await request.form()
    call_sid = form.get("CallSid", "")
    twilio_status = form.get("CallStatus", "")

    STATUS_MAP = {
        "queued":      "Calling",
        "initiated":   "Calling",
        "ringing":     "Ringing",
        "in-progress": "Answered",
        "answered":    "Answered",
        "completed":   "Completed",
        "failed":      "Failed",
        "busy":        "Failed",
        "no-answer":   "Failed",
        "canceled":    "Failed",
    }

    mapped = STATUS_MAP.get(twilio_status, twilio_status.title())
    logger.info(f"[StatusCallback] Call SID={call_sid} | Status: {mapped} (Raw: {twilio_status})")

    try:
        await update_stream_status(call_sid, mapped)
    except Exception as e:
        logger.debug(f"Could not update stream status (likely no active stream): {e}")

    return Response(content="", status_code=204)


# ---------------------------------------------------------------------------
# PHASE 2 — Twilio Media Stream WebSocket
# ---------------------------------------------------------------------------

@router.websocket("/twilio-media-stream")
async def twilio_media_stream(websocket: WebSocket):
    """
    Twilio connects here via WebSocket when Media Streams is active.
    Receives JSON frames with base64-encoded mulaw audio.
    Decodes, buffers, transcribes with faster-whisper, and forwards
    transcript lines to the frontend WebSocket via the active stream registry.
    """
    from services.media_stream_service import AudioBuffer, send_transcript_to_frontend, update_stream_status

    await websocket.accept()
    logger.info("Twilio Media Stream WebSocket connected")

    call_sid: str = None
    audio_buffer: AudioBuffer = None

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            event = msg.get("event", "")

            if event == "connected":
                logger.info(f"Twilio media stream connected: {msg}")

            elif event == "start":
                call_sid = msg.get("start", {}).get("callSid") or msg.get("callSid")
                if not call_sid:
                    # Try top-level field
                    call_sid = msg.get("callSid")
                stream_sid = msg.get("start", {}).get("streamSid") or msg.get("streamSid")
                logger.info(f"Media stream started for call SID: {call_sid}, stream SID: {stream_sid}")
                if call_sid:
                    audio_buffer = AudioBuffer(call_sid, websocket, stream_sid)
                    # Notify frontend that media stream is in progress
                    await update_stream_status(call_sid, "In Progress")
                    
                    # Generate and play initial greeting dynamically so it streams to the browser
                    from services.tts_service import text_to_mulaw_base64
                    from services.media_stream_service import send_transcript_to_frontend
                    greeting_text = (
                        "Hello. I am Aura, your apartment sales assistant. "
                        "I am calling regarding your property interest. "
                        "Please tell me about your requirements."
                    )
                    await send_transcript_to_frontend(call_sid, "Aura", greeting_text)
                    try:
                        logger.info("Generating and sending initial greeting TTS to Twilio...")
                        mulaw_b64 = await text_to_mulaw_base64(greeting_text)
                        if mulaw_b64:
                            # Send to Twilio
                            await websocket.send_json({
                                "event": "media",
                                "streamSid": stream_sid,
                                "media": {
                                    "payload": mulaw_b64
                                }
                            })
                            # Mirror to frontend
                            from services.media_stream_service import get_stream
                            stream = await get_stream(call_sid)
                            if stream and stream.get("frontend_ws"):
                                try:
                                    await stream["frontend_ws"].send_json({
                                        "type": "audio",
                                        "payload": mulaw_b64
                                    })
                                except Exception:
                                    pass
                    except Exception as e:
                        logger.error(f"Failed to play initial greeting: {e}")

            elif event == "media":
                # Temporary debug: log first few media events to a file
                try:
                    import os
                    debug_file = r"C:\Aura-Clean\media_events.txt"
                    # Limit file size / entries
                    if not os.path.exists(debug_file) or os.path.getsize(debug_file) < 20000:
                        with open(debug_file, "a") as f:
                            f.write(f"EVENT: {json.dumps(msg)[:1000]}\n")
                except Exception as log_err:
                    logger.error(f"Debug logging error: {log_err}")

                if audio_buffer and call_sid:
                    media_data = msg.get("media", {})
                    track = media_data.get("track")
                    payload = media_data.get("payload", "")
                    # Process ONLY the inbound track (caller's voice)
                    # Ignore the outbound track to prevent assistant self-transcription loop
                    if track == "inbound" and payload:
                        await audio_buffer.add_audio(payload)

            elif event == "stop":
                logger.info(f"Media stream stopped for call SID: {call_sid}")
                if audio_buffer and call_sid:
                    # Flush any remaining audio
                    await audio_buffer.flush()
                break

    except WebSocketDisconnect:
        logger.info(f"Twilio Media Stream WebSocket disconnected (call SID: {call_sid})")
    except Exception as e:
        logger.error(f"Error in Twilio Media Stream handler: {e}", exc_info=True)
    finally:
        if audio_buffer and call_sid:
            try:
                await audio_buffer.flush()
            except Exception:
                pass
        logger.info(f"Media stream handler done for call SID: {call_sid}")


# ---------------------------------------------------------------------------
# REAL-TIME CALLING & WEB SIMULATION SUPPORT
# ---------------------------------------------------------------------------

import random
from services.llm_service import generate_sales_response, GROQ_AVAILABLE, client as async_groq_client
from services.lead_scoring import classify_lead


class SimpleMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


# ---------------------------------------------------------------------------
# REAL-TIME CALLING SUPPORT
# ---------------------------------------------------------------------------

def update_lead_status_in_db(phone: str, new_status: str):
    db = SessionLocal()
    try:
        from models.schema import PropertyLead
        search_phone = phone
        if phone.startswith("+91"):
            search_phone = phone[3:]
        lead = db.query(PropertyLead).filter(PropertyLead.phone == search_phone).first()
        if lead:
            lead.status = new_status
            db.commit()
            print(f"Updated lead {lead.name} status to {new_status}")
        else:
            print(f"Lead with phone {search_phone} not found for status update")
    except Exception as e:
        print(f"Error updating lead status: {str(e)}")
        db.rollback()
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Main WebSocket: ws-active
# Enforces real outbound call with live Media Streams
# ---------------------------------------------------------------------------

@router.websocket("/ws-active")
async def websocket_active_call(websocket: WebSocket):
    phone = websocket.query_params.get("phone")
    name = websocket.query_params.get("name")
    mode = websocket.query_params.get("mode", "twilio")

    from services.media_stream_service import (
        register_stream, unregister_stream, wait_for_completion,
        get_all_transcripts, update_stream_status
    )

    await websocket.accept()
    print(f"WS Active Call established: phone={phone}, name={name}, mode={mode}")
    recording_url = DEFAULT_RECORDING_URL

    # 1. State: Calling (twilio sends its own status via callback)
    await websocket.send_json({"type": "status", "status": "Calling"})
    await asyncio.sleep(0.5)

    history = []
    full_transcript_lines = []

    load_dotenv(override=True)
    ngrok = os.getenv("NGROK_URL", "").rstrip("/")

    if not TWILIO_AVAILABLE:
        await websocket.send_json({"type": "error", "message": "Twilio not installed."})
        await websocket.send_json({"type": "status", "status": "Failed"})
        return

    if not ACCOUNT_SID or not AUTH_TOKEN or not TWILIO_NUMBER:
        await websocket.send_json({"type": "error", "message": "Twilio credentials not configured."})
        await websocket.send_json({"type": "status", "status": "Failed"})
        return

    if not ngrok:
        await websocket.send_json({
            "type": "error",
            "message": (
                "NGROK_URL is not set in backend/.env. "
                "Start ngrok (ngrok http 8000), copy the https URL, "
                "paste it as NGROK_URL in .env, then restart the backend."
            )
        })
        await websocket.send_json({"type": "status", "status": "Failed"})
        return

    try:
        client = TwilioClient(ACCOUNT_SID, AUTH_TOKEN)
        to_phone = "+91" + phone if not phone.startswith("+91") else phone

        # Register frontend WS in the active streams registry BEFORE placing the call
        # so that status-callback and media-stream handlers can find it immediately
        await register_stream(call_sid="pending", frontend_ws=websocket, name=name, phone=phone)

        logger.info(f"Placing Twilio call to {to_phone} from {TWILIO_NUMBER}")
        logger.info(f"TwiML URL: {ngrok}/api/call/twiml")
        logger.info(f"Status callback: {ngrok}/api/call/status-callback")

        try:
            call = client.calls.create(
                to=to_phone,
                from_=TWILIO_NUMBER,
                url=f"{ngrok}/api/call/twiml",
                status_callback=f"{ngrok}/api/call/status-callback",
                status_callback_event=["initiated", "ringing", "answered", "completed"],
                status_callback_method="POST",
            )
        except Exception as twilio_err:
            logger.error(f"Failed to place Twilio call: {twilio_err}")
            await unregister_stream("pending")
            await websocket.send_json({"type": "error", "message": f"Twilio call failed: {twilio_err}"})
            await websocket.send_json({"type": "status", "status": "Failed"})
            return

        call_sid = call.sid
        logger.info(f"Twilio call placed. SID: {call_sid}")
        await websocket.send_json({"type": "twilio_sid", "sid": call_sid})

        # Re-register under the real call SID
        await unregister_stream("pending")
        await register_stream(call_sid=call_sid, frontend_ws=websocket, name=name, phone=phone)

        # Define a background task to read from the websocket to detect client disconnect/messages
        async def websocket_reader():
            try:
                while True:
                    data = await websocket.receive_json()
                    if data.get("type") == "end_call":
                        logger.info(f"Client requested to end call: {call_sid}")
                        try:
                            await asyncio.to_thread(client.calls(call_sid).update, status="completed")
                        except Exception as twilio_err:
                            logger.error(f"Failed to end Twilio call via API: {twilio_err}")
            except WebSocketDisconnect:
                logger.info(f"Client websocket disconnected for call {call_sid}")
            except Exception as e:
                logger.error(f"Error in websocket reader for call {call_sid}: {e}")

        reader_task = asyncio.create_task(websocket_reader())
        completion_task = asyncio.create_task(wait_for_completion(call_sid, timeout=300.0))

        # Wait for either the call to complete or the client to disconnect
        done, pending = await asyncio.wait(
            [completion_task, reader_task],
            return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel whichever is still pending
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        completed = False
        if completion_task in done:
            completed = completion_task.result()

        # If reader task exited first (client disconnected or clicked end call), hang up the Twilio call immediately
        if reader_task in done:
            logger.info(f"WS disconnected or end_call received. Ensuring Twilio call {call_sid} is completed.")
            try:
                await asyncio.to_thread(client.calls(call_sid).update, status="completed")
            except Exception as twilio_err:
                logger.debug(f"Failed to force-complete Twilio call (might already be completed): {twilio_err}")

        # Retrieve real transcript from the stream registry
        transcript_lines = await get_all_transcripts(call_sid)
        full_transcript_lines = [f"{t['speaker']}: {t['text']}" for t in transcript_lines]

        if not full_transcript_lines:
            full_transcript_lines = [
                f"System: Outbound Twilio call placed to {name or 'Lead'} ({phone}).",
                f"System: Call SID: {call_sid}.",
                "System: No speech transcript was captured." if completed else "System: Call did not complete within timeout.",
            ]

        history = [
            SimpleMessage(
                "system",
                f"Outbound Twilio call to {name or 'Lead'} ({phone}). SID: {call_sid}. "
                f"{'Completed.' if completed else 'Timed out.'}"
            )
        ]

        await unregister_stream(call_sid)

    except Exception as e:
        logger.error(f"Error in Twilio call handler: {e}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "message": f"Twilio call error: {e}"})
            await websocket.send_json({"type": "status", "status": "Failed"})
        except Exception:
            pass
        return

    # -----------------------------------------------------------------------
    # Post-call: mark Completed, analyse, save to DB
    # -----------------------------------------------------------------------
    try:
        await websocket.send_json({"type": "status", "status": "Completed"})
    except Exception:
        pass

    transcript = "\n".join(full_transcript_lines)

    try:
        analysis = await analyze_lead(transcript)
    except Exception as e:
        print("Analysis failed:", str(e))
        analysis = {
            "property_type": "3BHK Apartment",
            "budget": "Medium (1.5 Cr)",
            "location": "Gachibowli",
            "intent": "Site Visit",
            "sentiment": "Positive",
            "lead_classification": "Warm",
            "summary": "Analysis failed fallback summary",
            "key_points": "N/A",
            "requirements": "N/A",
            "next_action": "N/A",
            "follow_up_notes": "N/A"
        }

    # Extract lead classification from LLM analysis
    lead_status = analysis.get("lead_classification", "Warm")
    if not lead_status or lead_status.strip() not in ("Hot", "Warm", "Cold"):
        try:
            classification = await classify_lead(history)
            lead_status = classification.get("classification", "Warm")
        except Exception as e:
            print("Classification failed:", str(e))
            lead_status = "Warm"

    db = SessionLocal()
    try:
        call_rec = CallHistory(
            name=name or "Unknown",
            phone=phone or "N/A",
            duration=max(len(full_transcript_lines) * 5, 20),
            transcript=transcript,
            recording_url=recording_url,
            property_type=analysis.get("property_type"),
            budget=analysis.get("budget"),
            location=analysis.get("location"),
            intent=analysis.get("intent"),
            sentiment=analysis.get("sentiment"),
            status=lead_status,
            summary=analysis.get("summary"),
            key_points=analysis.get("key_points"),
            requirements=analysis.get("requirements"),
            next_action=analysis.get("next_action"),
            follow_up_notes=analysis.get("follow_up_notes")
        )
        db.add(call_rec)
        db.commit()
        db.refresh(call_rec)

        update_lead_status_in_db(phone, lead_status)

        try:
            await websocket.send_json({
                "type": "summary",
                "id": call_rec.id,
                "analysis": {
                    "property_type": call_rec.property_type,
                    "budget": call_rec.budget,
                    "location": call_rec.location,
                    "intent": call_rec.intent,
                    "sentiment": call_rec.sentiment,
                    "status": lead_status,
                    "summary": call_rec.summary,
                    "key_points": call_rec.key_points,
                    "requirements": call_rec.requirements,
                    "next_action": call_rec.next_action,
                    "follow_up_notes": call_rec.follow_up_notes
                }
            })
        except Exception:
            pass
    except Exception as e:
        print("Database save error:", str(e))
        db.rollback()
    finally:
        db.close()


@router.post("/send-confirmation")
async def send_confirmation(data: dict):
    phone = data.get("phone")
    name = data.get("name", "there")
    property_name = data.get("property_name")
    visit_date = data.get("visit_date")
    channel = data.get("channel", "sms") # "sms" or "whatsapp"
    message_body = data.get("message_body")

    if not phone:
        return {"success": False, "error": "Phone number is required."}

    if not TWILIO_AVAILABLE:
        return {"success": False, "error": "Twilio package is not installed."}

    if not ACCOUNT_SID or not AUTH_TOKEN or not TWILIO_NUMBER:
        return {"success": False, "error": "Twilio credentials are not fully configured in environment."}

    # Standardize phone number format for India (+91) if 10-digits
    to_phone = phone.strip()
    if not to_phone.startswith("+"):
        if len(to_phone) == 10:
            to_phone = "+91" + to_phone
        else:
            to_phone = "+" + to_phone

    # Build default template if message_body is empty
    if not message_body:
        if visit_date and property_name:
            message_body = f"Hi {name}, Aura here! Confirming your scheduled site visit for {property_name} on {visit_date}. See you soon! 🏠"
        elif property_name:
            message_body = f"Hi {name}, Aura here! Thank you for showing interest in {property_name}. Let me know if you would like to schedule a site visit! 🏠"
        else:
            message_body = f"Hi {name}, Aura here! Confirming our recent conversation about apartment listings. Let me know if you would like to schedule a site visit! 🏠"

    try:
        client = TwilioClient(ACCOUNT_SID, AUTH_TOKEN)
        if channel == "whatsapp":
            whatsapp_sender = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
            if not whatsapp_sender.startswith("whatsapp:"):
                whatsapp_sender = "whatsapp:" + whatsapp_sender
            to_whatsapp = to_phone
            if not to_whatsapp.startswith("whatsapp:"):
                to_whatsapp = "whatsapp:" + to_whatsapp

            message = client.messages.create(
                body=message_body,
                from_=whatsapp_sender,
                to=to_whatsapp
            )
        else:
            message = client.messages.create(
                body=message_body,
                from_=TWILIO_NUMBER,
                to=to_phone
            )
        logger.info(f"Twilio message sent successfully via {channel}. SID: {message.sid}")
        return {"success": True, "sid": message.sid, "message": f"Confirmation sent successfully via {channel.upper()}!"}
    except Exception as e:
        logger.error(f"Failed to send Twilio message: {str(e)}")
        return {"success": False, "error": str(e)}


