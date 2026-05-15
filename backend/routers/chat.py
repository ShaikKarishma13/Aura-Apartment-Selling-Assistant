from fastapi import APIRouter, Depends
from models.pydantic_schemas import ChatRequest, ChatResponse, ChatMessage
from services.llm_service import generate_sales_response
import logging

router = APIRouter(
    prefix="/api/chat",
    tags=["Conversational AI"]
)
logger = logging.getLogger(__name__)

@router.post("/process-input", response_model=ChatResponse)
async def process_chat_input(request: ChatRequest):
    logger.info(f"Processing chat input for session: {request.session_id}")
    
    # In a full app, we would load history from DB using session_id.
    # Here we accept history explicitly or assume it's empty.
    
    bot_response = await generate_sales_response(
        user_input=request.user_input, 
        history=request.history
    )
    
    # Pass the total conversation context to the Lead Scoring logic
    from services.lead_scoring import classify_lead
    
    full_history = request.history + [ChatMessage(role="assistant", content=bot_response)]
    analysis = await classify_lead(full_history)
    
    return ChatResponse(
        response_text=bot_response,
        sentiment=analysis.get("reason", "No reason provided"),
        detected_intent=analysis.get("classification", "Unknown")
    )
