import os
import subprocess
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..models.database import get_db, ChallengeModel
from ..schemas.challenge import (
    LLMConfigSchema,
    TestConnectionRequest,
    AIHintRequest,
    AIHintResponse,
    PullModelRequest,
)
from ..services.llm_service import (
    get_current_llm_config,
    update_current_llm_config,
    LLMService,
)

router = APIRouter(prefix="/api", tags=["llm"])


@router.get("/config/llm", response_model=LLMConfigSchema)
def get_llm_configuration():
    cfg = get_current_llm_config()
    # Mask API key partially for safety in UI display
    api_key = cfg.get("api_key", "")
    masked_key = ""
    if api_key:
        if len(api_key) > 8:
            masked_key = api_key[:4] + "..." + api_key[-4:]
        else:
            masked_key = "********"

    return LLMConfigSchema(
        provider=cfg.get("provider", "ollama"),
        base_url=cfg.get("base_url", "http://localhost:11434"),
        model=cfg.get("model", "deepseek-coder:6.7b"),
        api_key=api_key,  # Full key so user can see or update
        temperature=cfg.get("temperature", 0.3),
    )


@router.post("/config/llm", response_model=LLMConfigSchema)
def update_llm_configuration(payload: LLMConfigSchema):
    updated = update_current_llm_config(payload.model_dump())
    return LLMConfigSchema(**updated)


@router.post("/llm/test-connection")
async def test_llm_connection(payload: TestConnectionRequest):
    test_dict = {}
    if payload.provider:
        test_dict["provider"] = payload.provider
    if payload.base_url:
        test_dict["base_url"] = payload.base_url
    if payload.model:
        test_dict["model"] = payload.model
    if payload.api_key is not None:
        test_dict["api_key"] = payload.api_key

    result = await LLMService.test_connection(test_dict if test_dict else None)
    return result


@router.post("/llm/hint", response_model=AIHintResponse)
async def request_ai_hint(payload: AIHintRequest, db: Session = Depends(get_db)):
    ch = db.query(ChallengeModel).filter(ChallengeModel.id == payload.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")

    try:
        hint_result = await LLMService.get_hint(
            challenge_title=ch.title,
            challenge_description=ch.description,
            requirements=ch.requirements,
            current_html=payload.code_html,
            current_css=payload.code_css,
            current_js=payload.code_js,
            failed_tests=payload.failed_tests,
            user_question=payload.user_question,
        )
        return AIHintResponse(
            hint=hint_result.get("hint", "Review the failed test assertions carefully."),
            explanation=hint_result.get("explanation"),
        )
    except Exception as e:
        fallback = LLMService.generate_fallback_hint(
            challenge_title=ch.title,
            requirements=ch.requirements,
            current_html=payload.code_html,
            current_css=payload.code_css,
            current_js=payload.code_js,
            failed_tests=payload.failed_tests,
            cause=str(e),
            user_question=payload.user_question,
        )
        return AIHintResponse(
            hint=fallback["hint"],
            explanation=fallback.get("explanation"),
        )


@router.get("/llm/local-models")
async def get_local_models(base_url: Optional[str] = "http://localhost:11434"):
    res = await LLMService.list_local_models(base_url)
    return res


@router.post("/llm/pull-model")
async def pull_local_model(payload: PullModelRequest):
    return StreamingResponse(
        LLMService.pull_model_stream(payload.model, payload.base_url),
        media_type="text/event-stream",
    )


@router.post("/llm/start-ollama")
async def start_local_ollama():
    # Check if already running
    status = await LLMService.list_local_models("http://localhost:11434")
    if status.get("online"):
        return {"status": "already_running", "message": "Ollama service is already active"}

    # Attempt to launch ollama on Windows
    ollama_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe")
    started = False
    if os.path.exists(ollama_path):
        try:
            subprocess.Popen([ollama_path, "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            started = True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start Ollama executable: {str(e)}")
    else:
        # Try generic 'ollama' in PATH
        try:
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            started = True
        except Exception:
            raise HTTPException(
                status_code=404,
                detail="Ollama executable not found. Please install Ollama from https://ollama.com",
            )

    return {
        "status": "launching" if started else "failed",
        "message": "Ollama service command sent. Waiting for daemon to initialize...",
    }
