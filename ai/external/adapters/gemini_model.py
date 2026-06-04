import os
from google import genai
from google.genai import types


class GeminiModel:
    """Gemini 2.0 Flash adapter with 3-key rotation."""

    def __init__(self):
        self._keys = self._load_keys()

    def _load_keys(self) -> list[str]:
        env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
        file_vars: dict[str, str] = {}
        try:
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, v = line.split("=", 1)
                        file_vars[k.strip()] = v.strip()
        except Exception:
            pass

        keys = []
        for name in ("GEMINI_API_KEY", "GEMINI_API_KEY2", "GEMINI_API_KEY3"):
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
                    model="gemini-2.0-flash",
                    contents=[prompt],
                    config=config,
                )
                return response.text
            except Exception as e:
                print(f"Gemini key {idx + 1} failed: {e}")
                continue

        print("All Gemini keys exhausted — cascading to offline Q&A")
        return None
