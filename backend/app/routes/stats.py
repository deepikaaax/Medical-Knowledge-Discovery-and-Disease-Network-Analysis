from fastapi import APIRouter
from ..services import db_service

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("", response_model=dict)
def get_stats():
    """Retrieves dynamic, database-calculated summary statistics for the dashboard."""
    return db_service.get_dashboard_stats()
