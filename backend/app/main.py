from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .models.database import init_db
from .seed_data import seed_database
from .api import challenges, submissions, llm, progress


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    # Seed default challenges if empty
    seed_database()
    yield


app = FastAPI(
    title="DevForge AI Practice Suite API",
    description="Backend API for AI-powered frontend coding practice with Local LLMs and Cloud API Keys",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(challenges.router)
app.include_router(submissions.router)
app.include_router(llm.router)
app.include_router(progress.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "DevForge AI Practice Suite API"}
