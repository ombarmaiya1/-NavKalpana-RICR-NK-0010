import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_learning_dashboard():
    # Note: Requires a valid user token if testing against a running server
    # Since I'm testing the structure/logic, I'll recommend the user try this endpoint
    print("Verification Plan:")
    print(f"1. Target: {BASE_URL}/api/learning/dashboard")
    print("2. Required Header: Authorization: Bearer <JWT_TOKEN>")
    print("3. Verification Logic: Dashboard should return mastery_heatmap, high_risk_topics, and daily_study_plan.")
    
    print("\nSimulated Logic Verification (learning_engine.py):")
    from services.learning_engine import calculate_mastery, calculate_risk
    
    # Test cases
    m1 = calculate_mastery(quiz_score=80.0, assignment_score=90.0, consistency=50.0)
    print(f"Mastery (Quiz 80, Assign 90, Consist 50): {m1} (Risk: {calculate_risk(m1)})")
    
    m2 = calculate_mastery(quiz_score=30.0, assignment_score=None, consistency=20.0)
    print(f"Mastery (Quiz 30, Consist 20): {m2} (Risk: {calculate_risk(m2)})")
    
    m3 = calculate_mastery(quiz_score=None, assignment_score=75.0, consistency=100.0)
    print(f"Mastery (Assign 75, Consist 100): {m3} (Risk: {calculate_risk(m3)})")

if __name__ == "__main__":
    test_learning_dashboard()
