"""Authentication service – Google OAuth + JWT management."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.identity import Account, AccountRole

logger = logging.getLogger(__name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def google_login_url(state: str | None = None) -> str:
    """Generate the Google OAuth2 authorization URL."""
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    if state:
        params["state"] = state
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{GOOGLE_AUTH_URL}?{query}"


async def google_callback(code: str, session: AsyncSession) -> Account:
    """Exchange the OAuth code for tokens and create/update the account."""
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_resp.raise_for_status()
        tokens = token_resp.json()

        # Get user info
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()

    google_id = userinfo["id"]
    email = userinfo["email"]
    name = userinfo.get("name", email.split("@")[0])
    avatar = userinfo.get("picture")

    # Find or create account
    stmt = select(Account).where(Account.google_id == google_id)
    result = await session.execute(stmt)
    account = result.scalar_one_or_none()

    if account is None:
        # Check if account exists by email
        stmt = select(Account).where(Account.email == email)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if account is None:
            # Check if this is the first account -> make admin
            count_stmt = select(Account)
            count_result = await session.execute(count_stmt)
            is_first = len(count_result.scalars().all()) == 0

            account = Account(
                email=email,
                display_name=name,
                avatar_url=avatar,
                google_id=google_id,
                role=AccountRole.SUPER_ADMIN if is_first else AccountRole.USER,
            )
            session.add(account)
        else:
            account.google_id = google_id
            account.avatar_url = avatar

    account.display_name = name
    account.last_login = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(account)
    return account


def create_jwt(account: Account) -> str:
    """Create a JWT token for the given account."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(account.id),
        "email": account.email,
        "name": account.display_name,
        "role": account.role.value,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_jwt(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        return None


async def get_account_by_id(session: AsyncSession, account_id: uuid.UUID) -> Account | None:
    """Fetch an account by ID."""
    stmt = select(Account).where(Account.id == account_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def list_accounts(session: AsyncSession, offset: int = 0, limit: int = 50) -> list[Account]:
    """List all accounts (paginated)."""
    stmt = select(Account).offset(offset).limit(limit).order_by(Account.created_at.desc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_account_role(
    session: AsyncSession, account_id: uuid.UUID, role: AccountRole
) -> Account | None:
    """Update an account's role."""
    account = await get_account_by_id(session, account_id)
    if account is None:
        return None
    account.role = role
    await session.commit()
    await session.refresh(account)
    return account
