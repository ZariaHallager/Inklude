"""Analytics service – aggregation queries for dashboard metrics."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity import (
    Account,
    AnalysisLog,
    CustomPronounSet,
    InclusiveTemplate,
    User,
)


async def get_overview(session: AsyncSession) -> dict:
    """Get summary statistics."""
    total_analyses = (await session.execute(select(func.count(AnalysisLog.id)))).scalar() or 0
    total_issues = (await session.execute(select(func.coalesce(func.sum(AnalysisLog.issues_found), 0)))).scalar() or 0
    total_identities = (await session.execute(select(func.count(User.id)))).scalar() or 0
    total_accounts = (await session.execute(select(func.count(Account.id)))).scalar() or 0
    total_templates = (await session.execute(select(func.count(InclusiveTemplate.id)))).scalar() or 0

    return {
        "total_analyses": total_analyses,
        "total_issues_found": total_issues,
        "total_identities": total_identities,
        "total_accounts": total_accounts,
        "total_templates": total_templates,
    }


async def get_trends(session: AsyncSession, days: int = 30) -> list[dict]:
    """Get analysis trends over the past N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    stmt = (
        select(
            func.date(AnalysisLog.requested_at).label("date"),
            func.count(AnalysisLog.id).label("count"),
            func.coalesce(func.sum(AnalysisLog.issues_found), 0).label("issues"),
        )
        .where(AnalysisLog.requested_at >= cutoff)
        .group_by(func.date(AnalysisLog.requested_at))
        .order_by(func.date(AnalysisLog.requested_at))
    )
    result = await session.execute(stmt)
    return [{"date": str(row.date), "count": row.count, "issues": row.issues} for row in result]


async def get_category_breakdown(session: AsyncSession) -> list[dict]:
    """Get breakdown of analyses by source."""
    stmt = (
        select(
            AnalysisLog.source.label("category"),
            func.count(AnalysisLog.id).label("count"),
        )
        .where(AnalysisLog.source.isnot(None))
        .group_by(AnalysisLog.source)
        .order_by(func.count(AnalysisLog.id).desc())
    )
    result = await session.execute(stmt)
    return [{"category": row.category or "unknown", "count": row.count} for row in result]


async def log_analysis(
    session: AsyncSession,
    text_length: int,
    issues_found: int,
    source: str | None = None,
) -> None:
    """Log an analysis event for metrics."""
    entry = AnalysisLog(
        text_length=text_length,
        issues_found=issues_found,
        source=source,
    )
    session.add(entry)
    await session.commit()
