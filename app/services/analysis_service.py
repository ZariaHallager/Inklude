"""Analysis service – bridges the API layer with the NLP engine."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity import Visibility
from app.nlp.engine import NLPEngine
from app.schemas.analysis import (
    AnalysisResult,
    ToneMode,
)
from app.services import identity_service


def analyze_text(
    text: str,
    tone: ToneMode = ToneMode.GENTLE,
    identity_map: dict[str, list[dict[str, str]]] | None = None,
) -> AnalysisResult:
    """Analyse a single piece of text."""
    engine = NLPEngine.get_instance()
    return engine.analyze(text, tone=tone, identity_map=identity_map)


def analyze_batch(
    texts: list[str],
    tone: ToneMode = ToneMode.GENTLE,
    identity_map: dict[str, list[dict[str, str]]] | None = None,
) -> list[AnalysisResult]:
    """Analyse multiple texts."""
    engine = NLPEngine.get_instance()
    return [
        engine.analyze(t, tone=tone, identity_map=identity_map)
        for t in texts
    ]


async def build_identity_map_for_persons(
    session: AsyncSession,
    person_ids: list[uuid.UUID],
    visibility: str = "internal",
) -> dict[str, list[dict[str, str]]]:
    """Build an identity_map from a list of person UUIDs.

    Returns a dict keyed by lowercased display_name, with values being
    lists of pronoun-set dicts.
    """
    vis = Visibility(visibility)
    identity_map: dict[str, list[dict[str, str]]] = {}

    for pid in person_ids:
        user = await identity_service.get_identity(session, pid)
        if user is None:
            continue

        # Check visibility
        if user.preference:
            from app.services.identity_service import _visibility_rank
            if _visibility_rank(user.preference.visibility) < _visibility_rank(vis):
                continue

        name_lower = user.display_name.lower()
        sets = []
        for ps in user.pronoun_sets:
            sets.append({
                "subject": ps.subject,
                "object": ps.object,
                "possessive": ps.possessive,
                "possessive_pronoun": ps.possessive_pronoun,
                "reflexive": ps.reflexive,
            })
        if sets:
            identity_map[name_lower] = sets

    return identity_map
