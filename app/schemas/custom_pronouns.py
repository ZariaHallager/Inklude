"""Pydantic schemas for custom pronoun submissions."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CustomPronounCreate(BaseModel):
    """Payload for submitting a custom pronoun set."""
    subject: str = Field(..., max_length=30)
    object: str = Field(..., max_length=30)
    possessive: str = Field(..., max_length=30)
    possessive_pronoun: str = Field(..., max_length=30)
    reflexive: str = Field(..., max_length=30)
    label: str = Field(..., max_length=60, description="e.g. 'xe/xem'")
    usage_note: str | None = None
    example: str | None = None


class CustomPronounRead(BaseModel):
    """Response model for custom pronoun sets."""
    id: uuid.UUID
    subject: str
    object: str
    possessive: str
    possessive_pronoun: str
    reflexive: str
    label: str
    usage_note: str | None = None
    example: str | None = None
    is_approved: bool
    submitted_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
