import logging
from pathlib import Path
from typing import Any

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

logger = logging.getLogger(__name__)

def retrieve_context(document_id: str, question: str, persist_dir: str | Path | None = None) -> list[dict[str, Any]]:
    directory = str(persist_dir or "./vectorstore")
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    vectordb = Chroma(
        persist_directory=directory,
        embedding_function=embeddings,
        collection_name="policy_documents"
    )
    
    results = vectordb.similarity_search_with_score(
        query=question,
        k=5,
        filter={"document_id": document_id}
    )
    
    retrieved_chunks = []
    
    for doc, distance in results:
        # Distance to similarity
        score = max(0.0, min(1.0, 1.0 - distance))
        chunk_data = {
            "text": doc.page_content,
            "score": score,
            "page": doc.metadata.get("page", 0)
        }
        retrieved_chunks.append(chunk_data)
        
    logger.info("Question: %s", question)
    logger.info("Document ID: %s", document_id)
    logger.info("Chunks Retrieved: %d", len(retrieved_chunks))
    logger.info("Similarity Scores: %s", [round(c['score'], 4) for c in retrieved_chunks])
    if retrieved_chunks:
        logger.info("Chunk Preview: %s", retrieved_chunks[0]['text'][:200])
        
    return retrieved_chunks

def build_context(chunks: list[dict[str, Any]]) -> str:
    lines = []
    for chunk in chunks:
        lines.append(f"[page {chunk.get('page', 0)}] {chunk['text']}")
    return "\n\n".join(lines)
