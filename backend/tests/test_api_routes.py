from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.exceptions import CorruptedPDFError
from app.main import app
from app.models.document_models import ChunkRecord, IngestionStatistics
from app.services import policy_workflow


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_success(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("UPLOADS_DIR", str(tmp_path))
    monkeypatch.setattr("app.api.routes.compute_document_id", lambda path: "doc-123")
    monkeypatch.setattr("app.api.routes.load_pdf", lambda path: [{"page": 1, "text": "Attendance must be 75%."}])
    monkeypatch.setattr(
        "app.api.routes.create_chunks",
        lambda pages, document_id: [ChunkRecord(document_id=document_id, page=1, chunk_id=f"{document_id}-p1-c1", text="Attendance must be 75%.")],
    )
    monkeypatch.setattr("app.api.routes.generate_embeddings", lambda texts: [[0.1, 0.2, 0.3]])
    monkeypatch.setattr(
        "app.api.routes.store_chunks",
        lambda chunks, embeddings, persist_dir=None: IngestionStatistics(document_id="doc-123", pages=1, chunks_created=1),
    )

    response = client.post(
        "/upload-policy",
        files={"file": ("policy.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json() == {
        "document_id": "doc-123",
        "pages": 1,
        "chunks_created": 1,
        "status": "indexed",
    }
    assert (tmp_path / "policy.pdf").exists()


def test_upload_invalid_pdf(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("UPLOADS_DIR", str(tmp_path))
    monkeypatch.setattr(
        "app.api.routes.load_pdf",
        lambda path: (_ for _ in ()).throw(CorruptedPDFError("Unable to parse PDF")),
    )

    response = client.post(
        "/upload-policy",
        files={"file": ("policy.pdf", b"not a pdf", "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unable to parse PDF"


def test_ask_success(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.api.routes.answer_policy_question",
        lambda document_id, question: {
            "answer": "Bhai minimum 75% attendance maintain karna zaroori hai.",
            "risk_level": "HIGH",
            "confidence": 92,
            "action_items": ["Maintain at least 75% attendance"],
            "consequence": "May be debarred from examinations.",
            "sources": [{"page": 12, "excerpt": "Students must maintain 75% attendance."}],
            "metadata": {"document_id": document_id, "chunks_used": 2, "top_score": 0.91},
        },
    )

    response = client.post(
        "/ask",
        json={"document_id": "doc-1", "question": "attendance short ka scene kya hai?"},
    )

    assert response.status_code == 200
    assert response.json()["confidence"] == 92
    assert response.json()["metadata"] == {"document_id": "doc-1", "chunks_used": 2, "top_score": 0.91}


def test_ask_no_evidence(monkeypatch) -> None:
    monkeypatch.setattr("app.api.routes.answer_policy_question", lambda document_id, question: dict(policy_workflow.NO_MATCH_RESPONSE))

    response = client.post(
        "/ask",
        json={"document_id": "doc-1", "question": "attendance short ka scene kya hai?"},
    )

    assert response.status_code == 200
    assert response.json() == policy_workflow.NO_MATCH_RESPONSE