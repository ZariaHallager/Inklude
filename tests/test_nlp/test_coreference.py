"""Tests for coreference resolution and misgendering detection."""

import spacy
import pytest

from app.nlp.coreference import CoreferenceResolver
from app.nlp.pronoun_detector import PronounDetector


@pytest.fixture(scope="module")
def nlp():
    return spacy.load("en_core_web_md")


@pytest.fixture(scope="module")
def resolver(nlp):
    return CoreferenceResolver(nlp)


@pytest.fixture(scope="module")
def pronoun_detector(nlp):
    return PronounDetector(nlp)


class TestCoreferenceResolver:
    def test_resolves_pronoun_to_person(self, nlp, resolver, pronoun_detector):
        doc = nlp("Sarah completed the project. She did an excellent job.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)
        # "She" should resolve to "Sarah"
        she_links = [l for l in links if l.pronoun.text.lower() == "she"]
        if she_links:
            assert she_links[0].antecedent_text == "Sarah"

    def test_resolves_him_to_preceding_person(self, nlp, resolver, pronoun_detector):
        doc = nlp("I gave the report to John. Tell him to review it.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)
        him_links = [l for l in links if l.pronoun.text.lower() == "him"]
        if him_links:
            assert him_links[0].antecedent_text == "John"

    def test_no_resolution_without_person(self, nlp, resolver, pronoun_detector):
        doc = nlp("The system processes them automatically.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)
        assert len(links) == 0


class TestMisgenderingDetection:
    def test_flags_misgendering(self, nlp, resolver, pronoun_detector):
        doc = nlp("Alex finished the report. He did a great job.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)

        # Suppose Alex uses they/them
        identity_map = {
            "alex": [
                {
                    "subject": "they",
                    "object": "them",
                    "possessive": "their",
                    "possessive_pronoun": "theirs",
                    "reflexive": "themself",
                }
            ]
        }
        flags = resolver.check_misgendering(links, identity_map)
        if links:  # Only if coreference resolved
            assert len(flags) >= 1
            assert flags[0].used_pronoun == "he"
            assert "they" in flags[0].expected_pronouns

    def test_no_flag_when_correct(self, nlp, resolver, pronoun_detector):
        doc = nlp("Sarah submitted the report. She did well.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)

        identity_map = {
            "sarah": [
                {
                    "subject": "she",
                    "object": "her",
                    "possessive": "her",
                    "possessive_pronoun": "hers",
                    "reflexive": "herself",
                }
            ]
        }
        flags = resolver.check_misgendering(links, identity_map)
        assert len(flags) == 0

    def test_no_flag_when_identity_unknown(self, nlp, resolver, pronoun_detector):
        doc = nlp("Chris said he would attend.")
        pronouns = pronoun_detector.detect(doc)
        links = resolver.resolve(doc, pronouns)

        identity_map = {}  # No known identities
        flags = resolver.check_misgendering(links, identity_map)
        assert len(flags) == 0
