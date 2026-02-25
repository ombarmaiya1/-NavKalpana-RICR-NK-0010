from core.config import settings
from ai.openai_provider import OpenAIProvider
from ai.gemini_provider import GeminiProvider
from ai.base_provider import AIProvider

class FallbackProvider(AIProvider):
    def __init__(self, primary: AIProvider, secondary: AIProvider):
        self.primary = primary
        self.secondary = secondary

    async def generate(self, prompt: str) -> str:
        try:
            return await self.primary.generate(prompt)
        except Exception as e:
            # Check for common quota/limit error indicators in OpenAI
            error_msg = str(e).lower()
            if "insufficient_quota" in error_msg or "429" in error_msg or "rate_limit" in error_msg:
                print(f"[FallbackProvider] Primary provider failed ({error_msg}). Falling back to Gemini...")
                try:
                    return await self.secondary.generate(prompt)
                except Exception as secondary_error:
                    print(f"[FallbackProvider] Secondary provider also failed: {str(secondary_error)}")
                    raise secondary_error
            raise e

def get_ai_provider():
    """Factory function to get the configured AI provider, with optional fallback."""
    provider_type = settings.AI_PROVIDER.lower()

    if provider_type == "openai":
        openai_p = OpenAIProvider()
        # Enable fallback to Gemini if API key is present
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "PASTE_YOUR_GEMINI_KEY_HERE":
            try:
                gemini_p = GeminiProvider()
                return FallbackProvider(openai_p, gemini_p)
            except Exception as e:
                print(f"[provider_factory] Could not initialize Gemini for fallback: {e}")
                return openai_p
        return openai_p

    elif provider_type == "gemini":
        return GeminiProvider()
    
    else:
        raise ValueError(f"Unsupported AI_PROVIDER: {provider_type}")
