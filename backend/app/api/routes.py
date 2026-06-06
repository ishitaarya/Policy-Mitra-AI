from fastapi import APIRouter
from pydantic import BaseModel

from app.services.retrieval_service import (
    retrieve_relevant_chunks,
    build_context,
)

from app.services.llm_service import (
    generate_structured_response,
)

from app.services.scenario_service import (
    generate_scenario,
)

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    document_id: str


@router.post("/ask")
async def ask_policy(
    request: AskRequest,
):

    retrieval = retrieve_relevant_chunks(
        query=request.question,
        document_id=request.document_id,
    )

    evidence = build_context(
        retrieval["chunks"]
    )

    answer = generate_structured_response(
        evidence=evidence,
        question=request.question,
    )

    scenario = generate_scenario(
        evidence=evidence,
        question=request.question,
    )

    return {
        **answer,
        "scenario": scenario,
        "confidence": retrieval["confidence"],
        "sources": retrieval["chunks"],
    }
