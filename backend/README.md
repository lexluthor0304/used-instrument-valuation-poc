# Backend

## Setup (uv)
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
```

## Run
```bash
uvicorn app.main:app --reload --port 8000
```

## Environment
Copy `.env.example` to `.env` and set your OpenAI key.

## RAG Storage
Vector data is persisted to `.rag_store` by default. Set `RAG_PERSIST_DIR` to change
the location, and delete the directory to rebuild from seed data.
