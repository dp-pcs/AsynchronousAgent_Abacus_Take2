
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List

from .database import get_db, create_tables, Prediction, PredictionStatus
from .schemas import PredictionCreate, PredictionResolve, PredictionResponse, LeaderboardStats
from .scoring import brier_score

# Create tables on startup
create_tables()

app = FastAPI(title="Prediction App API", version="1.0.0")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predictions", response_model=PredictionResponse)
def create_prediction(prediction: PredictionCreate, db: Session = Depends(get_db)):
    """Create a new prediction"""
    db_prediction = Prediction(
        statement=prediction.statement,
        category=prediction.category,
        confidence=prediction.confidence,
        due_at=prediction.due_at,
        status=PredictionStatus.open
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    return PredictionResponse.from_orm(db_prediction)

@app.get("/predictions", response_model=List[PredictionResponse])
def list_predictions(
    status: Optional[str] = Query(None, description="Filter by status (open/resolved)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """List predictions with optional filters"""
    query = db.query(Prediction)
    
    if status:
        if status not in ["open", "resolved"]:
            raise HTTPException(status_code=422, detail="Status must be 'open' or 'resolved'")
        query = query.filter(Prediction.status == PredictionStatus(status))
    
    if category:
        query = query.filter(Prediction.category == category)
    
    predictions = query.order_by(Prediction.created_at.desc()).all()
    
    # Calculate Brier scores for resolved predictions
    response_predictions = []
    for pred in predictions:
        pred_dict = {
            "id": pred.id,
            "statement": pred.statement,
            "category": pred.category,
            "confidence": pred.confidence,
            "due_at": pred.due_at,
            "status": pred.status.value,
            "outcome": pred.outcome,
            "created_at": pred.created_at,
            "updated_at": pred.updated_at,
            "brier_score": None
        }
        
        if pred.status == PredictionStatus.resolved and pred.outcome is not None:
            pred_dict["brier_score"] = brier_score(pred.confidence, pred.outcome)
        
        response_predictions.append(PredictionResponse(**pred_dict))
    
    return response_predictions

@app.post("/predictions/{prediction_id}/resolve", response_model=PredictionResponse)
def resolve_prediction(
    prediction_id: int, 
    resolution: PredictionResolve, 
    db: Session = Depends(get_db)
):
    """Resolve a prediction with outcome"""
    db_prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not db_prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if db_prediction.status == PredictionStatus.resolved:
        raise HTTPException(status_code=422, detail="Prediction already resolved")
    
    db_prediction.status = PredictionStatus.resolved
    db_prediction.outcome = resolution.outcome
    db_prediction.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_prediction)
    
    # Calculate Brier score for response
    pred_dict = {
        "id": db_prediction.id,
        "statement": db_prediction.statement,
        "category": db_prediction.category,
        "confidence": db_prediction.confidence,
        "due_at": db_prediction.due_at,
        "status": db_prediction.status.value,
        "outcome": db_prediction.outcome,
        "created_at": db_prediction.created_at,
        "updated_at": db_prediction.updated_at,
        "brier_score": brier_score(db_prediction.confidence, db_prediction.outcome)
    }
    
    return PredictionResponse(**pred_dict)

@app.get("/stats/leaderboard", response_model=LeaderboardStats)
def get_leaderboard_stats(db: Session = Depends(get_db)):
    """Get leaderboard statistics"""
    total_predictions = db.query(Prediction).count()
    resolved_predictions = db.query(Prediction).filter(
        Prediction.status == PredictionStatus.resolved
    ).count()
    
    # Calculate average Brier score
    average_brier_score = None
    accuracy_rate = None
    
    if resolved_predictions > 0:
        resolved_preds = db.query(Prediction).filter(
            Prediction.status == PredictionStatus.resolved,
            Prediction.outcome.isnot(None)
        ).all()
        
        if resolved_preds:
            brier_scores = [brier_score(pred.confidence, pred.outcome) for pred in resolved_preds]
            average_brier_score = sum(brier_scores) / len(brier_scores)
            
            # Calculate accuracy rate (predictions where confidence > 0.5 and outcome = 1, or confidence < 0.5 and outcome = 0)
            correct_predictions = sum(1 for pred in resolved_preds 
                                   if (pred.confidence > 0.5 and pred.outcome == 1) or 
                                      (pred.confidence < 0.5 and pred.outcome == 0))
            accuracy_rate = correct_predictions / len(resolved_preds)
    
    # Get categories distribution
    categories = dict(
        db.query(Prediction.category, func.count(Prediction.id))
        .group_by(Prediction.category)
        .all()
    )
    
    return LeaderboardStats(
        total_predictions=total_predictions,
        resolved_predictions=resolved_predictions,
        average_brier_score=average_brier_score,
        accuracy_rate=accuracy_rate,
        categories=categories
    )

@app.get("/")
def root():
    """Health check endpoint"""
    return {"message": "Prediction App API is running"}
