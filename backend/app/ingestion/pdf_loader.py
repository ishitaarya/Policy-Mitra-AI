from __future__ import annotations

import hashlib
import logging
from pathlib import Path

import pdfplumber

from app.exceptions import CorruptedPDFError, EmptyDocumentError, NoExtractableTextError, PDFProcessingError
from app.models.document_models import DocumentMetadata, DocumentPage

logger = logging.getLogger(__name__)


def compute_document_id(pdf_path: str | Path) -> str:
    path = Path(pdf_path)
    digest = hashlib.sha256()

    with path.open("rb") as pdf_file:
        for chunk in iter(lambda: pdf_file.read(8192), b""):
            digest.update(chunk)

    return digest.hexdigest()


def load_pdf(pdf_path: str | Path) -> list[dict[str, object]]:
    path = Path(pdf_path)
    logger.info("upload started | file=%s", path.name)

    if not path.exists():
        logger.error("extraction error | file=%s | reason=file_not_found", path.name)
        raise FileNotFoundError(f"PDF file not found: {path}")

    if path.stat().st_size == 0:
        logger.error("extraction error | file=%s | reason=empty_pdf", path.name)
        raise EmptyDocumentError("PDF contains no pages")

    try:
        with pdfplumber.open(str(path)) as pdf:
            if len(pdf.pages) == 0:
                logger.error("extraction error | file=%s | reason=empty_pdf", path.name)
                raise EmptyDocumentError("PDF contains no pages")

            pages: list[DocumentPage] = []

            for index, page in enumerate(pdf.pages, start=1):
                extracted_text = page.extract_text() or ""
                cleaned_text = extracted_text.strip()
                if cleaned_text:
                    pages.append(DocumentPage(page=index, text=cleaned_text))

            if not pages:
                logger.error("extraction error | file=%s | reason=no_extractable_text", path.name)
                raise NoExtractableTextError("PDF contains no extractable text")

            logger.info("upload completed | file=%s | page_count=%s", path.name, len(pages))
            return [page.model_dump() for page in pages]

    except PDFProcessingError:
        raise
    except Exception as exc:  # pragma: no cover - defensive guard for parser errors
        logger.exception("extraction error | file=%s | reason=corrupted_pdf", path.name)
        raise CorruptedPDFError("Unable to parse PDF") from exc


def build_document_metadata(pdf_path: str | Path, page_count: int) -> DocumentMetadata:
    path = Path(pdf_path)
    return DocumentMetadata(
        document_id=compute_document_id(path),
        filename=path.name,
        page_count=page_count,
    )