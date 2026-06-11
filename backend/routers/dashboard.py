from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from database.db import get_db
from models.schema import LeadStatus, Interaction, User, ChatHistory, PropertyLead

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    total_chats = db.query(ChatHistory).count()

    total_leads = db.query(PropertyLead).count()

    site_visits = (
        db.query(PropertyLead)
        .filter(PropertyLead.visit_date.isnot(None))
        .count()
    )

    high_intent = (
        db.query(PropertyLead)
        .filter(PropertyLead.status.in_(["Hot", "Warm"]))
        .count()
    )

    return {
        "totalChats": total_chats,
        "totalLeads": total_leads,
        "siteVisits": site_visits,
        "highIntentLeads": high_intent
    }