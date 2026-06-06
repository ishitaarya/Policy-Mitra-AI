from __future__ import annotations

from app.services import eli5_service


def test_explain_simple_returns_text(monkeypatch):
    monkeypatch.setattr(
        eli5_service,
        "retrieve_relevant_chunks",
        lambda **kwargs: {"chunks": [{"page": 1, "text": "Students must maintain 75% attendance."}]},
    )
    monkeypatch.setattr(
        eli5_service.llm_service,
        "generate_text_response",
        lambda evidence, question, system_prompt: "Bhai simple explanation",
    )

    out = eli5_service.explain_simple(document_id="doc-1", question="attendance?")
    assert out["simple_explanation"] == "Bhai simple explanation"
