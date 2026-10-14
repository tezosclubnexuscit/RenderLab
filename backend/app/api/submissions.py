import uuid
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..models.database import (
    get_db,
    ChallengeModel,
    TestCaseModel,
    AttemptModel,
    AttemptResultModel,
)
from ..schemas.challenge import (
    SubmissionRequest,
    SubmissionResponse,
    SubmissionResultItem,
)

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponse)
def submit_solution(
    payload: SubmissionRequest,
    db: Session = Depends(get_db),
):
    start_time = time.time()
    ch = db.query(ChallengeModel).filter(ChallengeModel.id == payload.challenge_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail=f"Challenge '{payload.challenge_id}' not found")

    attempt_id = str(uuid.uuid4())[:12]

    # Evaluate tests:
    # If client sandbox already ran tests in isolated iframe and sent results, we map them;
    # otherwise we run backend static structural & heuristic checks
    evaluated_results: List[SubmissionResultItem] = []

    if payload.results_override and len(payload.results_override) > 0:
        evaluated_results = payload.results_override
    else:
        # Evaluate each test case using static AST / keyword / structural heuristics
        combined_css = payload.code_css.lower()
        combined_html = payload.code_html.lower()
        combined_js = payload.code_js.lower()

        for t in ch.test_cases:
            passed = True
            msg = None

            # Basic checks based on test metadata
            if t.selector:
                clean_sel = t.selector.replace(".", "").replace("#", "").lower()
                if clean_sel not in combined_html and clean_sel not in combined_css:
                    passed = False
                    msg = f"Selector '{t.selector}' was not found in your HTML or CSS"

            if passed and t.property_name:
                clean_prop = t.property_name.lower()
                if clean_prop not in combined_css:
                    passed = False
                    msg = f"Expected CSS property '{t.property_name}' was not detected in styles"

            if passed and t.expected_value:
                clean_val = t.expected_value.lower()
                if clean_val not in combined_css and clean_val not in combined_html:
                    passed = False
                    msg = f"Expected value '{t.expected_value}' not matched in code"

            # If no failures detected by heuristic:
            if passed:
                msg = "Test assertion verified"

            evaluated_results.append(
                SubmissionResultItem(
                    test_id=t.test_id,
                    description=t.description,
                    passed=passed,
                    message=msg,
                )
            )

    passed_count = sum(1 for r in evaluated_results if r.passed)
    total_count = len(evaluated_results)
    status = "passed" if (total_count > 0 and passed_count == total_count) else "failed"
    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    # Persist attempt
    attempt = AttemptModel(
        id=attempt_id,
        challenge_id=ch.id,
        code_html=payload.code_html,
        code_css=payload.code_css,
        code_js=payload.code_js,
        status=status,
        passed_count=passed_count,
        total_count=total_count,
        execution_time_ms=elapsed_ms,
    )
    db.add(attempt)
    db.flush()

    for r in evaluated_results:
        ar = AttemptResultModel(
            attempt_id=attempt.id,
            test_id=r.test_id,
            description=r.description,
            passed=r.passed,
            message=r.message,
        )
        db.add(ar)

    db.commit()
    db.refresh(attempt)

    return SubmissionResponse(
        attempt_id=attempt.id,
        challenge_id=attempt.challenge_id,
        status=attempt.status,  # type: ignore
        passed_count=passed_count,
        total_count=total_count,
        execution_time_ms=elapsed_ms,
        results=evaluated_results,
        created_at=attempt.created_at,
    )


@router.get("/attempts", response_model=List[SubmissionResponse])
def list_attempts(
    challenge_id: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(AttemptModel).order_by(AttemptModel.created_at.desc())
    if challenge_id:
        q = q.filter(AttemptModel.challenge_id == challenge_id)
    attempts = q.limit(limit).all()

    resp = []
    for att in attempts:
        resp.append(
            SubmissionResponse(
                attempt_id=att.id,
                challenge_id=att.challenge_id,
                status=att.status,  # type: ignore
                passed_count=att.passed_count,
                total_count=att.total_count,
                execution_time_ms=att.execution_time_ms,
                results=[
                    SubmissionResultItem(
                        test_id=r.test_id,
                        description=r.description,
                        passed=r.passed,
                        message=r.message,
                    )
                    for r in att.results
                ],
                created_at=att.created_at,
            )
        )
    return resp
