from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router
from app.exceptions import CorruptedPDFError, EmptyDocumentError, ModelConfigurationError, NoExtractableTextError, WorkflowError
from app.utils.logger import configure_logging

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
configure_logging()

app = FastAPI(
    title="Policy Mitra AI",
    version="0.1.0",
    description="Backend scaffold for a policy explanation workflow engine."
)

# Allow the Vite dev server (and any localhost port) to call the API.
# In production, replace the wildcard with your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


def _json_error(detail: str, status_code: int) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


@app.exception_handler(EmptyDocumentError)
async def empty_document_handler(_: Request, exc: EmptyDocumentError) -> JSONResponse:
    return _json_error(str(exc), 400)


@app.exception_handler(CorruptedPDFError)
async def corrupted_pdf_handler(_: Request, exc: CorruptedPDFError) -> JSONResponse:
    return _json_error(str(exc), 400)


@app.exception_handler(NoExtractableTextError)
async def no_extractable_text_handler(_: Request, exc: NoExtractableTextError) -> JSONResponse:
    return _json_error(str(exc), 400)


@app.exception_handler(ModelConfigurationError)
async def model_configuration_handler(_: Request, exc: ModelConfigurationError) -> JSONResponse:
    return _json_error(str(exc), 500)


@app.exception_handler(WorkflowError)
async def workflow_error_handler(_: Request, exc: WorkflowError) -> JSONResponse:
    return _json_error(str(exc), 500)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, HTTPException):
        raise exc
    return _json_error("Internal server error", 500)
