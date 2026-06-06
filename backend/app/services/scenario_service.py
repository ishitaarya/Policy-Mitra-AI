from __future__ import annotations

import json

from app.services.llm_service import _get_service


EMPTY_SCENARIO = {
    "week_1": "Not specified",
    "week_3": "Not specified",
    "final_consequence": "Not specified",
}


def generate_scenario(
    evidence: str,
    question: str,
) -> dict:

    if not evidence.strip():
        return dict(EMPTY_SCENARIO)

    service = _get_service()

    response = service.client.chat.completions.create(
        model=service.model_name,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": """
You are a college policy consequence analyzer.

Use ONLY the provided evidence.

Return JSON only.

Format:

{
  "week_1":"",
  "week_3":"",
  "final_consequence":""
}

Do not invent rules.
If missing use:
Not specified
"""
            },
            {
                "role": "user",
                "content": f"""
Question:
{question}

Evidence:
{evidence}
"""
            }
        ]
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)

    except Exception:
        return dict(EMPTY_SCENARIO)