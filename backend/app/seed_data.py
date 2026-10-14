import json
from .models.database import SessionLocal, ChallengeModel, TestCaseModel


SEED_CHALLENGES = [
    {
        "id": "css-hover-glow-001",
        "title": "Interactive Glow Button",
        "description": "Enhance a standard action button by adding a smooth CSS transition and an eye-catching neon glow effect when hovered.",
        "difficulty": "easy",
        "topics": ["css", "transitions", "hover", "buttons"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<div class="container">\n  <button class="glow-button">Launch Practice</button>\n</div>',
            "css": '/* Container styling */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background-color: #0f172a;\n}\n\n.glow-button {\n  background: #3b82f6;\n  color: #ffffff;\n  font-size: 1.1rem;\n  font-weight: 600;\n  padding: 14px 28px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  /* TODO: 1. Add transition for all properties over 0.3s ease */\n  transition: /* fill in here */;\n}\n\n/* TODO: 2. Add hover state styles */\n.glow-button:hover {\n  /* Set background color to #2563eb */\n  /* Add box-shadow glow: 0 0 20px rgba(59, 130, 246, 0.7) */\n  /* Slightly scale button to 1.05 using transform */\n}\n',
            "javascript": "// No JavaScript needed for this CSS styling challenge",
        },
        "solution_code": {
            "html": '<div class="container">\n  <button class="glow-button">Launch Practice</button>\n</div>',
            "css": '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background-color: #0f172a;\n}\n\n.glow-button {\n  background: #3b82f6;\n  color: #ffffff;\n  font-size: 1.1rem;\n  font-weight: 600;\n  padding: 14px 28px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n.glow-button:hover {\n  background: #2563eb;\n  box-shadow: 0 0 20px rgba(59, 130, 246, 0.7);\n  transform: scale(1.05);\n}\n',
            "javascript": "",
        },
        "requirements": [
            "The button must have a CSS transition property configured for smooth animation.",
            "On hover, the button must change its background color to #2563eb.",
            "On hover, the button must have a vibrant box-shadow glow.",
            "On hover, the button must scale to 1.05 using transform: scale(1.05).",
        ],
        "hints": [
            "Use the 'transition: all 0.3s ease;' rule on .glow-button.",
            "Use the ':hover' pseudo-class on '.glow-button:hover'.",
            "Combine box-shadow and transform inside the :hover rule.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-btn-exists",
                "description": "Button element exists with class 'glow-button'",
                "test_type": "dom",
                "selector": ".glow-button",
                "assertion_code": "Boolean(document.querySelector('button.glow-button'))",
            },
            {
                "test_id": "test-btn-transition",
                "description": "Button has a transition rule defined",
                "test_type": "css",
                "selector": ".glow-button",
                "property_name": "transition",
                "assertion_code": "(() => { const btn = document.querySelector('.glow-button'); if (!btn) return false; const tr = window.getComputedStyle(btn).transition; return tr && tr.length > 0 && !tr.includes('none 0s'); })()",
            },
            {
                "test_id": "test-btn-hover-rule",
                "description": "CSS stylesheet includes hover rule for .glow-button:hover",
                "test_type": "css",
                "assertion_code": "(() => { const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join(' '); return styles.includes('.glow-button:hover') && styles.includes('box-shadow'); })()",
            },
            {
                "test_id": "test-btn-transform-hover",
                "description": "CSS hover rule applies transform: scale",
                "test_type": "css",
                "assertion_code": "(() => { const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join(' '); return styles.includes('scale('); })()",
            },
        ],
    },
    {
        "id": "flexbox-nav-center-002",
        "title": "Centered Responsive Navigation Bar",
        "description": "Construct a navigation header with a brand logo on the left, centered menu navigation links, and a call-to-action button on the right using modern Flexbox.",
        "difficulty": "easy",
        "topics": ["css", "flexbox", "navigation", "layout"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<nav class="navbar">\n  <div class="nav-logo">DevForge</div>\n  <ul class="nav-links">\n    <li><a href="#challenges">Challenges</a></li>\n    <li><a href="#leaderboard">Leaderboard</a></li>\n    <li><a href="#docs">Docs</a></li>\n  </ul>\n  <button class="nav-cta">Sign In</button>\n</nav>',
            "css": 'body {\n  margin: 0;\n  background: #0b0f17;\n  font-family: sans-serif;\n}\n\n.navbar {\n  background: #111827;\n  padding: 16px 24px;\n  border-bottom: 1px solid #1f2937;\n  /* TODO: 1. Turn navbar into a flex container */\n  display: /* fill in */;\n  /* TODO: 2. Space items across the header (logo left, links center, button right) */\n  justify-content: /* fill in */;\n  /* TODO: 3. Vertically align items in the center */\n  align-items: /* fill in */;\n}\n\n.nav-logo {\n  color: #38bdf8;\n  font-weight: 700;\n  font-size: 1.25rem;\n}\n\n.nav-links {\n  /* TODO: 4. Turn links list into a flex row and remove bullets */\n  display: flex;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  gap: 24px;\n}\n\n.nav-links a {\n  color: #94a3b8;\n  text-decoration: none;\n  transition: color 0.2s;\n}\n\n.nav-links a:hover {\n  color: #ffffff;\n}\n\n.nav-cta {\n  background: #22c55e;\n  color: #0f172a;\n  font-weight: 600;\n  padding: 8px 18px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n',
            "javascript": "",
        },
        "solution_code": {
            "html": '<nav class="navbar">\n  <div class="nav-logo">DevForge</div>\n  <ul class="nav-links">\n    <li><a href="#challenges">Challenges</a></li>\n    <li><a href="#leaderboard">Leaderboard</a></li>\n    <li><a href="#docs">Docs</a></li>\n  </ul>\n  <button class="nav-cta">Sign In</button>\n</nav>',
            "css": 'body {\n  margin: 0;\n  background: #0b0f17;\n  font-family: sans-serif;\n}\n\n.navbar {\n  background: #111827;\n  padding: 16px 24px;\n  border-bottom: 1px solid #1f2937;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.nav-logo {\n  color: #38bdf8;\n  font-weight: 700;\n  font-size: 1.25rem;\n}\n\n.nav-links {\n  display: flex;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  gap: 24px;\n}\n\n.nav-links a {\n  color: #94a3b8;\n  text-decoration: none;\n  transition: color 0.2s;\n}\n\n.nav-links a:hover {\n  color: #ffffff;\n}\n\n.nav-cta {\n  background: #22c55e;\n  color: #0f172a;\n  font-weight: 600;\n  padding: 8px 18px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n',
            "javascript": "",
        },
        "requirements": [
            "The navbar element must use display: flex.",
            "The navbar items must be spaced with justify-content: space-between.",
            "The navbar items must be vertically centered with align-items: center.",
            "The .nav-links list must have display: flex with no default bullet list styling.",
        ],
        "hints": [
            "Use display: flex and justify-content: space-between on .navbar.",
            "Set align-items: center to ensure logo, links, and CTA button align vertically.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-nav-flex",
                "description": "Navbar has display: flex",
                "test_type": "css",
                "selector": ".navbar",
                "assertion_code": "(() => { const nav = document.querySelector('.navbar'); return nav && window.getComputedStyle(nav).display === 'flex'; })()",
            },
            {
                "test_id": "test-nav-justify",
                "description": "Navbar has justify-content: space-between",
                "test_type": "css",
                "selector": ".navbar",
                "assertion_code": "(() => { const nav = document.querySelector('.navbar'); return nav && window.getComputedStyle(nav).justifyContent === 'space-between'; })()",
            },
            {
                "test_id": "test-nav-align",
                "description": "Navbar has align-items: center",
                "test_type": "css",
                "selector": ".navbar",
                "assertion_code": "(() => { const nav = document.querySelector('.navbar'); return nav && window.getComputedStyle(nav).alignItems === 'center'; })()",
            },
            {
                "test_id": "test-nav-links-count",
                "description": "Navbar contains 3 navigation links inside .nav-links",
                "test_type": "dom",
                "assertion_code": "document.querySelectorAll('.nav-links li a').length === 3",
            },
        ],
    },
    {
        "id": "js-counter-dom-003",
        "title": "Interactive Counter Component",
        "description": "Implement the JavaScript logic for an interactive counter with Increment (+), Decrement (-), and Reset buttons, ensuring the count updates dynamically and changes color when negative.",
        "difficulty": "medium",
        "topics": ["javascript", "dom", "events", "state"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<div class="counter-card">\n  <h2>Score Counter</h2>\n  <div id="count-display" class="count-value">0</div>\n  <div class="button-group">\n    <button id="btn-dec" class="btn btn-secondary">-</button>\n    <button id="btn-reset" class="btn btn-warning">Reset</button>\n    <button id="btn-inc" class="btn btn-primary">+</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n}\n.counter-card {\n  background: #1e293b;\n  padding: 32px;\n  border-radius: 12px;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n  color: #fff;\n}\n.count-value {\n  font-size: 3.5rem;\n  font-weight: 800;\n  margin: 16px 0;\n  color: #38bdf8;\n  transition: color 0.2s;\n}\n.count-negative {\n  color: #ef4444 !important;\n}\n.button-group {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}\n.btn {\n  font-size: 1.25rem;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 600;\n}\n.btn-primary { background: #22c55e; color: #fff; }\n.btn-secondary { background: #64748b; color: #fff; }\n.btn-warning { background: #f59e0b; color: #000; }\n',
            "javascript": "// Store current count state\nlet count = 0;\n\n// Select DOM elements\nconst countDisplay = document.getElementById('count-display');\nconst btnInc = document.getElementById('btn-inc');\nconst btnDec = document.getElementById('btn-dec');\nconst btnReset = document.getElementById('btn-reset');\n\nfunction updateUI() {\n  // TODO: 1. Update countDisplay textContent with the current count\n  \n  // TODO: 2. Add class 'count-negative' if count < 0, else remove it\n  \n}\n\n// TODO: 3. Add click event listener to btnInc to increment count by 1 and updateUI\n\n// TODO: 4. Add click event listener to btnDec to decrement count by 1 and updateUI\n\n// TODO: 5. Add click event listener to btnReset to reset count to 0 and updateUI\n",
        },
        "solution_code": {
            "html": '<div class="counter-card">\n  <h2>Score Counter</h2>\n  <div id="count-display" class="count-value">0</div>\n  <div class="button-group">\n    <button id="btn-dec" class="btn btn-secondary">-</button>\n    <button id="btn-reset" class="btn btn-warning">Reset</button>\n    <button id="btn-inc" class="btn btn-primary">+</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n}\n.counter-card {\n  background: #1e293b;\n  padding: 32px;\n  border-radius: 12px;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n  color: #fff;\n}\n.count-value {\n  font-size: 3.5rem;\n  font-weight: 800;\n  margin: 16px 0;\n  color: #38bdf8;\n  transition: color 0.2s;\n}\n.count-negative {\n  color: #ef4444 !important;\n}\n.button-group {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}\n.btn {\n  font-size: 1.25rem;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 600;\n}\n.btn-primary { background: #22c55e; color: #fff; }\n.btn-secondary { background: #64748b; color: #fff; }\n.btn-warning { background: #f59e0b; color: #000; }\n',
            "javascript": "let count = 0;\nconst countDisplay = document.getElementById('count-display');\nconst btnInc = document.getElementById('btn-inc');\nconst btnDec = document.getElementById('btn-dec');\nconst btnReset = document.getElementById('btn-reset');\n\nfunction updateUI() {\n  countDisplay.textContent = count;\n  if (count < 0) {\n    countDisplay.classList.add('count-negative');\n  } else {\n    countDisplay.classList.remove('count-negative');\n  }\n}\n\nbtnInc.addEventListener('click', () => {\n  count++;\n  updateUI();\n});\n\nbtnDec.addEventListener('click', () => {\n  count--;\n  updateUI();\n});\n\nbtnReset.addEventListener('click', () => {\n  count = 0;\n  updateUI();\n});\n",
        },
        "requirements": [
            "Clicking the '+' button must increase the display count by 1.",
            "Clicking the '-' button must decrease the display count by 1.",
            "Clicking the 'Reset' button must set the display count back to 0.",
            "When the count is less than 0, the display element must contain the class 'count-negative'.",
        ],
        "hints": [
            "Use document.getElementById('count-display').textContent = count.",
            "Use element.classList.toggle('count-negative', count < 0) or an if-else block.",
        ],
        "estimated_minutes": 15,
        "tests": [
            {
                "test_id": "test-counter-init",
                "description": "Counter initializes with value 0",
                "test_type": "dom",
                "selector": "#count-display",
                "assertion_code": "document.getElementById('count-display').textContent.trim() === '0'",
            },
            {
                "test_id": "test-counter-increment",
                "description": "Clicking '+' increases count to 1",
                "test_type": "javascript",
                "assertion_code": "(() => { const btn = document.getElementById('btn-inc'); const disp = document.getElementById('count-display'); btn.click(); return disp.textContent.trim() === '1'; })()",
            },
            {
                "test_id": "test-counter-decrement-negative",
                "description": "Clicking '-' past zero applies 'count-negative' class",
                "test_type": "javascript",
                "assertion_code": "(() => { const btnDec = document.getElementById('btn-dec'); const disp = document.getElementById('count-display'); btnDec.click(); btnDec.click(); return Number(disp.textContent.trim()) < 0 && disp.classList.contains('count-negative'); })()",
            },
            {
                "test_id": "test-counter-reset",
                "description": "Clicking 'Reset' resets count to 0 and removes negative class",
                "test_type": "javascript",
                "assertion_code": "(() => { const btnRst = document.getElementById('btn-reset'); const disp = document.getElementById('count-display'); btnRst.click(); return disp.textContent.trim() === '0' && !disp.classList.contains('count-negative'); })()",
            },
        ],
    },
    {
        "id": "fix-modal-toggle-004",
        "title": "Buggy Modal Dialog",
        "description": "A developer created a modal dialog, but it has bugs: clicking the 'Open Modal' button doesn't reveal the dialog because of conflicting CSS display rules and missing JavaScript event handling. Inspect and fix the code.",
        "difficulty": "medium",
        "topics": ["debugging", "css", "javascript", "modal"],
        "mode": "fix_broken",
        "starter_code": {
            "html": '<button id="open-btn" class="action-btn">Open Dialog</button>\n\n<div id="modal-overlay" class="modal-backdrop hidden">\n  <div class="modal-content">\n    <h3>Confirmation Required</h3>\n    <p>Are you ready to submit your solution?</p>\n    <button id="close-btn" class="close-btn">Dismiss</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  font-family: sans-serif;\n  padding: 40px;\n}\n.action-btn {\n  background: #3b82f6;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n/* BUG: .hidden selector has wrong specificity or typo */\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.hidden {\n  display: none !important;\n}\n.modal-content {\n  background: #1e293b;\n  color: white;\n  padding: 24px;\n  border-radius: 8px;\n  min-width: 300px;\n}\n.close-btn {\n  background: #ef4444;\n  color: white;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  margin-top: 12px;\n}\n',
            "javascript": "// BUG: Incorrect selector and missing handler for close button\nconst openBtn = document.getElementById('open-btn');\nconst modal = document.getElementById('modal-overlay');\nconst closeBtn = document.getElementById('close-btn');\n\n// Bug: querySelector used incorrectly\nopenBtn.addEventListener('click', () => {\n  // Modal is not showing because class is not being removed\n  modal.classList.add('hidden'); // <-- BUG here!\n});\n\n// Bug: close button listener is missing!\n",
        },
        "solution_code": {
            "html": '<button id="open-btn" class="action-btn">Open Dialog</button>\n\n<div id="modal-overlay" class="modal-backdrop hidden">\n  <div class="modal-content">\n    <h3>Confirmation Required</h3>\n    <p>Are you ready to submit your solution?</p>\n    <button id="close-btn" class="close-btn">Dismiss</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  font-family: sans-serif;\n  padding: 40px;\n}\n.action-btn {\n  background: #3b82f6;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.hidden {\n  display: none !important;\n}\n.modal-content {\n  background: #1e293b;\n  color: white;\n  padding: 24px;\n  border-radius: 8px;\n  min-width: 300px;\n}\n.close-btn {\n  background: #ef4444;\n  color: white;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  margin-top: 12px;\n}\n',
            "javascript": "const openBtn = document.getElementById('open-btn');\nconst modal = document.getElementById('modal-overlay');\nconst closeBtn = document.getElementById('close-btn');\n\nopenBtn.addEventListener('click', () => {\n  modal.classList.remove('hidden');\n});\n\ncloseBtn.addEventListener('click', () => {\n  modal.classList.add('hidden');\n});\n",
        },
        "requirements": [
            "Modal overlay must initially have the 'hidden' class applied.",
            "Clicking '#open-btn' must remove 'hidden' from '#modal-overlay'.",
            "Clicking '#close-btn' must add 'hidden' back to '#modal-overlay'.",
        ],
        "hints": [
            "In openBtn event listener, use modal.classList.remove('hidden') instead of add.",
            "Add a click listener to closeBtn that adds the 'hidden' class back to modal.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-modal-init-hidden",
                "description": "Modal starts in hidden state",
                "test_type": "dom",
                "assertion_code": "document.getElementById('modal-overlay').classList.contains('hidden')",
            },
            {
                "test_id": "test-modal-open-click",
                "description": "Clicking '#open-btn' removes 'hidden' class and reveals modal",
                "test_type": "javascript",
                "assertion_code": "(() => { document.getElementById('open-btn').click(); return !document.getElementById('modal-overlay').classList.contains('hidden'); })()",
            },
            {
                "test_id": "test-modal-close-click",
                "description": "Clicking '#close-btn' hides the modal again",
                "test_type": "javascript",
                "assertion_code": "(() => { document.getElementById('close-btn').click(); return document.getElementById('modal-overlay').classList.contains('hidden'); })()",
            },
        ],
    },
    {
        "id": "build-accordion-card-006",
        "title": "FAQ Accordion with Animated Expansion",
        "description": "Build an FAQ accordion item. When clicking the question header, the answer panel toggles between collapsed and expanded, and an arrow indicator rotates smoothly.",
        "difficulty": "medium",
        "topics": ["components", "javascript", "animation", "css"],
        "mode": "build_component",
        "starter_code": {
            "html": '<div class="accordion-item" id="faq-item">\n  <div class="accordion-header" id="faq-header">\n    <span class="faq-title">Can I practice with both local and cloud LLMs?</span>\n    <span class="faq-icon" id="faq-icon">▼</span>\n  </div>\n  <div class="accordion-body" id="faq-body">\n    <p>Yes! DevForge connects seamlessly with both local Ollama models and cloud providers like Gemini, OpenAI, and Groq.</p>\n  </div>\n</div>',
            "css": 'body {\n  background: #0b0f17;\n  padding: 40px;\n  font-family: system-ui, sans-serif;\n}\n.accordion-item {\n  max-width: 500px;\n  background: #1e293b;\n  border-radius: 8px;\n  overflow: hidden;\n  color: #fff;\n  border: 1px solid #334155;\n}\n.accordion-header {\n  padding: 16px 20px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  cursor: pointer;\n  user-select: none;\n}\n.faq-icon {\n  transition: transform 0.3s ease;\n}\n.accordion-body {\n  padding: 0 20px;\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.3s ease, padding 0.3s ease;\n  color: #94a3b8;\n}\n/* When accordion-item has class .active */\n.accordion-item.active .accordion-body {\n  max-height: 200px;\n  padding: 0 20px 20px 20px;\n}\n.accordion-item.active .faq-icon {\n  transform: rotate(180deg);\n}\n',
            "javascript": "// TODO: Select accordion header and item\n// Add click listener to toggle 'active' class on the accordion item\nconst header = document.getElementById('faq-header');\nconst item = document.getElementById('faq-item');\n\nheader.addEventListener('click', () => {\n  item.classList.toggle('active');\n});\n",
        },
        "solution_code": {
            "html": '<div class="accordion-item" id="faq-item">\n  <div class="accordion-header" id="faq-header">\n    <span class="faq-title">Can I practice with both local and cloud LLMs?</span>\n    <span class="faq-icon" id="faq-icon">▼</span>\n  </div>\n  <div class="accordion-body" id="faq-body">\n    <p>Yes! DevForge connects seamlessly with both local Ollama models and cloud providers like Gemini, OpenAI, and Groq.</p>\n  </div>\n</div>',
            "css": 'body {\n  background: #0b0f17;\n  padding: 40px;\n  font-family: system-ui, sans-serif;\n}\n.accordion-item {\n  max-width: 500px;\n  background: #1e293b;\n  border-radius: 8px;\n  overflow: hidden;\n  color: #fff;\n  border: 1px solid #334155;\n}\n.accordion-header {\n  padding: 16px 20px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  cursor: pointer;\n  user-select: none;\n}\n.faq-icon {\n  transition: transform 0.3s ease;\n}\n.accordion-body {\n  padding: 0 20px;\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.3s ease, padding 0.3s ease;\n  color: #94a3b8;\n}\n.accordion-item.active .accordion-body {\n  max-height: 200px;\n  padding: 0 20px 20px 20px;\n}\n.accordion-item.active .faq-icon {\n  transform: rotate(180deg);\n}\n',
            "javascript": "const header = document.getElementById('faq-header');\nconst item = document.getElementById('faq-item');\n\nheader.addEventListener('click', () => {\n  item.classList.toggle('active');\n});\n",
        },
        "requirements": [
            "Clicking the header toggles the 'active' class on '#faq-item'.",
            "When active, '#faq-body' expands and displays the answer text.",
            "The arrow icon '#faq-icon' rotates 180 degrees via CSS transform when active.",
        ],
        "hints": [
            "Add a click event listener to #faq-header that calls item.classList.toggle('active').",
        ],
        "estimated_minutes": 15,
        "tests": [
            {
                "test_id": "test-accordion-init",
                "description": "Accordion item starts without 'active' class",
                "test_type": "dom",
                "assertion_code": "!document.getElementById('faq-item').classList.contains('active')",
            },
            {
                "test_id": "test-accordion-toggle-open",
                "description": "Clicking header adds 'active' class to accordion item",
                "test_type": "javascript",
                "assertion_code": "(() => { document.getElementById('faq-header').click(); return document.getElementById('faq-item').classList.contains('active'); })()",
            },
            {
                "test_id": "test-accordion-toggle-close",
                "description": "Clicking header again removes 'active' class",
                "test_type": "javascript",
                "assertion_code": "(() => { document.getElementById('faq-header').click(); return !document.getElementById('faq-item').classList.contains('active'); })()",
            },
        ],
    },
]


def seed_database():
    db = SessionLocal()
    try:
        for c_data in SEED_CHALLENGES:
            existing = db.query(ChallengeModel).filter(ChallengeModel.id == c_data["id"]).first()
            if not existing:
                ch = ChallengeModel(
                    id=c_data["id"],
                    title=c_data["title"],
                    description=c_data["description"],
                    difficulty=c_data["difficulty"],
                    mode=c_data["mode"],
                    starter_html=c_data["starter_code"]["html"],
                    starter_css=c_data["starter_code"]["css"],
                    starter_js=c_data["starter_code"]["javascript"],
                    solution_html=c_data.get("solution_code", {}).get("html", ""),
                    solution_css=c_data.get("solution_code", {}).get("css", ""),
                    solution_js=c_data.get("solution_code", {}).get("javascript", ""),
                    estimated_minutes=c_data.get("estimated_minutes", 15),
                    is_approved=True,
                )
                ch.topics = c_data["topics"]
                ch.requirements = c_data["requirements"]
                ch.hints = c_data["hints"]
                db.add(ch)
                db.flush()

                for idx, t in enumerate(c_data["tests"]):
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
    finally:
        db.close()
