from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.ingestion.chunker import create_chunks
from app.ingestion.embeddings import generate_embeddings
from app.ingestion.pdf_loader import compute_document_id, load_pdf
from app.models.schemas import AskRequest, AskResponse, UploadPolicyResponse
from app.exceptions import ModelConfigurationError, WorkflowError
from app.services.policy_workflow import answer_policy_question
from app.database.chroma_client import store_chunks

router = APIRouter()


def _uploads_dir() -> Path:
	directory = Path(os.getenv("UPLOADS_DIR", "./data/pdfs"))
	directory.mkdir(parents=True, exist_ok=True)
	return directory


@router.get("/health")
async def health_check() -> dict[str, str]:
	return {"status": "ok"}


@router.post("/upload-policy", response_model=UploadPolicyResponse)
async def upload_policy(file: UploadFile = File(...)) -> UploadPolicyResponse:
	uploads_dir = _uploads_dir()
	filename = Path(file.filename or "policy.pdf").name
	destination = uploads_dir / filename

	contents = await file.read()
	destination.write_bytes(contents)

	document_id = compute_document_id(destination)
	pages = load_pdf(destination)
	chunks = create_chunks(pages, document_id=document_id)
	embeddings = generate_embeddings([chunk.text for chunk in chunks])
	stats = store_chunks(chunks, embeddings, persist_dir=uploads_dir)

	return UploadPolicyResponse(
		document_id=stats.document_id,
		pages=stats.pages,
		chunks_created=stats.chunks_created,
		status="indexed",
	)


@router.post("/ask", response_model=AskResponse, response_model_exclude_none=True)
async def ask_policy_question(payload: AskRequest) -> dict[str, object]:
	try:
		return answer_policy_question(document_id=payload.document_id, question=payload.question)
	except (HTTPException, ModelConfigurationError, WorkflowError):
		raise
	except Exception as exc:
		raise WorkflowError(str(exc)) from exc
