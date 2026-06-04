from external.adapters.openrouter_model import OpenRouterModel
from external.adapters.gemini_model import GeminiModel
from offline.qa_matcher import match as offline_match


class LLMCascade:
    """
    Three-tier LLM cascade:
      Tier 1 — Groq (Llama 3.3 70B)    fast, cloud
      Tier 2 — Gemini 2.0 Flash         3-key rotation, cloud
      Tier 3 — Offline Q&A matcher      zero-network, always succeeds
    """

    def __init__(self, system_prompt: str):
        self._system_prompt = system_prompt
        self._groq = OpenRouterModel(model_name="llama-3.3-70b-versatile")
        self._gemini = GeminiModel()

    def generate(self, message: str, language: str = "en") -> dict:
        # ── Tier 1: Groq ──────────────────────────────────────────────────
        try:
            result = self._groq.ask(message, system_prompt=self._system_prompt)
            if result and not result.startswith("Error:"):
                print("✅ LLM Cascade: responded via Groq")
                return {"text": result, "source": "groq"}
            print(f"⚠ Groq returned error/empty — cascading to Gemini: {result!r}")
        except Exception as e:
            print(f"⚠ Groq exception — cascading to Gemini: {e}")

        # ── Tier 2: Gemini ────────────────────────────────────────────────
        try:
            result = self._gemini.ask(message, system_prompt=self._system_prompt)
            if result:
                print("✅ LLM Cascade: responded via Gemini")
                return {"text": result, "source": "gemini"}
            print("⚠ Gemini returned None — cascading to offline Q&A")
        except Exception as e:
            print(f"⚠ Gemini exception — cascading to offline Q&A: {e}")

        # ── Tier 3: Offline Q&A ───────────────────────────────────────────
        print("✅ LLM Cascade: responded via offline Q&A")
        qa_result = offline_match(message, language)
        return {"text": qa_result["text"], "source": "offline"}
