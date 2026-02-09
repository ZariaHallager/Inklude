"""Pydantic schemas for text analysis requests and responses."""

import uuid
from enum import Enum

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class IssueCategory(str, Enum):
    GENDERED_LANGUAGE = "gendered_language"
    MISGENDERING = "misgendering"
    GENDERED_TITLE = "gendered_title"
    GENDERED_COLLOQUIALISM = "gendered_colloquialism"
    GENDERED_SALUTATION = "gendered_salutation"


class ToneMode(str, Enum):
    GENTLE = "gentle"
    DIRECT = "direct"
    RESEARCH_BACKED = "research_backed"


# ---------------------------------------------------------------------------
# Detected Issues
# ---------------------------------------------------------------------------


class TextSpan(BaseModel):
    """Character-level span in the original text."""

    start: int
    end: int
    text: str


class Suggestion(BaseModel):
    """A single replacement suggestion for a detected issue."""

    replacement: str
    explanation: str
    confidence: float = Field(ge=0.0, le=1.0)


class DetectedIssue(BaseModel):
    """A single issue found during analysis."""

    span: TextSpan
    category: IssueCategory
    severity: IssueSeverity
    message: str
    suggestions: list[Suggestion] = []


class PronounOccurrence(BaseModel):
    """A pronoun detected in the text."""

    span: TextSpan
    pronoun_type: str  # subject, object, possessive, possessive_pronoun, reflexive
    resolved_entity: str | None = None  # who it refers to, if resolved


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------


class AnalyzeTextRequest(BaseModel):
    """Single text analysis request."""

    text: str = Field(..., min_length=1, max_length=50_000)
    tone: ToneMode = ToneMode.GENTLE
    context_visibility: str = Field(
        default="internal",
        description="Visibility context for pronoun lookups (public/internal/team).",
    )


class AnalyzeBatchRequest(BaseModel):
    """Batch text analysis request."""

    texts: list[str] = Field(..., min_length=1, max_length=50)
    tone: ToneMode = ToneMode.GENTLE
    context_visibility: str = "internal"


class CheckPronounsRequest(BaseModel):
    """Check pronoun usage against known identities."""

    text: str = Field(..., min_length=1, max_length=50_000)
    person_ids: list[uuid.UUID] = Field(
        ..., description="IDs of people mentioned in the text."
    )
    tone: ToneMode = ToneMode.GENTLE


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class AnalysisResult(BaseModel):
    """Result of analysing a single piece of text."""

    text_length: int
    issues: list[DetectedIssue] = []
    pronouns_found: list[PronounOccurrence] = []
    summary: str = ""


class BatchAnalysisResult(BaseModel):
    """Result of batch text analysis."""

    results: list[AnalysisResult]
