"""Authentication endpoints – Google OAuth SSO + JWT."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.middleware.auth import require_auth
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    account_id: str
    email: str
    display_name: str
    role: str
    avatar_url: str | None = None


class MeResponse(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    avatar_url: str | None = None
    identity_id: str | None = None

    model_config = {"from_attributes": True}


@router.get("/login/google")
async def login_google(redirect_url: str | None = None):
    """Redirect user to Google OAuth consent screen."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=501,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )
    url = auth_service.google_login_url(state=redirect_url)
    return RedirectResponse(url=url)


@router.get("/callback/google")
async def callback_google(
    code: str,
    state: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    """Handle Google OAuth callback, issue JWT, redirect to frontend."""
    try:
        account = await auth_service.google_callback(code, session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

    token = auth_service.create_jwt(account)

    # Redirect to frontend with token
    redirect_url = state or settings.frontend_url
    separator = "&" if "?" in redirect_url else "?"
    return RedirectResponse(
        url=f"{redirect_url}{separator}token={token}"
    )


@router.post("/token", response_model=TokenResponse)
async def exchange_google_code(
    code: str = Query(...),
    session: AsyncSession = Depends(get_session),
):
    """Exchange a Google OAuth code for a JWT (for SPA flows)."""
    try:
        account = await auth_service.google_callback(code, session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

    token = auth_service.create_jwt(account)
    return TokenResponse(
        access_token=token,
        account_id=str(account.id),
        email=account.email,
        display_name=account.display_name,
        role=account.role.value,
        avatar_url=account.avatar_url,
    )


@router.get("/me", response_model=MeResponse)
async def get_me(
    auth: dict = Depends(require_auth),
    session: AsyncSession = Depends(get_session),
):
    """Get current authenticated user info."""
    if auth["type"] == "api_key":
        return MeResponse(
            id="api-key",
            email="api@inklude.local",
            display_name="API Key User",
            role="super_admin",
        )

    account_id = auth.get("account_id")
    if not account_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    account = await auth_service.get_account_by_id(session, uuid.UUID(account_id))
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")

    return MeResponse(
        id=str(account.id),
        email=account.email,
        display_name=account.display_name,
        role=account.role.value,
        avatar_url=account.avatar_url,
        identity_id=str(account.identity_id) if account.identity_id else None,
    )
