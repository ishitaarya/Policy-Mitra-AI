from __future__ import annotations

import json

import pytest

from app.exceptions import ModelConfigurationError
from app.services import llm_service


class FakeModel:
    def __init__(self, model_id: str):
        self.id = model_id


class FakeModelsAPI:
    def __init__(self, model_ids: list[str]):
        self.model_ids = model_ids

    def list(self):
        return type("Response", (), {"data": [FakeModel(model_id) for model_id in self.model_ids]})()


class FakeChatCompletions:
    def __init__(self, content: str):
        self.content = content

    def create(self, **kwargs):
        return type(
            "Response",
            (),
            {
                "choices": [
                    type(
                        "Choice",
                        (),
                        {
                            "message": type("Message", (), {"content": self.content})()
                        },
                    )()
                ]
            },
        )()


class FakeOpenAIClient:
    def __init__(self, model_ids: list[str], content: str = ""):
        self.models = FakeModelsAPI(model_ids)
        self.chat = type("Chat", (), {"completions": FakeChatCompletions(content)})()


def _build_service(monkeypatch: pytest.MonkeyPatch, model_ids: list[str], content: str = ""):
    monkeypatch.setenv("NAVIGATE_API_KEY", "test-key")
    monkeypatch.setenv("NAVIGATE_BASE_URL", "https://example.invalid")
    monkeypatch.setenv("MODEL_NAME", "supported-model")
    monkeypatch.setattr(llm_service, "OpenAI", lambda **kwargs: FakeOpenAIClient(model_ids, content))
    llm_service._default_service = None
    return llm_service.NavigateLabsLLMService()


def test_model_validation(monkeypatch: pytest.MonkeyPatch) -> None:
    service = _build_service(monkeypatch, ["supported-model", "other-model"])

    assert service.list_models() == ["supported-model", "other-model"]
    service.validate_model()


def test_missing_model(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("NAVIGATE_API_KEY", "test-key")
    monkeypatch.setenv("NAVIGATE_BASE_URL", "https://example.invalid")
    monkeypatch.setenv("MODEL_NAME", "missing-model")
    monkeypatch.setattr(llm_service, "OpenAI", lambda **kwargs: FakeOpenAIClient(["supported-model"]))
    llm_service._default_service = None

    with pytest.raises(ModelConfigurationError):
        llm_service.NavigateLabsLLMService()


def test_empty_evidence_returns_fallback(monkeypatch: pytest.MonkeyPatch) -> None:
    service = _build_service(monkeypatch, ["supported-model"])

    response = service.generate_structured_response(evidence="   ", question="attendance?")

    assert response == {
        "answer": "Bhai ye policy document mein nahi mila.",
        "risk_level": "UNKNOWN",
        "action_items": [],
    }


def test_successful_structured_response(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = {"answer": "Bhai 75% attendance required hai.", "risk_level": "HIGH", "action_items": ["Meet HOD"]}
    service = _build_service(monkeypatch, ["supported-model"], content=json.dumps(payload))

    response = service.generate_structured_response(evidence="75% attendance required.", question="attendance?")

    assert response == payload


def test_invalid_json_response(monkeypatch: pytest.MonkeyPatch) -> None:
    service = _build_service(monkeypatch, ["supported-model"], content="not json")

    with pytest.raises(ValueError):
        service.generate_structured_response(evidence="75% attendance required.", question="attendance?")