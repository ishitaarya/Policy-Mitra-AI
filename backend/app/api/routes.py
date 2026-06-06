from __future__ import annotations

import logging
import os
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

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

logger = logging.getLogger(__name__)

router = APIRouter()


def _uploads_dir() -> Path:
    directory = Path(os.getenv("UPLOADS_DIR", "./data/pdfs"))
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _chroma_dir() -> Path:
    """Return the ChromaDB persist directory (separate from PDF uploads)."""
    directory = Path(os.getenv("CHROMA_PERSIST_DIR", "./vectorstore"))
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
    logger.info("upload | document_id=%s | pages_extracted=%d", document_id, len(pages))
    for page in pages:
        logger.debug(
            "upload | page=%s | chars=%d | preview=%.100s",
            page["page"],
            len(str(page["text"])),
            str(page["text"]),
        )

    chunks = create_chunks(pages, document_id=document_id)
    logger.info("upload | document_id=%s | chunks_created=%d", document_id, len(chunks))

    embeddings = generate_embeddings([chunk.text for chunk in chunks])
    logger.info(
        "upload | document_id=%s | embeddings_count=%d | embedding_dim=%d",
        document_id,
        len(embeddings),
        len(embeddings[0]) if embeddings else 0,
    )

    # BUG FIX: store in chroma_dir (./vectorstore), not uploads_dir (./data/pdfs)
    stats = store_chunks(chunks, embeddings, persist_dir=chroma_dir)

    return UploadPolicyResponse(
        document_id=stats.document_id,
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
        chroma_dir = _chroma_dir()

        # BUG FIX: removed dead code (`vector_store` and `query` were undefined,
        # causing NameError → WorkflowError → 500 on every request).
        # BUG FIX: pass persist_dir so retrieval reads from the same DB as upload.
        result = answer_policy_question(
            document_id=payload.document_id,
            question=payload.question,
            persist_dir=chroma_dir,
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


@router.post("/generate-complaint", response_model=ComplaintResponse)
async def generate_complaint_endpoint(payload: ComplaintRequest) -> dict[str, str]:
    return generate_complaint(payload.issue)


@router.post("/explain-simple", response_model=ELI5Response)
async def explain_simple_endpoint(payload: ELI5Request) -> dict[str, str]:
    chroma_dir = _chroma_dir()
    return explain_simple(
        document_id=payload.document_id,
        question=payload.question,
        persist_dir=str(chroma_dir),
    )
