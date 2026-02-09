"""Inclusive template endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import require_admin, require_auth
from app.models.identity import InclusiveTemplate
from app.schemas.templates import TemplateCreate, TemplateRead, TemplateUpdate

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateRead])
async def list_templates(
    category: str | None = Query(None),
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """List inclusive templates, optionally filtered by category."""
    stmt = select(InclusiveTemplate).order_by(InclusiveTemplate.title)
    if category:
        stmt = stmt.where(InclusiveTemplate.category == category)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{template_id}", response_model=TemplateRead)
async def get_template(
    template_id: uuid.UUID,
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific template."""
    stmt = select(InclusiveTemplate).where(InclusiveTemplate.id == template_id)
    result = await session.execute(stmt)
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found.")
    return template


@router.post("/", response_model=TemplateRead, status_code=201)
async def create_template(
    payload: TemplateCreate,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Create a new inclusive template (admin only)."""
    account_id = auth.get("account_id")
    template = InclusiveTemplate(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        description=payload.description,
        created_by=uuid.UUID(account_id) if account_id else None,
    )
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template


@router.put("/{template_id}", response_model=TemplateRead)
async def update_template(
    template_id: uuid.UUID,
    payload: TemplateUpdate,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Update a template (admin only)."""
    stmt = select(InclusiveTemplate).where(InclusiveTemplate.id == template_id)
    result = await session.execute(stmt)
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found.")

    if payload.title is not None:
        template.title = payload.title
    if payload.category is not None:
        template.category = payload.category
    if payload.content is not None:
        template.content = payload.content
    if payload.description is not None:
        template.description = payload.description

    await session.commit()
    await session.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: uuid.UUID,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Delete a template (admin only)."""
    stmt = select(InclusiveTemplate).where(InclusiveTemplate.id == template_id)
    result = await session.execute(stmt)
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found.")
    await session.delete(template)
    await session.commit()
