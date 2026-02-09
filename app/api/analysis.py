"""Text analysis endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas.analysis import (
    AnalysisResult,
    AnalyzeBatchRequest,
    AnalyzeTextRequest,
    BatchAnalysisResult,
    CheckPronounsRequest,
)
from app.services import analysis_service

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("/text", response_model=AnalysisResult)
async def analyze_text(request: AnalyzeTextRequest):
    """Analyse a single text block for gendered language and pronoun issues."""
    result = analysis_service.analyze_text(
        text=request.text,
        tone=request.tone,
    )
    return result


@router.post("/batch", response_model=BatchAnalysisResult)
async def analyze_batch(request: AnalyzeBatchRequest):
    """Analyse multiple texts in one request."""
    results = analysis_service.analyze_batch(
        texts=request.texts,
        tone=request.tone,
    )
    return BatchAnalysisResult(results=results)


@router.post("/check-pronouns", response_model=AnalysisResult)
async def check_pronouns(
    request: CheckPronounsRequest,
    session: AsyncSession = Depends(get_session),
):
    """Check pronoun usage against known identities.

    Provide the text and the IDs of people mentioned in it.
    The engine will verify that pronouns used for those people match
    their stated preferences.
    """
    identity_map = await analysis_service.build_identity_map_for_persons(
        session,
        person_ids=request.person_ids,
        visibility="internal",
    )
    result = analysis_service.analyze_text(
        text=request.text,
        tone=request.tone,
        identity_map=identity_map,
    )
    return result
