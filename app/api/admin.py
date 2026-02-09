"""Admin endpoints – user management, policy settings, audit log."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import require_admin
from app.models.identity import (
    Account,
    AccountRole,
    AuditLogEntry,
    PolicySetting,
)
from app.schemas.admin import (
    AccountRead,
    AuditLogRead,
    PolicySettingRead,
    PolicySettingUpdate,
    RoleUpdate,
)
from app.services import auth_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AccountRead])
async def list_users(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """List all user accounts."""
    accounts = await auth_service.list_accounts(session, offset=offset, limit=limit)
    return accounts


@router.put("/users/{account_id}/role", response_model=AccountRead)
async def update_user_role(
    account_id: uuid.UUID,
    payload: RoleUpdate,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Change a user's role."""
    try:
        role = AccountRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")

    account = await auth_service.update_account_role(session, account_id, role)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")

    # Audit log
    audit = AuditLogEntry(
        account_id=uuid.UUID(auth["account_id"]) if auth.get("account_id") else None,
        action="update_role",
        resource_type="account",
        resource_id=str(account_id),
        details=f"Changed role to {role.value}",
    )
    session.add(audit)
    await session.commit()

    return account


@router.get("/policies", response_model=list[PolicySettingRead])
async def get_policies(
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Get all policy settings."""
    stmt = select(PolicySetting).order_by(PolicySetting.key)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.put("/policies", response_model=PolicySettingRead)
async def update_policy(
    payload: PolicySettingUpdate,
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Create or update a policy setting."""
    stmt = select(PolicySetting).where(PolicySetting.key == payload.key)
    result = await session.execute(stmt)
    policy = result.scalar_one_or_none()

    if policy is None:
        policy = PolicySetting(key=payload.key, value=payload.value)
        session.add(policy)
    else:
        policy.value = payload.value

    policy.updated_by = uuid.UUID(auth["account_id"]) if auth.get("account_id") else None
    await session.commit()
    await session.refresh(policy)

    # Audit log
    audit = AuditLogEntry(
        account_id=uuid.UUID(auth["account_id"]) if auth.get("account_id") else None,
        action="update_policy",
        resource_type="policy",
        resource_id=payload.key,
        details=f"Set {payload.key} = {payload.value}",
    )
    session.add(audit)
    await session.commit()

    return policy


@router.get("/audit-log", response_model=list[AuditLogRead])
async def get_audit_log(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    auth: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """View the audit trail."""
    stmt = (
        select(AuditLogEntry)
        .order_by(AuditLogEntry.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
