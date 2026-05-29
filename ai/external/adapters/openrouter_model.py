from interfaces.llm_model import ILLMModel

import os
import requests

# ── OpenRouter Implementation ──
class OpenRouterModel(ILLMModel):
    def __init__(self, model_name: str = "google/gemma-4-31b-it:free"):
        """
        Initializes the OpenRouter client.
        Expects OPENROUTER_API_KEY to be set in your environment variables.
        """
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("Missing environment variable: OPENROUTER_API_KEY")
            
        self.model_name = model_name
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    def ask(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            # OpenRouter optionally likes these rankings/identifications
            "HTTP-Referer": "http://localhost:3000", 
            "X-Title": "PulseGuard AI",
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        try:
            response = requests.post(self.url, headers=headers, json=payload)
            response.raise_for_status() # Raises an exception for 4xx/5xx status codes
            
            # OpenRouter follows the standard OpenAI response schema
            data = response.json()
            return data["choices"][0]["message"]["content"]

        except requests.exceptions.RequestException as e:
            print(f"OpenRouter API Error: {e}")
            return "Error: Unable to fetch response from OpenRouter."