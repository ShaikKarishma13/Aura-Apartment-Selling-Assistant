from pydantic import BaseModel, Field
from typing import Optional, List

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session identifier for the conversation")
    user_input: str = Field(..., min_length=1, max_length=1000)

    name: str
    phone: str
    budget: str
    location: str
    status: str

    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response_text: str
    sentiment: str = Field(default="neutral")
    detected_intent: str = Field(default="unknown")
