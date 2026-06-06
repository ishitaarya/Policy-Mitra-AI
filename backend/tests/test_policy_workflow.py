from __future__ import annotations

from pathlib import Path

import pytest

from app.services import policy_workflow


def test_successful_workflow(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {
            "query": kwargs["query"],
            "chunks": [
                {
                    "document_id": kwargs["document_id"],
                    "page": 12,
                    "chunk_id": "chunk-1",
                    "text": "Students must maintain 75% attendance. Students below 75% may be debarred from examinations.",
                    "score": 0.915,
                },
                {
                    "document_id": kwargs["document_id"],
                    "page": 13,
                    "chunk_id": "chunk-2",
                    "text": "Attendance shortfall requires approval from the department.",
                    "score": 0.88,
                },
            ],
            "top_score": 0.91,
            "confidence": "HIGH",
        },
    )
    monkeypatch.setattr(
        policy_workflow.llm_service,
        "generate_structured_response",
        lambda evidence, question: {
            "answer": "Bhai minimum 75% attendance maintain karna zaroori hai.",
            "risk_level": "HIGH",
            "action_items": ["Maintain at least 75% attendance"],
            "consequence": "May be debarred from examinations.",
        },
    )

    response = policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance short ka scene kya hai?")

    assert response["answer"]
    assert response["risk_level"] == "HIGH"
    assert response["confidence"] == 92
    assert response["action_items"] == ["Maintain at least 75% attendance"]
    assert response["sources"] == [
        {
            "page": 12,
            "excerpt": "Students must maintain 75% attendance. Students below 75% may be debarred from examinations.",
        },
        {
            "page": 13,
            "excerpt": "Attendance shortfall requires approval from the department.",
        },
    ]
    assert response["metadata"] == {"document_id": "doc-1", "chunks_used": 2, "top_score": 0.91}


def test_no_evidence_returns_fallback(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {"query": kwargs["query"], "chunks": [], "top_score": 0.0, "confidence": "LOW"},
    )
    llm_called = {"value": False}

    def fake_llm(*args, **kwargs):
        llm_called["value"] = True
        return {}

    monkeypatch.setattr(policy_workflow.llm_service, "generate_structured_response", fake_llm)

    response = policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance short ka scene kya hai?")

    assert response == policy_workflow.NO_MATCH_RESPONSE
    assert llm_called["value"] is False


def test_llm_exception_propagates(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {
            "query": kwargs["query"],
            "chunks": [
                {
                    "document_id": kwargs["document_id"],
                    "page": 12,
                    "chunk_id": "chunk-1",
                    "text": "Students must maintain 75% attendance.",
                    "score": 0.9,
                }
            ],
            "top_score": 0.9,
            "confidence": "HIGH",
        },
    )
    monkeypatch.setattr(policy_workflow.llm_service, "generate_structured_response", lambda **kwargs: (_ for _ in ()).throw(ValueError("LLM failed")))

    with pytest.raises(ValueError, match="LLM failed"):
        policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance short ka scene kya hai?")


def test_retrieval_exception_propagates(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(policy_workflow, "retrieve_relevant_chunks", lambda **kwargs: (_ for _ in ()).throw(RuntimeError("Retrieval failed")))

    with pytest.raises(RuntimeError, match="Retrieval failed"):
        policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance short ka scene kya hai?")


def test_metadata_verification(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {
            "query": kwargs["query"],
            "chunks": [
                {
                    "document_id": kwargs["document_id"],
                    "page": 7,
                    "chunk_id": "chunk-7",
                    "text": "A student may submit a medical certificate for attendance relaxation.",
                    "score": 0.801,
                },
                {
                    "document_id": kwargs["document_id"],
                    "page": 9,
                    "chunk_id": "chunk-9",
                    "text": "Department approval is required for attendance exceptions.",
                    "score": 0.654,
                },
            ],
            "top_score": 0.8,
            "confidence": "HIGH",
        },
    )
    monkeypatch.setattr(
        policy_workflow.llm_service,
        "generate_structured_response",
        lambda **kwargs: {"answer": "ok", "risk_level": "LOW", "action_items": [], "consequence": "Not specified in policy."},
    )

    response = policy_workflow.answer_policy_question(document_id="doc-77", question="Question?")

    assert response["metadata"] == {"document_id": "doc-77", "chunks_used": 2, "top_score": 0.8}
    assert response["confidence"] == 80