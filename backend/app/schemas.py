from pydantic import BaseModel, Field


class InstrumentDescription(BaseModel):
    category: str = ""
    brand: str = ""
    model: str = ""
    year: str | None = None
    condition: str = ""
    materials: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    notes: str = ""


class ValuationResult(BaseModel):
    price_jpy: int
    range_jpy: tuple[int, int]
    confidence: float
    rationale: str
    evidence: list[str]
