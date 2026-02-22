import requests
import json

url = 'http://localhost:8000/api/auth/signup'
payload = {
    'email': 'test_req@test.com',
    'name': 'Test Req',
    'password': 'password123'
}

print(f"Sending POST to {url}")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
