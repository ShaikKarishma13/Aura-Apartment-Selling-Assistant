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
