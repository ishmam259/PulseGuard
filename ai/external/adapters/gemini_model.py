import os
from google import genai
from google.genai import types


class GeminiModel:
    """Gemini 2.5 Flash adapter with 4-key rotation."""

    def __init__(self):
        self._keys = self._load_keys()

    def _load_keys(self) -> list[str]:
        file_vars: dict[str, str] = {}
        # Try root .env and backend .env
        env_paths = [
            os.path.join(os.path.dirname(__file__), "../../../.env"),
            os.path.join(os.path.dirname(__file__), "../../../backend/.env"),
        ]
        for path in env_paths:
            try:
                with open(path, encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if "=" in line and not line.startswith("#"):
                            k, v = line.split("=", 1)
                            val = v.strip()
                            if val:
                                file_vars[k.strip()] = val
            except Exception:
                pass

        keys = []
        for name in ("GEMINI_API_KEY", "GEMINI_API_KEY2", "GEMINI_API_KEY3", "GEMINI_API_KEY4"):
            val = os.getenv(name) or file_vars.get(name)
            if val:
                keys.append(val)
        return keys

    def ask(self, prompt: str, system_prompt: str = None) -> str | None:
        """Try each Gemini key in order. Returns None if all fail."""
        config = None
        if system_prompt:
            config = types.GenerateContentConfig(system_instruction=system_prompt)

        for idx, key in enumerate(self._keys):
            try:
                client = genai.Client(api_key=key)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[prompt],
                    config=config,
                )
                return response.text
            except Exception as e:
                print(f"Gemini key {idx + 1} failed: {e}")
                continue

        print("All Gemini keys exhausted — cascading to offline Q&A")
        return None

    def generate_multimodal(self, prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> str | None:
        """Send an image + text prompt to Gemini. Returns response text or None."""
        for idx, key in enumerate(self._keys):
            try:
                client = genai.Client(api_key=key)
                image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[image_part, prompt],
                )
                return response.text
            except Exception as e:
                print(f"Gemini key {idx + 1} failed (multimodal): {e}")
                continue
        return None
