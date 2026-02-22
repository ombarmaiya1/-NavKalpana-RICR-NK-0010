import urllib.request
import json
import traceback
import io

def get_token():
    login_data = json.dumps({'email': 'testresume@test.com', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            return res.get('access_token')
    except:
        return None

token = get_token()

if token:
    print("Testing PDF Upload...")
    import requests
    url = 'http://localhost:8000/api/resume/analyze'
    headers = {'Authorization': f'Bearer {token}'}
    # Create a dummy PDF file content
    # A valid but empty PDF (minimal byte string for PDF)
    pdf_content = b"%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>> endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer <</Size 4 /Root 1 0 R>>\nstartxref\n188\n%%EOF"
    
    files = {'file': ('test.pdf', pdf_content, 'application/pdf')}
    data = {'role': 'Backend Developer'}
    
    response = requests.post(url, headers=headers, files=files, data=data)
    print("Status:", response.status_code)
    print("Response:", response.text)
else:
    print("No token")
