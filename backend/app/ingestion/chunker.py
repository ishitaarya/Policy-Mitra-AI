from __future__ import annotations

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.models.document_models import ChunkRecord


def create_chunks(pages: list[dict[str, object]], document_id: str) -> list[ChunkRecord]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks: list[ChunkRecord] = []

    for page in pages:
        page_number = int(page["page"])
        text = str(page["text"])
        page_chunks = splitter.split_text(text)

        for chunk_index, chunk_text in enumerate(page_chunks, start=1):
            chunks.append(
                ChunkRecord(
                    document_id=document_id,
                    page=page_number,
                    chunk_id=f"{document_id}-p{page_number}-c{chunk_index}",
                    text=chunk_text,
                )
            )

    return chunks