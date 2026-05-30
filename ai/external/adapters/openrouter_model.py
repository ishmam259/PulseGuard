from interfaces.llm_model import ILLMModel

import os
import requests

# ── Groq Implementation ──
class OpenRouterModel(ILLMModel):
    def __init__(self, model_name: str = "llama-3.1-8b-instant"):
        """
        Initializes the Groq client.
        Expects GROQ_API_KEY to be set in your environment variables.
        """
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            # Fallback to reading root .env directly
            try:
                env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
                with open(env_path, "r") as f:
                    for line in f:
                        if line.startswith("GROQ_API_KEY="):
                            self.api_key = line.split("=", 1)[1].strip()
                            break
            except Exception:
                pass

        if not self.api_key:
            raise ValueError("Missing environment variable: GROQ_API_KEY")
            
        self.model_name = model_name
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    def ask(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
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
            
            # Groq follows the standard OpenAI response schema
            data = response.json()
            return data["choices"][0]["message"]["content"]

        except requests.exceptions.RequestException as e:
            print(f"Groq API Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Groq Response Body: {e.response.text}")
            return "Error: Unable to fetch response from Groq."