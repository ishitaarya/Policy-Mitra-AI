from __future__ import annotations

import logging
from pathlib import Path

import chromadb

from app.models.document_models import ChunkRecord, IngestionStatistics

logger = logging.getLogger(__name__)

COLLECTION_NAME = "policy_documents"


def _get_client(persist_dir: str | Path | None = None) -> chromadb.PersistentClient:
    directory = Path(persist_dir or "./vectorstore")
    directory.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(directory))


def _get_collection(client: chromadb.PersistentClient):
    return client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})


def store_chunks(
    chunks: list[ChunkRecord],
    embeddings: list[list[float]],
    persist_dir: str | Path | None = None,
) -> IngestionStatistics:
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings must have the same length")

    if not chunks:
        raise ValueError("no chunks provided")

    client = _get_client(persist_dir)
    collection = _get_collection(client)

    collection.add(
        ids=[chunk.chunk_id for chunk in chunks],
        documents=[chunk.text for chunk in chunks],
        metadatas=[
            {
                "document_id": chunk.document_id,
                "page": chunk.page,
                "chunk_id": chunk.chunk_id,
                "chunk_text": chunk.text,
            }
            for chunk in chunks
        ],
        embeddings=embeddings,
    )

    document_id = chunks[0].document_id
    stats = IngestionStatistics(
        document_id=document_id,
        pages=len({chunk.page for chunk in chunks}),
        chunks_created=len(chunks),
    )
    logger.info(
        "chunks stored | document_id=%s | pages=%s | chunks_created=%s",
        stats.document_id,
        stats.pages,
        stats.chunks_created,
    )
    return stats


def get_document_chunks(
    document_id: str,
    persist_dir: str | Path | None = None,
) -> list[dict[str, object]]:
    client = _get_client(persist_dir)
    collection = _get_collection(client)
    result = collection.get(where={"document_id": document_id}, include=["documents", "metadatas"])

    records: list[dict[str, object]] = []
    for document_text, metadata in zip(result.get("documents", []), result.get("metadatas", []), strict=False):
        records.append(
            {
                "document_id": metadata["document_id"],
                "page": metadata["page"],
                "chunk_id": metadata["chunk_id"],
                "text": document_text,
            }
        )

    return sorted(records, key=lambda item: (int(item["page"]), str(item["chunk_id"])))