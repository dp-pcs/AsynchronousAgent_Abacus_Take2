
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import tempfile
import os

from app.main import app
from app.database import Base, get_db

# Create temporary database for testing
@pytest.fixture
def test_db():
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp()
    
    # Create test engine
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Override dependency
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestingSessionLocal
    
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)
    app.dependency_overrides.clear()

@pytest.fixture
def client(test_db):
    return TestClient(app)

def test_root_endpoint(client):
    """Test the root health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Prediction App API is running"}

def test_create_prediction_valid(client):
    """Test creating a valid prediction"""
    prediction_data = {
        "statement": "It will rain tomorrow",
        "category": "Weather",
        "confidence": 0.7,
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    response = client.post("/predictions", json=prediction_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["statement"] == prediction_data["statement"]
    assert data["category"] == prediction_data["category"]
    assert data["confidence"] == prediction_data["confidence"]
    assert data["status"] == "open"
    assert data["outcome"] is None
    assert "id" in data
    assert "created_at" in data

def test_create_prediction_invalid_confidence(client):
    """Test creating prediction with invalid confidence"""
    prediction_data = {
        "statement": "Test prediction",
        "category": "Test",
        "confidence": 1.5,  # Invalid: > 0.99
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    response = client.post("/predictions", json=prediction_data)
    assert response.status_code == 422

def test_create_prediction_missing_fields(client):
    """Test creating prediction with missing required fields"""
    prediction_data = {
        "statement": "Test prediction",
        # Missing category, confidence, due_at
    }
    
    response = client.post("/predictions", json=prediction_data)
    assert response.status_code == 422

def test_list_predictions_empty(client):
    """Test listing predictions when none exist"""
    response = client.get("/predictions")
    assert response.status_code == 200
    assert response.json() == []

def test_list_predictions_with_data(client):
    """Test listing predictions with existing data"""
    # Create a prediction first
    prediction_data = {
        "statement": "Test prediction",
        "category": "Test",
        "confidence": 0.6,
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    create_response = client.post("/predictions", json=prediction_data)
    assert create_response.status_code == 200
    
    # List predictions
    response = client.get("/predictions")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["statement"] == prediction_data["statement"]

def test_list_predictions_filter_by_status(client):
    """Test filtering predictions by status"""
    # Create prediction
    prediction_data = {
        "statement": "Test prediction",
        "category": "Test",
        "confidence": 0.6,
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    create_response = client.post("/predictions", json=prediction_data)
    prediction_id = create_response.json()["id"]
    
    # Test filtering by open status
    response = client.get("/predictions?status=open")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Resolve the prediction
    resolve_response = client.post(f"/predictions/{prediction_id}/resolve", json={"outcome": 1})
    assert resolve_response.status_code == 200
    
    # Test filtering by resolved status
    response = client.get("/predictions?status=resolved")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Test filtering by open status (should be empty now)
    response = client.get("/predictions?status=open")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_resolve_prediction_valid(client):
    """Test resolving a prediction with valid data"""
    # Create prediction
    prediction_data = {
        "statement": "Test prediction",
        "category": "Test",
        "confidence": 0.7,
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    create_response = client.post("/predictions", json=prediction_data)
    prediction_id = create_response.json()["id"]
    
    # Resolve prediction
    response = client.post(f"/predictions/{prediction_id}/resolve", json={"outcome": 1})
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "resolved"
    assert data["outcome"] == 1
    assert "brier_score" in data
    assert data["brier_score"] is not None

def test_resolve_prediction_not_found(client):
    """Test resolving non-existent prediction"""
    response = client.post("/predictions/999/resolve", json={"outcome": 1})
    assert response.status_code == 404

def test_resolve_prediction_already_resolved(client):
    """Test resolving an already resolved prediction"""
    # Create and resolve prediction
    prediction_data = {
        "statement": "Test prediction",
        "category": "Test",
        "confidence": 0.7,
        "due_at": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    create_response = client.post("/predictions", json=prediction_data)
    prediction_id = create_response.json()["id"]
    
    # First resolution
    response1 = client.post(f"/predictions/{prediction_id}/resolve", json={"outcome": 1})
    assert response1.status_code == 200
    
    # Second resolution attempt
    response2 = client.post(f"/predictions/{prediction_id}/resolve", json={"outcome": 0})
    assert response2.status_code == 422

def test_stats_leaderboard_empty(client):
    """Test leaderboard stats with no predictions"""
    response = client.get("/stats/leaderboard")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_predictions"] == 0
    assert data["resolved_predictions"] == 0
    assert data["average_brier_score"] is None
    assert data["accuracy_rate"] is None
    assert data["categories"] == {}

def test_stats_leaderboard_with_data(client):
    """Test leaderboard stats with resolved predictions"""
    # Create and resolve predictions
    predictions = [
        {
            "statement": "Prediction 1",
            "category": "Category A",
            "confidence": 0.8,
            "due_at": (datetime.now() + timedelta(days=1)).isoformat(),
            "outcome": 1
        },
        {
            "statement": "Prediction 2", 
            "category": "Category B",
            "confidence": 0.3,
            "due_at": (datetime.now() + timedelta(days=1)).isoformat(),
            "outcome": 0
        }
    ]
    
    for pred in predictions:
        outcome = pred.pop("outcome")
        create_response = client.post("/predictions", json=pred)
        prediction_id = create_response.json()["id"]
        
        resolve_response = client.post(f"/predictions/{prediction_id}/resolve", json={"outcome": outcome})
        assert resolve_response.status_code == 200
    
    # Get stats
    response = client.get("/stats/leaderboard")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_predictions"] == 2
    assert data["resolved_predictions"] == 2
    assert data["average_brier_score"] is not None
    assert data["accuracy_rate"] is not None
    assert "Category A" in data["categories"]
    assert "Category B" in data["categories"]
