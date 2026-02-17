"""Inklude – AI-powered inclusive language and pronoun intelligence layer."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.config import settings

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Inklude API starting up")
    # #region agent log
    import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/main.py:24","message":"Backend starting","data":{"database_url":settings.database_url[:50],"frontend_url":settings.frontend_url},"hypothesisId":"D"}) + '\n')
    # #endregion

    # Auto-create tables for SQLite (local dev convenience)
    if "sqlite" in settings.database_url:
        try:
            from app.database import Base, engine
            # Import models so they register with Base metadata
            import app.models.identity  # noqa: F401

            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("SQLite tables created.")
            # #region agent log
            import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/main.py:38","message":"SQLite tables created successfully","data":{},"hypothesisId":"B,D"}) + '\n')
            # #endregion
        except Exception as e:
            # #region agent log
            import json; open('/Users/sagespellman/:code/Inklude/.cursor/debug.log', 'a').write(json.dumps({"id":f"log_{__import__('time').time_ns()}","timestamp":__import__('time').time()*1000,"location":"app/main.py:43","message":"Failed to create SQLite tables","data":{"error_type":type(e).__name__,"error_msg":str(e)},"hypothesisId":"B,D"}) + '\n')
            # #endregion
            raise

    yield
    logger.info("Inklude API shutting down")


app = FastAPI(
    title="Inklude",
    description="AI-powered inclusive language and pronoun intelligence API",
    version="0.2.0",
    lifespan=lifespan,
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api/v1")

# Serve static assets
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def serve_frontend():
    """Serve the Inklude web UI."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return HTMLResponse(content=index_path.read_text(), status_code=200)
    return HTMLResponse(
        content="<h1>Inklude API</h1><p>Visit <a href='/docs'>/docs</a> for API documentation.</p>",
        status_code=200,
    )
