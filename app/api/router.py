"""Main API router – aggregates all sub-routers."""

from fastapi import APIRouter, Depends

from app.api.admin import router as admin_router
from app.api.analysis import router as analysis_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.custom_pronouns import router as custom_pronouns_router
from app.api.health import router as health_router
from app.api.identity import router as identity_router
from app.api.neo_pronouns import router as neo_pronouns_router
from app.api.templates import router as templates_router
from app.middleware.auth import require_api_key, require_auth

api_router = APIRouter()

# Public endpoints (no auth)
api_router.include_router(health_router, tags=["health"])
api_router.include_router(neo_pronouns_router)
api_router.include_router(auth_router)

# Authenticated endpoints (accept both API key and JWT)
api_router.include_router(
    identity_router, dependencies=[Depends(require_auth)]
)
api_router.include_router(
    analysis_router, dependencies=[Depends(require_auth)]
)
api_router.include_router(custom_pronouns_router)
api_router.include_router(analytics_router)
api_router.include_router(templates_router)
api_router.include_router(admin_router)
