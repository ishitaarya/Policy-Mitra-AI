from __future__ import annotations

import argparse
import json
import sys
import tempfile
import time
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database.chroma_client import store_chunks
from app.ingestion.chunker import create_chunks
from app.ingestion.embeddings import generate_embeddings
from app.ingestion.pdf_loader import build_document_metadata, load_pdf


def benchmark_ingestion(pdf_path: Path, persist_dir: Path | None = None) -> dict[str, float | int]:
    extraction_start = time.perf_counter()
    pages = load_pdf(pdf_path)
    pdf_extraction_seconds = time.perf_counter() - extraction_start

    document_id = build_document_metadata(pdf_path, page_count=len(pages)).document_id

    chunking_start = time.perf_counter()
    chunks = create_chunks(pages, document_id=document_id)
    chunking_seconds = time.perf_counter() - chunking_start

    embedding_start = time.perf_counter()
    embeddings = generate_embeddings([chunk.text for chunk in chunks])
    embedding_seconds = time.perf_counter() - embedding_start

    storage_start = time.perf_counter()
    store_chunks(chunks, embeddings, persist_dir=persist_dir)
    storage_seconds = time.perf_counter() - storage_start

    total_seconds = pdf_extraction_seconds + chunking_seconds + embedding_seconds + storage_seconds

    return {
        "pages": len(pages),
        "chunks": len(chunks),
        "pdf_extraction_seconds": round(pdf_extraction_seconds, 2),
        "chunking_seconds": round(chunking_seconds, 2),
        "embedding_seconds": round(embedding_seconds, 2),
        "storage_seconds": round(storage_seconds, 2),
        "total_seconds": round(total_seconds, 2),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark policy PDF ingestion performance.")
    parser.add_argument("pdf_path", type=Path, help="Path to a sample PDF to benchmark")
    parser.add_argument(
        "--persist-dir",
        type=Path,
        default=None,
        help="Optional Chroma persistence directory. Defaults to a temporary directory.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    persist_dir = args.persist_dir

    if persist_dir is None:
        with tempfile.TemporaryDirectory() as temp_dir:
            result = benchmark_ingestion(args.pdf_path, persist_dir=Path(temp_dir))
            print(json.dumps(result, indent=2))
        return

    result = benchmark_ingestion(args.pdf_path, persist_dir=persist_dir)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()