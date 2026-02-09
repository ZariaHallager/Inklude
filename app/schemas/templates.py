"""Pydantic schemas for inclusive templates."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TemplateCreate(BaseModel):
    """Payload for creating a template."""
    title: str = Field(..., max_length=255)
    category: str = Field(..., max_length=50)
    content: str
    description: str | None = None


class TemplateUpdate(BaseModel):
    """Payload for updating a template."""
    title: str | None = Field(None, max_length=255)
    category: str | None = Field(None, max_length=50)
    content: str | None = None
    description: str | None = None


class TemplateRead(BaseModel):
    """Response model for templates."""
    id: uuid.UUID
    title: str
    category: str
    content: str
    description: str | None = None
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
