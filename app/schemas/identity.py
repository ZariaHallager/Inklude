"""Pydantic schemas for identity, pronoun, and preference endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.identity import Visibility


# ---------------------------------------------------------------------------
# Pronoun Set
# ---------------------------------------------------------------------------


class PronounSetBase(BaseModel):
    """Shared pronoun-set fields."""

    subject: str = Field(..., max_length=30, examples=["they"])
    object: str = Field(..., max_length=30, examples=["them"])
    possessive: str = Field(..., max_length=30, examples=["their"])
    possessive_pronoun: str = Field(..., max_length=30, examples=["theirs"])
    reflexive: str = Field(..., max_length=30, examples=["themself"])
    is_primary: bool = True


class PronounSetCreate(PronounSetBase):
    pass


class PronounSetRead(PronounSetBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Preference
# ---------------------------------------------------------------------------


class PreferenceBase(BaseModel):
    """Shared preference fields."""

    title: str | None = Field(None, max_length=30, examples=["Mx."])
    visibility: Visibility = Visibility.INTERNAL
    language_preference: str | None = Field(None, max_length=10, examples=["en"])


class PreferenceCreate(PreferenceBase):
    pass


class PreferenceRead(PreferenceBase):
    id: uuid.UUID
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# User / Identity
# ---------------------------------------------------------------------------


class IdentityCreate(BaseModel):
    """Payload for creating a new identity profile."""

    email: EmailStr
    display_name: str = Field(..., max_length=255)
    pronoun_sets: list[PronounSetCreate] = Field(default_factory=list)
    preference: PreferenceCreate | None = None


class IdentityUpdate(BaseModel):
    """Payload for updating an existing identity."""

    display_name: str | None = Field(None, max_length=255)


class IdentityRead(BaseModel):
    """Full identity response."""

    id: uuid.UUID
    email: str
    display_name: str
    pronoun_sets: list[PronounSetRead] = []
    preference: PreferenceRead | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
