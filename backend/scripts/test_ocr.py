from __future__ import annotations

import time
from pathlib import Path
from typing import Tuple

from paddleocr import PaddleOCR
from PIL import Image, ImageDraw, ImageFont
import fitz

OUT_DIR = Path(__file__).resolve().parents[1] / "tmp_ocr"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def make_image(text: str, size=(800, 200), font_path: str | None = None) -> Image.Image:
    img = Image.new("RGB", size, color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(font_path or "DejaVuSans.ttf", 24)
    except Exception:
        font = ImageFont.load_default()
    draw.text((10, 10), text, fill=(0, 0, 0), font=font)
    return img


def save_image_as_pdf(img: Image.Image, path: Path) -> None:
    img.save(path, "PDF", resolution=100.0)


def ocr_image(ocr: PaddleOCR, img_path: Path) -> Tuple[str, float, float]:
    start = time.time()
    # PaddleOCR accepts a file path; use that to avoid deprecated kwargs
    result = ocr.ocr(str(img_path))
    elapsed = time.time() - start
    texts = []
    confs = []
    for line in result:
        try:
            box, (txt, conf) = line
            texts.append(txt)
            confs.append(float(conf))
        except Exception:
            # different return shape
            texts.append(str(line))
    combined = "\n".join(texts).strip()
    avg_conf = float(sum(confs) / len(confs)) if confs else 0.0
    return combined, avg_conf, elapsed


def ocr_pdf(ocr: PaddleOCR, pdf_path: Path) -> Tuple[str, float, float]:
    doc = fitz.open(str(pdf_path))
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    mode = "RGB" if pix.n < 4 else "RGBA"
    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    return ocr_image(ocr, img)


def main():
    # instantiate OCR models for English and Hindi if available
    ocr_en = PaddleOCR(use_angle_cls=True, lang="en")
    print("Loaded PaddleOCR (en)")
    ocr_hi = None
    try:
        ocr_hi = PaddleOCR(use_angle_cls=True, lang="hi")
        print("Loaded PaddleOCR (hi)")
    except Exception as e:
        print("Hindi OCR model not available:", e)

    # Test 1: real image (English)
    img1 = make_image("Attendance must be at least 75% for exams.")
    img1_path = OUT_DIR / "img1.png"
    img1.save(img1_path)

    txt, conf, t = ocr_image(ocr_en, img1_path)
    print("Test 1 - Image English:\n", txt)
    print("Confidence:", conf, "Time:", t)

    # Test 2: scanned PDF page
    pdf_img = make_image("Scanned: Attendance 75%", size=(800, 600))
    pdf_path = OUT_DIR / "scanned.pdf"
    save_image_as_pdf(pdf_img, pdf_path)

    # Render PDF to image and OCR (ocr_pdf handles rendering)
    txt2, conf2, t2 = ocr_pdf(ocr_en, pdf_path)
    print("Test 2 - Scanned PDF English:\n", txt2)
    print("Confidence:", conf2, "Time:", t2)

    # Test 3: Hindi scanned PDF
    hindi_text = "परीक्षा के लिए 75% उपस्थिति आवश्यक है"
    img_hi = make_image(hindi_text, size=(1000, 200))
    pdf_hi = OUT_DIR / "scanned_hi.pdf"
    save_image_as_pdf(img_hi, pdf_hi)

    if ocr_hi is not None:
        txt_hi, conf_hi, t_hi = ocr_pdf(ocr_hi, pdf_hi)
        print("Test 3 - Scanned PDF Hindi:\n", txt_hi)
        print("Confidence:", conf_hi, "Time:", t_hi)
    else:
        print("Skipping Hindi OCR (model not available)")

    # Test 4: Mixed Hindi-English
    mixed = "परीक्षा 75% required"
    img_mixed = make_image(mixed, size=(1000, 200))
    pdf_mixed = OUT_DIR / "scanned_mixed.pdf"
    save_image_as_pdf(img_mixed, pdf_mixed)

    # Try both models
    txt_m_en, conf_m_en, t_m_en = ocr_pdf(ocr_en, pdf_mixed)
    print("Test 4 - Mixed (English model) -> Text:\n", txt_m_en)
    print("Confidence:", conf_m_en, "Time:", t_m_en)

    if ocr_hi is not None:
        txt_m_hi, conf_m_hi, t_m_hi = ocr_pdf(ocr_hi, pdf_mixed)
        print("Test 4 - Mixed (Hindi model) -> Text:\n", txt_m_hi)
        print("Confidence:", conf_m_hi, "Time:", t_m_hi)


if __name__ == "__main__":
    main()
