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


def _read_env(name: str, fallback: str | None = None) -> str:
    value = os.getenv(name)
    if value:
        return value
    if fallback is not None:
        fallback_value = os.getenv(fallback)
        if fallback_value:
            return fallback_value
    return ""


@lru_cache(maxsize=1)
def load_system_prompt() -> str:
    try:
        return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError as exc:
        raise PromptConfigurationError(f"Missing system prompt file: {SYSTEM_PROMPT_PATH}") from exc


def _clean_json_output(content: str) -> str:
    """Strip markdown code fences from LLM output if present."""
    content = content.strip()
    if content.startswith("```"):
        # Match ```json ... ``` or just ``` ... ```
        content = re.sub(r"^```(?:json)?\s*(.*?)\s*```$", r"\1", content, flags=re.DOTALL)
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
        available_models = self.list_models()
        if self.model_name not in available_models:
            raise ModelConfigurationError(f"Model '{self.model_name}' is not available")

    def _build_messages(self, evidence: str, question: str) -> list[dict[str, str]]:
        user_prompt = (
            f"Question:\n{question}\n\n"
            f"Retrieved Evidence:\n{evidence}\n\n"
            "Return JSON only."
        )
        return [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_prompt},
        ]

    def generate_structured_response(self, evidence: str, question: str) -> dict[str, Any]:
        if not evidence.strip():
            logger.warning("llm | empty evidence provided")
            return dict(EMPTY_EVIDENCE_RESPONSE)

        logger.info("llm | requesting completion | model=%s", self.model_name)
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=self._build_messages(evidence=evidence, question=question),
            temperature=0,
        )

        content = response.choices[0].message.content
        if not content:
            logger.error("llm | empty response from model")
            raise ValueError("Empty response from model")

        content = _clean_json_output(content)
        
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("llm | failed to parse JSON | content=%.100s | error=%s", content, exc)
            raise ValueError(f"Failed to parse model response as JSON: {exc}") from exc

        if not isinstance(parsed, dict):
            raise ValueError("Model response must be a JSON object")

        for key in ("answer", "risk_level", "action_items", "consequence"):
            if key not in parsed:
                logger.error("llm | missing required key | key=%s | parsed=%s", key, parsed)
                raise ValueError(f"Missing required key: {key}")

        if not isinstance(parsed["action_items"], list):
            raise ValueError("action_items must be a list")

        return {
            "answer": parsed["answer"],
            "risk_level": parsed["risk_level"],
            "consequence": parsed["consequence"],
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
    """Generate a freeform text response using a custom system prompt.

    This uses the existing NavigateLabs client and is a thin wrapper so
    higher-level services can load prompts from files and pass them in.
    """
    service = _get_service()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Question:\n{question}\n\nRetrieved Evidence:\n{evidence}\n\n"},
    ]

    response = service.client.chat.completions.create(model=service.model_name, messages=messages, temperature=0)
    content = response.choices[0].message.content
    if not content:
        raise ValueError("Empty response from model")
    return content