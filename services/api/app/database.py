
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum
import os

# Database setup
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "predictions.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PredictionStatus(enum.Enum):
    open = "open"
    resolved = "resolved"

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    statement = Column(String, nullable=False)
    category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)  # 0.01-0.99
    due_at = Column(DateTime, nullable=False)
    status = Column(Enum(PredictionStatus), default=PredictionStatus.open)
    outcome = Column(Integer, nullable=True)  # 0 or 1, nullable until resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Create indexes for performance
    __table_args__ = (
        Index('idx_status_due_at', 'status', 'due_at'),
        Index('idx_category', 'category'),
    )

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
