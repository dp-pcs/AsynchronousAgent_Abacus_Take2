
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from enum import Enum

class PredictionStatus(str, Enum):
    open = "open"
    resolved = "resolved"

class PredictionCreate(BaseModel):
    statement: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., min_length=1, max_length=100)
    confidence: float = Field(..., ge=0.01, le=0.99)
    due_at: datetime

class PredictionResolve(BaseModel):
    outcome: int = Field(..., ge=0, le=1)

class PredictionResponse(BaseModel):
    id: int
    statement: str
    category: str
    confidence: float
    due_at: datetime
    status: PredictionStatus
    outcome: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    brier_score: Optional[float] = None

    class Config:
        from_attributes = True

class LeaderboardStats(BaseModel):
    total_predictions: int
    resolved_predictions: int
    average_brier_score: Optional[float] = None
    accuracy_rate: Optional[float] = None
    categories: dict[str, int]
