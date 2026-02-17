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
    # #region agent log
    import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/api/auth.py:42","message":"Login endpoint called","data":{"redirect_url":redirect_url,"has_client_id":bool(settings.google_client_id),"has_client_secret":bool(settings.google_client_secret)},"hypothesisId":"A"}) + '\n')
    # #endregion
    if not settings.google_client_id:
        raise HTTPException(
            status_code=501,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )
    url = auth_service.google_login_url(state=redirect_url)
    # #region agent log
    import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/api/auth.py:50","message":"Redirecting to Google","data":{"oauth_url":url[:100]},"hypothesisId":"A"}) + '\n')
    # #endregion
    return RedirectResponse(url=url)


@router.get("/callback/google")
async def callback_google(
    code: str,
    state: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    """Handle Google OAuth callback, issue JWT, redirect to frontend."""
    # #region agent log
    import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/api/auth.py:59","message":"Callback endpoint called","data":{"has_code":bool(code),"state":state},"hypothesisId":"C"}) + '\n')
    # #endregion
    try:
        account = await auth_service.google_callback(code, session)
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/api/auth.py:64","message":"Account retrieved/created","data":{"account_id":str(account.id),"email":account.email},"hypothesisId":"C"}) + '\n')
        # #endregion
    except Exception as e:
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/api/auth.py:68","message":"OAuth callback error","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"C"}) + '\n')
        # #endregion
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
