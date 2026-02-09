"""Neo-pronoun registry – comprehensive catalogue of neo-pronoun sets.

Provides a curated, extensible registry of neo-pronouns (pronouns beyond
he/she/they) so the Inklude engine can detect and validate them in text.

Each entry includes the full conjugation (subject, object, possessive
determiner, possessive pronoun, reflexive) plus metadata like origin,
usage notes, and popularity tier.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class PopularityTier(str, Enum):
    """How commonly encountered a neo-pronoun set is."""
    COMMON = "common"           # Frequently used in communities
    MODERATE = "moderate"       # Well-known but less common
    EMERGING = "emerging"       # Newer or niche usage
    HISTORICAL = "historical"   # Has historical usage


@dataclass(frozen=True)
class NeoPronounSet:
    """A complete neo-pronoun conjugation with metadata."""

    subject: str           # e.g. "ze"
    object: str            # e.g. "hir"
    possessive: str        # e.g. "hir"  (determiner: "hir book")
    possessive_pronoun: str  # e.g. "hirs" (standalone: "the book is hirs")
    reflexive: str         # e.g. "hirself"
    label: str             # Human-readable label, e.g. "ze/hir"
    popularity: PopularityTier = PopularityTier.MODERATE
    origin: str = ""       # Brief origin/history note
    usage_note: str = ""   # Guidance on usage
    example: str = ""      # Example sentence


# ---------------------------------------------------------------------------
# Master registry
# ---------------------------------------------------------------------------

_NEO_PRONOUN_SETS: list[NeoPronounSet] = [
    # --- ze/hir family (very common) ---
    NeoPronounSet(
        subject="ze",
        object="hir",
        possessive="hir",
        possessive_pronoun="hirs",
        reflexive="hirself",
        label="ze/hir",
        popularity=PopularityTier.COMMON,
        origin="Coined in the 1990s; widely adopted in LGBTQ+ communities.",
        usage_note="One of the most widely recognized neo-pronoun sets.",
        example="Ze went to the store. I saw hir there. That book is hirs.",
    ),
    # --- ze/zir family ---
    NeoPronounSet(
        subject="ze",
        object="zir",
        possessive="zir",
        possessive_pronoun="zirs",
        reflexive="zirself",
        label="ze/zir",
        popularity=PopularityTier.COMMON,
        origin="Variant of ze/hir using 'z' throughout for consistency.",
        usage_note="Popular alternative to ze/hir with a more consistent spelling.",
        example="Ze laughed. I called zir. That is zir jacket. The idea was zirs.",
    ),
    # --- xe/xem family ---
    NeoPronounSet(
        subject="xe",
        object="xem",
        possessive="xyr",
        possessive_pronoun="xyrs",
        reflexive="xemself",
        label="xe/xem",
        popularity=PopularityTier.COMMON,
        origin="Emerged in online communities in the early 2000s.",
        usage_note="Uses the distinctive 'x' prefix. Pronounced 'zee/zem'.",
        example="Xe smiled. I told xem the news. Xyr coat is here. This is xyrs.",
    ),
    # --- ey/em family (Spivak pronouns) ---
    NeoPronounSet(
        subject="ey",
        object="em",
        possessive="eir",
        possessive_pronoun="eirs",
        reflexive="emself",
        label="ey/em",
        popularity=PopularityTier.COMMON,
        origin="Based on the Spivak pronoun system; 'they' with the 'th' removed.",
        usage_note="Sometimes called Spivak pronouns. Simple and easy to learn.",
        example="Ey went home. I saw em leave. Eir bag was heavy. That seat is eirs.",
    ),
    # --- fae/faer family ---
    NeoPronounSet(
        subject="fae",
        object="faer",
        possessive="faer",
        possessive_pronoun="faers",
        reflexive="faerself",
        label="fae/faer",
        popularity=PopularityTier.MODERATE,
        origin="Inspired by the word 'fairy/fae' from folklore traditions.",
        usage_note="Popular in some online and creative communities.",
        example="Fae is an artist. I admire faer work. Faer studio is beautiful.",
    ),
    # --- ve/ver family ---
    NeoPronounSet(
        subject="ve",
        object="ver",
        possessive="vis",
        possessive_pronoun="vis",
        reflexive="verself",
        label="ve/ver",
        popularity=PopularityTier.MODERATE,
        origin="Created as a simple, phonetically intuitive set.",
        usage_note="Easy to pronounce and integrate into everyday speech.",
        example="Ve is coming. I will meet ver there. Vis phone is ringing.",
    ),
    # --- ne/nem family ---
    NeoPronounSet(
        subject="ne",
        object="nem",
        possessive="nir",
        possessive_pronoun="nirs",
        reflexive="nemself",
        label="ne/nem",
        popularity=PopularityTier.MODERATE,
        origin="Part of a family of minimalist neo-pronoun sets.",
        usage_note="Short and unobtrusive in text.",
        example="Ne arrived early. I greeted nem. Nir smile was warm.",
    ),
    # --- per/per family ---
    NeoPronounSet(
        subject="per",
        object="per",
        possessive="pers",
        possessive_pronoun="pers",
        reflexive="perself",
        label="per/per",
        popularity=PopularityTier.MODERATE,
        origin="Derived from 'person'; used since the 1970s in feminist writing.",
        usage_note="Based on 'person'. Same form for subject and object.",
        example="Per is a great writer. I work with per. Pers ideas are brilliant.",
    ),
    # --- e/em family (simplified Spivak) ---
    NeoPronounSet(
        subject="e",
        object="em",
        possessive="eir",
        possessive_pronoun="eirs",
        reflexive="emself",
        label="e/em",
        popularity=PopularityTier.MODERATE,
        origin="Simplified variant of the Spivak system using just 'e'.",
        usage_note="Very minimal. Context helps distinguish from other uses of 'e'.",
        example="E is talented. I spoke with em about eir project.",
    ),
    # --- thon/thon family (historical) ---
    NeoPronounSet(
        subject="thon",
        object="thon",
        possessive="thons",
        possessive_pronoun="thons",
        reflexive="thonself",
        label="thon/thon",
        popularity=PopularityTier.HISTORICAL,
        origin="Coined by Charles Crozat Converse in 1858; appeared in dictionaries.",
        usage_note="One of the earliest documented neo-pronouns in English.",
        example="Thon left already. I will call thon later. Thons work is thorough.",
    ),
    # --- ae/aer family ---
    NeoPronounSet(
        subject="ae",
        object="aer",
        possessive="aer",
        possessive_pronoun="aers",
        reflexive="aerself",
        label="ae/aer",
        popularity=PopularityTier.EMERGING,
        origin="Emerged in online communities as an alternative to fae/faer.",
        usage_note="Phonetically similar to 'ay/air'. Used in some fantasy and creative spaces.",
        example="Ae is here. I met aer yesterday. Aer smile was bright.",
    ),
    # --- co/co family ---
    NeoPronounSet(
        subject="co",
        object="co",
        possessive="cos",
        possessive_pronoun="cos",
        reflexive="coself",
        label="co/co",
        popularity=PopularityTier.EMERGING,
        origin="Proposed by Mary Orovan in 1970 as a truly neutral pronoun.",
        usage_note="Same form for subject and object. Simple to use.",
        example="Co is ready. I asked co about cos schedule.",
    ),
    # --- hu/hum family ---
    NeoPronounSet(
        subject="hu",
        object="hum",
        possessive="hus",
        possessive_pronoun="hus",
        reflexive="humself",
        label="hu/hum",
        popularity=PopularityTier.EMERGING,
        origin="Derived from 'human'; proposed as a universal neutral pronoun.",
        usage_note="Based on 'human' — intuitive for new users.",
        example="Hu is talented. I work with hum. Hus project won an award.",
    ),
    # --- it/its (by choice) ---
    NeoPronounSet(
        subject="it",
        object="it",
        possessive="its",
        possessive_pronoun="its",
        reflexive="itself",
        label="it/its",
        popularity=PopularityTier.MODERATE,
        origin="Standard English pronoun reclaimed by some nonbinary individuals.",
        usage_note=(
            "Only use if a person has explicitly stated it/its as their pronouns. "
            "Never assume. Using it/its without consent is dehumanizing."
        ),
        example="It went to the park. I saw it there. Its jacket is red.",
    ),
    # --- sie/hir family (German-influenced) ---
    NeoPronounSet(
        subject="sie",
        object="hir",
        possessive="hir",
        possessive_pronoun="hirs",
        reflexive="hirself",
        label="sie/hir",
        popularity=PopularityTier.MODERATE,
        origin="Influenced by the German 'sie' (she/they); adopted in English contexts.",
        usage_note="Pronounced 'see/here'. Same object forms as ze/hir.",
        example="Sie is talented. I asked hir about the project. Hir ideas are great.",
    ),
    # --- tey/tem family ---
    NeoPronounSet(
        subject="tey",
        object="tem",
        possessive="ter",
        possessive_pronoun="ters",
        reflexive="temself",
        label="tey/tem",
        popularity=PopularityTier.EMERGING,
        origin="A variation on they/them with distinct forms for clarity.",
        usage_note="Avoids ambiguity of singular 'they' while staying close phonetically.",
        example="Tey is coming. I will meet tem at the cafe. Ter order is ready.",
    ),
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Build lookup tables for fast detection
_REGISTRY: dict[str, NeoPronounSet] = {}
_ALL_NEO_TOKENS: dict[str, list[tuple[NeoPronounSet, str]]] = {}


def _build_lookups() -> None:
    """Populate lookup tables from the master list."""
    for nps in _NEO_PRONOUN_SETS:
        _REGISTRY[nps.label] = nps
        # Index every form → (set, pronoun_type)
        forms = {
            nps.subject: "subject",
            nps.object: "object",
            nps.possessive: "possessive",
            nps.possessive_pronoun: "possessive_pronoun",
            nps.reflexive: "reflexive",
        }
        for form, ptype in forms.items():
            lower = form.lower()
            if lower not in _ALL_NEO_TOKENS:
                _ALL_NEO_TOKENS[lower] = []
            _ALL_NEO_TOKENS[lower].append((nps, ptype))


_build_lookups()


def get_all_sets() -> list[NeoPronounSet]:
    """Return all registered neo-pronoun sets."""
    return list(_NEO_PRONOUN_SETS)


def get_set_by_label(label: str) -> NeoPronounSet | None:
    """Look up a neo-pronoun set by its label (e.g. 'ze/hir')."""
    return _REGISTRY.get(label)


def is_neo_pronoun(token: str) -> bool:
    """Check if a token (case-insensitive) is a known neo-pronoun form."""
    return token.lower() in _ALL_NEO_TOKENS


def classify_neo_pronoun(token: str) -> list[tuple[str, str]]:
    """Classify a neo-pronoun token.

    Returns a list of (label, pronoun_type) tuples — may have multiple
    matches if the form appears in more than one set (e.g. 'hir' appears
    in both ze/hir and sie/hir).
    """
    results = _ALL_NEO_TOKENS.get(token.lower(), [])
    return [(nps.label, ptype) for nps, ptype in results]


def get_all_neo_tokens() -> set[str]:
    """Return the set of all known neo-pronoun token forms (lowercased)."""
    return set(_ALL_NEO_TOKENS.keys())


def register_custom_set(neo_set: NeoPronounSet) -> None:
    """Register a custom neo-pronoun set at runtime.

    This allows user-defined pronoun sets to be added to the detection
    engine dynamically.
    """
    _NEO_PRONOUN_SETS.append(neo_set)
    _REGISTRY[neo_set.label] = neo_set
    forms = {
        neo_set.subject: "subject",
        neo_set.object: "object",
        neo_set.possessive: "possessive",
        neo_set.possessive_pronoun: "possessive_pronoun",
        neo_set.reflexive: "reflexive",
    }
    for form, ptype in forms.items():
        lower = form.lower()
        if lower not in _ALL_NEO_TOKENS:
            _ALL_NEO_TOKENS[lower] = []
        _ALL_NEO_TOKENS[lower].append((neo_set, ptype))
