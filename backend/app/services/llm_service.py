import json
import re
import time
import copy
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import httpx
from ..config import DEFAULT_LLM_CONFIG
from ..models.database import SessionLocal, LLMSettingModel

_CURRICULUM_CACHE: Optional[List[Dict[str, Any]]] = None


def get_curriculum_challenges() -> List[Dict[str, Any]]:
    global _CURRICULUM_CACHE
    if _CURRICULUM_CACHE is None:
        curr_path = Path(__file__).resolve().parent.parent / "data" / "curriculum_311.json"
        if curr_path.exists():
            try:
                with open(curr_path, "r", encoding="utf-8") as f:
                    _CURRICULUM_CACHE = json.load(f)
            except Exception as e:
                print(f"[LLMService] Error loading curriculum_311.json: {e}")
                _CURRICULUM_CACHE = []
        else:
            _CURRICULUM_CACHE = []
    return _CURRICULUM_CACHE


def find_matching_curriculum_challenge(topic: str, category: Optional[str] = None) -> Optional[Dict[str, Any]]:
    curr = get_curriculum_challenges()
    if not curr:
        return None

    # 1. Match by challenge sequence number e.g. #25 or #1
    m = re.search(r'#(\d+)', topic)
    if m:
        num = int(m.group(1))
        for c in curr:
            cm = re.search(r'#(\d+)', c.get("title", ""))
            if cm and int(cm.group(1)) == num:
                return copy.deepcopy(c)

    # 2. Match by clean title (case-insensitive substring)
    clean_t = re.sub(r'^#\d+\.\s*', '', topic).lower().strip()
    if clean_t:
        for c in curr:
            c_title = re.sub(r'^#\d+\.\s*', '', c.get("title", "")).lower().strip()
            if clean_t == c_title or (len(clean_t) > 6 and clean_t in c_title):
                return copy.deepcopy(c)

    # 3. Match by major keywords
    words = [
        w for w in re.findall(r'[a-zA-Z]{4,}', clean_t)
        if w not in ("challenge", "practice", "markup", "component", "using", "with", "form", "card")
    ]
    if len(words) >= 2:
        for c in curr:
            c_str = (c.get("title", "") + " " + c.get("description", "")).lower()
            if all(w in c_str for w in words[:2]):
                return copy.deepcopy(c)

    return None


def adapt_curriculum_challenge(
    base: Dict[str, Any],
    topic: str,
    difficulty: str,
    mode: str,
    learning_objective: Optional[str] = None,
) -> Dict[str, Any]:
    adapted = copy.deepcopy(base)
    clean_id = re.sub(r'[^a-z0-9]+', '-', base.get("id", "challenge")).strip('-')
    adapted["id"] = f"gen-{clean_id}-{int(time.time()) % 10000}"
    adapted["difficulty"] = difficulty
    adapted["mode"] = mode

    if learning_objective and learning_objective.strip():
        adapted["description"] = f"{adapted.get('description', '')} Note: {learning_objective.strip()}"

    # If mode is fill_blanks, ensure starter_code has blanks and does not reveal solution
    if mode == "fill_blanks":
        s_html = (adapted.get("starter_code", {}).get("html") or "").strip()
        sol_html = (adapted.get("solution_code", {}).get("html") or "").strip()
        if (s_html == sol_html or ("TODO" not in s_html and "todo" not in s_html)) and sol_html:
            from .challenge_validator import ChallengeValidator
            adapted["starter_code"]["html"] = ChallengeValidator._create_html_blanks(
                sol_html, adapted.get("title", "")
            )

    return adapted



def get_current_llm_config() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        setting = db.query(LLMSettingModel).filter(LLMSettingModel.id == 1).first()
        if not setting:
            setting = LLMSettingModel(
                id=1,
                provider=DEFAULT_LLM_CONFIG["provider"],
                base_url=DEFAULT_LLM_CONFIG["base_url"],
                model=DEFAULT_LLM_CONFIG["model"],
                api_key=DEFAULT_LLM_CONFIG["api_key"],
                temperature=DEFAULT_LLM_CONFIG["temperature"],
            )
            db.add(setting)
            db.commit()
            db.refresh(setting)

        return {
            "provider": setting.provider,
            "base_url": setting.base_url,
            "model": setting.model,
            "api_key": setting.api_key or "",
            "temperature": setting.temperature or 0.3,
        }
    finally:
        db.close()


def update_current_llm_config(new_config: Dict[str, Any]) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        setting = db.query(LLMSettingModel).filter(LLMSettingModel.id == 1).first()
        if not setting:
            setting = LLMSettingModel(id=1)
            db.add(setting)

        if "provider" in new_config and new_config["provider"]:
            setting.provider = new_config["provider"]
        if "base_url" in new_config and new_config["base_url"] is not None:
            setting.base_url = new_config["base_url"].rstrip("/")
        if "model" in new_config and new_config["model"]:
            setting.model = new_config["model"]
        if "api_key" in new_config:
            setting.api_key = new_config["api_key"]
        if "temperature" in new_config and new_config["temperature"] is not None:
            setting.temperature = float(new_config["temperature"])

        db.commit()
        db.refresh(setting)

        return {
            "provider": setting.provider,
            "base_url": setting.base_url,
            "model": setting.model,
            "api_key": setting.api_key or "",
            "temperature": setting.temperature,
        }
    finally:
        db.close()


class LLMService:
    @staticmethod
    async def chat_completion(
        messages: list,
        config: Optional[Dict[str, Any]] = None,
        max_tokens: int = 2500,
        response_json: bool = False,
    ) -> str:
        cfg = config or get_current_llm_config()
        provider = cfg.get("provider", "ollama").lower()
        base_url = (cfg.get("base_url") or "").rstrip("/")
        model = cfg.get("model", "deepseek-coder:6.7b")
        api_key = cfg.get("api_key", "").strip()
        temperature = float(cfg.get("temperature", 0.3))

        timeout = httpx.Timeout(90.0, connect=10.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            if provider == "ollama":
                # Ollama chat endpoint
                url = f"{base_url}/api/chat" if base_url else "http://localhost:11434/api/chat"
                payload = {
                    "model": model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                    },
                }
                if response_json:
                    payload["format"] = "json"

                resp = await client.post(url, json=payload)
                if resp.status_code == 404:
                    err_text = ""
                    try:
                        err_text = resp.json().get("error", "")
                    except Exception:
                        err_text = resp.text

                    # Auto-fallback: check if Ollama has another model installed (e.g. llama3.1:8b when llama3:8b was requested)
                    try:
                        tags_url = f"{base_url}/api/tags" if base_url else "http://localhost:11434/api/tags"
                        tags_resp = await client.get(tags_url)
                        if tags_resp.status_code == 200:
                            installed_models = [m.get("name") for m in tags_resp.json().get("models", [])]
                            matched = None
                            for inst in installed_models:
                                if model.replace(".1", "").split(":")[0] in inst or inst.split(":")[0] in model:
                                    matched = inst
                                    break
                            if not matched and len(installed_models) > 0:
                                matched = installed_models[0]
                            if matched and matched != model:
                                payload["model"] = matched
                                retry_resp = await client.post(url, json=payload)
                                if retry_resp.status_code == 200:
                                    data = retry_resp.json()
                                    return data.get("message", {}).get("content", "")
                    except Exception:
                        pass

                    if "not found" in err_text.lower():
                        raise ValueError(f"Model '{model}' is not installed in local Ollama. Open AI Settings to install '{model}' with 1-click, or switch to a Cloud API Key (Gemini/Groq).")
                    raise ValueError(f"Ollama returned 404: {err_text}")
                elif resp.status_code != 200:
                    err_text = ""
                    try:
                        err_text = resp.json().get("error", resp.text)
                    except Exception:
                        err_text = resp.text
                    raise ValueError(f"Ollama returned HTTP {resp.status_code}: {err_text}")

                data = resp.json()
                return data.get("message", {}).get("content", "")

            elif provider == "gemini":
                # Google Gemini API
                # Can use Gemini native generateContent or OpenAI compatibility
                # Native endpoint:
                target_model = model if model else "gemini-2.5-flash"
                if not api_key:
                    raise ValueError("Gemini API Key is required. Please set it in AI Settings.")

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
                
                # Transform messages to Gemini contents format
                gemini_contents = []
                system_instruction = None
                for msg in messages:
                    role = msg.get("role")
                    content = msg.get("content", "")
                    if role == "system":
                        system_instruction = {"parts": [{"text": content}]}
                    else:
                        gemini_role = "user" if role == "user" else "model"
                        gemini_contents.append({"role": gemini_role, "parts": [{"text": content}]})

                gemini_body: Dict[str, Any] = {
                    "contents": gemini_contents,
                    "generationConfig": {
                        "temperature": temperature,
                        "maxOutputTokens": max_tokens,
                    },
                }
                if system_instruction:
                    gemini_body["systemInstruction"] = system_instruction
                if response_json:
                    gemini_body["generationConfig"]["responseMimeType"] = "application/json"

                resp = await client.post(url, json=gemini_body)
                resp.raise_for_status()
                data = resp.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError(f"No response candidates returned by Gemini: {data}")
                parts = candidates[0].get("content", {}).get("parts", [])
                return "".join([p.get("text", "") for p in parts])

            elif provider in ["openai", "groq", "custom"]:
                # Standard OpenAI compatible endpoints
                if provider == "openai":
                    url = f"{base_url}/chat/completions" if base_url else "https://api.openai.com/v1/chat/completions"
                elif provider == "groq":
                    url = f"{base_url}/chat/completions" if base_url else "https://api.groq.com/openai/v1/chat/completions"
                else:  # custom / lmstudio
                    url = f"{base_url}/chat/completions" if "/chat/completions" not in base_url else base_url

                headers = {"Content-Type": "application/json"}
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"

                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_json and provider in ["openai", "groq"]:
                    payload["response_format"] = {"type": "json_object"}

                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                choices = data.get("choices", [])
                if not choices:
                    raise ValueError(f"Empty choices from {provider}: {data}")
                return choices[0].get("message", {}).get("content", "")

            elif provider == "anthropic":
                # Anthropic Claude API
                url = "https://api.anthropic.com/v1/messages"
                if not api_key:
                    raise ValueError("Anthropic API Key is required. Please set it in AI Settings.")

                system_text = ""
                chat_messages = []
                for msg in messages:
                    if msg.get("role") == "system":
                        system_text += msg.get("content", "") + "\n"
                    else:
                        chat_messages.append({"role": msg.get("role"), "content": msg.get("content")})

                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                }
                payload = {
                    "model": model if model else "claude-3-5-sonnet-20241022",
                    "messages": chat_messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                }
                if system_text:
                    payload["system"] = system_text

                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                content_blocks = data.get("content", [])
                return "".join([b.get("text", "") for b in content_blocks if b.get("type") == "text"])

            else:
                raise ValueError(f"Unsupported LLM provider: {provider}")

    @classmethod
    async def test_connection(cls, test_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        cfg = test_config or get_current_llm_config()
        start_time = time.time()
        try:
            sample_messages = [
                {"role": "system", "content": "You are an assistant. Reply with only 'OK' if you receive this."},
                {"role": "user", "content": "Ping"},
            ]
            response = await cls.chat_completion(messages=sample_messages, config=cfg, max_tokens=10)
            elapsed_ms = round((time.time() - start_time) * 1000, 1)
            return {
                "success": True,
                "latency_ms": elapsed_ms,
                "message": f"Successfully connected to {cfg.get('provider')} ({cfg.get('model')}) in {elapsed_ms}ms!",
                "raw_response": response.strip(),
            }
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 1)
            return {
                "success": False,
                "latency_ms": elapsed_ms,
                "message": f"Failed to connect: {str(e)}",
            }

    @classmethod
    async def generate_challenge_prompt(
        cls,
        topic: str,
        difficulty: str,
        mode: str,
        learning_objective: Optional[str] = None,
        custom_prompt: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        system_instruction = (
            "You are an expert Frontend Lead Engineer and educator who creates high-quality coding challenges. "
            "You must generate a complete, valid JSON object for a frontend practice challenge. "
            "The challenge MUST be strictly valid JSON with no markdown formatting outside, and must strictly conform to this schema:\n"
            "{\n"
            '  "id": "slug-name-001",\n'
            '  "title": "Title of Challenge",\n'
            '  "description": "Clear explanation of what needs to be accomplished and why",\n'
            '  "difficulty": "easy" | "medium" | "hard",\n'
            '  "topics": ["topic1", "topic2"],\n'
            '  "mode": "fill_blanks" | "fix_broken" | "build_component" | "recreate_page",\n'
            '  "starter_code": {\n'
            '    "html": "Incomplete starter HTML template",\n'
            '    "css": "Incomplete starter CSS template with TODO comments",\n'
            '    "javascript": "Incomplete starter JS template with TODO comments"\n'
            "  },\n"
            '  "solution_code": {\n'
            '    "html": "Complete working reference HTML",\n'
            '    "css": "Complete working reference CSS",\n'
            '    "javascript": "Complete working reference JS"\n'
            "  },\n"
            '  "requirements": ["Requirement 1", "Requirement 2"],\n'
            '  "hints": ["Helpful tip 1", "Helpful tip 2"],\n'
            '  "estimated_minutes": 15,\n'
            '  "tests": [\n'
            "    {\n"
            '      "test_id": "test-1",\n'
            '      "description": "Description of what is verified",\n'
            '      "test_type": "dom" | "css" | "javascript" | "event" | "custom",\n'
            '      "selector": "CSS selector to element if applicable",\n'
            '      "property_name": "CSS or DOM property if applicable",\n'
            '      "expected_value": "Expected value if applicable",\n'
            '      "assertion_code": "JavaScript expression returning boolean or throwing error. In the test runner sandbox, document, window, and elements are available. E.g. !!document.querySelector(\'.btn\') or window.getComputedStyle(document.querySelector(\'.card\')).display === \'flex\'"\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "CRITICAL: Do NOT wrap in ```json ``` markdown tags. Return ONLY raw valid JSON.\n"
            "CRITICAL: 'starter_code' MUST BE INCOMPLETE! Leave the key CSS properties or JS logic for the user to write, marked with /* TODO */ blanks. 'solution_code' must be the complete, working solution."
        )

        mode_specs = {
            "fill_blanks": (
                "FILL_BLANKS MODE: Provide an incomplete code template with scaffolding in place. "
                "Crucial elements (e.g., semantic tags, key CSS layout properties, or core JS logic) MUST be omitted "
                "and clearly marked with '<!-- TODO: instruction -->' or '/* TODO: instruction */' or '// TODO: instruction'. "
                "The user fills in the blanks. Do NOT provide the full solution in starter_code!"
            ),
            "build_component": (
                "BUILD_COMPONENT MODE: Provide minimal skeletal starter code (e.g., outer wrapper and sample data). "
                "The user must architect and build the entire component from scratch matching the requirements "
                "and target solution output. starter_code must be skeletal; solution_code must be the complete, working component."
            ),
            "fix_broken": (
                "FIX_BROKEN MODE: Provide realistic, complete-looking code that contains 1 to 2 intentional, subtle bugs "
                "(e.g., broken accessibility attributes, layout overflow, missing flex/grid alignment, or event/state bug in JS). "
                "starter_code contains the bug; solution_code contains the corrected bug-free implementation."
            ),
            "recreate_page": (
                "RECREATE_PAGE MODE: Provide a complete, polished, pixel-perfect target design in solution_code. "
                "The starter_code should be a clean, minimal starting canvas. The user's objective is to study the "
                "Expected Target Output preview and recreate the exact design pixel-for-pixel."
            ),
        }
        mode_detail = mode_specs.get(mode, mode_specs["fill_blanks"])

        # Check if an authoritative curriculum blueprint matches this topic
        base_blueprint = find_matching_curriculum_challenge(topic, category)

        # If user did NOT specify a custom prompt and we have an authoritative blueprint,
        # we can provide the curated, high-quality, pre-tested challenge immediately!
        if base_blueprint and not custom_prompt:
            return adapt_curriculum_challenge(base_blueprint, topic, difficulty, mode, learning_objective)

        # Build prompt for LLM
        user_content = (
            f"Generate a frontend coding challenge with:\n"
            f"- Topic: {topic}\n"
            f"- Difficulty: {difficulty}\n"
            f"- Mode Specification: {mode_detail}\n"
        )
        if category:
            user_content += f"- Category Focus: Strictly emphasize {category.upper()} best practices and concepts.\n"
        if learning_objective:
            user_content += f"- Learning Objective: {learning_objective}\n"
        if custom_prompt:
            user_content += f"- Additional Instructions: {custom_prompt}\n"

        if base_blueprint:
            user_content += (
                f"\nReference challenge blueprint for inspiration:\n"
                f"- Title: {base_blueprint.get('title')}\n"
                f"- Description: {base_blueprint.get('description')}\n"
                f"- Reference Starter Code: {json.dumps(base_blueprint.get('starter_code', {}))}\n"
                f"- Reference Solution Code: {json.dumps(base_blueprint.get('solution_code', {}))}\n"
            )

        user_content += (
            "\nProvide 3 to 6 comprehensive, deterministic tests with clear assertion_code snippets "
            "that inspect the DOM / CSS / JS state accurately. Ensure starter_code is incomplete template with TODO blanks, and solution_code has the complete working code."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content},
        ]

        try:
            clean_json_str = ""   # initialize before use so except clause can reference it safely
            raw_output = await cls.chat_completion(messages, response_json=True, max_tokens=3000)

            # Parse JSON safely
            clean_json_str = raw_output.strip()
            if clean_json_str.startswith("```"):
                clean_json_str = re.sub(r"^```(?:json)?\n", "", clean_json_str)
                clean_json_str = re.sub(r"\n```$", "", clean_json_str)

            parsed = json.loads(clean_json_str)
            return parsed
        except json.JSONDecodeError as err:
            match = re.search(r"(\{.*\})", clean_json_str, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            if base_blueprint:
                return adapt_curriculum_challenge(base_blueprint, topic, difficulty, mode, learning_objective)
            return cls.generate_fallback_challenge(topic, difficulty, mode, learning_objective, custom_prompt)
        except Exception as err:
            print(f"[LLMService] Live LLM call failed ({str(err)}). Providing smart challenge fallback.")
            if base_blueprint:
                return adapt_curriculum_challenge(base_blueprint, topic, difficulty, mode, learning_objective)
            return cls.generate_fallback_challenge(topic, difficulty, mode, learning_objective, custom_prompt)

    @classmethod
    def generate_fallback_challenge(
        cls,
        topic: str,
        difficulty: str,
        mode: str,
        learning_objective: Optional[str] = None,
        custom_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower().strip()).strip("-")
        clean_topic = topic.strip().title()
        t_low = topic.lower()

        if "grid" in t_low or "gallery" in t_low:
            title = f"{clean_topic}: Responsive CSS Grid"
            desc = "Build a modern responsive card gallery layout using CSS Grid with auto-fit and minmax columns."
            starter_html = '<div class="gallery-container">\n  <!-- TODO: Populate responsive gallery cards -->\n  <div class="gallery-card">Card 1</div>\n  <div class="gallery-card">Card 2</div>\n  <div class="gallery-card">Card 3</div>\n  <div class="gallery-card">Card 4</div>\n</div>'
            starter_css = 'body {\n  background: #0f172a;\n  padding: 30px;\n  font-family: sans-serif;\n}\n.gallery-container {\n  /* =======================================================\n     TODO (Fill in the Blanks):\n     1. Set display: grid\n     2. Set grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))\n     3. Set gap: 20px\n     ======================================================= */\n}\n.gallery-card {\n  background: #1e293b;\n  color: #fff;\n  padding: 24px;\n  border-radius: 8px;\n  border: 1px solid #334155;\n}'
            starter_js = "// Optional: Add click or filter behavior"

            solution_html = '<div class="gallery-container">\n  <div class="gallery-card">Card 1</div>\n  <div class="gallery-card">Card 2</div>\n  <div class="gallery-card">Card 3</div>\n  <div class="gallery-card">Card 4</div>\n</div>'
            solution_css = 'body {\n  background: #0f172a;\n  padding: 30px;\n  font-family: sans-serif;\n}\n.gallery-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 20px;\n}\n.gallery-card {\n  background: #1e293b;\n  color: #fff;\n  padding: 24px;\n  border-radius: 8px;\n  border: 1px solid #334155;\n}'
            solution_js = ""

            tests = [
                {
                    "test_id": "test-grid-display",
                    "description": "Container uses display: grid",
                    "test_type": "css",
                    "selector": ".gallery-container",
                    "assertion_code": "window.getComputedStyle(document.querySelector('.gallery-container')).display === 'grid'",
                },
                {
                    "test_id": "test-grid-gap",
                    "description": "Container has gap spacing between items",
                    "test_type": "css",
                    "selector": ".gallery-container",
                    "assertion_code": "parseInt(window.getComputedStyle(document.querySelector('.gallery-container')).gap) >= 16",
                },
                {
                    "test_id": "test-cards-rendered",
                    "description": "All 4 gallery cards are rendered",
                    "test_type": "dom",
                    "assertion_code": "document.querySelectorAll('.gallery-card').length >= 4",
                },
            ]
            reqs = [
                "Set .gallery-container to display: grid.",
                "Configure responsive columns using repeat(auto-fit, minmax(200px, 1fr)).",
                "Set gap: 20px between grid items.",
            ]
        elif "animat" in t_low or "transition" in t_low or "toggle" in t_low or "switch" in t_low:
            title = f"{clean_topic}: Smooth Toggle Transition"
            desc = "Implement an animated switch that toggles state when clicked and animates its slider handle."
            starter_html = '<div class="switch-wrapper">\n  <button id="toggle-switch" class="switch" role="switch" aria-checked="false">\n    <span class="switch-handle"></span>\n  </button>\n  <span id="status-label" class="status">Off</span>\n</div>'
            starter_css = 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: sans-serif;\n}\n.switch {\n  width: 60px;\n  height: 32px;\n  background: #334155;\n  border-radius: 16px;\n  position: relative;\n  border: none;\n  cursor: pointer;\n  transition: background 0.3s ease;\n}\n.switch-handle {\n  width: 24px;\n  height: 24px;\n  background: white;\n  border-radius: 50%;\n  position: absolute;\n  top: 4px;\n  left: 4px;\n  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n/* ========================================================\n   TODO: Fill in the blanks below!\n   1. Add .switch.active rule with background: #22c55e\n   2. Add .switch.active .switch-handle with transform: translateX(28px)\n   ======================================================== */\n\n.status { color: #fff; margin-left: 12px; }'
            starter_js = "const btn = document.getElementById('toggle-switch');\nconst label = document.getElementById('status-label');\n\nbtn.addEventListener('click', () => {\n  // TODO: 1. Toggle 'active' class on btn\n  // TODO: 2. Set label.textContent to 'On' if active, else 'Off'\n  // TODO: 3. Set aria-checked attribute to 'true' or 'false'\n});"

            solution_html = '<div class="switch-wrapper">\n  <button id="toggle-switch" class="switch" role="switch" aria-checked="false">\n    <span class="switch-handle"></span>\n  </button>\n  <span id="status-label" class="status">Off</span>\n</div>'
            solution_css = 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: sans-serif;\n}\n.switch {\n  width: 60px;\n  height: 32px;\n  background: #334155;\n  border-radius: 16px;\n  position: relative;\n  border: none;\n  cursor: pointer;\n  transition: background 0.3s ease;\n}\n.switch-handle {\n  width: 24px;\n  height: 24px;\n  background: white;\n  border-radius: 50%;\n  position: absolute;\n  top: 4px;\n  left: 4px;\n  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.switch.active {\n  background: #22c55e;\n}\n.switch.active .switch-handle {\n  transform: translateX(28px);\n}\n.status { color: #fff; margin-left: 12px; }'
            solution_js = "const btn = document.getElementById('toggle-switch');\nconst label = document.getElementById('status-label');\n\nbtn.addEventListener('click', () => {\n  const isActive = btn.classList.toggle('active');\n  label.textContent = isActive ? 'On' : 'Off';\n  btn.setAttribute('aria-checked', String(isActive));\n});"

            tests = [
                {
                    "test_id": "test-switch-exists",
                    "description": "Switch button exists with id 'toggle-switch'",
                    "test_type": "dom",
                    "assertion_code": "Boolean(document.getElementById('toggle-switch'))",
                },
                {
                    "test_id": "test-toggle-click",
                    "description": "Clicking switch toggles 'active' class",
                    "test_type": "javascript",
                    "assertion_code": "(() => { const btn = document.getElementById('toggle-switch'); btn.click(); const wasActive = btn.classList.contains('active'); btn.click(); return wasActive; })()",
                },
                {
                    "test_id": "test-label-update",
                    "description": "Clicking switch updates status label text to 'On'",
                    "test_type": "javascript",
                    "assertion_code": "(() => { const btn = document.getElementById('toggle-switch'); const lbl = document.getElementById('status-label'); btn.click(); return lbl.textContent.trim() === 'On'; })()",
                },
            ]
            reqs = [
                "Clicking '#toggle-switch' must toggle the 'active' class.",
                "When active, '#status-label' must display 'On'.",
                "The handle inside the button must animate smoothly with CSS transition.",
            ]
        else:
            title = f"{clean_topic} Challenge"
            desc = f"Build and style an interactive {topic} component with clean DOM structure, modern layout, and responsive styles."
            if mode == "fill_blanks":
                starter_html = f'<div class="component-card">\n  <!-- TODO: 1. Add <h2 class=\"title\">{clean_topic}</h2> -->\n  <p class=\"desc\">Practice building this component with clean styling and layout.</p>\n  <!-- TODO: 2. Add an interactive button with id=\"action-btn\" and class=\"action-btn\" -->\n  <div id=\"output-box\" class=\"output\">Ready</div>\n</div>'
            else:
                starter_html = f'<div class="component-card">\n  <div id="root-container"></div>\n</div>'
            starter_css = 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: sans-serif;\n}\n.component-card {\n  background: #1e293b;\n  color: #fff;\n  padding: 32px;\n  border-radius: 12px;\n  max-width: 450px;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n}\n.title { font-size: 1.5rem; margin-top: 0; color: #38bdf8; }\n.desc { color: #94a3b8; font-size: 0.9rem; }\n/* ========================================================\n   TODO: Fill in the button styles below!\n   1. Set background: #3b82f6, color: #fff, padding: 10px 20px\n   2. Add hover effect with background: #2563eb\n   ======================================================== */\n.output { margin-top: 16px; font-weight: 500; color: #22c55e; }'
            starter_js = "const btn = document.getElementById('action-btn');\nconst out = document.getElementById('output-box');\n\nif (btn) {\n  btn.addEventListener('click', () => {\n    // TODO: Update out.textContent to 'Completed!'\n  });\n}"

            solution_html = f'<div class="component-card">\n  <h2 class="title">{clean_topic}</h2>\n  <p class="desc">Practice building this component with clean styling and layout.</p>\n  <button id="action-btn" class="action-btn">Interact</button>\n  <div id="output-box" class="output">Ready</div>\n</div>'
            solution_css = 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: sans-serif;\n}\n.component-card {\n  background: #1e293b;\n  color: #fff;\n  padding: 32px;\n  border-radius: 12px;\n  max-width: 450px;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n}\n.title { font-size: 1.5rem; margin-top: 0; color: #38bdf8; }\n.desc { color: #94a3b8; font-size: 0.9rem; }\n.action-btn {\n  background: #3b82f6;\n  color: #fff;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n.action-btn:hover { background: #2563eb; transform: translateY(-1px); }\n.output { margin-top: 16px; font-weight: 500; color: #22c55e; }'
            solution_js = "const btn = document.getElementById('action-btn');\nconst out = document.getElementById('output-box');\n\nif (btn) {\n  btn.addEventListener('click', () => {\n    out.textContent = 'Completed!';\n  });\n}"

            tests = [
                {
                    "test_id": "test-card-rendered",
                    "description": "Component card is rendered with title",
                    "test_type": "dom",
                    "assertion_code": "Boolean(document.querySelector('.component-card .title'))",
                },
                {
                    "test_id": "test-action-click",
                    "description": "Clicking button updates output text to 'Completed!'",
                    "test_type": "javascript",
                    "assertion_code": "(() => { const btn = document.getElementById('action-btn'); const out = document.getElementById('output-box'); if (!btn || !out) return false; btn.click(); return out.textContent.trim() === 'Completed!'; })()",
                },
                {
                    "test_id": "test-styling-applied",
                    "description": "Card has background color and padding applied",
                    "test_type": "css",
                    "selector": ".component-card",
                    "assertion_code": "(() => { const c = document.querySelector('.component-card'); return c && window.getComputedStyle(c).padding !== '0px'; })()",
                },
            ]
            reqs = [
                "Render the component title and description inside .component-card.",
                "Clicking '#action-btn' must update '#output-box' to 'Completed!'.",
                "Ensure modern padding, colors, and button hover states are active.",
            ]

        topics_list = [t.strip().lower() for t in topic.split() if len(t) > 2][:4]
        if not topics_list:
            topics_list = ["frontend", "css", "javascript"]

        return {
            "id": f"{slug[:20]}-{int(time.time()) % 10000}",
            "title": title,
            "description": desc,
            "difficulty": difficulty,
            "topics": topics_list,
            "mode": mode,
            "starter_code": {
                "html": starter_html,
                "css": starter_css,
                "javascript": starter_js,
            },
            "solution_code": {
                "html": solution_html,
                "css": solution_css,
                "javascript": solution_js,
            },
            "requirements": reqs,
            "hints": [
                f"Inspect the DOM structure and CSS styles for {clean_topic}.",
                "Use event listeners to handle user interaction dynamically.",
            ],
            "estimated_minutes": 15 if difficulty == 'easy' else 25 if difficulty == 'medium' else 35,
            "tests": tests,
        }

    @classmethod
    async def get_hint(
        cls,
        challenge_title: str,
        challenge_description: str,
        requirements: list,
        current_html: str,
        current_css: str,
        current_js: str,
        failed_tests: list,
        user_question: Optional[str] = None,
    ) -> Dict[str, str]:
        system_instruction = (
            "You are a friendly, encouraging frontend coding tutor. "
            "Your goal is to guide the user to solve their challenge without giving away the complete solution. "
            "Point out where their logic or CSS/DOM syntax might be missing or incorrect, and give them a conceptual step forward."
        )

        user_content = (
            f"Challenge: {challenge_title}\n"
            f"Description: {challenge_description}\n"
            f"Requirements:\n" + "\n".join(f"- {r}" for r in requirements) + "\n\n"
            f"Failed Tests:\n" + "\n".join(f"- {ft}" for ft in failed_tests) + "\n\n"
            f"User's Current Code:\n"
            f"HTML:\n{current_html}\n\n"
            f"CSS:\n{current_css}\n\n"
            f"JavaScript:\n{current_js}\n\n"
        )
        if user_question:
            user_content += f"User's Question/Input:\n{user_question}\n\n"

        user_content += (
            "Please provide:\n"
            "1. A direct, concise hint (1-2 sentences) tailored to their code and question.\n"
            "2. A brief pedagogical explanation of the core concept."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content},
        ]

        try:
            raw_response = await cls.chat_completion(messages, max_tokens=600)
            return {
                "hint": raw_response.strip(),
                "explanation": "Review the requirement and test expectation against the DOM tree and styles.",
            }
        except Exception as err:
            print(f"[LLMService] Live hint failed ({str(err)}). Providing smart pedagogical fallback hint.")
            return cls.generate_fallback_hint(
                challenge_title=challenge_title,
                requirements=requirements,
                current_html=current_html,
                current_css=current_css,
                current_js=current_js,
                failed_tests=failed_tests,
                cause=str(err),
                user_question=user_question,
            )

    @classmethod
    def generate_fallback_hint(
        cls,
        challenge_title: str,
        requirements: list,
        current_html: str,
        current_css: str,
        current_js: str,
        failed_tests: list,
        cause: Optional[str] = None,
        user_question: Optional[str] = None,
    ) -> Dict[str, str]:
        tips = []
        combined_tests = " ".join(failed_tests).lower()
        combined_css = current_css.lower()
        combined_js = current_js.lower()

        # Specific diagnostics based on failing assertions
        if "transition" in combined_tests:
            if "transition:" not in combined_css:
                tips.append("Make sure to add the `transition` property (e.g. `transition: all 0.3s ease;`) to the base selector so property changes animate smoothly.")
            else:
                tips.append("Check that your `transition` rule syntax is valid and covers the animated properties (like `background-color`, `transform`, or `all`).")

        if "hover" in combined_tests or "box-shadow" in combined_tests:
            if ":hover" not in combined_css:
                tips.append("You need a `:hover` pseudo-class rule (e.g. `.glow-button:hover { ... }`) to define styles that activate when the mouse hovers.")
            elif "box-shadow" not in combined_css:
                tips.append("Don't forget to include the requested `box-shadow` glow inside your `:hover` CSS block.")

        if "transform" in combined_tests or "scale" in combined_tests:
            if "scale(" not in combined_css:
                tips.append("Use `transform: scale(1.05);` inside your `:hover` selector to achieve the smooth scaling effect.")

        if "flex" in combined_tests or "justify" in combined_tests or "align" in combined_tests:
            if "display: flex" not in combined_css and "display:flex" not in combined_css:
                tips.append("Turn the container into a flexbox by declaring `display: flex;`.")
            else:
                tips.append("Use `justify-content: space-between;` and `align-items: center;` to align your items evenly.")

        if "hidden" in combined_tests or "modal" in combined_tests:
            if "classlist.remove" not in combined_js and "classlist.add" not in combined_js:
                tips.append("Remember to use `modal.classList.remove('hidden')` when opening and `modal.classList.add('hidden')` when closing.")

        if "click" in combined_tests or "counter" in combined_tests:
            if "addeventlistener" not in combined_js:
                tips.append("Attach click event listeners using `element.addEventListener('click', () => { ... })` to handle user clicks.")

        if not tips:
            if requirements:
                tips.append(f"Check your code against the requirement: \"{requirements[0]}\". Ensure class names and property values match the test specification.")
            else:
                tips.append("Inspect the failing test descriptions and check your selectors and property values in the styles or script.")

        hint_text = " ".join(tips)
        if cause:
            clean_cause = cause
            if "not installed in local ollama" in cause.lower():
                clean_cause = "Model is not yet downloaded in local Ollama. Open AI Settings to install it with 1-click."
            elif "connect" in cause.lower():
                clean_cause = "Local Ollama daemon is offline. Start Ollama or configure a Cloud API key in AI Settings."
            hint_text += f"\n\n💡 (Note: {clean_cause})"

        return {
            "hint": hint_text,
            "explanation": "Review the requirement rules and test assertions against your code.",
        }

    @classmethod
    async def list_local_models(cls, base_url: Optional[str] = None) -> Dict[str, Any]:
        url = (base_url or "http://localhost:11434").rstrip("/")
        timeout = httpx.Timeout(5.0, connect=2.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.get(f"{url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
                raw_models = data.get("models", [])
                formatted = []
                for m in raw_models:
                    size_bytes = m.get("size", 0)
                    size_gb = round(size_bytes / (1024 ** 3), 2)
                    formatted.append({
                        "name": m.get("name"),
                        "model": m.get("model"),
                        "size_gb": size_gb,
                        "size_str": f"{size_gb} GB" if size_gb > 0 else "N/A",
                        "modified_at": m.get("modified_at"),
                        "family": m.get("details", {}).get("family", ""),
                        "parameter_size": m.get("details", {}).get("parameter_size", ""),
                    })
                return {
                    "online": True,
                    "models": formatted,
                    "count": len(formatted),
                    "error": None,
                }
        except Exception as e:
            return {
                "online": False,
                "models": [],
                "count": 0,
                "error": str(e),
            }

    @classmethod
    async def pull_model_stream(cls, model_name: str, base_url: Optional[str] = None):
        url = (base_url or "http://localhost:11434").rstrip("/")
        # Stream pull from Ollama — use async with to guarantee cleanup regardless of generator lifecycle
        async with httpx.AsyncClient(timeout=httpx.Timeout(1800.0, connect=10.0)) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{url}/api/pull",
                    json={"name": model_name, "stream": True},
                ) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'status': 'error', 'message': f'HTTP {response.status_code}'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                            status = chunk.get("status", "")
                            completed = chunk.get("completed", 0)
                            total = chunk.get("total", 0)
                            percent = round((completed / total * 100), 1) if total > 0 else None

                            payload = {
                                "status": status,
                                "completed": completed,
                                "total": total,
                                "percent": percent,
                                "completed_mb": round(completed / (1024 * 1024), 1) if completed else 0,
                                "total_mb": round(total / (1024 * 1024), 1) if total else 0,
                            }
                            yield f"data: {json.dumps(payload)}\n\n"
                        except Exception:
                            pass
            except Exception as err:
                yield f"data: {json.dumps({'status': 'error', 'message': str(err)})}\n\n"
