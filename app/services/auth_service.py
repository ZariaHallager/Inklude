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
    # #region agent log
    import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:41","message":"Starting google_callback","data":{"has_code":bool(code),"client_id":settings.google_client_id[:20] if settings.google_client_id else None,"redirect_uri":settings.google_redirect_uri},"hypothesisId":"A,C"}) + '\n')
    # #endregion
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        try:
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
            # #region agent log
            import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:54","message":"Token exchange response","data":{"status_code":token_resp.status_code,"has_content":bool(token_resp.content)},"hypothesisId":"A,E"}) + '\n')
            # #endregion
            token_resp.raise_for_status()
            tokens = token_resp.json()
        except Exception as e:
            # #region agent log
            import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:59","message":"Token exchange failed","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"A,E"}) + '\n')
            # #endregion
            raise

        # Get user info
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:69","message":"Got user info from Google","data":{"email":userinfo.get("email"),"has_id":bool(userinfo.get("id"))},"hypothesisId":"C"}) + '\n')
        # #endregion

    google_id = userinfo["id"]
    email = userinfo["email"]
    name = userinfo.get("name", email.split("@")[0])
    avatar = userinfo.get("picture")

    # Find or create account
    try:
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:80","message":"Querying database for account","data":{"google_id":google_id,"email":email},"hypothesisId":"B"}) + '\n')
        # #endregion
        stmt = select(Account).where(Account.google_id == google_id)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()
    except Exception as e:
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:87","message":"Database query failed","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"B"}) + '\n')
        # #endregion
        raise

    if account is None:
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:92","message":"Account not found by google_id, checking email","data":{"email":email},"hypothesisId":"B"}) + '\n')
        # #endregion
        # Check if account exists by email
        stmt = select(Account).where(Account.email == email)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if account is None:
            # #region agent log
            import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:101","message":"Creating new account","data":{"email":email,"name":name},"hypothesisId":"B"}) + '\n')
            # #endregion
            # Check if this is the first account -> make admin
            count_stmt = select(Account)
            count_result = await session.execute(count_stmt)
            is_first = len(count_result.scalars().all()) == 0

            try:
                account = Account(
                    email=email,
                    display_name=name,
                    avatar_url=avatar,
                    google_id=google_id,
                    role=AccountRole.SUPER_ADMIN if is_first else AccountRole.USER,
                )
                session.add(account)
                # #region agent log
                import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:118","message":"Account object created, added to session","data":{"is_first":is_first},"hypothesisId":"B"}) + '\n')
                # #endregion
            except Exception as e:
                # #region agent log
                import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:123","message":"Failed to create account","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"B"}) + '\n')
                # #endregion
                raise
        else:
            account.google_id = google_id
            account.avatar_url = avatar

    account.display_name = name
    account.last_login = datetime.now(timezone.utc)
    try:
        await session.commit()
        await session.refresh(account)
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:139","message":"Account committed to database","data":{"account_id":str(account.id),"email":account.email},"hypothesisId":"B"}) + '\n')
        # #endregion
    except Exception as e:
        # #region agent log
        import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/services/auth_service.py:144","message":"Database commit failed","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"B"}) + '\n')
        # #endregion
        raise
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
