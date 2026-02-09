"""Inklude – AI-powered inclusive language and pronoun intelligence layer."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.config import settings

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Inklude API starting up")
    yield
    logger.info("Inklude API shutting down")


app = FastAPI(
    title="Inklude",
    description="AI-powered inclusive language and pronoun intelligence API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(api_router, prefix="/api/v1")
