# 🎓 PolicyPal AI
### AI-Powered Hinglish College Policy Explainer

> Making complex college policies understandable for every student through multilingual AI.

---

## 🚀 Overview

PolicyPal AI is an intelligent assistant designed to help students understand complex college policies in simple Hinglish.

Most students struggle to read lengthy academic regulations, attendance policies, examination rules, scholarship guidelines, hostel regulations, and grievance procedures because they are written in formal institutional language.

PolicyPal converts these documents into:

- Simple Hinglish explanations
- Step-by-step guidance
- Personalized answers
- Voice-enabled conversations
- Structured summaries

The platform ensures students receive information only from official college documents, reducing misinformation and confusion.

---

## ❗ Problem Statement

Students often:

- Cannot understand legal or formal policy language.
- Need quick answers instead of reading long PDFs.
- Prefer code-mixed communication (Hindi + English).
- Miss important rules due to document complexity.

This leads to:

- Attendance confusion
- Exam eligibility misunderstandings
- Scholarship misinformation
- Hostel and grievance process issues

---

## 💡 Solution

PolicyPal AI transforms official college documents into an interactive multilingual assistant.

### Workflow

```text
Student Query
      ↓
Language Detection
      ↓
Document Retrieval (RAG)
      ↓
Relevant Policy Extraction
      ↓
LLM Simplification Engine
      ↓
Hinglish Explanation
      ↓
Actionable Steps + References
```

### Example

**Student Query**

```text
Meri attendance 70% hai,
kya main semester exam de sakta hu?
```

**PolicyPal Response**

```text
College policy ke according minimum
75% attendance required hai.

Aapki attendance 70% hai,
isliye aap short attendance category
mein aa sakte ho.

Recommended Action:
• HOD se permission request karein
• Medical documents submit karein (if applicable)

Source:
Attendance Policy Section 4.2
```

---

## ✨ Key Features

### 📄 Policy Understanding

- Upload official college PDFs
- Extract policy content
- Semantic search over documents

### 🌐 Hinglish Explanations

- Converts legal language into student-friendly language
- Supports Hindi-English mixed conversations

### 🎙 Voice Support

- Speech-to-text query input
- Audio response generation

### 🔍 Source Verification

- Every answer is grounded in uploaded documents
- No hallucinated responses

### 📊 Policy Summaries

Generate:

- Attendance summaries
- Hostel rules summaries
- Scholarship eligibility summaries
- Examination guidelines

### 🤖 Personalized Assistance

Students can ask:

```text
Can I apply for revaluation?
```

```text
Mujhe hostel room change karna hai.
```

```text
Scholarship ke liye eligibility kya hai?
```

---

## 👤 User Persona

### Primary User

**College Student**

Characteristics:

- Reads Hinglish comfortably
- Limited time to read long PDFs
- Needs quick and accurate answers

---

## 🏗 System Architecture

```text
Frontend (Next.js)
       │
       ▼
API Layer (FastAPI)
       │
       ▼
Document Processing
(PDF Parsing)
       │
       ▼
Vector Database
(Pinecone/Chroma)
       │
       ▼
Embedding Model
       │
       ▼
LLM Engine
(Gemini/OpenAI)
       │
       ▼
Response Generator
       │
       ▼
Student Dashboard
```

---

## 🛠 Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion

### Backend

- FastAPI
- Python

### AI Stack

- Gemini API
- LangChain
- Sentence Transformers
- RAG Pipeline

### Database

- ChromaDB / Pinecone

### Document Processing

- PyPDF
- PDFPlumber

### Speech Features

- Whisper
- Browser Speech API

### Deployment

- Vercel (Frontend)
- Render / Railway (Backend)

---

## 📂 Project Structure

```bash
PolicyPal-AI/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── pages/
│   └── styles/
│
├── backend/
│   ├── api/
│   ├── rag/
│   ├── embeddings/
│   ├── services/
│   └── utils/
│
├── docs/
│   └── sample_policies/
│
├── architecture/
│
├── demo/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Clone Repository

```bash
git clone https://github.com/your-team/policypal-ai.git
cd policypal-ai
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```text
http://localhost:3000
```

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Runs on:

```text
http://localhost:8000
```

### Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key

OPENAI_API_KEY=your_api_key

VECTOR_DB_URL=your_db_url
```

---

## 🎯 Demo Instructions

### Step 1

Upload an official college policy PDF.

Examples:

- Attendance Policy
- Examination Rules
- Hostel Regulations

### Step 2

Ask questions in:

- English
- Hindi
- Hinglish

Examples:

```text
Attendance short ho gayi toh kya hoga?
```

```text
Can I apply for scholarship after first year?
```

### Step 3

Receive:

- Simplified explanation
- Actionable steps
- Source references

---

## 🤖 How AI Is Used

### 1. Language Understanding

Detects:

- English
- Hindi
- Hinglish

### 2. Retrieval-Augmented Generation (RAG)

- Searches official policy documents
- Retrieves relevant sections
- Prevents hallucinations

### 3. Simplification Engine

Converts complex institutional language into student-friendly Hinglish.

### 4. Conversational Assistant

Maintains context across multiple questions.

### 5. Speech Processing

- Voice input
- Voice output

---

## 📈 Future Enhancements

- Support for all Indian regional languages
- WhatsApp integration
- Student grievance filing
- Automatic form filling
- College ERP integration
- Mobile application

---

## 🏆 Impact

PolicyPal AI improves:

- Student awareness
- Policy accessibility
- Administrative efficiency
- Multilingual inclusion

By making official policies understandable for every student, PolicyPal bridges the gap between institutions and learners.

---

## 👥 Team

**Team Name:** [Your Team Name]

**Hackathon:** AI for Impact 2026

**Theme:** AI for Indian Multilingual Users

**Project:** PolicyPal AI – Hinglish College Policy Explainer

---

## 📜 License

This project was developed as part of the AI for Impact Hackathon.

---

### "Understand Policies. Not Legal Jargon." 🎓🤖