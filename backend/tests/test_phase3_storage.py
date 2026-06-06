from __future__ import annotations

from pathlib import Path

import pytest

from app.database.chroma_client import get_document_chunks, store_chunks
from app.ingestion.chunker import create_chunks
from app.ingestion.embeddings import generate_embeddings


class FakeEmbeddingModel:
    def encode(self, texts: list[str], normalize_embeddings: bool = True):
        return [[float(len(text)), 1.0, 0.0] for text in texts]


def test_chunk_creation_preserves_metadata() -> None:
    pages = [
        {"page": 1, "text": "A" * 900},
        {"page": 2, "text": "Attendance requires 75 percent."},
    ]

    chunks = create_chunks(pages, document_id="doc-123")

    assert chunks
    assert all(chunk.document_id == "doc-123" for chunk in chunks)
    assert chunks[0].page == 1
    assert chunks[0].chunk_id.startswith("doc-123-p1-c")
    assert all(chunk.text for chunk in chunks)


def test_generate_embeddings(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.ingestion.embeddings.get_embedding_model", lambda: FakeEmbeddingModel())

    embeddings = generate_embeddings(["first chunk", "second chunk"])

    assert embeddings == [[11.0, 1.0, 0.0], [12.0, 1.0, 0.0]]


def test_chroma_storage_and_stats(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.ingestion.embeddings.get_embedding_model", lambda: FakeEmbeddingModel())

    pages = [
        {"page": 1, "text": "Attendance requires 75 percent. " * 30},
        {"page": 2, "text": "Medical certificate needed within 3 days."},
    ]
    chunks = create_chunks(pages, document_id="doc-xyz")
    embeddings = generate_embeddings([chunk.text for chunk in chunks])

    stats = store_chunks(chunks, embeddings, persist_dir=tmp_path)

    assert stats.document_id == "doc-xyz"
    assert stats.pages == 2
    assert stats.chunks_created == len(chunks)


def test_chroma_retrieval_by_document_id(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.ingestion.embeddings.get_embedding_model", lambda: FakeEmbeddingModel())

    pages = [
        {"page": 1, "text": "Attendance requires 75 percent. " * 30},
        {"page": 2, "text": "Medical certificate needed within 3 days."},
    ]
    chunks = create_chunks(pages, document_id="doc-fetch")
    embeddings = generate_embeddings([chunk.text for chunk in chunks])
    store_chunks(chunks, embeddings, persist_dir=tmp_path)

    stored_chunks = get_document_chunks("doc-fetch", persist_dir=tmp_path)

    assert len(stored_chunks) == len(chunks)
    assert all(item["document_id"] == "doc-fetch" for item in stored_chunks)
    assert stored_chunks[0]["page"] == 1
    assert stored_chunks[0]["text"]
