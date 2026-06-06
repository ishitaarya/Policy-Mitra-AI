from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    document_id: str = Field(..., description="Server-generated document identifier")


class UploadPolicyResponse(BaseModel):
    document_id: str = Field(..., description="Server-generated document identifier")
    pages: int = Field(..., ge=0, description="Number of extracted pages")
    chunks_created: int = Field(..., ge=0, description="Number of chunks stored")
    status: str = Field(default="indexed", description="Indexing status")


class AskRequest(BaseModel):
    document_id: str = Field(..., description="Uploaded policy document identifier")
    question: str = Field(..., min_length=1, description="User policy question")


class SourceExcerpt(BaseModel):
    page: int
    excerpt: str


class WorkflowMetadata(BaseModel):
    document_id: str
    chunks_used: int
    top_score: float


class AskResponse(BaseModel):
    answer: str
    risk_level: str
    confidence: int = Field(..., ge=0, le=100)
    action_items: list[str]
    sources: list[SourceExcerpt]
    metadata: WorkflowMetadata | None = None
