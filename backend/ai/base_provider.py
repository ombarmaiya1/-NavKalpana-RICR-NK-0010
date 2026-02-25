class AIProvider:
    async def generate(self, prompt: str) -> str:
        """Generate text based on the provided prompt."""
        raise NotImplementedError("Subclasses must implement generate()")
