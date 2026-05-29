from abc import ABC, abstractmethod

class ILLMModel(ABC):
    @abstractmethod
    def ask(self, prompt: str) -> str:
        """
        Gives response to a prompt using LLM
        """