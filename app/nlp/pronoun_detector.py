"""Pronoun detection using spaCy POS tagging + neo-pronoun awareness.

Identifies all pronoun tokens in text, classifies them by type
(subject, object, possessive, reflexive), and maps each to a
character span in the original text.

Supports both traditional pronouns (he/she/they) and neo-pronouns
(ze/hir, xe/xem, ey/em, fae/faer, etc.) via the neo-pronoun registry.
"""

from __future__ import annotations

from dataclasses import dataclass

import spacy
from spacy.tokens import Doc, Token

from app.nlp.neo_pronouns import classify_neo_pronoun, get_all_neo_tokens, is_neo_pronoun


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


def _classify_neo(token_text: str) -> str | None:
    """Classify a neo-pronoun token. Returns the pronoun type or None.

    When a token maps to multiple neo-pronoun sets, we pick the first
    classification (they'll agree on type in practice).
    """
    matches = classify_neo_pronoun(token_text)
    if matches:
        # Return the pronoun type from the first matching set
        return matches[0][1]
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
    is_neo_pronoun: bool = False  # True if this is a neo-pronoun


class PronounDetector:
    """Detects and classifies gendered / tracked / neo pronouns in text."""

    def __init__(self, nlp: spacy.language.Language) -> None:
        self._nlp = nlp
        # Cache neo-pronoun tokens for fast lookup
        self._neo_tokens = get_all_neo_tokens()

    def detect(self, doc: Doc) -> list[PronounMatch]:
        """Return all tracked pronoun occurrences in *doc*.

        Checks both traditional pronouns (via spaCy POS tags) and
        neo-pronouns (via the neo-pronoun registry token set).
        """
        matches: list[PronounMatch] = []
        for token in doc:
            lower = token.text.lower()

            # --- Check neo-pronouns first (they won't have PRON POS) ---
            if lower in self._neo_tokens:
                ptype = _classify_neo(token.text)
                if ptype is not None:
                    matches.append(
                        PronounMatch(
                            start=token.idx,
                            end=token.idx + len(token.text),
                            text=token.text,
                            pronoun_type=ptype,
                            lemma=lower,
                            is_neo_pronoun=True,
                        )
                    )
                continue

            # --- Standard pronoun detection ---
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
                    lemma=lower,
                    is_neo_pronoun=False,
                )
            )
        return matches
