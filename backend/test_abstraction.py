import asyncio
import os
import sys

# Add the current directory to sys.path to allow importing from ai and core
sys.path.append(os.getcwd())

from ai.provider_factory import get_ai_provider
from core.config import settings

async def test_abstraction():
    print(f"Current AI_PROVIDER: {settings.AI_PROVIDER}")
    
    try:
        provider = get_ai_provider()
        print(f"Instantiated provider: {type(provider).__name__}")
        
        print("Sending test prompt...")
        response = await provider.generate("Say 'Hello from Abstraction Layer'")
        print(f"Response: {response}")
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_abstraction())
