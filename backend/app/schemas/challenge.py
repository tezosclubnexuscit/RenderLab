from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class StarterCode(BaseModel):
    html: str = ""
    css: str = ""
    javascript: str = ""


class TestCaseSchema(BaseModel):
    test_id: str
    description: str
    test_type: Literal["dom", "css", "javascript", "event", "custom"] = "dom"
    selector: Optional[str] = None
    property_name: Optional[str] = None
    expected_value: Optional[str] = None
    assertion_code: Optional[str] = None
    order_index: int = 0


class ChallengeBase(BaseModel):
    id: str
    title: str
    description: str
    difficulty: Literal["easy", "medium", "hard"] = "easy"
    topics: List[str] = []
    mode: Literal["fill_blanks", "fix_broken", "build_component", "recreate_page"] = "fill_blanks"
    starter_code: StarterCode
    requirements: List[str] = []
    hints: List[str] = []
    estimated_minutes: int = 15
    is_approved: bool = True


class ChallengeCreate(ChallengeBase):
    tests: List[TestCaseSchema]
    solution_code: Optional[StarterCode] = None


class ChallengeResponse(ChallengeBase):
    tests: List[TestCaseSchema]
    solution_code: Optional[StarterCode] = None
    created_at: Optional[datetime] = None


class ChallengeListItem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    topics: List[str]
    mode: str
    estimated_minutes: int
    is_approved: bool
    is_solved: bool = False
    tests_count: int = 0


class SubmissionResultItem(BaseModel):
    test_id: str
    description: str
    passed: bool
    message: Optional[str] = None


class SubmissionRequest(BaseModel):
    challenge_id: str
    code_html: str = ""
    code_css: str = ""
    code_js: str = ""
    results_override: Optional[List[SubmissionResultItem]] = None


class SubmissionResponse(BaseModel):
    attempt_id: str
    challenge_id: str
    status: Literal["passed", "failed", "error"]
    passed_count: int
    total_count: int
    execution_time_ms: float
    results: List[SubmissionResultItem]
    created_at: Optional[datetime] = None


class GenerateChallengeRequest(BaseModel):
    topic: str = "css flexbox"
    difficulty: Literal["easy", "medium", "hard"] = "easy"
    mode: Literal["fill_blanks", "fix_broken", "build_component", "recreate_page"] = "fill_blanks"
    learning_objective: Optional[str] = None
    custom_prompt: Optional[str] = None


class LLMConfigSchema(BaseModel):
    provider: Literal["ollama", "gemini", "openai", "groq", "anthropic", "custom"] = "ollama"
    base_url: str = "http://localhost:11434"
    model: str = "deepseek-coder:6.7b"
    api_key: Optional[str] = ""
    temperature: float = 0.3


class TestConnectionRequest(BaseModel):
    provider: Optional[str] = None
    base_url: Optional[str] = None
    model: Optional[str] = None
    api_key: Optional[str] = None


class AIHintRequest(BaseModel):
    challenge_id: str
    code_html: str = ""
    code_css: str = ""
    code_js: str = ""
    failed_tests: List[str] = []
    user_question: Optional[str] = None


class AIHintResponse(BaseModel):
    hint: str
    explanation: Optional[str] = None


class PullModelRequest(BaseModel):
    model: str
    base_url: Optional[str] = "http://localhost:11434"
