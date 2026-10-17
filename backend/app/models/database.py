import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    create_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from ..config import DATABASE_URL

Base = declarative_base()
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ChallengeModel(Base):
    __tablename__ = "challenges"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False, default="easy")  # easy, medium, hard
    topics_json = Column(Text, nullable=False, default="[]")  # JSON array
    mode = Column(String(50), nullable=False, default="fill_blanks")  # fill_blanks, fix_broken, build_component
    starter_html = Column(Text, nullable=False, default="")
    starter_css = Column(Text, nullable=False, default="")
    starter_js = Column(Text, nullable=False, default="")
    solution_html = Column(Text, nullable=True, default="")
    solution_css = Column(Text, nullable=True, default="")
    solution_js = Column(Text, nullable=True, default="")
    requirements_json = Column(Text, nullable=False, default="[]")
    hints_json = Column(Text, nullable=False, default="[]")
    estimated_minutes = Column(Integer, default=15)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    test_cases = relationship("TestCaseModel", back_populates="challenge", cascade="all, delete-orphan")
    attempts = relationship("AttemptModel", back_populates="challenge", cascade="all, delete-orphan")

    @property
    def topics(self):
        try:
            return json.loads(self.topics_json)
        except Exception:
            return []

    @topics.setter
    def topics(self, value):
        self.topics_json = json.dumps(value)

    @property
    def requirements(self):
        try:
            return json.loads(self.requirements_json)
        except Exception:
            return []

    @requirements.setter
    def requirements(self, value):
        self.requirements_json = json.dumps(value)

    @property
    def hints(self):
        try:
            return json.loads(self.hints_json)
        except Exception:
            return []

    @hints.setter
    def hints(self, value):
        self.hints_json = json.dumps(value)


class TestCaseModel(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    challenge_id = Column(String(100), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    test_type = Column(String(50), nullable=False, default="dom")  # dom, css, js, event, custom
    selector = Column(String(200), nullable=True)
    property_name = Column(String(100), nullable=True)
    expected_value = Column(String(255), nullable=True)
    assertion_code = Column(Text, nullable=True)  # JS test expression / function body
    order_index = Column(Integer, default=0)

    challenge = relationship("ChallengeModel", back_populates="test_cases")


class AttemptModel(Base):
    __tablename__ = "attempts"

    id = Column(String(50), primary_key=True, index=True)
    challenge_id = Column(String(100), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    code_html = Column(Text, nullable=False, default="")
    code_css = Column(Text, nullable=False, default="")
    code_js = Column(Text, nullable=False, default="")
    status = Column(String(20), nullable=False, default="pending")  # passed, failed, error
    passed_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    challenge = relationship("ChallengeModel", back_populates="attempts")
    results = relationship("AttemptResultModel", back_populates="attempt", cascade="all, delete-orphan")


class AttemptResultModel(Base):
    __tablename__ = "attempt_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(String(50), ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    passed = Column(Boolean, nullable=False)
    message = Column(Text, nullable=True)

    attempt = relationship("AttemptModel", back_populates="results")


class LLMSettingModel(Base):
    __tablename__ = "llm_settings"

    id = Column(Integer, primary_key=True, default=1)
    provider = Column(String(50), default="ollama")  # 'ollama', 'gemini', 'openai', 'groq', 'anthropic', 'custom'
    base_url = Column(String(255), default="http://localhost:11434")
    model = Column(String(100), default="deepseek-coder:6.7b")
    api_key = Column(Text, default="")
    temperature = Column(Float, default=0.3)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(bind=engine)
