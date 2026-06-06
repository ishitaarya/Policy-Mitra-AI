from __future__ import annotations

from pathlib import Path

from app.database.chroma_client import store_chunks
from app.ingestion.chunker import create_chunks
from app.ingestion.embeddings import generate_embeddings
from app.services.retrieval_service import build_context, calculate_confidence, retrieve_relevant_chunks


class FakeEmbeddingModel:
    def encode(self, texts: list[str], normalize_embeddings: bool = True):
        vectors = []
        for text in texts:
            score = float(len(text))
            vectors.append([score, score / 10.0, 1.0])
        return vectors


def _seed_store(tmp_path: Path) -> str:
    pages = [
        {"page": 1, "text": "Attendance must be at least 75 percent. Medical leave requires approval."},
        {"page": 2, "text": "Examination debarment may happen if attendance is below the threshold."},
    ]
    document_id = "doc-retrieval"
    chunks = create_chunks(pages, document_id=document_id)
    embeddings = generate_embeddings([chunk.text for chunk in chunks])
    store_chunks(chunks, embeddings, persist_dir=tmp_path)
    return document_id


def test_calculate_confidence() -> None:
    assert calculate_confidence(0.91) == "HIGH"
    assert calculate_confidence(0.75) == "MEDIUM"
    assert calculate_confidence(0.25) == "LOW"


def test_retrieve_relevant_chunks_and_build_context(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr("app.ingestion.embeddings.get_embedding_model", lambda: FakeEmbeddingModel())
    document_id = _seed_store(tmp_path)

    result = retrieve_relevant_chunks(
        query="attendance short hai",
        document_id=document_id,
        persist_dir=tmp_path,
        top_k=5,
    )

    assert result["query"] == "attendance short hai"
    assert result["chunks"]
    assert result["top_score"] >= 0.0
    assert result["confidence"] in {"LOW", "MEDIUM", "HIGH"}

    context = build_context(result["chunks"])
    assert "[page 1]" in context
    assert "Attendance" in context
