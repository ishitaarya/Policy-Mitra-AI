from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.services import eli5_service

client = TestClient(app)


def test_explain_simple_endpoint(monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.explain_simple",
        lambda document_id, question: {"simple_explanation": "Bhai simplified"},
    )

    resp = client.post("/explain-simple", json={"document_id": "doc-1", "question": "attendance?"})
    assert resp.status_code == 200
    assert resp.json()["simple_explanation"] == "Bhai simplified"
        # Removed accidental '*** End Patch' text