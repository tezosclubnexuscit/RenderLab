from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models.database import get_db, ChallengeModel, AttemptModel

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("")
def get_user_progress(db: Session = Depends(get_db)):
    all_challenges = db.query(ChallengeModel).filter(ChallengeModel.is_approved == True).all()
    all_attempts = db.query(AttemptModel).all()

    passed_attempts = [a for a in all_attempts if a.status == "passed"]
    solved_challenge_ids = {a.challenge_id for a in passed_attempts}

    challenge_map = {c.id: c for c in all_challenges}

    easy_total = sum(1 for c in all_challenges if c.difficulty == "easy")
    medium_total = sum(1 for c in all_challenges if c.difficulty == "medium")
    hard_total = sum(1 for c in all_challenges if c.difficulty == "hard")

    easy_solved = sum(1 for cid in solved_challenge_ids if cid in challenge_map and challenge_map[cid].difficulty == "easy")
    medium_solved = sum(1 for cid in solved_challenge_ids if cid in challenge_map and challenge_map[cid].difficulty == "medium")
    hard_solved = sum(1 for cid in solved_challenge_ids if cid in challenge_map and challenge_map[cid].difficulty == "hard")

    total_challenges = len(all_challenges)
    solved_count = len(solved_challenge_ids)
    total_attempts = len(all_attempts)

    accuracy = round((len(passed_attempts) / total_attempts * 100), 1) if total_attempts > 0 else 0.0

    return {
        "total_challenges": total_challenges,
        "solved_count": solved_count,
        "completion_rate": round((solved_count / total_challenges * 100), 1) if total_challenges > 0 else 0.0,
        "total_attempts": total_attempts,
        "accuracy_percent": accuracy,
        "difficulty": {
            "easy": {"solved": easy_solved, "total": easy_total},
            "medium": {"solved": medium_solved, "total": medium_total},
            "hard": {"solved": hard_solved, "total": hard_total},
        },
        "solved_challenge_ids": list(solved_challenge_ids),
    }
