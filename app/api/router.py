"""Main API router – aggregates all sub-routers."""

from fastapi import APIRouter, Depends

from app.api.analysis import router as analysis_router
from app.api.health import router as health_router
from app.api.identity import router as identity_router
from app.api.neo_pronouns import router as neo_pronouns_router
from app.middleware.auth import require_api_key

api_router = APIRouter()

# Health endpoints are public (no auth)
api_router.include_router(health_router, tags=["health"])

# Neo-pronoun registry is public (reference data)
api_router.include_router(neo_pronouns_router)

# All other endpoints require API key authentication
api_router.include_router(
    identity_router, dependencies=[Depends(require_api_key)]
)
api_router.include_router(
    analysis_router, dependencies=[Depends(require_api_key)]
)
