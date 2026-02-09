"""Pydantic schemas for admin endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AccountRead(BaseModel):
    """Response model for accounts."""
    id: uuid.UUID
    email: str
    display_name: str
    avatar_url: str | None = None
    role: str
    is_active: bool
    identity_id: uuid.UUID | None = None
    created_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class RoleUpdate(BaseModel):
    """Payload for updating an account's role."""
    role: str  # "user", "admin", "super_admin"


class PolicySettingRead(BaseModel):
    """Response model for policy settings."""
    id: uuid.UUID
    key: str
    value: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class PolicySettingUpdate(BaseModel):
    """Payload for updating a policy setting."""
    key: str
    value: str


class AuditLogRead(BaseModel):
    """Response model for audit log entries."""
    id: uuid.UUID
    account_id: uuid.UUID | None
    action: str
    resource_type: str | None
    resource_id: str | None
    details: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsOverview(BaseModel):
    """Summary analytics."""
    total_analyses: int
    total_issues_found: int
    total_identities: int
    total_accounts: int
    total_templates: int


class AnalyticsTrend(BaseModel):
    """A data point in a time series."""
    date: str
    count: int
    issues: int


class CategoryBreakdown(BaseModel):
    """Breakdown of issues by category."""
    category: str
    count: int
