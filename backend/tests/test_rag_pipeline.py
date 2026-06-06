import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rag_pipeline_submission_requirements():
    pdf_path = "./data/pdfs/AI for Impact Problem Statements.pdf"
    if not os.path.exists(pdf_path):
        pytest.skip(f"Test file not found: {pdf_path}")
        
    with open(pdf_path, "rb") as f:
        upload_response = client.post(
            "/upload-policy",
            files={"file": ("AI for Impact Problem Statements.pdf", f, "application/pdf")}
        )
    assert upload_response.status_code == 200
    document_id = upload_response.json()["document_id"]
    
    ask_response = client.post(
        "/ask",
        json={
            "document_id": document_id,
            "question": "What are the submission requirements?"
        }
    )
    assert ask_response.status_code == 200
    answer = ask_response.json()["answer"].lower()
    
    assert "source code" in answer or "source" in answer
    assert "readme" in answer
    assert "demo video" in answer or "demo" in answer

def test_rag_pipeline_challenging():
    pdf_path = "./data/pdfs/AI for Impact Problem Statements.pdf"
    if not os.path.exists(pdf_path):
        pytest.skip(f"Test file not found: {pdf_path}")
        
    with open(pdf_path, "rb") as f:
        upload_response = client.post(
            "/upload-policy",
            files={"file": ("AI for Impact Problem Statements.pdf", f, "application/pdf")}
        )
    assert upload_response.status_code == 200
    document_id = upload_response.json()["document_id"]
    
    ask_response = client.post(
        "/ask",
        json={
            "document_id": document_id,
            "question": "What counts as challenging?"
        }
    )
    assert ask_response.status_code == 200
    answer = ask_response.json()["answer"].lower()
    
    assert "specific user persona" in answer or "user persona" in answer
    assert "multi-step workflow" in answer or "multi-step" in answer
    assert "useful output" in answer
