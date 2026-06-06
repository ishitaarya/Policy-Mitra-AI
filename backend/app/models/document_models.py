from pydantic import BaseModel, Field


class DocumentPage(BaseModel):
    page: int = Field(..., ge=1)
    text: str = Field(..., min_length=1)


class DocumentMetadata(BaseModel):
    document_id: str = Field(..., min_length=1)
    filename: str = Field(..., min_length=1)
    page_count: int = Field(..., ge=0)


class ChunkRecord(BaseModel):
    document_id: str = Field(..., min_length=1)
    page: int = Field(..., ge=1)
    chunk_id: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


class IngestionStatistics(BaseModel):
    document_id: str = Field(..., min_length=1)
    pages: int = Field(..., ge=0)
    chunks_created: int = Field(..., ge=0)
