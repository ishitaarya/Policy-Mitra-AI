from __future__ import annotations

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

    assert response["risk_level"] == "HIGH"
    assert response["confidence"] == 92
    assert response["action_items"] == ["Maintain at least 75% attendance"]
    assert response["sources"][0]["page"] == 12


def test_weak_evidence_returns_fallback_without_calling_llm(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {
            "query": kwargs["query"],
            "chunks": [{"page": 2, "chunk_id": "weak", "text": "Scholarship forms.", "score": 0.21}],
            "top_score": 0.21,
            "confidence": "LOW",
        },
    )
    llm_called = {"value": False}

    def fake_llm(*args, **kwargs):
        llm_called["value"] = True
        return {}

    monkeypatch.setattr(policy_workflow.llm_service, "generate_structured_response", fake_llm)

    response = policy_workflow.answer_policy_question(document_id="doc-1", question="Hostel curfew?")
    assert response == policy_workflow.NO_MATCH_RESPONSE
    assert llm_called["value"] is False


def test_no_evidence_returns_fallback(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {"query": kwargs["query"], "chunks": [], "top_score": 0.0, "confidence": "LOW"},
    )
    response = policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance?")
    assert response == policy_workflow.NO_MATCH_RESPONSE


def test_llm_exception_propagates(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        policy_workflow,
        "retrieve_relevant_chunks",
        lambda **kwargs: {
            "query": kwargs["query"],
            "chunks": [{"document_id": kwargs["document_id"], "page": 12, "chunk_id": "chunk-1", "text": "Students must maintain 75% attendance.", "score": 0.9}],
            "top_score": 0.9,
            "confidence": "HIGH",
        },
    )
    monkeypatch.setattr(
        policy_workflow.llm_service,
        "generate_structured_response",
        lambda **kwargs: (_ for _ in ()).throw(ValueError("LLM failed")),
    )

    with pytest.raises(ValueError, match="LLM failed"):
        policy_workflow.answer_policy_question(document_id="doc-1", question="Attendance?")
