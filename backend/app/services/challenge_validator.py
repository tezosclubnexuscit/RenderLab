import re
import time
from typing import Dict, Any, Tuple, List
from ..schemas.challenge import ChallengeCreate, StarterCode, TestCaseSchema


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
    def _create_html_blanks(cls, html: str, title: str) -> str:
        """Transforms completed HTML into an incomplete starter template with TODO blanks."""
        if not html:
            return (
                "<!-- TODO: Construct the component markup -->\n"
                "<div class=\"component-wrapper\">\n"
                "  <!-- TODO: Add required elements -->\n"
                "</div>"
            )

        out_html = html
        has_sub = "<sub>" in out_html or "<sub " in out_html
        has_sup = "<sup>" in out_html or "<sup " in out_html

        if has_sub or has_sup:
            out_html = re.sub(r'<sub>(.*?)</sub>', r'\1', out_html)
            out_html = re.sub(r'<sup>(.*?)</sup>', r'\1', out_html)
            todo_header = (
                "<!-- TODO: 1. Use <sub> for subscript elements and <sup> for superscript exponents -->\n"
            )
            return todo_header + out_html

        # Semantic tags check
        semantic_tags = [
            "header", "nav", "main", "article", "section", "aside", "footer",
            "figure", "picture", "dialog", "details", "summary", "optgroup"
        ]
        found_tags = [tag for tag in semantic_tags if f"<{tag}" in out_html]

        if found_tags:
            for tag in found_tags[:3]:
                out_html = re.sub(rf'<{tag}(\s+[^>]*)?>', r'<div\1>', out_html)
                out_html = re.sub(rf'</{tag}>', r'</div>', out_html)
            todo_header = (
                f"<!-- TODO: Replace generic <div> tags with semantic <{', <'.join(found_tags[:3])}> elements -->\n"
            )
            return todo_header + out_html

        # Form check
        if "<form" in out_html or "<input" in out_html:
            stripped = re.sub(r'\s+required', '', out_html)
            todo_header = (
                "<!-- TODO: 1. Link each <label> to its <input> using matching for/id attributes -->\n"
                "<!-- TODO: 2. Add required validation attributes to mandatory fields -->\n"
            )
            return todo_header + stripped

        return (
            "<!-- TODO: Complete the missing component elements and structure below -->\n"
            + out_html
        )

    @classmethod
    def _create_css_blanks(cls, css: str) -> str:
        """Removes key CSS layout properties and adds TODO comments."""
        if not css:
            return ""
        out_css = re.sub(r'(display:\s*(flex|grid);)', r'/* TODO: \1 */', css)
        out_css = re.sub(r'(grid-template-columns:[^;]+;)', r'/* TODO: \1 */', out_css)
        out_css = re.sub(r'(justify-content:[^;]+;)', r'/* TODO: \1 */', out_css)
        out_css = re.sub(r'(align-items:[^;]+;)', r'/* TODO: \1 */', out_css)
        out_css = re.sub(r'(transition:[^;]+;)', r'/* TODO: \1 */', out_css)
        return (
            "/* ========================================================\n"
            "   TODO: Fill in the missing CSS properties below!\n"
            "   ======================================================== */\n"
            + out_css
        )

    @classmethod
    def _create_js_blanks(cls, js: str) -> str:
        """Replaces listener logic with TODO instructions."""
        if not js:
            return ""
        out_js = re.sub(
            r'(\.addEventListener\([^,]+,\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*\{)([\s\S]*?)(\}\);)',
            r'\1\n  // TODO: Implement the event handler logic here\n\3',
            js,
        )
        if out_js == js:
            out_js = "// TODO: Implement the required JavaScript behavior and event handling\n" + js
        return out_js

    @classmethod
    def validate_challenge_payload(cls, data: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
        errors = []

        if not isinstance(data, dict):
            return False, ["Payload must be a JSON dictionary"], {}

        normalized = dict(data)

        # 1. Normalize ID
        if not normalized.get("id"):
            clean_title = re.sub(r'[^a-z0-9]+', '-', str(normalized.get("title", "challenge")).lower()).strip("-")
            normalized["id"] = f"gen-{clean_title[:20]}-{int(time.time()) % 10000}"

        # 2. Normalize Title & Description
        normalized["title"] = str(normalized.get("title") or "Frontend Coding Challenge").strip()
        normalized["description"] = str(normalized.get("description") or "Complete the challenge requirements.").strip()

        # 3. Normalize Difficulty
        raw_diff = str(normalized.get("difficulty", "easy")).lower().strip()
        if "begin" in raw_diff or "easy" in raw_diff or "basic" in raw_diff:
            normalized["difficulty"] = "easy"
        elif "inter" in raw_diff or "med" in raw_diff:
            normalized["difficulty"] = "medium"
        elif "adv" in raw_diff or "hard" in raw_diff or "expert" in raw_diff:
            normalized["difficulty"] = "hard"
        else:
            normalized["difficulty"] = "easy"

        # 4. Normalize Mode
        raw_mode = str(normalized.get("mode", "fill_blanks")).lower().strip().replace("-", "_").replace(" ", "_")
        if "blank" in raw_mode:
            normalized["mode"] = "fill_blanks"
        elif "fix" in raw_mode or "broken" in raw_mode or "bug" in raw_mode:
            normalized["mode"] = "fix_broken"
        elif "build" in raw_mode or "comp" in raw_mode:
            normalized["mode"] = "build_component"
        elif "recreate" in raw_mode or "page" in raw_mode or "design" in raw_mode:
            normalized["mode"] = "recreate_page"
        else:
            normalized["mode"] = "fill_blanks"

        # 5. Normalize Starter Code & Solution Code
        s_code = normalized.get("starter_code")
        if not isinstance(s_code, dict):
            s_code = {"html": str(s_code or ""), "css": "", "javascript": ""}
        s_html = str(s_code.get("html") or "")
        s_css = str(s_code.get("css") or "")
        s_js = str(s_code.get("javascript") or "")

        sol_code = normalized.get("solution_code")
        if not isinstance(sol_code, dict):
            sol_code = {"html": str(sol_code or ""), "css": "", "javascript": ""}
        sol_html = str(sol_code.get("html") or s_html)
        sol_css = str(sol_code.get("css") or s_css)
        sol_js = str(sol_code.get("javascript") or s_js)

        # =========================================================================
        # CRITICAL: Prevent starter code in 'fill_blanks' mode from giving the full solution
        # =========================================================================
        if normalized["mode"] == "fill_blanks":
            # Check HTML
            has_todo_html = "TODO" in s_html or "todo" in s_html
            if (s_html.strip() == sol_html.strip() or not has_todo_html) and sol_html.strip():
                s_html = cls._create_html_blanks(sol_html, normalized["title"])

            # Check CSS
            has_todo_css = "TODO" in s_css or "todo" in s_css
            if s_css.strip() and sol_css.strip() and (s_css.strip() == sol_css.strip()) and not has_todo_css:
                s_css = cls._create_css_blanks(sol_css)

            # Check JS
            has_todo_js = "TODO" in s_js or "todo" in s_js
            if s_js.strip() and sol_js.strip() and (s_js.strip() == sol_js.strip()) and not has_todo_js:
                s_js = cls._create_js_blanks(sol_js)

        normalized["starter_code"] = {
            "html": s_html,
            "css": s_css,
            "javascript": s_js,
        }
        normalized["solution_code"] = {
            "html": sol_html,
            "css": sol_css,
            "javascript": sol_js,
        }

        # 6. Normalize Tests
        raw_tests = normalized.get("tests") or normalized.get("test_cases") or []
        if not isinstance(raw_tests, list):
            raw_tests = []

        clean_tests = []
        for idx, t in enumerate(raw_tests):
            if not isinstance(t, dict):
                continue
            test_id = str(t.get("test_id") or f"test-{idx+1}").strip()
            desc = str(t.get("description") or f"Verification check #{idx+1}").strip()
            raw_tt = str(t.get("test_type", "dom")).lower().strip()
            if raw_tt in ("html", "markup", "structure"):
                clean_tt = "dom"
            elif raw_tt in ("css", "style", "styles"):
                clean_tt = "css"
            elif raw_tt in ("js", "javascript", "script"):
                clean_tt = "javascript"
            elif raw_tt in ("event", "interaction"):
                clean_tt = "event"
            else:
                clean_tt = "dom"

            assertion = str(t.get("assertion_code") or "Boolean(document.body.children.length > 0)").strip()

            clean_tests.append({
                "test_id": test_id,
                "description": desc,
                "test_type": clean_tt,
                "selector": t.get("selector"),
                "property_name": t.get("property_name"),
                "expected_value": t.get("expected_value"),
                "assertion_code": assertion,
                "order_index": idx,
            })

        if not clean_tests:
            clean_tests.append({
                "test_id": "test-1-dom",
                "description": "Component renders properly in the document body",
                "test_type": "dom",
                "selector": None,
                "property_name": None,
                "expected_value": None,
                "assertion_code": "Boolean(document.body.firstElementChild)",
                "order_index": 0,
            })

        # Ensure unique test IDs
        seen_ids = set()
        for i, t in enumerate(clean_tests):
            if t["test_id"] in seen_ids:
                t["test_id"] = f"{t['test_id']}-{i+1}"
            seen_ids.add(t["test_id"])

        normalized["tests"] = clean_tests

        # 7. Normalize Topics, Requirements, Hints, Minutes
        topics = normalized.get("topics") or ["frontend", "practice"]
        if isinstance(topics, str):
            topics = [t.strip() for t in topics.split(",") if t.strip()]
        normalized["topics"] = [str(t).lower() for t in topics]

        reqs = normalized.get("requirements") or [
            "Implement the component according to specifications.",
            "Ensure clean DOM structure and responsive layout.",
        ]
        if isinstance(reqs, str):
            reqs = [r.strip() for r in reqs.split("\n") if r.strip()]
        normalized["requirements"] = [str(r) for r in reqs]

        hints = normalized.get("hints") or [
            "Check the TODO comments in the starter code.",
            "Inspect the Expected Output tab for visual guidance.",
        ]
        if isinstance(hints, str):
            hints = [h.strip() for h in hints.split("\n") if h.strip()]
        normalized["hints"] = [str(h) for h in hints]

        try:
            m_match = re.search(r'\d+', str(normalized.get("estimated_minutes", 15)))
            normalized["estimated_minutes"] = int(m_match.group(0)) if m_match else 15
        except Exception:
            normalized["estimated_minutes"] = 15

        normalized["is_approved"] = True

        # 8. Security keyword check
        combined_code = (
            (normalized["starter_code"]["html"] or "")
            + (normalized["starter_code"]["css"] or "")
            + (normalized["starter_code"]["javascript"] or "")
        )
        for t in normalized["tests"]:
            combined_code += f" {t.get('assertion_code', '')} {t.get('description', '')}"

        for kw in cls.DISALLOWED_KEYWORDS:
            if kw in combined_code:
                errors.append(f"Forbidden security-sensitive pattern detected in code or tests: '{kw}'")

        if errors:
            return False, errors, normalized

        # 9. Pydantic validation
        try:
            challenge_obj = ChallengeCreate(**normalized)
        except Exception as e:
            errors.append(f"Schema validation failed: {str(e)}")
            return False, errors, normalized

        return True, [], challenge_obj.model_dump()
