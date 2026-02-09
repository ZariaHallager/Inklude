"""Analytics endpoints for DEI dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import require_auth
from app.schemas.admin import AnalyticsOverview, AnalyticsTrend, CategoryBreakdown
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Get summary analytics."""
    data = await analytics_service.get_overview(session)
    return AnalyticsOverview(**data)


@router.get("/trends", response_model=list[AnalyticsTrend])
async def get_trends(
    days: int = Query(30, ge=1, le=365),
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Get analysis trends over time."""
    data = await analytics_service.get_trends(session, days=days)
    return [AnalyticsTrend(**d) for d in data]


@router.get("/categories", response_model=list[CategoryBreakdown])
async def get_categories(
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Get breakdown of analyses by category/source."""
    data = await analytics_service.get_category_breakdown(session)
    return [CategoryBreakdown(**d) for d in data]
