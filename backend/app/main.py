from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.rag.pipeline import RagPipeline, get_pipeline
from app.schemas import InstrumentDescription, ValuationResult
from app.vlm.client import describe_instrument

app = FastAPI(title="Used Instrument Valuation API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/describe", response_model=InstrumentDescription)
async def describe(image: UploadFile = File(...)) -> InstrumentDescription:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    try:
        payload = await image.read()
        return describe_instrument(payload, image.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="VLM request failed") from exc


@app.post("/api/estimate", response_model=ValuationResult)
async def estimate(
    description: InstrumentDescription,
    pipeline: RagPipeline = Depends(get_pipeline),
) -> ValuationResult:
    try:
        return pipeline.estimate(description)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="RAG request failed") from exc
