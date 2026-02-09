"""Tests for gendered language detection."""

import spacy
import pytest

from app.nlp.gendered_language import GenderedLanguageDetector


@pytest.fixture(scope="module")
def nlp():
    return spacy.load("en_core_web_md")


@pytest.fixture(scope="module")
def detector(nlp):
    return GenderedLanguageDetector(nlp)


class TestGenderedLanguageDetector:
    def test_detects_chairman(self, nlp, detector):
        doc = nlp("The chairman called the meeting to order.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        terms = [m.text.lower() for m in active]
        assert "chairman" in terms

    def test_suggests_alternatives(self, nlp, detector):
        doc = nlp("Our fireman rescued the cat.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        fireman_match = next(m for m in active if m.text.lower() == "fireman")
        assert "firefighter" in fireman_match.entry.alternatives

    def test_detects_hey_guys(self, nlp, detector):
        doc = nlp("Hey guys, let's get started.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        terms = [m.text.lower() for m in active]
        assert "hey guys" in terms or "guys" in terms

    def test_detects_manpower(self, nlp, detector):
        doc = nlp("We need more manpower on this project.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        terms = [m.text.lower() for m in active]
        assert "manpower" in terms

    def test_suppresses_named_entities(self, nlp, detector):
        doc = nlp("Guy Fieri makes amazing food.")
        matches = detector.detect(doc)
        # "Guy" appears as part of a PERSON entity – should be suppressed
        active = [m for m in matches if not m.suppressed]
        guy_matches = [m for m in active if "guy" in m.text.lower()]
        # Should either not detect or suppress
        assert len(guy_matches) == 0

    def test_no_false_positive_on_clean_text(self, nlp, detector):
        doc = nlp("The team finished the quarterly report ahead of schedule.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        assert len(active) == 0

    def test_span_offsets_correct(self, nlp, detector):
        text = "The policeman arrived on scene."
        doc = nlp(text)
        matches = detector.detect(doc)
        for m in matches:
            assert text[m.start : m.end].lower() == m.text.lower()

    def test_detects_multiple_issues(self, nlp, detector):
        doc = nlp("The chairman told the fireman and the policeman to report.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        assert len(active) >= 3

    def test_detects_dear_sir(self, nlp, detector):
        doc = nlp("Dear Sir, I am writing to apply for the position.")
        matches = detector.detect(doc)
        active = [m for m in matches if not m.suppressed]
        terms = [m.text.lower() for m in active]
        assert "dear sir" in terms
