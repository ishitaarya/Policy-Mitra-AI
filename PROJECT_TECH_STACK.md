# PolicyMitra AI: Technology Stack and Project Inventory

## 1. Project Overview

PolicyMitra AI is a Retrieval-Augmented Generation (RAG) application that helps
students understand institutional policy documents.

The current system supports:

- PDF policy upload
- Text extraction and OCR fallback
- Document chunking and embedding generation
- Document-specific semantic retrieval
- AI-generated answers grounded in retrieved policy text
- Source excerpts and confidence scores
- Risk analysis and actionable next steps
- Simple/ELI5 explanations
- Complaint generation
- English and Hinglish interactions
- Demo scenarios, authentication screens, and profile/settings interfaces

## 2. High-Level Architecture

```text
React Frontend
      |
      | HTTP/JSON and multipart/form-data
      v
FastAPI Backend
      |
      +--> PDF extraction / OCR
      |
      +--> Text chunking
      |
      +--> Sentence Transformer embeddings
      |
      +--> ChromaDB vector storage
      |
      +--> document_id-filtered retrieval
      |
      +--> Navigate Labs OpenAI-compatible LLM API
      |
      v
Structured answer, sources, risk, confidence, and action items
```

## 3. Frontend Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| React | 19.2.6 | Component-based user interface |
| React DOM | 19.2.6 | Browser rendering |
| TypeScript | 6.0.x | Static typing |
| Vite | 8.0.x | Development server and production bundler |
| React Router DOM | 7.17.0 | Client-side routing |
| Tailwind CSS | 4.3.0 | Utility-first styling |
| Framer Motion | 12.40.0 | Animations and transitions |
| Radix UI | Multiple packages | Accessible UI primitives |
| Lucide React | 1.17.0 | Interface icons |
| class-variance-authority | 0.7.1 | Component variant management |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.6.0 | Tailwind class conflict resolution |
| ESLint | 10.x | Frontend linting |

### Frontend Features

- Landing page
- Sign-in, sign-up, and password recovery pages
- Protected application routes
- PDF upload interface
- Active-document state management
- Chat interface
- Animated AI thinking workflow
- Source evidence panels and citation modals
- Risk dashboard
- Policy impact cards
- Complaint generator drawer
- Demo scenarios
- Profile and settings pages
- Local browser persistence using `localStorage`

### Frontend API Configuration

During development, Vite proxies:

```text
/api/* -> http://127.0.0.1:8000/*
```

Production deployments can configure:

```text
VITE_API_BASE_URL=https://your-backend.example.com
```

## 4. Backend Technology Stack

| Technology | Purpose |
| --- | --- |
| Python | Backend implementation language |
| FastAPI | REST API framework |
| Uvicorn | ASGI development/production server |
| Pydantic | Request, response, metadata, and domain validation |
| python-dotenv | Environment variable loading |
| python-multipart | PDF file upload handling |
| OpenAI Python SDK | OpenAI-compatible Navigate Labs API client |
| ChromaDB | Persistent vector database |
| Sentence Transformers | Local embedding model execution |
| LangChain text splitters | Recursive text chunking |
| pdfplumber | PDF text extraction |
| PyMuPDF (`fitz`) | PDF page rendering for OCR |
| Pillow | Image representation for OCR |
| PaddleOCR | OCR fallback for scanned or low-text PDF pages |
| hashlib / SHA-256 | Deterministic document identifier generation |

## 5. AI Models

### Generation Model

The generation model is configured through the backend environment:

```text
MODEL_NAME=gemini-2.5-flash
```

The backend calls it through a Navigate Labs endpoint using the OpenAI-compatible
Python client.

Configuration variables:

```text
NAVIGATE_API_KEY
NAVIGATE_BASE_URL
MODEL_NAME
```

The generation model is used for:

- Policy question answering
- Structured risk classification
- Consequence generation
- Action-item generation
- ELI5/simple explanations
- Complaint and scenario-related generation

### Embedding Model

```text
BAAI/bge-small-en-v1.5
```

The embedding model runs locally through `sentence-transformers`.

It is used to:

- Convert uploaded policy chunks into normalized vectors
- Convert each user question into a query vector
- Perform semantic similarity search in ChromaDB

The same embedding model is used for ingestion and retrieval, preventing vector
dimension and semantic-space mismatches.

### OCR Model

```text
PaddleOCR English model
```

OCR is triggered when normal PDF extraction produces fewer than 50 characters
for a page. The page is rendered using PyMuPDF and passed to PaddleOCR.

The repository also contains OCR experimentation for English and Hindi models.

## 6. RAG Pipeline

### Upload and Ingestion

1. The frontend sends the PDF as `multipart/form-data`.
2. FastAPI stores the uploaded file.
3. SHA-256 of the file produces a deterministic `document_id`.
4. `pdfplumber` extracts text page by page.
5. PaddleOCR is used as a fallback for scanned pages.
6. Text is split into chunks of approximately 800 characters.
7. Consecutive chunks overlap by approximately 100 characters.
8. Every chunk receives:
   - `document_id`
   - Page number
   - Unique chunk ID
   - Chunk text
9. `BAAI/bge-small-en-v1.5` generates normalized embeddings.
10. Chunks, metadata, and vectors are upserted into ChromaDB.

### Question Answering

1. The frontend sends the question and active `document_id`.
2. The backend embeds the question.
3. ChromaDB performs similarity search.
4. Retrieval applies:

```python
where={"document_id": document_id}
```

5. The top five matching chunks are selected.
6. Retrieved chunks are assembled into an evidence context.
7. The context and question are sent to the generation model.
8. The backend returns:
   - Answer
   - Risk level
   - Confidence percentage
   - Consequence
   - Action items
   - Action plan
   - Source page excerpts
   - Retrieval metadata

## 7. Vector Database

### ChromaDB

Collection name:

```text
policy_documents
```

Distance space:

```text
cosine
```

Stored metadata:

```text
document_id
page
chunk_id
chunk_text
```

The database is persisted under the configured backend path:

```text
CHROMA_PERSIST_DIR=./vectorstore
```

Paths are resolved relative to the backend directory so upload and retrieval use
the same database regardless of the shell's current working directory.

## 8. API Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| POST | `/upload-policy` | Upload, parse, chunk, embed, and index a PDF |
| POST | `/ask` | Ask a question about an uploaded document |
| POST | `/explain-simple` | Generate a simple explanation |
| POST | `/generate-complaint` | Generate a structured complaint |
| GET | `/debug/chunks/{document_id}` | Inspect stored chunks |
| GET | `/debug/retrieval` | Inspect retrieval results and scores |

### Upload Response

```json
{
  "document_id": "sha256-document-id",
  "pages": 7,
  "chunks_created": 12,
  "status": "indexed"
}
```

### Ask Request

```json
{
  "document_id": "sha256-document-id",
  "question": "What are the attendance requirements?"
}
```

### Ask Response

```json
{
  "answer": "Policy-grounded answer",
  "risk_level": "LOW",
  "confidence": 91,
  "consequence": "Relevant consequence",
  "action_items": [],
  "action_plan": [],
  "sources": [
    {
      "page": 2,
      "excerpt": "Relevant policy text"
    }
  ],
  "metadata": {
    "document_id": "sha256-document-id",
    "chunks_used": 5,
    "top_score": 0.91
  }
}
```

## 9. Prompt Engineering

The backend stores prompts as separate text files:

- `system_prompt.txt`
- `eli5_prompt.txt`
- `complaint_prompt.txt`

The primary system prompt instructs the model to:

- Use only retrieved evidence
- Avoid unsupported claims
- Return structured output
- Provide risk and action information
- Return a no-match response when evidence is unavailable

The workflow also handles model responses that contain useful plain text but do
not perfectly follow the requested JSON schema.

## 10. Application State and Data Isolation

- The upload response is stored as the active document in React state.
- The latest uploaded document is persisted in browser `localStorage`.
- Every `/ask` request includes the active `document_id`.
- Every stored chunk includes the same `document_id`.
- Every ChromaDB retrieval is filtered using that `document_id`.
- Re-uploading the same document replaces its previous chunks.

This prevents chunks from unrelated policy documents from being mixed into an
answer.

## 11. Testing and Quality Tools

| Tool | Purpose |
| --- | --- |
| Pytest | Backend unit and integration testing |
| FastAPI TestClient | API route testing |
| HTTPX | HTTP testing support |
| TypeScript compiler | Frontend type checking |
| ESLint | Frontend static analysis |
| Vite production build | Frontend build verification |

The backend test suite covers:

- PDF loading and validation
- OCR fallback
- Chunk creation
- Embedding generation
- ChromaDB storage
- Document-specific retrieval
- Prompt loading
- LLM response handling
- Policy workflow
- API routes
- ELI5 responses
- Complaint generation
- Full upload-to-answer RAG flow

Current verified result:

```text
36 backend tests passed
Frontend TypeScript check passed
Frontend production build passed
```

## 12. Environment Configuration

Backend:

```text
NAVIGATE_API_KEY
NAVIGATE_BASE_URL
MODEL_NAME
CHROMA_PERSIST_DIR
UPLOADS_DIR
```

Frontend:

```text
VITE_API_BASE_URL
```

API keys must remain in local environment files and must not be committed.

## 13. Current Project Structure

```text
Policy-Mitra/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routes
│   │   ├── database/       # ChromaDB operations
│   │   ├── ingestion/      # PDF, chunking, and embeddings
│   │   ├── models/         # Pydantic schemas
│   │   ├── prompts/        # LLM prompts
│   │   ├── services/       # Retrieval, LLM, policy, ELI5, complaint
│   │   └── main.py         # FastAPI application
│   ├── data/pdfs/          # Uploaded PDFs
│   ├── vectorstore/        # ChromaDB persistence
│   └── tests/              # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/     # UI and feature components
│   │   ├── context/        # React context providers
│   │   ├── data/           # Demo and mock data
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # API and utility functions
│   │   ├── pages/          # Application pages
│   │   └── types/          # TypeScript types
│   └── vite.config.ts
└── scripts/                # Retrieval diagnostics
```

## 14. Dependency Note

The source code currently uses these OCR-related packages:

- `paddleocr`
- `PyMuPDF`
- `Pillow`

They are available in the current development environment but are not explicitly
listed in `backend/requirements.txt`. They should be added before deployment or
setting up the project on a new machine.

## 15. Summary

PolicyMitra AI currently uses:

- React, TypeScript, Vite, and Tailwind CSS for the frontend
- FastAPI, Pydantic, and Uvicorn for the backend
- `gemini-2.5-flash` through Navigate Labs for answer generation
- `BAAI/bge-small-en-v1.5` for embeddings
- ChromaDB for vector storage and semantic retrieval
- pdfplumber, PyMuPDF, Pillow, and PaddleOCR for PDF processing
- SHA-256 identifiers for document tracking
- A document-filtered RAG pipeline for grounded policy answers
- Pytest, TypeScript, ESLint, and Vite for validation and quality checks
