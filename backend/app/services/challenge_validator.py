from typing import Dict, Any, Tuple, List
from ..schemas.challenge import ChallengeCreate


class ChallengeValidator:
    ALLOWED_DIFFICULTIES = {"easy", "medium", "hard"}
    ALLOWED_MODES = {"fill_blanks", "fix_broken", "build_component", "recreate_page"}
    DISALLOWED_KEYWORDS = [
        "child_process",
        "eval(",
        "__import__",
        "process.env",
        "window.top.location",
        "localStorage.clear",
    ]

    @classmethod
    def validate_challenge_payload(cls, data: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
        errors = []

        # 1. Pydantic validation
        try:
            challenge_obj = ChallengeCreate(**data)
        except Exception as e:
            errors.append(f"Schema validation failed: {str(e)}")
            return False, errors, data

        # 2. Difficulty and mode validation
        if challenge_obj.difficulty not in cls.ALLOWED_DIFFICULTIES:
            errors.append(f"Invalid difficulty '{challenge_obj.difficulty}'. Must be one of: {cls.ALLOWED_DIFFICULTIES}")

        if challenge_obj.mode not in cls.ALLOWED_MODES:
            errors.append(f"Invalid mode '{challenge_obj.mode}'. Must be one of: {cls.ALLOWED_MODES}")

        # 3. Test presence
        if not challenge_obj.tests or len(challenge_obj.tests) < 1:
            errors.append("Challenge must contain at least 1 automated test case.")

        # 4. Security keyword check
        combined_code = (
            (challenge_obj.starter_code.html or "")
            + (challenge_obj.starter_code.css or "")
            + (challenge_obj.starter_code.javascript or "")
        )
        for test in challenge_obj.tests:
            combined_code += f" {test.assertion_code or ''} {test.description or ''}"

        for kw in cls.DISALLOWED_KEYWORDS:
            if kw in combined_code:
                errors.append(f"Forbidden security-sensitive pattern detected in code or tests: '{kw}'")

        # 5. Check test IDs are unique
        test_ids = [t.test_id for t in challenge_obj.tests]
        if len(test_ids) != len(set(test_ids)):
            errors.append("Test case IDs must be unique within the challenge.")

        if errors:
            return False, errors, data

        return True, [], challenge_obj.model_dump()
