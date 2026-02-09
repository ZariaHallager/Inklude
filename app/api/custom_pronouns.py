"""Custom pronoun submission endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import require_admin, require_auth
from app.models.identity import CustomPronounSet
from app.nlp.neo_pronouns import NeoPronounSet, PopularityTier, register_custom_set
from app.schemas.custom_pronouns import CustomPronounCreate, CustomPronounRead

router = APIRouter(prefix="/custom-pronouns", tags=["custom-pronouns"])


@router.post("/", response_model=CustomPronounRead, status_code=201)
async def submit_custom_pronouns(
    payload: CustomPronounCreate,
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Submit a new custom pronoun set."""
    account_id = auth.get("account_id")
    if not account_id and auth["type"] == "api_key":
        account_id = None  # API key users can submit but without account link

    custom = CustomPronounSet(
        submitted_by=uuid.UUID(account_id) if account_id else uuid.uuid4(),
        subject=payload.subject,
        object=payload.object,
        possessive=payload.possessive,
        possessive_pronoun=payload.possessive_pronoun,
        reflexive=payload.reflexive,
        label=payload.label,
        usage_note=payload.usage_note,
        example=payload.example,
    )
    session.add(custom)
    await session.commit()
    await session.refresh(custom)
    return custom


@router.get("/", response_model=list[CustomPronounRead])
async def list_custom_pronouns(
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """List custom pronoun sets (user sees their own + approved global ones)."""
    if auth.get("role") in ("admin", "super_admin"):
        stmt = select(CustomPronounSet).order_by(CustomPronounSet.created_at.desc())
    else:
        account_id = auth.get("account_id")
        stmt = select(CustomPronounSet).where(
            (CustomPronounSet.is_approved == True)
            | (CustomPronounSet.submitted_by == uuid.UUID(account_id) if account_id else False)
        ).order_by(CustomPronounSet.created_at.desc())

    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.put("/{pronoun_id}/approve", response_model=CustomPronounRead)
async def approve_custom_pronouns(
    pronoun_id: uuid.UUID,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Admin approves a custom pronoun set for the global registry."""
    stmt = select(CustomPronounSet).where(CustomPronounSet.id == pronoun_id)
    result = await session.execute(stmt)
    custom = result.scalar_one_or_none()

    if custom is None:
        raise HTTPException(status_code=404, detail="Custom pronoun set not found.")

    custom.is_approved = True
    await session.commit()
    await session.refresh(custom)

    # Register in the NLP neo-pronoun registry
    neo_set = NeoPronounSet(
        subject=custom.subject,
        object=custom.object,
        possessive=custom.possessive,
        possessive_pronoun=custom.possessive_pronoun,
        reflexive=custom.reflexive,
        label=custom.label,
        popularity=PopularityTier.EMERGING,
        origin="Community-submitted",
        usage_note=custom.usage_note or "",
        example=custom.example or "",
    )
    register_custom_set(neo_set)

    return custom


@router.delete("/{pronoun_id}", status_code=204)
async def delete_custom_pronouns(
    pronoun_id: uuid.UUID,
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Delete a custom pronoun set."""
    stmt = select(CustomPronounSet).where(CustomPronounSet.id == pronoun_id)
    result = await session.execute(stmt)
    custom = result.scalar_one_or_none()

    if custom is None:
        raise HTTPException(status_code=404, detail="Custom pronoun set not found.")

    # Only submitter or admin can delete
    if auth.get("role") not in ("admin", "super_admin"):
        if str(custom.submitted_by) != auth.get("account_id"):
            raise HTTPException(status_code=403, detail="Not authorized to delete this set.")

    await session.delete(custom)
    await session.commit()
