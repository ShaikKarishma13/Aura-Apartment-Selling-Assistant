from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database.db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    budget = Column(String)
    location = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Property(Base):
    __tablename__ = 'properties'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    location = Column(String)
    features = Column(Text)
    images = Column(Text) # comma separated URLs or JSON string

class LeadStatus(Base):
    __tablename__ = 'lead_status'

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey('users.id'),
        nullable=True
    )
    name = Column(String)
    phone = Column(String)
    budget = Column(String)
    location = Column(String)

    follow_up_date = Column(String)
    
    ai_response = Column(Text)

    status = Column(String)

    score = Column(Integer)

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )
class Interaction(Base):
    __tablename__ = 'interactions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    message = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String) # voice, text, whatsapp
class PropertyLead(Base):
    __tablename__ = 'property_leads'

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    phone = Column(String)

    property_name = Column(String)

    budget = Column(String, nullable=True)

    location = Column(String, nullable=True)

    follow_up_date = Column(String, nullable=True)

    notes = Column(String, nullable=True)

    status = Column(String, default="Interested")
    
    visit_date = Column(String)


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
class ChatHistory(Base):
    __tablename__ = 'chat_history'

    id = Column(Integer, primary_key=True, index=True)

    visitor_id = Column(String)

    role = Column(String)

    message = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

class CallHistory(Base):
    __tablename__ = "call_history"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    phone = Column(String)

    duration = Column(Integer)

    sentiment = Column(String)

    transcript = Column(Text)

    recording_url = Column(Text, nullable=True)
    property_type = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    location = Column(String, nullable=True)
    intent = Column(String, nullable=True)

    status = Column(String)
    
    summary = Column(Text, nullable=True)
    key_points = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    next_action = Column(Text, nullable=True)
    follow_up_notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
