"""CRUD endpoints for user identities, pronouns, and preferences."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas.identity import (
    IdentityCreate,
    IdentityRead,
    IdentityUpdate,
    PreferenceCreate,
    PreferenceRead,
    PronounSetCreate,
    PronounSetRead,
)
from app.services import identity_service

router = APIRouter(prefix="/identities", tags=["identities"])


@router.post("/", response_model=IdentityRead, status_code=201)
async def create_identity(
    payload: IdentityCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new identity profile."""
    existing = await identity_service.get_identity_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered.")
    user = await identity_service.create_identity(session, payload)
    return user


@router.get("/", response_model=list[IdentityRead])
async def list_identities(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
):
    """List identity profiles (paginated)."""
    return await identity_service.list_identities(session, offset=offset, limit=limit)


@router.get("/{identity_id}", response_model=IdentityRead)
async def get_identity(
    identity_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a single identity by ID."""
    user = await identity_service.get_identity(session, identity_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return user


@router.put("/{identity_id}", response_model=IdentityRead)
async def update_identity(
    identity_id: uuid.UUID,
    payload: IdentityUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update an identity's mutable fields."""
    user = await identity_service.update_identity(session, identity_id, payload)
    if user is None:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return user


@router.delete("/{identity_id}", status_code=204)
async def delete_identity(
    identity_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete an identity and all associated data."""
    deleted = await identity_service.delete_identity(session, identity_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Identity not found.")


# ---------------------------------------------------------------------------
# Pronoun sub-resource
# ---------------------------------------------------------------------------


@router.get("/{identity_id}/pronouns", response_model=list[PronounSetRead])
async def get_pronouns(
    identity_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get all pronoun sets for a user."""
    user = await identity_service.get_identity(session, identity_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return await identity_service.get_pronoun_sets(session, identity_id)


@router.put("/{identity_id}/pronouns", response_model=list[PronounSetRead])
async def update_pronouns(
    identity_id: uuid.UUID,
    pronoun_sets: list[PronounSetCreate],
    session: AsyncSession = Depends(get_session),
):
    """Replace all pronoun sets for a user."""
    user = await identity_service.get_identity(session, identity_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return await identity_service.replace_pronoun_sets(
        session, identity_id, pronoun_sets
    )


# ---------------------------------------------------------------------------
# Preference sub-resource
# ---------------------------------------------------------------------------


@router.put("/{identity_id}/preferences", response_model=PreferenceRead)
async def update_preferences(
    identity_id: uuid.UUID,
    payload: PreferenceCreate,
    session: AsyncSession = Depends(get_session),
):
    """Update (or create) preferences for a user."""
    user = await identity_service.get_identity(session, identity_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return await identity_service.update_preference(session, identity_id, payload)
