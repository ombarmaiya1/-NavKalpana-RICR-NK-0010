from openai import OpenAI
from ai.base_provider import AIProvider
from core.config import settings

class OpenAIProvider(AIProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "PASTE_YOUR_KEY_HERE":
            raise ValueError("OpenAI API Key is missing or not configured correctly.")
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(self, prompt: str) -> str:
        """Generate text using OpenAI's gpt-4o-mini model."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[OpenAIProvider] Error: {str(e)}")
            raise e
