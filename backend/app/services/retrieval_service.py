from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from app.database.chroma_client import _get_client, _get_collection
from app.ingestion.embeddings import generate_embeddings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RetrievedChunk:
    document_id: str
    page: int
    chunk_id: str
    text: str
    score: float


def _distance_to_score(distance: float) -> float:
    """Convert ChromaDB cosine distance [0, 2] to similarity score [0, 1]."""
    return max(0.0, min(1.0, 1.0 - distance))


def calculate_confidence(top_score: float) -> str:
    if top_score >= 0.85:
        return "HIGH"
    if top_score >= 0.70:
        return "MEDIUM"
    if top_score > 0.0:
        return "LOW"
    return "LOW"


def retrieve_relevant_chunks(
    query: str,
    document_id: str,
    persist_dir: str | Path | None = None,
    top_k: int = 5,
) -> dict[str, object]:
    logger.info(
        "retrieval | document_id=%s | persist_dir=%s | query=%.200s",
        document_id,
        persist_dir,
        query,
    )

    client = _get_client(persist_dir)
    collection = _get_collection(client)

    total_in_collection = collection.count()
    logger.info("retrieval | total_docs_in_collection=%d", total_in_collection)

    query_embedding = generate_embeddings([query])[0]

    result = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"document_id": document_id},
        include=["documents", "metadatas", "distances"],
    )

    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]

    logger.info(
        "retrieval | document_id=%s | raw_matches=%d | raw_distances=%s",
        document_id,
        len(documents),
        [round(float(d), 4) for d in distances],
    )

    chunks: list[dict[str, object]] = []
    top_score = 0.0

    for doc_text, metadata, distance in zip(documents, metadatas, distances, strict=False):
        score = _distance_to_score(float(distance))
        top_score = max(top_score, score)
        chunks.append(
            {
                "document_id": metadata["document_id"],
                "page": metadata["page"],
                "chunk_id": metadata["chunk_id"],
                "text": doc_text,
                "score": score,
            }
        )
        logger.debug(
            "retrieval | chunk_id=%s | page=%s | score=%.4f | preview=%.300s",
            metadata["chunk_id"],
            metadata["page"],
            score,
            doc_text,
        )

    logger.info(
        "retrieval | document_id=%s | chunks_returned=%d | top_score=%.4f | confidence=%s",
        document_id,
        len(chunks),
        top_score,
        calculate_confidence(top_score),
    )

    return {
        "query": query,
        "chunks": sorted(chunks, key=lambda item: item["score"], reverse=True),
        "top_score": round(top_score, 2),
        "confidence": calculate_confidence(top_score),
    }


def build_context(chunks: list[dict[str, object]]) -> str:
    lines: list[str] = []
    for chunk in chunks:
        lines.append(f"[page {chunk['page']}] {chunk['text']}")
    return "\n\n".join(lines)
