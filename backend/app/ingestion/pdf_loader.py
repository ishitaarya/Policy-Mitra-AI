from __future__ import annotations

import hashlib
import logging
from functools import lru_cache
from pathlib import Path
from typing import Tuple

import pdfplumber

from app.exceptions import CorruptedPDFError, EmptyDocumentError, NoExtractableTextError, PDFProcessingError
from app.models.document_models import DocumentMetadata, DocumentPage

logger = logging.getLogger(__name__)

try:
    import fitz  # PyMuPDF
    from PIL import Image
except Exception:  # pragma: no cover - optional rendering helpers
    fitz = None
    Image = None


@lru_cache(maxsize=1)
def _get_ocr():
    try:
        from paddleocr import PaddleOCR

        # support Hindi + English; configuration may vary by environment
        return PaddleOCR(use_angle_cls=True, lang="en")
    except Exception:  # pragma: no cover - tests may monkeypatch this
        return None


def _render_page_to_image(pdf_path: Path, page_index: int) -> Image.Image:
    if fitz is None or Image is None:
        raise RuntimeError("PDF rendering dependencies are not available")

    doc = fitz.open(str(pdf_path))
    page = doc.load_page(page_index - 1)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    mode = "RGB" if pix.n < 4 else "RGBA"
    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    return img


def _run_ocr_on_image(img: Image.Image) -> Tuple[str, float]:
    ocr = _get_ocr()
    if ocr is None:
        raise RuntimeError("OCR engine not available")

    result = ocr.ocr(img, cls=True)
    texts: list[str] = []
    confidences: list[float] = []
    for line in result:
        # Each line: [box, (text, confidence)]
        try:
            text, conf = line[1][0], float(line[1][1])
        except Exception:
            # Fallback if structure differs
            text, conf = str(line), 0.0
        texts.append(text)
        confidences.append(conf)

    combined = "\n".join(texts).strip()
    avg_conf = float(sum(confidences) / len(confidences)) if confidences else 0.0
    return combined, avg_conf


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

                # If extracted text is short, treat as scanned and attempt OCR
                if len(cleaned_text) < 50:
                    logger.info("ocr triggered | file=%s | page=%s", path.name, index)
                    try:
                        image = _render_page_to_image(path, index)
                        ocr_text, ocr_conf = _run_ocr_on_image(image)
                        if ocr_text.strip():
                            logger.info("ocr success | file=%s | page=%s | conf=%.2f", path.name, index, ocr_conf)
                            pages.append(DocumentPage(page=index, text=ocr_text).model_dump())
                            # attach metadata field while keeping compatibility
                            pages[-1]["ocr_used"] = True
                            continue
                    except Exception as exc:  # pragma: no cover - environment-specific failures
                        logger.warning("ocr failed | file=%s | page=%s | reason=%s", path.name, index, exc)

                if cleaned_text:
                    page_obj = DocumentPage(page=index, text=cleaned_text).model_dump()
                    page_obj["ocr_used"] = False
                    pages.append(page_obj)

            if not pages:
                logger.error("extraction error | file=%s | reason=no_extractable_text", path.name)
                raise NoExtractableTextError("PDF contains no extractable text")

            logger.info("upload completed | file=%s | page_count=%s", path.name, len(pages))
            return pages

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