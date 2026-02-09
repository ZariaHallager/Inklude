"""Gendered language detector.

Scans text against the curated lexicon and uses spaCy NER and
dependency parsing to suppress false positives (e.g., proper nouns
like "Guy Fieri" should not flag "guy").
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import spacy
from spacy.tokens import Doc

from app.nlp.lexicon import LEXICON, LexiconCategory, LexiconEntry, Severity, get_all_terms


@dataclass
class GenderedMatch:
    """A single gendered-language match in source text."""

    start: int
    end: int
    text: str  # original surface form
    entry: LexiconEntry
    suppressed: bool = False  # True if NER/context says it's a false positive


class GenderedLanguageDetector:
    """Detects gendered language in text using a lexicon + NER guard."""

    def __init__(self, nlp: spacy.language.Language) -> None:
        self._nlp = nlp
        # Pre-compile regex patterns for multi-word terms (longest first)
        self._patterns: list[tuple[re.Pattern[str], LexiconEntry]] = []
        for term in get_all_terms():
            entry = LEXICON[term]
            # Word-boundary-aware pattern
            pat = re.compile(r"\b" + re.escape(term) + r"\b", re.IGNORECASE)
            self._patterns.append((pat, entry))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect(self, doc: Doc) -> list[GenderedMatch]:
        """Return all gendered-language matches, marking false positives."""
        text = doc.text
        raw_matches = self._find_raw_matches(text)

        # Build a set of character spans covered by named entities
        entity_spans = set()
        for ent in doc.ents:
            for i in range(ent.start_char, ent.end_char):
                entity_spans.add(i)

        # Suppress matches that overlap with named entities
        for match in raw_matches:
            if any(i in entity_spans for i in range(match.start, match.end)):
                match.suppressed = True

        # Also suppress honorifics when they appear right before a known name
        for match in raw_matches:
            if match.entry.category == LexiconCategory.HONORIFIC:
                after = text[match.end :].lstrip()
                # Check if the next word is a named entity
                for ent in doc.ents:
                    if ent.start_char >= match.end and after.startswith(ent.text):
                        # Honorific before a known name – lower severity,
                        # but don't suppress (the person may prefer Mx.)
                        break

        return raw_matches

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _find_raw_matches(self, text: str) -> list[GenderedMatch]:
        """Find all lexicon matches via regex (no NER filtering yet)."""
        matches: list[GenderedMatch] = []
        seen_spans: set[tuple[int, int]] = set()

        for pattern, entry in self._patterns:
            for m in pattern.finditer(text):
                span = (m.start(), m.end())
                # Skip if this span is a sub-span of an already-found match
                if span in seen_spans:
                    continue
                # Skip if this span overlaps with a longer match
                overlap = False
                for s in seen_spans:
                    if m.start() >= s[0] and m.end() <= s[1]:
                        overlap = True
                        break
                if overlap:
                    continue

                seen_spans.add(span)
                matches.append(
                    GenderedMatch(
                        start=m.start(),
                        end=m.end(),
                        text=m.group(),
                        entry=entry,
                    )
                )

        # Sort by position
        matches.sort(key=lambda m: m.start)
        return matches
