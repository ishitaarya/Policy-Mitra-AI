from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.services.llm_service import NavigateLabsLLMService

QUESTION = "Attendance short ka scene kya hai?"
EVIDENCE = (
    "Students must maintain 75% attendance.\n\n"
    "Students below 75% may be debarred from examinations."
)


def _load_env_from_example() -> None:
    env_path = ROOT_DIR / ".env.example"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def _raw_model_response(service: NavigateLabsLLMService) -> Any:
    response = service.client.chat.completions.create(
        model=service.model_name,
        messages=service._build_messages(evidence=EVIDENCE, question=QUESTION),
        temperature=0,
    )
    return response


def main() -> None:
    _load_env_from_example()
    service = NavigateLabsLLMService()

    raw_response = _raw_model_response(service)
    parsed = service.generate_structured_response(evidence=EVIDENCE, question=QUESTION)

    print("Raw model response:")
    print(raw_response.model_dump_json(indent=2))
    print()
    print("Parsed JSON:")
    print(json.dumps(parsed, indent=2, ensure_ascii=False))
    print()
    print("Python type:")
    print(type(parsed).__name__)


if __name__ == "__main__":
    main()
