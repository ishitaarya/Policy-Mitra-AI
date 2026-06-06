from __future__ import annotations

from pathlib import Path
from PIL import Image

import pytest

from app.exceptions import CorruptedPDFError, EmptyDocumentError, NoExtractableTextError
from app.ingestion.pdf_loader import build_document_metadata, compute_document_id, load_pdf


def _make_pdf_bytes(page_texts: list[str]) -> bytes:
    objects: list[bytes] = []

    def add_object(body: str) -> int:
        objects.append(body.encode("utf-8"))
        return len(objects)

    add_object("<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{4 + i * 2} 0 R" for i in range(len(page_texts)))
    add_object(f"<< /Type /Pages /Count {len(page_texts)} /Kids [{kids}] >>")
    add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    for text in page_texts:
        escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream = f"BT /F1 12 Tf 72 720 Td ({escaped}) Tj ET"
        add_object(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents "
            f"{len(objects) + 2} 0 R >>"
        )
        add_object(f"<< /Length {len(stream.encode('utf-8'))} >>\nstream\n{stream}\nendstream")

    output = bytearray()
    output.extend(b"%PDF-1.4\n")
    offsets = [0]

    for index, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("utf-8"))
        output.extend(body)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("utf-8"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("utf-8"))
    output.extend(
        (
            "trailer\n"
            f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n"
            "%%EOF\n"
        ).encode("utf-8")
    )
    return bytes(output)


def _write_pdf(tmp_path: Path, name: str, content: bytes) -> Path:
    pdf_path = tmp_path / name
    pdf_path.write_bytes(content)
    return pdf_path


def test_load_valid_pdf(tmp_path: Path) -> None:
    pdf_path = _write_pdf(tmp_path, "valid.pdf", _make_pdf_bytes(["Attendance policy 75 percent."]))
    # ensure OCR is not used for regular extracted text
    pages = load_pdf(pdf_path)

    assert pages == [{"page": 1, "text": "Attendance policy 75 percent.", "ocr_used": False}]
    metadata = build_document_metadata(pdf_path, page_count=len(pages))
    assert metadata.document_id == compute_document_id(pdf_path)
    assert metadata.filename == "valid.pdf"
    assert metadata.page_count == 1


def test_reject_empty_pdf(tmp_path: Path) -> None:
    pdf_path = _write_pdf(tmp_path, "empty.pdf", b"")

    with pytest.raises(EmptyDocumentError):
        load_pdf(pdf_path)


def test_reject_corrupted_pdf(tmp_path: Path) -> None:
    pdf_path = _write_pdf(tmp_path, "corrupted.pdf", b"not a pdf")

    with pytest.raises(CorruptedPDFError):
        load_pdf(pdf_path)


def test_load_multi_page_pdf(tmp_path: Path) -> None:
    pdf_path = _write_pdf(
        tmp_path,
        "multi.pdf",
        _make_pdf_bytes([
            "Page one text.",
            "Page two text.",
            "Page three text.",
        ]),
    )

    pages = load_pdf(pdf_path)

    assert pages == [
        {"page": 1, "text": "Page one text.", "ocr_used": False},
        {"page": 2, "text": "Page two text.", "ocr_used": False},
        {"page": 3, "text": "Page three text.", "ocr_used": False},
    ]


def test_reject_pdf_with_no_text(tmp_path: Path) -> None:
    pdf_path = _write_pdf(tmp_path, "blank-text.pdf", _make_pdf_bytes(["", "   "]))

    # If OCR is unavailable or returns nothing, we should still raise
    with pytest.raises(NoExtractableTextError):
        load_pdf(pdf_path)


def test_scanned_page_uses_ocr(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    # Create a PDF where pdfplumber returns empty text, but OCR returns content
    pdf_path = _write_pdf(tmp_path, "scanned.pdf", _make_pdf_bytes([" "]))

    # Monkeypatch rendering and OCR to simulate scanned page handling
    monkeypatch.setattr(
        "app.ingestion.pdf_loader._render_page_to_image",
        lambda path, idx: Image.new("RGB", (100, 100), color=(255, 255, 255)),
    )
    monkeypatch.setattr(
        "app.ingestion.pdf_loader._run_ocr_on_image",
        lambda img: ("Scanned attendance 75%", 0.92),
    )

    pages = load_pdf(pdf_path)

    assert pages == [{"page": 1, "text": "Scanned attendance 75%", "ocr_used": True}]