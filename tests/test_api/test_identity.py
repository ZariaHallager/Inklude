"""Tests for identity CRUD endpoints."""

import pytest

from tests.conftest import API_KEY_HEADER


@pytest.mark.asyncio
async def test_create_identity(client):
    payload = {
        "email": "alex@example.com",
        "display_name": "Alex Rivera",
        "pronoun_sets": [
            {
                "subject": "they",
                "object": "them",
                "possessive": "their",
                "possessive_pronoun": "theirs",
                "reflexive": "themself",
                "is_primary": True,
            }
        ],
        "preference": {
            "title": "Mx.",
            "visibility": "internal",
            "language_preference": "en",
        },
    }
    resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alex@example.com"
    assert data["display_name"] == "Alex Rivera"
    assert len(data["pronoun_sets"]) == 1
    assert data["pronoun_sets"][0]["subject"] == "they"
    assert data["preference"]["title"] == "Mx."


@pytest.mark.asyncio
async def test_create_identity_duplicate_email(client):
    payload = {
        "email": "dupe@example.com",
        "display_name": "First",
    }
    resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    assert resp.status_code == 201

    resp2 = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_get_identity(client):
    payload = {
        "email": "get@example.com",
        "display_name": "Get Test",
    }
    create_resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    identity_id = create_resp.json()["id"]

    resp = await client.get(
        f"/api/v1/identities/{identity_id}", headers=API_KEY_HEADER
    )
    assert resp.status_code == 200
    assert resp.json()["display_name"] == "Get Test"


@pytest.mark.asyncio
async def test_update_identity(client):
    payload = {
        "email": "update@example.com",
        "display_name": "Before Update",
    }
    create_resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    identity_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/v1/identities/{identity_id}",
        json={"display_name": "After Update"},
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    assert resp.json()["display_name"] == "After Update"


@pytest.mark.asyncio
async def test_delete_identity(client):
    payload = {
        "email": "delete@example.com",
        "display_name": "To Delete",
    }
    create_resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    identity_id = create_resp.json()["id"]

    resp = await client.delete(
        f"/api/v1/identities/{identity_id}", headers=API_KEY_HEADER
    )
    assert resp.status_code == 204

    get_resp = await client.get(
        f"/api/v1/identities/{identity_id}", headers=API_KEY_HEADER
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_update_pronouns(client):
    payload = {
        "email": "pronouns@example.com",
        "display_name": "Pronoun Test",
    }
    create_resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    identity_id = create_resp.json()["id"]

    pronoun_sets = [
        {
            "subject": "she",
            "object": "her",
            "possessive": "her",
            "possessive_pronoun": "hers",
            "reflexive": "herself",
            "is_primary": True,
        },
        {
            "subject": "they",
            "object": "them",
            "possessive": "their",
            "possessive_pronoun": "theirs",
            "reflexive": "themself",
            "is_primary": False,
        },
    ]
    resp = await client.put(
        f"/api/v1/identities/{identity_id}/pronouns",
        json=pronoun_sets,
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_update_preferences(client):
    payload = {
        "email": "prefs@example.com",
        "display_name": "Pref Test",
    }
    create_resp = await client.post(
        "/api/v1/identities/", json=payload, headers=API_KEY_HEADER
    )
    identity_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/v1/identities/{identity_id}/preferences",
        json={"title": "Dr.", "visibility": "public", "language_preference": "en"},
        headers=API_KEY_HEADER,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Dr."
    assert resp.json()["visibility"] == "public"


@pytest.mark.asyncio
async def test_auth_required(client):
    resp = await client.get("/api/v1/identities/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_invalid_api_key(client):
    resp = await client.get(
        "/api/v1/identities/", headers={"X-API-Key": "wrong-key"}
    )
    assert resp.status_code == 401
