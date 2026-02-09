"""Tests for pronoun detection."""

import spacy
import pytest

from app.nlp.pronoun_detector import PronounDetector


@pytest.fixture(scope="module")
def nlp():
    return spacy.load("en_core_web_md")


@pytest.fixture(scope="module")
def detector(nlp):
    return PronounDetector(nlp)


class TestPronounDetector:
    def test_detects_he_him(self, nlp, detector):
        doc = nlp("Alex said he would send him the report.")
        matches = detector.detect(doc)
        texts = [m.text.lower() for m in matches]
        assert "he" in texts
        assert "him" in texts

    def test_detects_she_her(self, nlp, detector):
        doc = nlp("Maria said she would finish her presentation.")
        matches = detector.detect(doc)
        texts = [m.text.lower() for m in matches]
        assert "she" in texts
        assert "her" in texts

    def test_detects_they_them(self, nlp, detector):
        doc = nlp("Jordan said they would bring their laptop with them.")
        matches = detector.detect(doc)
        texts = [m.text.lower() for m in matches]
        assert "they" in texts
        assert "their" in texts
        assert "them" in texts

    def test_detects_reflexive(self, nlp, detector):
        doc = nlp("She hurt herself during the meeting.")
        matches = detector.detect(doc)
        texts = [m.text.lower() for m in matches]
        assert "herself" in texts

    def test_classifies_subject(self, nlp, detector):
        doc = nlp("He runs every morning.")
        matches = detector.detect(doc)
        he_match = next(m for m in matches if m.text.lower() == "he")
        assert he_match.pronoun_type == "subject"

    def test_classifies_object(self, nlp, detector):
        doc = nlp("Give the book to her.")
        matches = detector.detect(doc)
        her_match = next(m for m in matches if m.text.lower() == "her")
        assert her_match.pronoun_type in ("object", "possessive")

    def test_span_offsets_correct(self, nlp, detector):
        text = "She is great."
        doc = nlp(text)
        matches = detector.detect(doc)
        for m in matches:
            assert text[m.start : m.end] == m.text

    def test_no_pronouns_in_neutral_text(self, nlp, detector):
        doc = nlp("The team completed the project on time.")
        matches = detector.detect(doc)
        # Should have no gendered pronoun matches
        assert len(matches) == 0
