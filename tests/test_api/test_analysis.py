"""Tests for text analysis API endpoints."""

import pytest

from tests.conftest import API_KEY_HEADER


@pytest.mark.asyncio
async def test_analyze_text_gendered_language(client):
    resp = await client.post(
        "/api/v1/analyze/text",
        json={"text": "The chairman called the meeting.", "tone": "gentle"},
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["text_length"] > 0
    assert len(data["issues"]) >= 1
    assert data["issues"][0]["category"] in (
        "gendered_language",
        "gendered_title",
    )


@pytest.mark.asyncio
async def test_analyze_text_clean(client):
    resp = await client.post(
        "/api/v1/analyze/text",
        json={"text": "The team finished the report.", "tone": "gentle"},
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["issues"]) == 0


@pytest.mark.asyncio
async def test_analyze_batch(client):
    resp = await client.post(
        "/api/v1/analyze/batch",
        json={
            "texts": [
                "The fireman saved the day.",
                "Everyone did a great job.",
            ],
            "tone": "direct",
        },
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) == 2
    # First text should have issues, second should not
    assert len(data["results"][0]["issues"]) >= 1
    assert len(data["results"][1]["issues"]) == 0


@pytest.mark.asyncio
async def test_analyze_text_with_pronouns(client):
    resp = await client.post(
        "/api/v1/analyze/text",
        json={
            "text": "Sarah said she would handle it. He agreed with her plan.",
            "tone": "gentle",
        },
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["pronouns_found"]) >= 2


@pytest.mark.asyncio
async def test_analyze_auth_required(client):
    resp = await client.post(
        "/api/v1/analyze/text",
        json={"text": "Hello world."},
    )
    assert resp.status_code == 401
