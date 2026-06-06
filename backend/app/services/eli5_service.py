from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from app.services import llm_service
from app.services.retrieval_service import retrieve_context, build_context


@lru_cache(maxsize=1)
def load_eli5_prompt() -> str:
    path = Path(__file__).resolve().parents[1] / "prompts" / "eli5_prompt.txt"
    return path.read_text(encoding="utf-8").strip()


NO_MATCH = {"simple_explanation": "Bhai ye policy document mein nahi mila."}


def explain_simple(document_id: str, question: str, persist_dir: str | None = None) -> dict[str, Any]:
    chunks = retrieve_context(question=question, document_id=document_id, persist_dir=persist_dir)
    if not chunks:
        return NO_MATCH

    context = build_context(chunks)
    system_prompt = load_eli5_prompt()
    content = llm_service.generate_text_response(evidence=context, question=question, system_prompt=system_prompt)
    return {"simple_explanation": content}
