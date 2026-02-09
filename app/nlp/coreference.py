"""Coreference resolution – links pronouns to their antecedent entities.

Uses spaCy's built-in capabilities for entity recognition and basic
coreference heuristics. When a resolved entity matches a known identity
in the database, cross-references the pronoun against stated preferences
and flags mismatches.

Note: For the MVP we use a rule-based coreference heuristic rather than
a full neural coreference model. This keeps dependencies light and
avoids GPU requirements. The architecture allows swapping in a
transformer-based coreference model later.
"""

from __future__ import annotations

from dataclasses import dataclass

import spacy
from spacy.tokens import Doc

from app.nlp.pronoun_detector import PronounMatch


@dataclass
class CoreferenceLink:
    """A resolved link between a pronoun and its antecedent."""

    pronoun: PronounMatch
    antecedent_text: str
    antecedent_start: int
    antecedent_end: int
    confidence: float  # 0.0–1.0


@dataclass
class MisgenderingFlag:
    """Raised when a pronoun doesn't match a person's stated pronouns."""

    pronoun: PronounMatch
    person_name: str
    used_pronoun: str
    expected_pronouns: list[str]
    confidence: float


class CoreferenceResolver:
    """Rule-based coreference resolver for MVP.

    Strategy (simplified):
    1. Collect named-entity PERSON spans.
    2. For each pronoun, find the nearest preceding PERSON entity in
       the same sentence or the previous sentence.
    3. If no PERSON entity is found, fall back to the nearest preceding
       noun phrase with a compatible number feature.
    """

    def __init__(self, nlp: spacy.language.Language) -> None:
        self._nlp = nlp

    def resolve(
        self,
        doc: Doc,
        pronouns: list[PronounMatch],
    ) -> list[CoreferenceLink]:
        """Resolve pronoun → antecedent links."""
        # Gather PERSON entities
        person_entities = [
            ent for ent in doc.ents if ent.label_ == "PERSON"
        ]

        links: list[CoreferenceLink] = []
        for pm in pronouns:
            link = self._resolve_single(doc, pm, person_entities)
            if link is not None:
                links.append(link)
        return links

    def check_misgendering(
        self,
        links: list[CoreferenceLink],
        identity_map: dict[str, list[dict[str, str]]],
    ) -> list[MisgenderingFlag]:
        """Check resolved links against known identity preferences.

        Parameters
        ----------
        identity_map:
            Mapping of lowercased display name → list of pronoun-set dicts.
            Each dict has keys: subject, object, possessive,
            possessive_pronoun, reflexive.
        """
        flags: list[MisgenderingFlag] = []
        for link in links:
            name_lower = link.antecedent_text.lower()
            pronoun_sets = identity_map.get(name_lower)
            if pronoun_sets is None:
                continue

            used = link.pronoun.lemma
            ptype = link.pronoun.pronoun_type

            # Collect all acceptable pronoun forms for this type
            acceptable: set[str] = set()
            for ps in pronoun_sets:
                val = ps.get(ptype, "")
                if val:
                    acceptable.add(val.lower())

            if not acceptable:
                continue

            if used not in acceptable:
                flags.append(
                    MisgenderingFlag(
                        pronoun=link.pronoun,
                        person_name=link.antecedent_text,
                        used_pronoun=used,
                        expected_pronouns=sorted(acceptable),
                        confidence=link.confidence,
                    )
                )

        return flags

    # ------------------------------------------------------------------
    # Internal heuristics
    # ------------------------------------------------------------------

    def _resolve_single(
        self,
        doc: Doc,
        pronoun: PronounMatch,
        person_entities: list,
    ) -> CoreferenceLink | None:
        """Try to resolve a single pronoun to a PERSON entity."""
        # Find the spaCy token corresponding to this pronoun
        pronoun_token = None
        for token in doc:
            if token.idx == pronoun.start:
                pronoun_token = token
                break
        if pronoun_token is None:
            return None

        sent = pronoun_token.sent

        # Strategy 1: nearest preceding PERSON entity in same sentence
        best = None
        best_dist = float("inf")

        for ent in person_entities:
            # Entity must start before the pronoun
            if ent.start_char >= pronoun.start:
                continue

            # Prefer same sentence
            ent_in_same_sent = ent.start >= sent.start and ent.end <= sent.end

            # Also accept previous sentence
            prev_sent = None
            for s in doc.sents:
                if s.end == sent.start:
                    prev_sent = s
                    break
            ent_in_prev_sent = (
                prev_sent is not None
                and ent.start >= prev_sent.start
                and ent.end <= prev_sent.end
            )

            if not (ent_in_same_sent or ent_in_prev_sent):
                continue

            dist = pronoun.start - ent.end_char
            conf = 0.8 if ent_in_same_sent else 0.5

            if dist < best_dist:
                best_dist = dist
                best = CoreferenceLink(
                    pronoun=pronoun,
                    antecedent_text=ent.text,
                    antecedent_start=ent.start_char,
                    antecedent_end=ent.end_char,
                    confidence=conf,
                )

        return best
