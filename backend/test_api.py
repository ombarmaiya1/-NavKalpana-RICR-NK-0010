import urllib.request
import json
import urllib.error

data = json.dumps({'email': 'test@test.com', 'password': 'password123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/auth/signup', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode())
except Exception as e:
    print(e)
