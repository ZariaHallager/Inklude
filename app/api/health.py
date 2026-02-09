"""Health-check endpoints."""

from fastapi import APIRouter

from app.nlp.engine import NLPEngine

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    """Basic liveness probe."""
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness() -> dict:
    """Readiness probe – checks if NLP models are loaded."""
    nlp_ready = NLPEngine.is_loaded()
    return {
        "status": "ready" if nlp_ready else "loading",
        "nlp_model_loaded": nlp_ready,
    }
