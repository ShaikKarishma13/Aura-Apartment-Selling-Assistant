from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from openpyxl import Workbook
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from services.groq_service import generate_ai_response

from models.pydantic_schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage
)

from models.schema import Interaction, LeadStatus, User, Property, PropertyLead, ChatHistory


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
        visitor_id = data.get(
            "visitor_id",
           "visitor"
        )

        # Save User Message

        user_chat = ChatHistory(
            visitor_id=visitor_id,
            role="user",
            message=user_message
        )

        db.add(user_chat)
        db.commit()

        # -------------------------
        # WAITING FOR NAME
        # -------------------------

        if lead_stage.get(visitor_id) == "waiting_name":

            lead_name[visitor_id] = user_message

            lead_stage[visitor_id] = "waiting_phone"


            
            reply_text = (
                f"Thanks {user_message}! 😊\n\n"
                f"Please share your phone number."
            )
            assistant_chat = ChatHistory(
                visitor_id=visitor_id,
                role="assistant",
                message=reply_text
            )
            db.add(assistant_chat)
            db.commit()

            return {
                "reply": reply_text
            }
            
            

        # -------------------------
        # WAITING FOR PHONE
        # -------------------------

        if lead_stage.get(visitor_id) == "waiting_phone":

            lead_phone[visitor_id] = user_message

            lead_stage[visitor_id] = "waiting_date"


            
            reply_text = (
                    "Thank you! 😊\n\n"
                    "Please enter a preferred visit date.\n"
                    "Example: 10 June 2026"
            )
            assistant_chat = ChatHistory(
                visitor_id=visitor_id,
                role="assistant",
                message=reply_text
            )
            db.add(assistant_chat)
            db.commit()

            return {
                "reply": reply_text
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


            
            reply_text = (
                    "✅ Thank you!\n\n"
                    "Your site visit request has been submitted successfully.\n\n"
                    "Our sales team will contact you shortly.\n\n"
                    "Have a great day!😊"
                )
            assistant_chat = ChatHistory(
                visitor_id=visitor_id,
                role="assistant",
                message=reply_text
            )
            db.add(assistant_chat)
            db.commit()

            return {
                "reply": reply_text
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

            
            reply_text = (
                "Great! 🏠\n\n"
                "I'd be happy to help.\n\n"
                "Please share your name."
            )
            assistant_chat = ChatHistory(
                visitor_id=visitor_id,
                role="assistant",
                message=reply_text
            )
            db.add(assistant_chat)
            db.commit()

            return {
                    "reply": reply_text
            }

            

        # -------------------------
        # GROQ RESPONSE
        # -------------------------

        ai_response = await generate_ai_response(
            user_message,
            language
        )
        # Save Assistant message
        assistant_chat = ChatHistory(
            visitor_id=visitor_id,
            role="assistant",
            message=ai_response
        )
        db.add(assistant_chat)
        db.commit()

        return {
            "reply": ai_response
        }

    except Exception as e:

        print("AI CHAT ERROR:", str(e))

        return {
            "reply": f"Error: {str(e)}"
        }
@router.get("/chat-history/{visitor_id}")
def get_chat_history(
    visitor_id: str,
    db: Session = Depends(get_db)
):

    chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.visitor_id == visitor_id
        )
        .order_by(ChatHistory.id.asc())
        .all()
    )

    return [
        {
            "role": chat.role,
            "message": chat.message
        }
        for chat in chats
    ]
@router.get("/all-leads")
def get_all_leads(
    db: Session = Depends(get_db)
):

    leads = (
        db.query(PropertyLead)
        .order_by(PropertyLead.created_at.desc())
        .all()
    )

    return [
        {
            "name": lead.name,
            "phone": lead.phone,
            "property_name": lead.property_name,
            "budget": lead.budget,
            "location": lead.location,
            "status": lead.status,
            "visit_date": lead.visit_date,
            "follow_up_date": lead.follow_up_date,
            "notes": lead.notes,
            "created_at": lead.created_at
        }
        for lead in leads
    ]
@router.put("/update-property-lead/{phone}")
def update_property_lead(
    phone: str,
    data: dict,
    db: Session = Depends(get_db)
):

    lead = (
        db.query(PropertyLead)
        .filter(PropertyLead.phone == phone)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    lead.budget = data.get("budget")

    lead.location = data.get("location")

    lead.follow_up_date = data.get(
        "follow_up_date"
    )

    lead.notes = data.get("notes")

    db.commit()

    return {
        "message": "Lead updated successfully"
    }
@router.delete("/delete-lead/{phone}")
def delete_lead(
    phone: str,
    db: Session = Depends(get_db)
):

    lead = (
        db.query(PropertyLead)
        .filter(PropertyLead.phone == phone)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    db.delete(lead)

    db.commit()

    return {
        "message": "Lead deleted successfully"
    }
@router.get("/export-leads")
def export_leads(
    db: Session = Depends(get_db)
):

    leads = db.query(PropertyLead).all()

    workbook = Workbook()

    sheet = workbook.active

    sheet.title = "Leads"

    headers = [
        "Name",
        "Phone",
        "Property",
        "Budget",
        "Location",
        "Status",
        "Visit Date",
        "Follow Up Date"
    ]

    sheet.append(headers)

    for lead in leads:

        sheet.append([
            lead.name,
            lead.phone,
            lead.property_name,
            lead.budget,
            lead.location,
            lead.status,
            lead.visit_date,
            lead.follow_up_date
        ])

    file_name = "leads.xlsx"

    workbook.save(file_name)

    return FileResponse(
        path=file_name,
        filename=file_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )