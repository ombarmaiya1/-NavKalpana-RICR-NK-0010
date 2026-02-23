from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Using key: {api_key[:10]}...")

client = genai.Client(api_key=api_key)

print("\n--- Available models (v1beta) ---")
try:
    for m in client.models.list():
        if "generateContent" in (m.supported_actions or []):
            print(m.name)
except Exception as e:
    print("Error listing v1beta models:", e)

client_v1 = genai.Client(api_key=api_key, http_options={"api_version": "v1"})
print("\n--- Available models (v1) ---")
try:
    for m in client_v1.models.list():
        if "generateContent" in (m.supported_actions or []):
            print(m.name)
except Exception as e:
    print("Error listing v1 models:", e)
