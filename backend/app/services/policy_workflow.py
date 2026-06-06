from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from app.services import llm_service
from app.services.retrieval_service import build_context, retrieve_context

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
    sources: list[dict[str, object]] = []
    for chunk in chunks:
        text = str(chunk["text"])
        excerpt = " ".join(text.split())[:200]
        sources.append({"page": chunk["page"], "excerpt": excerpt})
    return sources


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
    plan: list[dict[str, str]] = []
    for task in action_items:
        priority = _assign_priority_for_task(task, risk_level)
        plan.append({"task": task, "priority": priority})
    return plan


def answer_policy_question(
    document_id: str,
    question: str,
    persist_dir: str | Path | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    logger.info(
        "workflow | document_id=%s | question=%.200s | persist_dir=%s",
        document_id,
        question,
        persist_dir,
    )

    chunks = retrieve_context(
        document_id=document_id,
        question=question,
        persist_dir=persist_dir
    )

    logger.info(
        "workflow | document_id=%s | chunks_retrieved=%d",
        document_id,
        len(chunks),
    )

    if not chunks:
        logger.warning("workflow | document_id=%s | NO chunks found → returning NO_MATCH", document_id)
        return dict(NO_MATCH_RESPONSE)

    top_score = max((float(chunk["score"]) for chunk in chunks), default=0.0)
    confidence = _calculate_numeric_confidence(top_score)

    # Note: similarity score could be 0 if distance >= 1
    if top_score <= 0.0:
        logger.warning(
            "workflow | document_id=%s | top_score=%.4f ≤ 0 → returning NO_MATCH",
            document_id,
            top_score,
        )
        return dict(NO_MATCH_RESPONSE)

    context = build_context(chunks)
    logger.debug("workflow | document_id=%s | context_chars=%d", document_id, len(context))

    llm_response = llm_service.generate_structured_response(evidence=context, question=question)
    logger.info(
        "workflow | document_id=%s | llm_answer_preview=%.200s",
        document_id,
        str(llm_response.get("answer", "")),
    )

    return {
        "answer": llm_response["answer"],
        "risk_level": llm_response["risk_level"],
        "confidence": confidence,
        "action_items": llm_response["action_items"],
        "action_plan": _build_action_plan(llm_response["action_items"], llm_response["risk_level"]),
        "consequence": llm_response.get("consequence", "Not specified in policy."),
        "sources": _build_sources(chunks),
        "metadata": {
            "document_id": document_id,
            "chunks_used": len(chunks),
            "top_score": round(top_score, 2),
        },
    }