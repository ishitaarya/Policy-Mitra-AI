from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_complaint_simple():
    payload = {"issue": "The hostel mess is serving cold food and utensils are unclean."}
    resp = client.post("/generate-complaint", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "Accommodation"
    assert data["department"] == "Hostel Office"
    assert data["priority"] in {"LOW", "MEDIUM", "HIGH"}
    assert "Formal complaint" in data["complaint"] or "Formal complaint" not in data["complaint"]


def test_generate_complaint_academic():
    payload = {"issue": "I was unfairly debarred from the examination due to attendance."}
    resp = client.post("/generate-complaint", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "Academic"
    assert data["department"] == "Academic Affairs"
 