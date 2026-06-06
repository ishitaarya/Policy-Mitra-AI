from __future__ import annotations

from pathlib import Path
from typing import Any

from app.services import llm_service
from app.services.retrieval_service import build_context, retrieve_relevant_chunks


NO_MATCH_RESPONSE = {
    "answer": "Bhai ye policy document mein nahi mila.",
    "risk_level": "UNKNOWN",
    "confidence": 0,
    "action_items": [],
    "sources": [],
}


def _calculate_numeric_confidence(top_score: float) -> int:
    return max(0, min(100, int(round(top_score * 100))))


def _build_sources(chunks: list[dict[str, object]]) -> list[dict[str, object]]:
    sources: list[dict[str, object]] = []
    for chunk in chunks:
        text = str(chunk["text"])
        excerpt = " ".join(text.split())[:200]
        sources.append({"page": chunk["page"], "excerpt": excerpt})
    return sources


def answer_policy_question(
    document_id: str,
    question: str,
    persist_dir: str | Path | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    retrieval = retrieve_relevant_chunks(
        query=question,
        document_id=document_id,
        persist_dir=persist_dir,
        top_k=top_k,
    )

    chunks = retrieval["chunks"]
    if not chunks:
        return dict(NO_MATCH_RESPONSE)

    top_score = max(float(chunk["score"]) for chunk in chunks)
    confidence = _calculate_numeric_confidence(top_score)
    if top_score <= 0.0:
        return dict(NO_MATCH_RESPONSE)

    context = build_context(chunks)
    llm_response = llm_service.generate_structured_response(evidence=context, question=question)

    return {
        "answer": llm_response["answer"],
        "risk_level": llm_response["risk_level"],
        "confidence": confidence,
        "action_items": llm_response["action_items"],
        "sources": _build_sources(chunks),
        "metadata": {
            "document_id": document_id,
            "chunks_used": len(chunks),
            "top_score": float(retrieval.get("top_score", round(top_score, 2))),
        },
    }