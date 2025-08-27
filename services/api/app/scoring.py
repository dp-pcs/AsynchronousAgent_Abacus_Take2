
def brier_score(p: float, o: int) -> float:
    """
    Calculate Brier score for a prediction.
    
    Args:
        p (float): Predicted probability (0.01 to 0.99)
        o (int): Actual outcome (0 or 1)
    
    Returns:
        float: Brier score (p - o)^2
    
    Raises:
        ValueError: If p is not in range [0.01, 0.99] or o is not 0 or 1
    """
    if not isinstance(p, (int, float)) or not (0.01 <= p <= 0.99):
        raise ValueError("Predicted probability must be between 0.01 and 0.99")
    
    if o not in (0, 1):
        raise ValueError("Outcome must be 0 or 1")
    
    return (p - o) ** 2
