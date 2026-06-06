from __future__ import annotations

from pathlib import Path

import pytest

from app.exceptions import PromptConfigurationError
from app.services import llm_service


def test_prompt_loads_successfully(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    prompt_path = tmp_path / "system_prompt.txt"
    prompt_path.write_text("Policy Mitra prompt text", encoding="utf-8")
    monkeypatch.setattr(llm_service, "SYSTEM_PROMPT_PATH", prompt_path)
    llm_service.load_system_prompt.cache_clear()

    prompt = llm_service.load_system_prompt()

    assert prompt == "Policy Mitra prompt text"


def test_missing_prompt_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    prompt_path = tmp_path / "missing.txt"
    monkeypatch.setattr(llm_service, "SYSTEM_PROMPT_PATH", prompt_path)
    llm_service.load_system_prompt.cache_clear()

    with pytest.raises(PromptConfigurationError):
        llm_service.load_system_prompt()


def test_cached_prompt_reuse(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    prompt_path = tmp_path / "system_prompt.txt"
    prompt_path.write_text("cached prompt", encoding="utf-8")
    monkeypatch.setattr(llm_service, "SYSTEM_PROMPT_PATH", prompt_path)
    llm_service.load_system_prompt.cache_clear()

    call_count = {"reads": 0}
    original_read_text = Path.read_text

    def tracked_read_text(self: Path, *args, **kwargs):
        call_count["reads"] += 1
        return original_read_text(self, *args, **kwargs)

    monkeypatch.setattr(Path, "read_text", tracked_read_text)

    first = llm_service.load_system_prompt()
    second = llm_service.load_system_prompt()

    assert first == "cached prompt"
    assert second == "cached prompt"
    assert call_count["reads"] == 1