"""Pronoun detection using spaCy POS tagging.

Identifies all pronoun tokens in text, classifies them by type
(subject, object, possessive, reflexive), and maps each to a
character span in the original text.
"""

from __future__ import annotations

from dataclasses import dataclass

import spacy
from spacy.tokens import Doc, Token


# ---------------------------------------------------------------------------
# Pronoun classification tables
# ---------------------------------------------------------------------------

# Gendered pronouns we care about (lowercase).  We also track "they/them"
# because singular they needs coreference to validate.
SUBJECT_PRONOUNS = {"he", "she", "they"}
OBJECT_PRONOUNS = {"him", "her", "them"}
POSSESSIVE_DETERMINERS = {"his", "her", "their"}  # before a noun
POSSESSIVE_PRONOUNS = {"his", "hers", "theirs"}  # standalone
REFLEXIVE_PRONOUNS = {"himself", "herself", "themself", "themselves"}

ALL_TRACKED = (
    SUBJECT_PRONOUNS
    | OBJECT_PRONOUNS
    | POSSESSIVE_DETERMINERS
    | POSSESSIVE_PRONOUNS
    | REFLEXIVE_PRONOUNS
)


def _classify(token: Token) -> str | None:
    """Return the pronoun type for a spaCy token, or None if not tracked."""
    lower = token.text.lower()
    if lower not in ALL_TRACKED:
        return None

    # spaCy tags: PRP = personal pronoun, PRP$ = possessive pronoun
    tag = token.tag_

    if lower in REFLEXIVE_PRONOUNS:
        return "reflexive"

    if tag == "PRP$" or (lower in POSSESSIVE_DETERMINERS and token.dep_ in ("poss",)):
        return "possessive"

    if lower in POSSESSIVE_PRONOUNS and tag == "PRP":
        # Standalone possessive ("the book is hers")
        return "possessive_pronoun"

    if lower in SUBJECT_PRONOUNS and token.dep_ in ("nsubj", "nsubjpass", "csubj"):
        return "subject"

    if lower in OBJECT_PRONOUNS:
        return "object"

    # Fallback heuristic based on dependency role
    if token.dep_ in ("nsubj", "nsubjpass", "csubj"):
        return "subject"
    if token.dep_ in ("dobj", "iobj", "pobj", "dative"):
        return "object"
    if token.dep_ == "poss":
        return "possessive"

    # If nothing matched precisely, still return a reasonable guess
    if lower in SUBJECT_PRONOUNS:
        return "subject"
    if lower in OBJECT_PRONOUNS:
        return "object"
    if lower in POSSESSIVE_DETERMINERS:
        return "possessive"

    return None


# ---------------------------------------------------------------------------
# Public dataclass & detector
# ---------------------------------------------------------------------------


@dataclass
class PronounMatch:
    """A single pronoun occurrence in the source text."""

    start: int  # char offset
    end: int  # char offset
    text: str  # original surface form
    pronoun_type: str  # subject | object | possessive | possessive_pronoun | reflexive
    lemma: str  # lowercased canonical form


class PronounDetector:
    """Detects and classifies gendered / tracked pronouns in text."""

    def __init__(self, nlp: spacy.language.Language) -> None:
        self._nlp = nlp

    def detect(self, doc: Doc) -> list[PronounMatch]:
        """Return all tracked pronoun occurrences in *doc*."""
        matches: list[PronounMatch] = []
        for token in doc:
            if token.pos_ != "PRON":
                # Also check PRP$ which spaCy sometimes tags as DET
                if token.tag_ != "PRP$":
                    continue
            ptype = _classify(token)
            if ptype is None:
                continue
            matches.append(
                PronounMatch(
                    start=token.idx,
                    end=token.idx + len(token.text),
                    text=token.text,
                    pronoun_type=ptype,
                    lemma=token.text.lower(),
                )
            )
        return matches
