from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from database.db import get_db
from models.schema import LeadStatus, Interaction

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total_leads = db.query(LeadStatus).count()

    hot_leads = db.query(LeadStatus).filter(
        LeadStatus.status == "Hot"
    ).count()

    total_calls = db.query(Interaction).count()

    conversion_rate = 0

    if total_leads > 0:
        conversion_rate = round((hot_leads / total_leads) * 100)

    return {
        "total_leads": total_leads,
        "hot_leads": hot_leads,
        "calls_today": total_calls,
        "conversion_rate": conversion_rate
    }