"""Tests for the suggestion generator."""

import pytest

from app.nlp.gendered_language import GenderedMatch
from app.nlp.coreference import MisgenderingFlag
from app.nlp.lexicon import LexiconCategory, LexiconEntry, Severity
from app.nlp.pronoun_detector import PronounMatch
from app.nlp.suggestion import SuggestionGenerator
from app.schemas.analysis import IssueCategory, IssueSeverity, ToneMode


@pytest.fixture
def generator():
    return SuggestionGenerator()


class TestSuggestionFromGenderedMatch:
    def test_gentle_tone(self, generator):
        entry = LexiconEntry(
            term="chairman",
            alternatives=["chairperson", "chair"],
            category=LexiconCategory.JOB_TITLE,
            severity=Severity.MEDIUM,
            note="Gender-neutral alternatives are widely adopted.",
        )
        match = GenderedMatch(start=4, end=12, text="chairman", entry=entry)
        issue = generator.from_gendered_match(match, ToneMode.GENTLE)

        assert issue.category == IssueCategory.GENDERED_TITLE
        assert issue.severity == IssueSeverity.MEDIUM
        assert len(issue.suggestions) == 2
        assert issue.suggestions[0].replacement == "chairperson"
        assert "Consider" in issue.message

    def test_direct_tone(self, generator):
        entry = LexiconEntry(
            term="fireman",
            alternatives=["firefighter"],
            category=LexiconCategory.JOB_TITLE,
            severity=Severity.MEDIUM,
            note="Standard since the 1990s.",
        )
        match = GenderedMatch(start=0, end=7, text="fireman", entry=entry)
        issue = generator.from_gendered_match(match, ToneMode.DIRECT)

        assert "gendered language" in issue.message.lower()
        assert issue.suggestions[0].replacement == "firefighter"

    def test_research_backed_tone(self, generator):
        entry = LexiconEntry(
            term="mankind",
            alternatives=["humankind", "humanity"],
            category=LexiconCategory.COLLOQUIALISM,
            severity=Severity.LOW,
            note="Humankind is inclusive.",
        )
        match = GenderedMatch(start=0, end=7, text="mankind", entry=entry)
        issue = generator.from_gendered_match(match, ToneMode.RESEARCH_BACKED)

        assert "studies" in issue.message.lower() or "research" in issue.message.lower()


class TestSuggestionFromMisgendering:
    def test_misgendering_suggestion(self, generator):
        pronoun = PronounMatch(
            start=30, end=32, text="he", pronoun_type="subject", lemma="he"
        )
        flag = MisgenderingFlag(
            pronoun=pronoun,
            person_name="Alex",
            used_pronoun="he",
            expected_pronouns=["they"],
            confidence=0.8,
        )
        issue = generator.from_misgendering(flag, ToneMode.GENTLE)

        assert issue.category == IssueCategory.MISGENDERING
        assert issue.severity == IssueSeverity.HIGH
        assert "Alex" in issue.message
        assert issue.suggestions[0].replacement == "they"

    def test_misgendering_direct_tone(self, generator):
        pronoun = PronounMatch(
            start=10, end=13, text="him", pronoun_type="object", lemma="him"
        )
        flag = MisgenderingFlag(
            pronoun=pronoun,
            person_name="Jordan",
            used_pronoun="him",
            expected_pronouns=["them"],
            confidence=0.7,
        )
        issue = generator.from_misgendering(flag, ToneMode.DIRECT)

        assert "incorrect" in issue.message.lower() or "Jordan" in issue.message
