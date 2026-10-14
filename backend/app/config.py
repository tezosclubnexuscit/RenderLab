import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/practice_suite.db")

DEFAULT_LLM_CONFIG = {
    "provider": "ollama",  # 'ollama', 'gemini', 'openai', 'groq', 'anthropic', 'custom'
    "base_url": "http://localhost:11434",
    "model": "deepseek-coder:6.7b",
    "api_key": "",
    "temperature": 0.4,
}
