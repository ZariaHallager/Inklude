"""NLP Engine – orchestrates all sub-components into a single analysis pipeline.

Usage:
    engine = NLPEngine.get_instance()
    result = engine.analyze("Send the report to chairman Davis. He should review it.")
"""

from __future__ import annotations

import logging
import threading
from typing import Any

import spacy

from app.config import settings
from app.nlp.coreference import CoreferenceResolver, MisgenderingFlag
from app.nlp.gendered_language import GenderedLanguageDetector
from app.nlp.pronoun_detector import PronounDetector, PronounMatch
from app.nlp.suggestion import SuggestionGenerator
from app.schemas.analysis import (
    AnalysisResult,
    DetectedIssue,
    PronounOccurrence,
    TextSpan,
    ToneMode,
)

logger = logging.getLogger(__name__)


class NLPEngine:
    """Singleton NLP engine that orchestrates all analysis components."""

    _instance: NLPEngine | None = None
    _lock = threading.Lock()

    def __init__(self, nlp: spacy.language.Language) -> None:
        self._nlp = nlp
        self._pronoun_detector = PronounDetector(nlp)
        self._gendered_detector = GenderedLanguageDetector(nlp)
        self._coref_resolver = CoreferenceResolver(nlp)
        self._suggestion_gen = SuggestionGenerator()

    @classmethod
    def get_instance(cls) -> NLPEngine:
        """Lazy-load the spaCy model and return the singleton engine."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    logger.info(
                        "Loading spaCy model '%s' …", settings.spacy_model
                    )
                    nlp = spacy.load(settings.spacy_model)
                    cls._instance = cls(nlp)
                    logger.info("NLP engine ready.")
        return cls._instance

    @classmethod
    def is_loaded(cls) -> bool:
        """Check if the model has been loaded (for health checks)."""
        return cls._instance is not None

    # ------------------------------------------------------------------
    # Main analysis pipeline
    # ------------------------------------------------------------------

    def analyze(
        self,
        text: str,
        tone: ToneMode = ToneMode.GENTLE,
        identity_map: dict[str, list[dict[str, str]]] | None = None,
    ) -> AnalysisResult:
        """Run the full analysis pipeline on *text*.

        Parameters
        ----------
        text:
            The text to analyse.
        tone:
            Tone mode for educational explanations.
        identity_map:
            Optional mapping of lowercased display-name → list of
            pronoun-set dicts (keys: subject, object, possessive,
            possessive_pronoun, reflexive).  When provided, enables
            misgendering detection.
        """
        doc = self._nlp(text)

        # 1. Pronoun detection
        pronoun_matches = self._pronoun_detector.detect(doc)

        # 2. Gendered language detection
        gendered_matches = self._gendered_detector.detect(doc)

        # 3. Coreference resolution
        coref_links = self._coref_resolver.resolve(doc, pronoun_matches)

        # 4. Misgendering check (if identity data available)
        misgendering_flags: list[MisgenderingFlag] = []
        if identity_map:
            misgendering_flags = self._coref_resolver.check_misgendering(
                coref_links, identity_map
            )

        # 5. Build suggestions
        issues: list[DetectedIssue] = []

        # 5a. Gendered language issues (skip suppressed)
        for gm in gendered_matches:
            if gm.suppressed:
                continue
            issues.append(self._suggestion_gen.from_gendered_match(gm, tone))

        # 5b. Misgendering issues
        for mf in misgendering_flags:
            issues.append(self._suggestion_gen.from_misgendering(mf, tone))

        # Sort issues by position in text
        issues.sort(key=lambda i: i.span.start)

        # 6. Build pronoun occurrence list (for informational purposes)
        pronoun_occurrences = []
        # Build a quick lookup from pronoun match → resolved entity
        resolved_map: dict[int, str] = {}
        for link in coref_links:
            resolved_map[link.pronoun.start] = link.antecedent_text

        for pm in pronoun_matches:
            pronoun_occurrences.append(
                PronounOccurrence(
                    span=TextSpan(start=pm.start, end=pm.end, text=pm.text),
                    pronoun_type=pm.pronoun_type,
                    resolved_entity=resolved_map.get(pm.start),
                )
            )

        # 7. Summary
        summary = self._build_summary(issues, pronoun_matches)

        return AnalysisResult(
            text_length=len(text),
            issues=issues,
            pronouns_found=pronoun_occurrences,
            summary=summary,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_summary(
        self,
        issues: list[DetectedIssue],
        pronouns: list[PronounMatch],
    ) -> str:
        """Generate a human-readable summary."""
        if not issues:
            return "No issues detected. The text appears inclusive."

        n_gendered = sum(
            1 for i in issues if i.category != "misgendering"
        )
        n_misgendering = sum(
            1 for i in issues if i.category == "misgendering"
        )

        parts = []
        if n_gendered:
            parts.append(
                f"{n_gendered} gendered language {'issue' if n_gendered == 1 else 'issues'}"
            )
        if n_misgendering:
            parts.append(
                f"{n_misgendering} potential misgendering {'instance' if n_misgendering == 1 else 'instances'}"
            )

        return f"Found {' and '.join(parts)}."
