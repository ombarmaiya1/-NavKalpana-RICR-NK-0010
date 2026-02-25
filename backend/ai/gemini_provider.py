from google import genai
from ai.base_provider import AIProvider
from core.config import settings

class GeminiProvider(AIProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "PASTE_YOUR_GEMINI_KEY_HERE":
            raise ValueError("Gemini API Key is missing or not configured correctly.")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash"

    async def generate(self, prompt: str) -> str:
        """Generate text using Google's gemini-2.5-flash model."""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"[GeminiProvider] Error: {str(e)}")
            raise e
