"""Neo-pronoun registry API endpoints.

Provides public (no auth required) access to the neo-pronoun registry,
so front-end apps and integrations can display available neo-pronouns,
look up specific sets, and offer them in UI pickers.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.nlp.neo_pronouns import (
    NeoPronounSet,
    PopularityTier,
    get_all_sets,
    get_set_by_label,
    is_neo_pronoun,
)

router = APIRouter(prefix="/neo-pronouns", tags=["neo-pronouns"])


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class NeoPronounResponse(BaseModel):
    """A single neo-pronoun set in API responses."""

    subject: str
    object: str
    possessive: str
    possessive_pronoun: str
    reflexive: str
    label: str
    popularity: str
    origin: str
    usage_note: str
    example: str


class NeoPronounListResponse(BaseModel):
    """List of neo-pronoun sets."""

    count: int
    sets: list[NeoPronounResponse]


class NeoPronounCheckResponse(BaseModel):
    """Result of checking a token against the registry."""

    token: str
    is_neo_pronoun: bool
    matching_sets: list[str] = Field(
        default_factory=list,
        description="Labels of neo-pronoun sets containing this form.",
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _to_response(nps: NeoPronounSet) -> NeoPronounResponse:
    return NeoPronounResponse(
        subject=nps.subject,
        object=nps.object,
        possessive=nps.possessive,
        possessive_pronoun=nps.possessive_pronoun,
        reflexive=nps.reflexive,
        label=nps.label,
        popularity=nps.popularity.value,
        origin=nps.origin,
        usage_note=nps.usage_note,
        example=nps.example,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/", response_model=NeoPronounListResponse)
async def list_neo_pronouns(
    popularity: str | None = Query(
        None,
        description="Filter by popularity tier: common, moderate, emerging, historical",
    ),
):
    """List all registered neo-pronoun sets.

    Optionally filter by popularity tier.
    """
    all_sets = get_all_sets()

    if popularity:
        try:
            tier = PopularityTier(popularity)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid popularity tier '{popularity}'. "
                f"Valid values: {', '.join(t.value for t in PopularityTier)}",
            )
        all_sets = [s for s in all_sets if s.popularity == tier]

    return NeoPronounListResponse(
        count=len(all_sets),
        sets=[_to_response(s) for s in all_sets],
    )


@router.get("/check")
async def check_token(
    token: str = Query(..., description="The word to check against the registry"),
) -> NeoPronounCheckResponse:
    """Check if a word is a recognized neo-pronoun form.

    Returns the matching neo-pronoun sets if it is.
    """
    from app.nlp.neo_pronouns import classify_neo_pronoun

    matches = classify_neo_pronoun(token)
    return NeoPronounCheckResponse(
        token=token,
        is_neo_pronoun=bool(matches),
        matching_sets=[label for label, _ in matches],
    )


@router.get("/{label}", response_model=NeoPronounResponse)
async def get_neo_pronoun_set(label: str):
    """Get a specific neo-pronoun set by its label (e.g. 'ze/hir')."""
    nps = get_set_by_label(label)
    if nps is None:
        raise HTTPException(
            status_code=404,
            detail=f"Neo-pronoun set '{label}' not found.",
        )
    return _to_response(nps)
