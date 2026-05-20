from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db

from models.pydantic_schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage
)

from models.schema import Interaction, LeadStatus

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

    # Save interaction
    user_interaction = Interaction(
        user_id=None,
        message=request.user_input,
        response=bot_response,
        source="text"
    )

    db.add(user_interaction)

    # Save lead status
    lead_status = LeadStatus(
        user_id=None,
        status=analysis.get("classification", "Warm"),
        score=85 if analysis.get("classification") == "Hot" else 60
    )

    db.add(lead_status)

    db.commit()

    return ChatResponse(
        response_text=bot_response,
        sentiment=analysis.get("reason", "No reason provided"),
        detected_intent=analysis.get("classification", "Unknown")
    )