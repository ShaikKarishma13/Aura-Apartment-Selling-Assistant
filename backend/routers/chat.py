from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database.db import get_db

from models.pydantic_schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage
)

from models.schema import Interaction, LeadStatus, User

from services.llm_service import generate_sales_response
from services.lead_scoring import classify_lead

import logging

router = APIRouter(
    prefix="/api/chat",
    tags=["Conversational AI"]
)

logger = logging.getLogger(__name__)


@router.post("/process-input", response_model=ChatResponse)
async def process_chat_input(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Processing chat input for session: {request.session_id}")

    # Generate AI response
    bot_response = await generate_sales_response(
        user_input=request.user_input,
        history=request.history
    )

    # Lead analysis
    full_history = request.history + [
        ChatMessage(role="assistant", content=bot_response)
    ]

    analysis = await classify_lead(full_history)

    # Create user
    new_user = User(
        name=request.name,
        phone=request.phone,
        budget=request.budget,
        location=request.location
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Save interaction
    user_interaction = Interaction(
        user_id=new_user.id,
        message=request.user_input,
        response=bot_response,
        source="text"
    )

    db.add(user_interaction)

    # Save lead status
    lead_status = LeadStatus(
        user_id=new_user.id,
        status=request.status,
        score=85 if request.status == "Hot" else 60
    )

    db.add(lead_status)

    db.commit()

    return ChatResponse(
        response_text=bot_response,
        sentiment=analysis.get("reason", "No reason provided"),
        detected_intent=analysis.get("classification", "Unknown")
    )


@router.get("/all-leads")
def get_all_leads(db: Session = Depends(get_db)):

    interactions = (
        db.query(Interaction, User, LeadStatus)
        .join(User, Interaction.user_id == User.id)
        .join(LeadStatus, LeadStatus.user_id == User.id)
        .all()
    )

    leads = []

    for interaction, user, status in interactions:
        leads.append({
            "id": interaction.id,
            "name": user.name,
            "phone": user.phone,
            "status": status.status,
            "message": interaction.message,
            "response": interaction.response,
            "source": interaction.source,
            "timestamp": str(interaction.timestamp),
            "budget": user.budget,
            "location": user.location,
            "followUpDate": str(interaction.timestamp.date())
        })

    return leads
@router.delete("/delete-lead/{phone}")
def delete_lead(phone: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.phone == phone).first()

    if not user:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.query(Interaction).filter(Interaction.user_id == user.id).delete()

    db.query(LeadStatus).filter(LeadStatus.user_id == user.id).delete()

    db.delete(user)

    db.commit()

    return {"message": "Lead deleted successfully"}