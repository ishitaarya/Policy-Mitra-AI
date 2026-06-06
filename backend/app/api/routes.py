from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse

from app.config import storage_path
from app.database.chroma_client import get_document_chunks, store_chunks
from app.exceptions import ModelConfigurationError, WorkflowError
from app.ingestion.chunker import create_chunks
from app.ingestion.embeddings import generate_embeddings
from app.ingestion.pdf_loader import compute_document_id, load_pdf
from app.models.schemas import (
    AskRequest,
    AskResponse,
    ComplaintRequest,
    ComplaintResponse,
    ELI5Request,
    ELI5Response,
    UploadPolicyResponse,
)
from app.services.complaint_service import generate_complaint
from app.services.eli5_service import explain_simple
from app.services.policy_workflow import NO_MATCH_RESPONSE, answer_policy_question
from app.services.retrieval_service import retrieve_context

logger = logging.getLogger(__name__)

router = APIRouter()


def _uploads_dir() -> Path:
    directory = storage_path("UPLOADS_DIR", "data/pdfs")
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _chroma_dir() -> Path:
    """Return the ChromaDB persist directory (separate from PDF uploads)."""
    directory = storage_path("CHROMA_PERSIST_DIR", "vectorstore")
    directory.mkdir(parents=True, exist_ok=True)
    return directory


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/upload-policy", response_model=UploadPolicyResponse)
async def upload_policy(file: UploadFile = File(...)) -> UploadPolicyResponse:
    uploads_dir = _uploads_dir()
    chroma_dir = _chroma_dir()

    filename = Path(file.filename or "policy.pdf").name
    destination = uploads_dir / filename

    contents = await file.read()
    destination.write_bytes(contents)

    document_id = compute_document_id(destination)
    logger.info("upload | document_id=%s | file=%s", document_id, filename)

    pages = load_pdf(destination)
    chunks = create_chunks(pages, document_id=document_id)

    if not chunks:
        logger.warning("upload | document_id=%s | no chunks after splitting", document_id)
        return UploadPolicyResponse(
            document_id=document_id,
            pages=len(pages),
            chunks_created=0,
            status="empty",
        )

    embeddings = generate_embeddings([chunk.text for chunk in chunks])
    stats = store_chunks(chunks, embeddings, persist_dir=chroma_dir)

    return UploadPolicyResponse(
        document_id=document_id,
        pages=stats.pages,
        chunks_created=stats.chunks_created,
        status="indexed",
    )


@router.post("/ask", response_model=AskResponse, response_model_exclude_none=True)
async def ask_policy_question(payload: AskRequest) -> dict[str, object]:
    logger.info(
        "ask | document_id=%s | question=%.200s",
        payload.document_id,
        payload.question,
    )
    try:
        result = answer_policy_question(
            document_id=payload.document_id,
            question=payload.question,
        )

        logger.info(
            "ask | document_id=%s | answer_preview=%.200s",
            payload.document_id,
            str(result.get("answer", "")),
        )

        if result == dict(NO_MATCH_RESPONSE):
            return JSONResponse(content=NO_MATCH_RESPONSE)
        return result
    except (HTTPException, ModelConfigurationError, WorkflowError):
        raise
    except Exception as exc:
        logger.exception("ask | document_id=%s | unhandled error: %s", payload.document_id, exc)
        raise WorkflowError(str(exc)) from exc


@router.get("/debug/chunks/{document_id}")
async def debug_chunks(document_id: str) -> dict[str, object]:
    """Debug endpoint: inspect what is actually stored in ChromaDB for a document."""
    chroma_dir = _chroma_dir()
    chunks = get_document_chunks(document_id=document_id, persist_dir=chroma_dir)
    return {
        "document_id": document_id,
        "chroma_dir": str(chroma_dir.resolve()),
        "chunk_count": len(chunks),
        "chunks": [
            {
                "chunk_id": c["chunk_id"],
                "page": c["page"],
                "text_length": len(str(c["text"])),
                "text_preview": str(c["text"])[:500],
            }
            for c in chunks
        ],
    }


@router.get("/debug/retrieval")
async def debug_retrieval(
    document_id: str = Query(...),
    question: str = Query(..., min_length=1),
) -> dict[str, object]:
    chroma_dir = _chroma_dir()
    retrieved_chunks = retrieve_context(
        document_id=document_id,
        question=question,
        persist_dir=chroma_dir,
    )

    return {
        "retrieved_chunks": [c["text"] for c in retrieved_chunks],
        "scores": [c["score"] for c in retrieved_chunks],
    }


@router.post("/generate-complaint", response_model=ComplaintResponse)
async def generate_complaint_endpoint(payload: ComplaintRequest) -> dict[str, str]:
    return generate_complaint(payload.issue)


@router.post("/explain-simple", response_model=ELI5Response)
async def explain_simple_endpoint(payload: ELI5Request) -> dict[str, str]:
    return explain_simple(
        document_id=payload.document_id,
        question=payload.question,
    )
