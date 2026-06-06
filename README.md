# 🚀 PolicyMitra AI

<div align="center">

<img src="assets/banner.gif" alt="PolicyMitra AI Banner" width="100%"/>

<br/>

# 🧠 PolicyMitra AI

### *Your AI Senior for Understanding College Policies*

<p align="center">
An AI-powered RAG platform that transforms complex institutional regulations into understandable, trustworthy, and actionable guidance.
</p>

<br/>

<img src="https://img.shields.io/badge/AI%20for%20Impact-Hackathon-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/RAG-Powered-purple?style=for-the-badge" />
<img src="https://img.shields.io/badge/Student-First-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/Open%20Source-Love-red?style=for-the-badge" />

<br/><br/>

<a href="#-live-demo">
  <img src="https://img.shields.io/badge/🚀_Demo-000000?style=for-the-badge" />
</a>

<a href="#-system-architecture">
  <img src="https://img.shields.io/badge/🏗️_Architecture-1E90FF?style=for-the-badge" />
</a>

<a href="#-api-reference">
  <img src="https://img.shields.io/badge/📚_API-7B68EE?style=for-the-badge" />
</a>

<a href="#-deployment">
  <img src="https://img.shields.io/badge/☁️_Deploy-228B22?style=for-the-badge" />
</a>

</div>

---

<div align="center">

## ✨ Transforming Policy Confusion into Student Clarity

</div>

Students often struggle with:

* Attendance regulations
* Hostel rules
* Examination policies
* Scholarship eligibility
* Academic grievances
* Administrative procedures
* Disciplinary guidelines

PolicyMitra AI acts as an intelligent policy navigator that allows students to upload official policy documents and ask questions in natural language.

Instead of searching through hundreds of pages, students receive:

✅ Accurate Answers

✅ Relevant Sources

✅ Student-Friendly Explanations

✅ Actionable Guidance

✅ Structured Complaint Drafts

---

# 🏆 Hackathon Alignment

Built specifically around the **AI for Campus Operations** and **AI for Indian Multilingual Users** challenge themes, combining:

* AI Campus Policy Navigator
* AI Grievance Assistant
* Hinglish Policy Explainer
* Multi-step RAG Workflow
* Actionable Student Outputs

This directly addresses the hackathon's campus policy navigation and multilingual policy explanation challenges.

---

# 🛡️ Badges

<div align="center">

![Version](https://img.shields.io/badge/version-v1.0-blue)
![Build](https://img.shields.io/github/actions/workflow/status/your-org/policymitra/main.yml)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-009688)
![React](https://img.shields.io/badge/React-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6)
![LangChain](https://img.shields.io/badge/LangChain-121212)
![ChromaDB](https://img.shields.io/badge/ChromaDB-purple)
![Docker](https://img.shields.io/badge/Docker-2496ED)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success)
![Stars](https://img.shields.io/github/stars/your-org/policymitra?style=social)

</div>

---

# 🌟 Core Features

<div align="center">

| Feature                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| 🧭 AI Policy Navigator   | Ask questions directly from uploaded policies |
| 📄 Policy Summarization  | Generate concise summaries                    |
| 🧒 ELI5 Mode             | Explain regulations in simple language        |
| 📋 Action Plan Generator | Convert policies into actionable steps        |
| ⚖️ Grievance Assistant   | Draft structured complaints                   |
| 🔎 Semantic Search       | Vector-powered retrieval                      |
| 📚 Source Grounding      | Every answer backed by policy text            |
| 🌐 Multilingual Support  | English + Hinglish understanding              |
| 🔐 Secure Isolation      | Document-specific retrieval                   |
| ⚡ Fast Responses         | Optimized RAG pipeline                        |

</div>

---

# 🎬 Product Walkthrough

---

## 📂 Policy Upload

<div align="center">

<img src="assets/demos/upload.gif" width="100%"/>

</div>

---

## 💬 Policy Question Answering

<div align="center">

<img src="assets/demos/qa.gif" width="100%"/>

</div>

---

## 🧒 ELI5 Mode

<div align="center">

<img src="assets/demos/eli5.gif" width="100%"/>

</div>

---

## 📋 Action Plan Generator

<div align="center">

<img src="assets/demos/action-plan.gif" width="100%"/>

</div>

---

## ⚖️ Grievance Generator

<div align="center">

<img src="assets/demos/grievance.gif" width="100%"/>

</div>

---

## 📊 Admin Dashboard

<div align="center">

<img src="assets/demos/dashboard.gif" width="100%"/>

</div>

---

# 🏗️ System Architecture

## High-Level Architecture

```mermaid
flowchart LR

A[Student User]
--> B[React Frontend]

B --> C[API Gateway]

C --> D[FastAPI Backend]

D --> E[RAG Pipeline]

E --> F[Chunking]

F --> G[Embeddings]

G --> H[ChromaDB]

E --> I[Retriever]

I --> J[LLM]

J --> K[Grounded Response]

K --> B
```

---

## C4 Container Diagram

```mermaid
flowchart TB

User --> Frontend

subgraph Frontend
React
TypeScript
Tailwind
end

Frontend --> Backend

subgraph Backend
FastAPI
LangChain
end

Backend --> EmbeddingService

subgraph EmbeddingService
MiniLM
SentenceTransformers
end

EmbeddingService --> ChromaDB

Backend --> LLMs

subgraph LLMs
OpenAI
Groq
Gemini
Llama
end
```

---

## Sequence Diagram

```mermaid
sequenceDiagram

participant U as User
participant FE as Frontend
participant API as FastAPI
participant EMB as Embeddings
participant DB as ChromaDB
participant LLM as LLM

U->>FE: Upload PDF

FE->>API: POST /upload-policy

API->>API: Extract Text

API->>API: Chunking

API->>EMB: Generate Embeddings

EMB->>DB: Store Vectors

DB-->>API: Stored

U->>FE: Ask Question

FE->>API: POST /ask

API->>DB: Semantic Search

DB-->>API: Relevant Chunks

API->>LLM: Context + Query

LLM-->>API: Grounded Answer

API-->>FE: Response
```

---

## Authentication Flow

```mermaid
flowchart LR

User

--> OAuth

OAuth

--> JWT

JWT

--> ProtectedAPI

ProtectedAPI

--> FastAPI

FastAPI

--> Database
```

---

## ER Diagram

```mermaid
erDiagram

USERS ||--o{ DOCUMENTS : uploads
DOCUMENTS ||--o{ CHUNKS : contains
USERS ||--o{ QUERIES : asks
QUERIES ||--o{ RESPONSES : receives

USERS {
string id
string email
string role
}

DOCUMENTS {
string id
string name
datetime uploaded_at
}

CHUNKS {
string id
text content
vector embedding
}

QUERIES {
string id
text question
datetime created_at
}

RESPONSES {
string id
text answer
}
```

---

## Deployment Diagram

```mermaid
flowchart LR

Browser

--> Vercel

Vercel

--> Railway

Railway

--> FastAPI

FastAPI

--> ChromaDB

FastAPI

--> LLM Providers
```

---

## CI/CD Pipeline

```mermaid
flowchart LR

Developer

--> GitHub

GitHub

--> Actions

Actions

--> Tests

Tests

--> Build

Build

--> Deploy

Deploy

--> Production
```

---

# 🧠 RAG Pipeline

```mermaid
flowchart TB

PDF

--> Text Extraction

Text Extraction

--> Chunking

Chunking

--> Embedding Generation

Embedding Generation

--> ChromaDB

Question

--> Retriever

Retriever

--> Relevant Chunks

Relevant Chunks

--> LLM

LLM

--> Grounded Answer

Grounded Answer

--> Student
```

---

# 📁 Folder Structure

```text
PolicyMitraAI/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── assets/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── rag/
│   │   ├── models/
│   │   └── core/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── docs/
├── architecture/
├── docker/
├── .github/
│   └── workflows/
│
├── screenshots/
├── README.md
└── docker-compose.yml
```

---

# ⚙️ Tech Stack

## Frontend

| Technology    | Purpose      |
| ------------- | ------------ |
| React         | UI Framework |
| TypeScript    | Type Safety  |
| Tailwind CSS  | Styling      |
| Framer Motion | Animations   |
| ShadCN UI     | Components   |

---

## Backend

| Technology | Purpose       |
| ---------- | ------------- |
| FastAPI    | API Framework |
| Python     | Core Language |

---

## AI Layer

| Technology   | Purpose         |
| ------------ | --------------- |
| LangChain    | Orchestration   |
| ChromaDB     | Vector Storage  |
| HuggingFace  | Embeddings      |
| MiniLM-L6-v2 | Semantic Search |

---

## LLM Providers

| Provider | Usage                |
| -------- | -------------------- |
| OpenAI   | GPT Models           |
| Groq     | Fast Inference       |
| Gemini   | Multimodal Reasoning |
| Llama    | Open Source LLM      |

---

# 📡 API Reference

## Upload Policy

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | `/upload-policy` |

### Request

```json
{
  "file": "policy.pdf"
}
```

---

## Ask Question

| Method | Endpoint |
| ------ | -------- |
| POST   | `/ask`   |

```json
{
  "question":"What is attendance requirement?"
}
```

---

## Generate Complaint

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | `/generate-complaint` |

---

## Explain Simple

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | `/explain-simple` |

---

## Health Check

| Method | Endpoint  |
| ------ | --------- |
| GET    | `/health` |

---

## Debug Chunks

| Method | Endpoint        |
| ------ | --------------- |
| GET    | `/debug/chunks` |

---

# 🔒 Security

<details>

<summary><b>Security Controls</b></summary>

### JWT Authentication

* Secure API access
* Token expiration
* Role-based authorization

### Document Isolation

* User-specific document access
* Namespace segregation

### Prompt Injection Protection

* Input sanitization
* Context filtering
* Source validation

### RAG Guardrails

* Grounded-only responses
* Hallucination reduction
* Citation enforcement

</details>

---

# ⚡ Performance Metrics

| Metric               | Performance |
| -------------------- | ----------- |
| PDF Upload           | < 3 sec     |
| Chunking             | < 1 sec     |
| Embedding Generation | < 2 sec     |
| Vector Search        | < 150 ms    |
| Retrieval Pipeline   | < 300 ms    |
| Response Generation  | < 3 sec     |
| End-to-End Query     | < 4 sec     |

---

# 🗺️ Product Roadmap

```mermaid
gantt
title PolicyMitra AI Roadmap

dateFormat YYYY-MM-DD

section Phase 1
Policy Navigator :done, p1, 2025-06-01, 30d

section Phase 2
Multilingual Support :active, p2, after p1, 30d

section Phase 3
Workflow Automation : p3, after p2, 45d

section Phase 4
Campus Copilot Ecosystem : p4, after p3, 60d
```

---

# 🚀 Local Setup

```bash
git clone https://github.com/your-org/policymitra-ai.git

cd policymitra-ai
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

### Docker

```bash
docker-compose up --build
```

---

# 🤝 Contributing

We welcome contributions from the community.

### Workflow

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Open Pull Request

### Guidelines

* Follow clean architecture
* Write tests
* Maintain documentation
* Use meaningful commit messages
* Keep PRs focused and reviewable

---

# 📊 Why PolicyMitra AI?

| Traditional Policy PDFs | PolicyMitra AI                |
| ----------------------- | ----------------------------- |
| Hundreds of pages       | Instant answers               |
| Difficult language      | Student-friendly explanations |
| Manual searching        | Semantic retrieval            |
| No guidance             | Actionable next steps         |
| No multilingual support | Hinglish understanding        |
| No context              | Source-grounded responses     |

---

# 📜 License

Licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 PolicyMitra AI

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software...
```

---

<div align="center">

# 🌟 PolicyMitra AI

### Your AI Senior for Understanding College Policies

<br/>

Built for **AI for Impact Hackathon**

<br/>

⚡ FastAPI
⚡ React
⚡ LangChain
⚡ ChromaDB
⚡ Generative AI

<br/>

<img src="https://img.shields.io/badge/Built%20With-AI-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Open%20Source-Love-red?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Student-Impact-success?style=for-the-badge"/>

<br/><br/>

[🌐 Website](#) •
[📚 Docs](#) •
[🎥 Demo](#) •
[💬 Discord](#) •
[🐦 Twitter](#)

<br/>

### ⭐ If this project helps students, consider starring the repository.

</div>
