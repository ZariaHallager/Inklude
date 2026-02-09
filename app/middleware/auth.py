"""Authentication middleware – supports both API key and JWT Bearer token."""

from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
_bearer_scheme = HTTPBearer(auto_error=False)


async def require_api_key(
    api_key: str | None = Security(_api_key_header),
) -> str:
    """Dependency that validates the X-API-Key header.

    Raises 401 if the key is missing or invalid.
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header.",
        )
    if not secrets.compare_digest(api_key, settings.api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key.",
        )
    return api_key


async def require_auth(
    api_key: str | None = Security(_api_key_header),
    bearer: HTTPAuthorizationCredentials | None = Security(_bearer_scheme),
):
    """Accept either API key or JWT Bearer token.
    
    Returns a dict with auth info:
    - For API key: {"type": "api_key"}
    - For JWT: {"type": "jwt", "account_id": ..., "email": ..., "role": ...}
    """
    # Try API key first
    if api_key is not None:
        if secrets.compare_digest(api_key, settings.api_key):
            return {"type": "api_key", "role": "super_admin"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key.",
        )

    # Try JWT Bearer
    if bearer is not None:
        from app.services.auth_service import decode_jwt
        payload = decode_jwt(bearer.credentials)
        if payload is not None:
            return {
                "type": "jwt",
                "account_id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role", "user"),
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Provide X-API-Key header or Bearer token.",
    )


async def require_admin(auth: dict = Depends(require_auth)):
    """Dependency that requires admin role."""
    if auth.get("role") not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return auth
