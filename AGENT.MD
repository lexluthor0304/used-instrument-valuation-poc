# Used Instrument Valuation AI Agent

## Goal
Build a used instrument valuation AI agent with:
- Frontend: React, managed by Bun.
- Backend: FastAPI, managed by uv.
- RAG layer: LangChain (OpenAI embeddings + retrieval).
- VLM/LLM: OpenAI API (vision for description, LLM for synthesis).
- Flow: image -> VLM description -> RAG retrieval -> valuation.
- UI language: Japanese (all user-facing strings).

## Architecture
- Frontend collects an instrument image and optional metadata.
- Backend runs VLM to produce a structured description.
- Description is embedded and queried against a vector store.
- Retrieved examples are used to estimate price and rationale.

## Conventions
- UI text must be Japanese; code identifiers and comments stay in English.
- Keep prompts, schemas, and API contracts explicit and versioned.
- Prefer structured outputs from the VLM (JSON schema) to reduce parsing.

## Repo Layout (planned)
- /frontend: React app (Bun, package.json, bun.lockb).
- /backend: FastAPI app (pyproject.toml, uv).
- /backend/rag: LangChain pipelines, embedding, retrieval logic.
- /backend/vlm: VLM client and prompt templates.

## Dependency Management
- Frontend uses Bun for install, dev, and build tasks.
- Backend uses uv for Python dependencies and virtual envs.

## RAG Guidance
- Normalize VLM output into a stable schema (brand, model, year, condition).
- Store both raw description and normalized fields for retrieval.
- Include price ranges and market source metadata in the index.

## APIs (high level)
- POST /api/describe: image -> structured description
- POST /api/estimate: description -> valuation + evidence

## Testing
- Add unit tests for schema validation and retrieval scoring.
- Add a small golden set for valuation regression checks.
