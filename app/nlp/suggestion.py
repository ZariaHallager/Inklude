"""Suggestion generator – produces actionable, tone-aware suggestions.

Takes detected issues (gendered language matches, misgendering flags)
and produces user-facing suggestions with educational explanations.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.nlp.coreference import MisgenderingFlag
from app.nlp.gendered_language import GenderedMatch
from app.nlp.lexicon import Severity
from app.schemas.analysis import (
    DetectedIssue,
    IssueCategory,
    IssueSeverity,
    Suggestion,
    TextSpan,
    ToneMode,
)


# ---------------------------------------------------------------------------
# Tone-specific explanation templates
# ---------------------------------------------------------------------------

_GENDERED_LANG_TEMPLATES: dict[ToneMode, str] = {
    ToneMode.GENTLE: (
        'Consider using "{alt}" instead of "{term}". '
        "{note}"
    ),
    ToneMode.DIRECT: (
        '"{term}" is gendered language. '
        'Use "{alt}" instead. {note}'
    ),
    ToneMode.RESEARCH_BACKED: (
        'Studies show that gendered language can reinforce stereotypes and '
        'create exclusionary environments. Replace "{term}" with "{alt}". '
        "{note}"
    ),
}

_MISGENDERING_TEMPLATES: dict[ToneMode, str] = {
    ToneMode.GENTLE: (
        "It looks like {name} uses {expected} pronouns. "
        'You wrote "{used}" — would you like to update it?'
    ),
    ToneMode.DIRECT: (
        "{name}'s pronouns are {expected}. "
        '"{used}" is incorrect. Please update.'
    ),
    ToneMode.RESEARCH_BACKED: (
        "Using someone's correct pronouns is a fundamental sign of respect. "
        "Research shows that misgendering causes measurable psychological harm. "
        "{name} uses {expected} pronouns — please replace \"{used}\"."
    ),
}


def _severity_map(s: Severity) -> IssueSeverity:
    return {
        Severity.LOW: IssueSeverity.LOW,
        Severity.MEDIUM: IssueSeverity.MEDIUM,
        Severity.HIGH: IssueSeverity.HIGH,
    }[s]


def _category_from_lexicon(cat_value: str) -> IssueCategory:
    """Map lexicon category to schema IssueCategory."""
    mapping = {
        "job_title": IssueCategory.GENDERED_TITLE,
        "salutation": IssueCategory.GENDERED_SALUTATION,
        "colloquialism": IssueCategory.GENDERED_COLLOQUIALISM,
        "honorific": IssueCategory.GENDERED_LANGUAGE,
        "pronoun_related": IssueCategory.GENDERED_LANGUAGE,
        "familial": IssueCategory.GENDERED_LANGUAGE,
        "gendered_descriptor": IssueCategory.GENDERED_LANGUAGE,
        "institutional": IssueCategory.GENDERED_LANGUAGE,
        "maritime_military": IssueCategory.GENDERED_LANGUAGE,
        "compound": IssueCategory.GENDERED_COLLOQUIALISM,
    }
    return mapping.get(cat_value, IssueCategory.GENDERED_LANGUAGE)


class SuggestionGenerator:
    """Produces user-facing suggestions from detected issues."""

    def from_gendered_match(
        self, match: GenderedMatch, tone: ToneMode = ToneMode.GENTLE
    ) -> DetectedIssue:
        """Create a DetectedIssue from a gendered-language match."""
        template = _GENDERED_LANG_TEMPLATES[tone]
        entry = match.entry
        first_alt = entry.alternatives[0] if entry.alternatives else match.text

        suggestions = []
        for alt in entry.alternatives:
            explanation = template.format(
                term=match.text, alt=alt, note=entry.note
            )
            suggestions.append(
                Suggestion(
                    replacement=alt,
                    explanation=explanation,
                    confidence=0.9,
                )
            )

        return DetectedIssue(
            span=TextSpan(start=match.start, end=match.end, text=match.text),
            category=_category_from_lexicon(entry.category.value),
            severity=_severity_map(entry.severity),
            message=template.format(
                term=match.text, alt=first_alt, note=entry.note
            ),
            suggestions=suggestions,
        )

    def from_misgendering(
        self, flag: MisgenderingFlag, tone: ToneMode = ToneMode.GENTLE
    ) -> DetectedIssue:
        """Create a DetectedIssue from a misgendering flag."""
        template = _MISGENDERING_TEMPLATES[tone]
        expected_str = "/".join(flag.expected_pronouns)

        message = template.format(
            name=flag.person_name,
            expected=expected_str,
            used=flag.used_pronoun,
        )

        suggestions = []
        for pron in flag.expected_pronouns:
            suggestions.append(
                Suggestion(
                    replacement=pron,
                    explanation=message,
                    confidence=flag.confidence,
                )
            )

        return DetectedIssue(
            span=TextSpan(
                start=flag.pronoun.start,
                end=flag.pronoun.end,
                text=flag.pronoun.text,
            ),
            category=IssueCategory.MISGENDERING,
            severity=IssueSeverity.HIGH,
            message=message,
            suggestions=suggestions,
        )
