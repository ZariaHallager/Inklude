"""Tests for health check endpoints."""

import pytest
import pytest_asyncio

from tests.conftest import API_KEY_HEADER


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness(client):
    resp = await client.get("/api/v1/health/ready")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "nlp_model_loaded" in data
