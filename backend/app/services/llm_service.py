from __future__ import annotations

import json
import logging
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from openai import OpenAI

from app.exceptions import ModelConfigurationError, PromptConfigurationError

logger = logging.getLogger(__name__)

EMPTY_EVIDENCE_RESPONSE = {
    "answer": "Bhai ye policy document mein nahi mila.",
    "risk_level": "UNKNOWN",
    "action_items": [],
    "consequence": "Not specified in policy.",
}

SYSTEM_PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "system_prompt.txt"


class StructuredResponseError(ValueError):
    def __init__(self, message: str, raw_content: str):
        super().__init__(message)
        self.raw_content = raw_content


def _read_env(name: str, fallback: str | None = None) -> str:
    value = os.getenv(name)
    if value:
        return value
    return os.getenv(fallback, "") if fallback else ""


@lru_cache(maxsize=1)
def load_system_prompt() -> str:
    try:
        return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError as exc:
        raise PromptConfigurationError(f"Missing system prompt file: {SYSTEM_PROMPT_PATH}") from exc


def _clean_json_output(content: str) -> str:
    content = content.strip()
    fence = chr(96) * 3
    if content.startswith(fence):
        content = re.sub(r"^" + re.escape(fence) + r"(?:json)?\s*(.*?)\s*" + re.escape(fence) + r"$", r"\1", content, flags=re.DOTALL)
    return content.strip()


class NavigateLabsLLMService:
    def __init__(self) -> None:
        self.api_key = _read_env("NAVIGATE_API_KEY", "NAVIGATE_LABS_API_KEY")
        self.base_url = _read_env("NAVIGATE_BASE_URL", "NAVIGATE_LABS_BASE_URL")
        self.model_name = _read_env("MODEL_NAME", "NAVIGATE_LABS_MODEL")

        if not self.api_key or not self.base_url or not self.model_name:
            raise ModelConfigurationError("Missing Navigate Labs configuration")

        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        self.system_prompt = load_system_prompt()
        self.validate_model()

    def list_models(self) -> list[str]:
        response = self.client.models.list()
        return [model.id for model in response.data]

    def validate_model(self) -> None:
        if self.model_name not in self.list_models():
            raise ModelConfigurationError(f"Model '{self.model_name}' is not available")

    def _build_messages(self, evidence: str, question: str) -> list[dict[str, str]]:
        return [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": f"Question:\n{question}\n\nRetrieved Evidence:\n{evidence}\n\nReturn JSON only.",
            },
        ]

    def generate_structured_response(self, evidence: str, question: str) -> dict[str, Any]:
        if not evidence.strip():
            return dict(EMPTY_EVIDENCE_RESPONSE)

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=self._build_messages(evidence=evidence, question=question),
            temperature=0,
        )
        content = response.choices[0].message.content
        if not content:
            raise StructuredResponseError("Empty response from model", raw_content="")

        content = _clean_json_output(content)
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise StructuredResponseError(
                f"Failed to parse model response as JSON: {exc}",
                raw_content=content,
            ) from exc

        if not isinstance(parsed, dict):
            raise StructuredResponseError("Model response must be a JSON object", raw_content=content)

        required = ("answer", "risk_level", "action_items", "consequence")
        missing = [key for key in required if key not in parsed]
        if missing:
            raise StructuredResponseError(
                f"Missing required keys: {', '.join(missing)}",
                raw_content=str(parsed.get("answer") or content),
            )

        if not isinstance(parsed["answer"], str) or not parsed["answer"].strip():
            raise StructuredResponseError("answer must be a non-empty string", raw_content=content)
        if not isinstance(parsed["risk_level"], str):
            raise StructuredResponseError("risk_level must be a string", raw_content=content)
        if not isinstance(parsed["action_items"], list) or not all(
            isinstance(item, str) and item.strip() for item in parsed["action_items"]
        ):
            raise StructuredResponseError("action_items must be a list of non-empty strings", raw_content=content)

        return {
            "answer": parsed["answer"].strip(),
            "risk_level": parsed["risk_level"].upper(),
            "consequence": str(parsed["consequence"]).strip(),
            "action_items": parsed["action_items"],
        }


_default_service: NavigateLabsLLMService | None = None


def _get_service() -> NavigateLabsLLMService:
    global _default_service
    if _default_service is None:
        _default_service = NavigateLabsLLMService()
    return _default_service


def list_models() -> list[str]:
    return _get_service().list_models()


def validate_model() -> None:
    _get_service().validate_model()


def generate_structured_response(evidence: str, question: str) -> dict[str, Any]:
    return _get_service().generate_structured_response(evidence=evidence, question=question)


def generate_text_response(evidence: str, question: str, system_prompt: str) -> str:
    service = _get_service()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Question:\n{question}\n\nRetrieved Evidence:\n{evidence}\n\n"},
    ]
    response = service.client.chat.completions.create(
        model=service.model_name,
        messages=messages,
        temperature=0,
    )
    content = response.choices[0].message.content
    if not content:
        raise ValueError("Empty response from model")
    return content
