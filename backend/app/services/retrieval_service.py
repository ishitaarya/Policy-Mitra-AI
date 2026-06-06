from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from app.config import storage_path
from app.database.chroma_client import _get_client, _get_collection
from app.ingestion.embeddings import generate_query_embedding

logger = logging.getLogger(__name__)


def _persist_dir(persist_dir: str | Path | None) -> str | Path:
    return persist_dir or storage_path("CHROMA_PERSIST_DIR", "vectorstore")


def _distance_to_score(distance: float) -> float:
    return max(0.0, min(1.0, 1.0 - distance))


def calculate_confidence(top_score: float) -> str:
    if top_score >= 0.85:
        return "HIGH"
    if top_score >= 0.60:
        return "MEDIUM"
    return "LOW"


def retrieve_relevant_chunks(
    query: str,
    document_id: str,
    persist_dir: str | Path | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    client = _get_client(_persist_dir(persist_dir))
    collection = _get_collection(client)
    matching_chunks = collection.count() and collection.get(
        where={"document_id": document_id},
        include=[],
    )
    match_count = len(matching_chunks.get("ids", [])) if matching_chunks else 0

    if match_count == 0:
        logger.warning("retrieval | document_id=%s | no indexed chunks", document_id)
        return {
            "query": query,
            "chunks": [],
            "top_score": 0.0,
            "confidence": "LOW",
        }

    result = collection.query(
        query_embeddings=[generate_query_embedding(query)],
        n_results=min(top_k, match_count),
        where={"document_id": document_id},
        include=["documents", "metadatas", "distances"],
    )

    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]
    chunks: list[dict[str, Any]] = []

    for text, metadata, distance in zip(documents, metadatas, distances, strict=False):
        chunks.append(
            {
                "text": text,
                "score": _distance_to_score(float(distance)),
                "page": metadata.get("page", 0),
                "document_id": metadata.get("document_id", document_id),
                "chunk_id": metadata.get("chunk_id"),
            }
        )

    top_score = max((chunk["score"] for chunk in chunks), default=0.0)
    logger.info(
        "retrieval | document_id=%s | chunks=%d | scores=%s",
        document_id,
        len(chunks),
        [round(chunk["score"], 4) for chunk in chunks],
    )
    return {
        "query": query,
        "chunks": chunks,
        "top_score": top_score,
        "confidence": calculate_confidence(top_score),
    }


def retrieve_context(
    document_id: str,
    question: str,
    persist_dir: str | Path | None = None,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    return retrieve_relevant_chunks(
        query=question,
        document_id=document_id,
        persist_dir=persist_dir,
        top_k=top_k,
    )["chunks"]


def build_context(chunks: list[dict[str, Any]]) -> str:
    return "\n\n".join(
        f"[page {chunk.get('page', 0)}] {chunk['text']}"
        for chunk in chunks
    )
