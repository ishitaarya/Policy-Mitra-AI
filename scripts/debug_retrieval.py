#!/usr/bin/env python3
"""Diagnostics for retrieval and embedding pipeline.

Prints stored chunk text, stored embedding dims, query embedding dims,
raw chroma query output, raw distances, converted similarity scores,
and final confidence calculation for a given document_id and question.

Do NOT modify retrieval code; this script only reads from the vectorstore
and reuses the project's embedding function for exact parity.
"""
from __future__ import annotations

import sys
from pathlib import Path
from pprint import pprint
import json


DEFAULT_DOCUMENT_ID = "3e525506abce589ed4afa629e8fcc8cd8089de4813f8948e4dcd5172e7c3e5bd"
DEFAULT_QUESTION = "Attendance short ka scene kya hai?"


def main(document_id: str, question: str, top_k: int = 5):
    # Ensure backend package importable: add backend directory to sys.path
    repo_root = Path(__file__).resolve().parents[1]
    backend_dir = repo_root / "backend"
    sys.path.insert(0, str(backend_dir))

    # Import project utilities
    from app.database import chroma_client
    from app.ingestion.embeddings import generate_embeddings
    from app.services import retrieval_service

    # Use the same persist directory the backend uses for uploads: backend/data/pdfs
    persist_dir = backend_dir / "data" / "pdfs"
    client = chroma_client._get_client(persist_dir=str(persist_dir))
    collection = chroma_client._get_collection(client)

    print("\n== Retrieval Debugging Report ==\n")
    print(f"Document ID: {document_id}")
    print(f"Question: {question}\n")

    # 1) Stored chunk text + embeddings via collection.get
    get_result = collection.get(where={"document_id": document_id}, include=["documents", "metadatas", "embeddings"])
    documents = get_result.get("documents", [])
    metadatas = get_result.get("metadatas", [])
    embeddings = get_result.get("embeddings", [])

    print("1) Stored chunks (text):")
    for i, doc in enumerate(documents):
        meta = metadatas[i] if i < len(metadatas) else {}
        print(f"- chunk[{i}] id={meta.get('chunk_id')} page={meta.get('page')}")
        print(doc)
        print()

    # 2) Stored chunk embedding dimensions
    print("2) Stored chunk embedding dimensions:")
    for i, emb in enumerate(embeddings):
        if emb is None:
            print(f"- chunk[{i}] embedding: <missing>")
            continue
        try:
            length = len(emb)
        except Exception:
            # fall back to numpy shape
            try:
                length = emb.shape[0]
            except Exception:
                length = "unknown"
        print(f"- chunk[{i}] len={length}")
    if len(embeddings) == 0:
        print("- No embeddings found for document_id")

    # 3) Query embedding dims
    query_embedding = generate_embeddings([question])[0]
    print("\n3) Query embedding dimensions:")
    print(f"- query_embedding len={len(query_embedding)}")

    # 4) Raw Chroma query output (documents, metadatas, distances)
    query_result = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"document_id": document_id},
        include=["documents", "metadatas", "distances"],
    )

    print("\n4) Raw Chroma query output:")
    pprint(query_result)

    documents_q = query_result.get("documents", [[]])[0]
    metadatas_q = query_result.get("metadatas", [[]])[0]
    distances = query_result.get("distances", [[]])[0]

    # 5) Raw distances
    print("\n5) Raw distances:")
    for i, d in enumerate(distances):
        print(f"- result[{i}] distance={d}")

    # 6) Converted similarity scores (using retrieval_service._distance_to_score)
    print("\n6) Converted similarity scores (1.0 - distance):")
    similarities = []
    for i, d in enumerate(distances):
        score = retrieval_service._distance_to_score(float(d))
        similarities.append(score)
        print(f"- result[{i}] score={score}")

    # Also compute dot product/cosine between query embedding and stored embeddings
    def dot(a, b):
        return sum(x * y for x, y in zip(a, b))

    print("\n6b) Cosine (dot) between query embedding and stored embeddings:")
    for i, stored in enumerate(embeddings):
        if stored is None or (hasattr(stored, '__len__') and len(stored) == 0):
            print(f"- stored[{i}]: <no embedding>")
            continue
        # If shapes differ, skip
        if len(stored) != len(query_embedding):
            print(f"- stored[{i}]: len mismatch stored={len(stored)} query={len(query_embedding)}")
            continue
        dp = dot(stored, query_embedding)
        print(f"- stored[{i}] dot={dp}")

    # 7) Confidence calculation using same thresholds
    print("\n7) Confidence calculation (based on top score):")
    top_score = max(similarities) if similarities else 0.0
    confidence = retrieval_service.calculate_confidence(top_score)
    print(f"- top_score={top_score}")
    print(f"- confidence={confidence}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Debug retrieval for a document and question")
    parser.add_argument("--document_id", default=DEFAULT_DOCUMENT_ID)
    parser.add_argument("--question", default=DEFAULT_QUESTION)
    parser.add_argument("--top_k", type=int, default=5)
    args = parser.parse_args()

    main(document_id=args.document_id, question=args.question, top_k=args.top_k)
