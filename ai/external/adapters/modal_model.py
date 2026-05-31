from interfaces.llm_model import ILLMModel
import requests, os

class ModalDirectModel(ILLMModel):
    def __init__(self, model_name: str = "zai-org/GLM-5.1-FP8", max_tokens: int = 500):
        """
        Initializes the Modal Direct client.
        Expects MODAL_API_TOKEN to be set in your environment variables.
        """
        self.api_key = os.getenv("MODAL_API_TOKEN")
        if not self.api_key:
            raise ValueError("Missing environment variable: MODAL_API_TOKEN")
            
        self.model_name = model_name
        self.max_tokens = max_tokens
        self.url = "https://api.us-west-2.modal.direct/v1/chat/completions"

    def ask(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": self.max_tokens
        }

        try:
            response = requests.post(self.url, headers=headers, json=payload)
            response.raise_for_status()  # Catch 4xx or 5xx status codes
            
            data = response.json()
            return data["choices"][0]["message"]["content"]

        except requests.exceptions.RequestException as e:
            print(f"Modal Direct API Error: {e}")
            return "Error: Unable to fetch response from Modal Direct server."