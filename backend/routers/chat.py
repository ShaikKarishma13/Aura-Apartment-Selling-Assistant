from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from services.groq_service import generate_ai_response

from models.pydantic_schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage
)

from models.schema import Interaction, LeadStatus, User, Property,  PropertyLead

from services.llm_service import generate_sales_response
from services.lead_scoring import classify_lead

import logging

router = APIRouter(
    prefix="/api/chat",
    tags=["Conversational AI"]
)

logger = logging.getLogger(__name__)
# LEAD CAPTURE MEMORY
lead_stage = {}
lead_property = {}
lead_name = {}
lead_phone = {}


@router.post("/ai-chat")
async def ai_chat(
    data: dict,
    db: Session = Depends(get_db)
):
    try:

        user_message = data.get("message", "")
        language = data.get("language", "English")

        message_lower = user_message.lower()
        visitor_id = "visitor"

        # -------------------------
        # WAITING FOR NAME
        # -------------------------

        if lead_stage.get(visitor_id) == "waiting_name":

            lead_name[visitor_id] = user_message

            lead_stage[visitor_id] = "waiting_phone"

            return {
                "reply": (
                    f"Thanks {user_message}! 😊\n\n"
                    f"Please share your phone number."
                )
            }

        # -------------------------
        # WAITING FOR PHONE
        # -------------------------

        if lead_stage.get(visitor_id) == "waiting_phone":

            lead_phone[visitor_id] = user_message

            lead_stage[visitor_id] = "waiting_date"

            return {
                "reply": (
                    "Thank you! 😊\n\n"
                    "Please enter a preferred visit date.\n"
                    "Example: 10 June 2026"
                )
            }
                # -------------------------
        # WAITING FOR DATE
        # -------------------------

        if lead_stage.get(visitor_id) == "waiting_date":

            visit_date = user_message

            lead = PropertyLead(
                name=lead_name.get(visitor_id),
                phone=lead_phone.get(visitor_id),
                property_name=lead_property.get(visitor_id),
                status=f"Site Visit: {visit_date}",
                visit_date=visit_date
            )

            db.add(lead)
            db.commit()

            # Clear memory

            lead_stage.pop(visitor_id, None)
            lead_name.pop(visitor_id, None)
            lead_phone.pop(visitor_id, None)
            lead_property.pop(visitor_id, None)

            return {
                "reply": (
                    "✅ Thank you!\n\n"
                    "Your site visit request has been submitted successfully.\n\n"
                    "Our sales team will contact you shortly.\n\n"
                    "Have a great day!😊"
                )
            }

        # -------------------------
        # INTEREST DETECTION
        # -------------------------

        interest_keywords = [
            "interested",
            "book",
            "site visit",
            "visit",
            "schedule",
            "contact",
            "call me",
            
        ]

        interested = any(
            keyword in message_lower
            for keyword in interest_keywords
        )

        if interested:

            lead_stage[visitor_id] = "waiting_name"

            lead_property[visitor_id] = (
                user_message
            .replace("i am interested in", "")
            .replace("am interested in", "")
            .replace("interested in", "")
            .strip()
            )

            return {
                "reply": (
                    "Great! 🏠\n\n"
                    "I'd be happy to help.\n\n"
                    "Please share your name."
                )
            }

        # -------------------------
        # GROQ RESPONSE
        # -------------------------

        ai_response = await generate_ai_response(
            user_message,
            language
        )

        return {
            "reply": ai_response
        }

    except Exception as e:

        print("AI CHAT ERROR:", str(e))

        return {
            "reply": f"Error: {str(e)}"
        }
