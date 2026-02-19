# Finance Tutor

A full-stack finance learning app with:
- FastAPI backend for RAG, quiz generation, answer evaluation, and teaching flows
- React frontend UI
- FAISS vector index built from local `.txt` data files
- Google Gemini models for embeddings and generation

## Project Structure

```text
finance_bot/
  backend/          # FastAPI app + RAG pipeline
  frontend/         # React app
  data/             # Source .txt files for ingestion
  vector_db/        # Generated FAISS index + metadata
  requirements.txt
```

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A Google Gemini API key

## 1 Environment Setup

Create a `.env` file in the repo root (`finance_bot/.env`):

```env
GEMINI_API_KEY=your_api_key_here
PERSIST_DIR=vector_db
EMBEDDING_MODEL=gemini-embedding-001
LLM_MODEL=gemini-2.5-flash
PERSIST_INDEX_PATH=vector_db/faiss_index.idx
METADATA_PATH=vector_db/metadata.json
```

Notes:
- `GEMINI_API_KEY` is required.
- Relative paths above are recommended for this repo layout.
- Keep `.env` private; do not commit secrets.

## 2) Backend Setup

From repo root:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

Start backend:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

Health check:
- `GET /status`

## 3) Build the Vector Index (Ingestion)

Make sure you have `.txt` content in `data/`, then run:

```bash
cd backend
python ingestion.py
```

This generates:
- `vector_db/faiss_index.idx`
- `vector_db/metadata.json`

If ingestion is not run, retrieval routes will fail with index-not-found errors.

## 4) Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:3000`

The frontend is configured to call backend on port `8000`.

## Windows Batch Scripts (Optional)

From repo root:

- `run_backend.bat` - installs Python deps and starts backend
- `run_frontend.bat` - starts frontend
- `run_ingest.bat` - runs ingestion
- `run_all.bat` - opens backend + frontend in separate windows

## API Endpoints

- `POST /ask`
  - body: `{ "question": "..." }`
- `POST /quiz`
  - body: `{ "topic": "...", "top_k": 5 }`
- `POST /evaluate`
  - body: `{ "question": "...", "user_answer": "...", "reference": "optional" }`
- `POST /teach`
  - body: `{ "concept": "...", "reference": "..." }`
- `GET /status`

## Troubleshooting

- `GEMINI_API_KEY not set in environment`
  - Ensure `.env` exists at repo root and backend is started from `backend/` after loading env.

- `Index not found. Run ingestion first.`
  - Run `python backend/ingestion.py` (or `run_ingest.bat`).

- CORS errors from frontend
  - Confirm frontend is running on `http://localhost:3000` and backend on `http://127.0.0.1:8000` or `http://localhost:8000`.

## First Run Checklist

1. Create `.env`
2. Install backend dependencies
3. Run ingestion
4. Start backend
5. Install frontend dependencies
6. Start frontend
