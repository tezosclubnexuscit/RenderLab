from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..models.database import get_db, ChallengeModel, TestCaseModel, AttemptModel
from ..schemas.challenge import (
    ChallengeListItem,
    ChallengeResponse,
    ChallengeCreate,
    GenerateChallengeRequest,
    TestCaseSchema,
    StarterCode,
)
from ..services.challenge_validator import ChallengeValidator
from ..services.llm_service import (
    LLMService,
    find_matching_curriculum_challenge,
    adapt_curriculum_challenge,
)

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.get("", response_model=List[ChallengeListItem])
def list_challenges(
    difficulty: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ChallengeModel).filter(ChallengeModel.is_approved == True)

    if difficulty:
        query = query.filter(ChallengeModel.difficulty == difficulty.lower())
    if mode:
        query = query.filter(ChallengeModel.mode == mode.lower())

    challenges = query.all()

    # Get solved challenge IDs from attempts
    solved_ids = {
        att.challenge_id
        for att in db.query(AttemptModel).filter(AttemptModel.status == "passed").all()
    }

    results = []
    for ch in challenges:
        topics = ch.topics
        # Topic filter
        if topic and topic.lower() not in [t.lower() for t in topics]:
            continue
        # Search filter
        if search:
            s = search.lower()
            if s not in ch.title.lower() and s not in ch.description.lower():
                continue

        results.append(
            ChallengeListItem(
                id=ch.id,
                title=ch.title,
                description=ch.description,
                difficulty=ch.difficulty,
                topics=topics,
                mode=ch.mode,
                estimated_minutes=ch.estimated_minutes,
                is_approved=ch.is_approved,
                is_solved=ch.id in solved_ids,
                tests_count=len(ch.test_cases),
            )
        )

    return results


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    ch = db.query(ChallengeModel).filter(ChallengeModel.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail=f"Challenge '{challenge_id}' not found")

    tests = [
        TestCaseSchema(
            test_id=t.test_id,
            description=t.description,
            test_type=t.test_type,  # type: ignore
            selector=t.selector,
            property_name=t.property_name,
            expected_value=t.expected_value,
            assertion_code=t.assertion_code,
            order_index=t.order_index,
        )
        for t in ch.test_cases
    ]

    sol_code = None
    if ch.solution_html or ch.solution_css or ch.solution_js:
        sol_code = StarterCode(
            html=ch.solution_html or ch.starter_html,
            css=ch.solution_css or ch.starter_css,
            javascript=ch.solution_js or ch.starter_js,
        )

    return ChallengeResponse(
        id=ch.id,
        title=ch.title,
        description=ch.description,
        difficulty=ch.difficulty,  # type: ignore
        topics=ch.topics,
        mode=ch.mode,  # type: ignore
        starter_code=StarterCode(
            html=ch.starter_html,
            css=ch.starter_css,
            javascript=ch.starter_js,
        ),
        solution_code=sol_code,
        requirements=ch.requirements,
        hints=ch.hints,
        estimated_minutes=ch.estimated_minutes,
        is_approved=ch.is_approved,
        tests=tests,
        created_at=ch.created_at,
    )


@router.post("", response_model=ChallengeResponse)
def create_challenge(payload: ChallengeCreate, db: Session = Depends(get_db)):
    is_valid, errors, _ = ChallengeValidator.validate_challenge_payload(payload.model_dump())
    if not is_valid:
        raise HTTPException(status_code=422, detail={"errors": errors})

    existing = db.query(ChallengeModel).filter(ChallengeModel.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Challenge ID '{payload.id}' already exists")

    ch = ChallengeModel(
        id=payload.id,
        title=payload.title,
        description=payload.description,
        difficulty=payload.difficulty,
        mode=payload.mode,
        starter_html=payload.starter_code.html,
        starter_css=payload.starter_code.css,
        starter_js=payload.starter_code.javascript,
        solution_html=payload.solution_code.html if payload.solution_code else "",
        solution_css=payload.solution_code.css if payload.solution_code else "",
        solution_js=payload.solution_code.javascript if payload.solution_code else "",
        estimated_minutes=payload.estimated_minutes,
        is_approved=payload.is_approved,
    )
    ch.topics = payload.topics
    ch.requirements = payload.requirements
    ch.hints = payload.hints

    db.add(ch)
    db.flush()

    for idx, t in enumerate(payload.tests):
        tc = TestCaseModel(
            challenge_id=ch.id,
            test_id=t.test_id,
            description=t.description,
            test_type=t.test_type,
            selector=t.selector,
            property_name=t.property_name,
            expected_value=t.expected_value,
            assertion_code=t.assertion_code,
            order_index=idx,
        )
        db.add(tc)

    db.commit()
    db.refresh(ch)
    return get_challenge(ch.id, db)


@router.post("/generate", response_model=ChallengeResponse)
async def generate_challenge(request: GenerateChallengeRequest, db: Session = Depends(get_db)):
    try:
        raw_challenge = await LLMService.generate_challenge_prompt(
            topic=request.topic,
            difficulty=request.difficulty,
            mode=request.mode,
            learning_objective=request.learning_objective,
            custom_prompt=request.custom_prompt,
            category=request.category,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Challenge generation via active LLM failed: {str(e)}. Check your AI settings (Local Ollama or Cloud API Key).",
        )

    # Validate generated challenge
    is_valid, errors, validated_data = ChallengeValidator.validate_challenge_payload(raw_challenge)
    if not is_valid:
        print(f"[API] Initial validation failed ({errors}), generating resilient curriculum fallback...")
        base = find_matching_curriculum_challenge(request.topic, request.category)
        if base:
            fallback_raw = adapt_curriculum_challenge(base, request.topic, request.difficulty, request.mode, request.learning_objective)
        else:
            fallback_raw = LLMService.generate_fallback_challenge(
                request.topic, request.difficulty, request.mode, request.learning_objective, request.custom_prompt
            )
        is_valid, errors, validated_data = ChallengeValidator.validate_challenge_payload(fallback_raw)
        if not is_valid:
            raise HTTPException(
                status_code=422,
                detail={"message": "LLM produced challenge that failed validation", "errors": errors, "raw": raw_challenge},
            )

    # Make ID unique if needed
    challenge_id = validated_data["id"]
    counter = 1
    base_id = challenge_id
    while db.query(ChallengeModel).filter(ChallengeModel.id == challenge_id).first():
        challenge_id = f"{base_id}-{counter}"
        counter += 1
    validated_data["id"] = challenge_id

    # Create and save
    ch = ChallengeModel(
        id=validated_data["id"],
        title=validated_data["title"],
        description=validated_data["description"],
        difficulty=validated_data["difficulty"],
        mode=validated_data["mode"],
        starter_html=validated_data["starter_code"]["html"],
        starter_css=validated_data["starter_code"]["css"],
        starter_js=validated_data["starter_code"]["javascript"],
        solution_html=validated_data.get("solution_code", {}).get("html", "") if validated_data.get("solution_code") else "",
        solution_css=validated_data.get("solution_code", {}).get("css", "") if validated_data.get("solution_code") else "",
        solution_js=validated_data.get("solution_code", {}).get("javascript", "") if validated_data.get("solution_code") else "",
        estimated_minutes=validated_data.get("estimated_minutes", 15),
        is_approved=True,
    )
    ch.topics = validated_data.get("topics", [])
    ch.requirements = validated_data.get("requirements", [])
    ch.hints = validated_data.get("hints", [])

    db.add(ch)
    db.flush()

    for idx, t in enumerate(validated_data.get("tests", [])):
        tc = TestCaseModel(
            challenge_id=ch.id,
            test_id=t["test_id"],
            description=t["description"],
            test_type=t.get("test_type", "dom"),
            selector=t.get("selector"),
            property_name=t.get("property_name"),
            expected_value=t.get("expected_value"),
            assertion_code=t.get("assertion_code"),
            order_index=idx,
        )
        db.add(tc)

    db.commit()
    db.refresh(ch)
    return get_challenge(ch.id, db)


@router.delete("/{challenge_id}")
def delete_challenge(challenge_id: str, db: Session = Depends(get_db)):
    ch = db.query(ChallengeModel).filter(ChallengeModel.id == challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail=f"Challenge '{challenge_id}' not found")
    
    db.delete(ch)
    db.commit()
    return {"status": "success", "message": f"Challenge '{challenge_id}' deleted successfully", "id": challenge_id}

