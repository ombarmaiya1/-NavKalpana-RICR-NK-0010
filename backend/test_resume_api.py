import urllib.request
import json
import urllib.error

# 1. First, sign up (if needed) or login to get a JWT token
def get_token():
    # Try to login first
    login_data = json.dumps({'email': 'testresume@test.com', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            return res.get('access_token')
    except urllib.error.HTTPError as e:
        if e.code == 400:
            # Maybe user doesn't exist, let's sign up
            signup_data = json.dumps({'email': 'testresume@test.com', 'name': 'Test User', 'password': 'password123'}).encode('utf-8')
            req = urllib.request.Request('http://localhost:8000/api/auth/signup', data=signup_data, headers={'Content-Type': 'application/json'})
            try:
                with urllib.request.urlopen(req) as response:
                    pass # Signed up successfully
            except Exception as e2:
                print("Signup failed:", e2)
            
            # Now login
            req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
            try:
                 with urllib.request.urlopen(req) as response:
                    res = json.loads(response.read().decode())
                    return res.get('access_token')
            except Exception as e3:
                 print("Login failed after signup:", e3)
        return None
    except Exception as e:
        print("Login error:", e)
        return None

token = get_token()
if not token:
    print("Failed to get token, cannot test resume endpoint.")
    exit(1)

print("Got token:", token)

# 2. Test the resume endpoint with JSON (raw text)
test_data = json.dumps({
    'resume_text': 'I am a software engineer with 5 years of experience in Python, FastAPI, and React. I have built scalable web applications.',
    'role': 'Backend Developer'
}).encode('utf-8')

req = urllib.request.Request('http://localhost:8000/api/resume/analyze', data=test_data, headers={
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
})

print("Testing /api/resume/analyze with raw text...")
try:
    with urllib.request.urlopen(req) as response:
         print("Status:", response.getcode())
         print("Response:", json.loads(response.read().decode()))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    try:
         print(e.read().decode())
    except:
         pass
except Exception as e:
    print("Error:", e)
