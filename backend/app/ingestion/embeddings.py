from __future__ import annotations

from functools import lru_cache

from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer("BAAI/bge-small-en-v1.5")


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist() if hasattr(embeddings, "tolist") else list(embeddings)


def generate_query_embedding(text: str) -> list[float]:
    model = get_embedding_model()
    embeddings = model.encode([text], normalize_embeddings=True)
    vector = embeddings[0]
    return vector.tolist() if hasattr(vector, "tolist") else list(vector)
