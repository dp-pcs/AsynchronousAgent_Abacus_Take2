
import pytest
from app.scoring import brier_score

def test_brier_score_correct_calculation():
    """Test Brier score calculation with valid inputs"""
    # Perfect prediction (p=1, o=1)
    assert brier_score(0.99, 1) == (0.99 - 1) ** 2
    assert brier_score(0.01, 0) == (0.01 - 0) ** 2
    
    # Worst prediction (p=1, o=0)
    assert brier_score(0.99, 0) == (0.99 - 0) ** 2
    assert brier_score(0.01, 1) == (0.01 - 1) ** 2
    
    # Mid-range predictions
    assert brier_score(0.5, 1) == (0.5 - 1) ** 2
    assert brier_score(0.7, 0) == (0.7 - 0) ** 2

def test_brier_score_invalid_probability():
    """Test Brier score validation for probability range"""
    # Test p < 0.01
    with pytest.raises(ValueError, match="Predicted probability must be between 0.01 and 0.99"):
        brier_score(0.005, 1)
    
    # Test p > 0.99
    with pytest.raises(ValueError, match="Predicted probability must be between 0.01 and 0.99"):
        brier_score(1.0, 1)
    
    # Test p = 0
    with pytest.raises(ValueError, match="Predicted probability must be between 0.01 and 0.99"):
        brier_score(0.0, 1)

def test_brier_score_invalid_outcome():
    """Test Brier score validation for outcome values"""
    # Test o not in {0, 1}
    with pytest.raises(ValueError, match="Outcome must be 0 or 1"):
        brier_score(0.5, 2)
    
    with pytest.raises(ValueError, match="Outcome must be 0 or 1"):
        brier_score(0.5, -1)

def test_brier_score_edge_cases():
    """Test Brier score with edge cases"""
    # Test boundary values
    assert brier_score(0.01, 0) == (0.01 - 0) ** 2
    assert brier_score(0.01, 1) == (0.01 - 1) ** 2
    assert brier_score(0.99, 0) == (0.99 - 0) ** 2
    assert brier_score(0.99, 1) == (0.99 - 1) ** 2
