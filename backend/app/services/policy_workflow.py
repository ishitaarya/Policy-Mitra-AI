from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from app.services import llm_service
from app.services.retrieval_service import build_context, retrieve_relevant_chunks

logger = logging.getLogger(__name__)

NO_MATCH_RESPONSE = {
    "answer": "Bhai ye policy document mein nahi mila.",
    "risk_level": "UNKNOWN",
    "confidence": 0,
    "action_items": [],
    "sources": [],
    "consequence": "Not specified in policy.",
}


def _calculate_numeric_confidence(top_score: float) -> int:
    return max(0, min(100, int(round(top_score * 100))))


def _build_sources(chunks: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {"page": chunk["page"], "excerpt": " ".join(str(chunk["text"]).split())[:200]}
        for chunk in chunks
    ]


def _assign_priority_for_task(task: str, risk_level: str) -> str:
    t = task.lower()
    if risk_level == "HIGH":
        return "HIGH"
    if any(x in t for x in ("must", "required", "immediately", "urgent", "debar")):
        return "HIGH"
    if any(x in t for x in ("should", "may", "recommend", "suggest", "request")):
        return "MEDIUM"
    return "LOW"


def _build_action_plan(action_items: list[str], risk_level: str) -> list[dict[str, str]]:
    return [{"task": task, "priority": _assign_priority_for_task(task, risk_level)} for task in action_items]


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
        logger.warning("workflow | document_id=%s | no evidence", document_id)
        return dict(NO_MATCH_RESPONSE)

    top_score = float(retrieval["top_score"])
    min_score = float(os.getenv("RETRIEVAL_MIN_SCORE", "0.45"))
    if top_score < min_score:
        logger.warning(
            "workflow | document_id=%s | weak evidence top_score=%.4f threshold=%.4f",
            document_id,
            top_score,
            min_score,
        )
        return dict(NO_MATCH_RESPONSE)

    confidence = _calculate_numeric_confidence(top_score)
    context = build_context(chunks)

    try:
        llm_response = llm_service.generate_structured_response(evidence=context, question=question)
    except llm_service.StructuredResponseError:
        return dict(NO_MATCH_RESPONSE)

    risk_level = str(llm_response.get("risk_level", "UNKNOWN")).upper()
    if risk_level not in {"LOW", "MEDIUM", "HIGH", "UNKNOWN"}:
        risk_level = "UNKNOWN"

    return {
        "answer": str(llm_response.get("answer", "")),
        "risk_level": risk_level,
        "confidence": confidence,
        "action_items": llm_response.get("action_items", []),
        "action_plan": _build_action_plan(llm_response.get("action_items", []), risk_level),
        "consequence": llm_response.get("consequence", "Not specified in policy."),
        "sources": _build_sources(chunks),
        "metadata": {
            "document_id": document_id,
            "chunks_used": len(chunks),
            "top_score": round(top_score, 2),
        },
    }
