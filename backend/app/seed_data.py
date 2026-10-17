import json
from .models.database import SessionLocal, ChallengeModel, TestCaseModel


SEED_CHALLENGES = [
    # =========================================================================
    # CATEGORY: HTML (Semantic Markup, Forms, Media, Document Hierarchy)
    # =========================================================================
    {
        "id": "html-semantic-structure-001",
        "title": "Semantic HTML5 Content Structure",
        "description": "Construct an accessible, semantic HTML5 document layout using <header>, <nav>, <main>, <article>, <section>, <aside>, and <footer> tags instead of unsemantic div elements.",
        "difficulty": "easy",
        "topics": ["html", "semantic-html", "accessibility", "structure"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<div class="page-container">\n  <!-- TODO: 1. Replace with <header> -->\n  <div class="site-header">\n    <h1>Frontend Engineering Daily</h1>\n    <!-- TODO: 2. Replace with <nav> -->\n    <div class="main-navigation">\n      <a href="#articles">Articles</a>\n      <a href="#about">About</a>\n    </div>\n  </div>\n\n  <!-- TODO: 3. Replace with <main> -->\n  <div class="content-body">\n    <!-- TODO: 4. Replace with <article> containing a <section> -->\n    <div class="post-card">\n      <h2>Understanding Semantic HTML5</h2>\n      <p>Semantic tags give meaning to content for screen readers, search engines, and browsers.</p>\n    </div>\n\n    <!-- TODO: 5. Replace with <aside> -->\n    <div class="sidebar">\n      <h3>Trending Tags</h3>\n      <p>#css #html #javascript</p>\n    </div>\n  </div>\n\n  <!-- TODO: 6. Replace with <footer> -->\n  <div class="site-footer">\n    <p>&copy; 2026 RenderLab Practice Suite</p>\n  </div>\n</div>',
            "css": 'body {\n  margin: 0;\n  padding: 24px;\n  background: #0f172a;\n  color: #f8fafc;\n  font-family: system-ui, sans-serif;\n}\n.page-container { max-width: 800px; margin: 0 auto; }\nheader { border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }\nnav a { color: #38bdf8; margin-right: 16px; text-decoration: none; font-weight: 600; }\nmain { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }\narticle { background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; }\naside { background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; }\nfooter { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; color: #94a3b8; font-size: 0.9rem; }\n',
            "javascript": "// Pure HTML Semantic Challenge - No JS required",
        },
        "solution_code": {
            "html": '<div class="page-container">\n  <header class="site-header">\n    <h1>Frontend Engineering Daily</h1>\n    <nav class="main-navigation">\n      <a href="#articles">Articles</a>\n      <a href="#about">About</a>\n    </nav>\n  </header>\n\n  <main class="content-body">\n    <article class="post-card">\n      <section>\n        <h2>Understanding Semantic HTML5</h2>\n        <p>Semantic tags give meaning to content for screen readers, search engines, and browsers.</p>\n      </section>\n    </article>\n\n    <aside class="sidebar">\n      <h3>Trending Tags</h3>\n      <p>#css #html #javascript</p>\n    </aside>\n  </main>\n\n  <footer class="site-footer">\n    <p>&copy; 2026 RenderLab Practice Suite</p>\n  </footer>\n</div>',
            "css": 'body {\n  margin: 0;\n  padding: 24px;\n  background: #0f172a;\n  color: #f8fafc;\n  font-family: system-ui, sans-serif;\n}\n.page-container { max-width: 800px; margin: 0 auto; }\nheader { border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }\nnav a { color: #38bdf8; margin-right: 16px; text-decoration: none; font-weight: 600; }\nmain { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }\narticle { background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; }\naside { background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; }\nfooter { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; color: #94a3b8; font-size: 0.9rem; }\n',
            "javascript": "",
        },
        "requirements": [
            "Use a semantic <header> tag for the top branding area.",
            "Use a semantic <nav> element containing the navigation links.",
            "Use a semantic <main> element as the primary content container.",
            "Use <article> and <section> tags to wrap the blog post content.",
            "Use an <aside> tag for the complementary sidebar content.",
            "Use a <footer> element for the copyright section at the bottom.",
        ],
        "hints": [
            "Replace <div class='site-header'> with <header> and </header>.",
            "Use <main> to group the <article> and <aside> elements.",
            "Wrap the article text inside a semantic <section>.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-semantic-header",
                "description": "Document includes a semantic <header> element",
                "test_type": "dom",
                "selector": "header",
                "assertion_code": "Boolean(document.querySelector('header'))",
            },
            {
                "test_id": "test-semantic-nav",
                "description": "Document includes a semantic <nav> element with navigation links",
                "test_type": "dom",
                "selector": "nav",
                "assertion_code": "document.querySelectorAll('nav a').length >= 2",
            },
            {
                "test_id": "test-semantic-main",
                "description": "Document includes a semantic <main> element",
                "test_type": "dom",
                "selector": "main",
                "assertion_code": "Boolean(document.querySelector('main'))",
            },
            {
                "test_id": "test-semantic-article",
                "description": "Document contains an <article> inside <main>",
                "test_type": "dom",
                "selector": "main article",
                "assertion_code": "Boolean(document.querySelector('main article'))",
            },
            {
                "test_id": "test-semantic-aside",
                "description": "Document contains a semantic <aside> sidebar",
                "test_type": "dom",
                "selector": "aside",
                "assertion_code": "Boolean(document.querySelector('aside'))",
            },
            {
                "test_id": "test-semantic-footer",
                "description": "Document includes a semantic <footer>",
                "test_type": "dom",
                "selector": "footer",
                "assertion_code": "Boolean(document.querySelector('footer'))",
            },
        ],
    },
    {
        "id": "html-accessible-form-002",
        "title": "Accessible Survey & Registration Form",
        "description": "Build an accessible HTML form with linked <label> elements, fieldset groupings, required input validation, and proper input types for email and password.",
        "difficulty": "easy",
        "topics": ["html", "forms", "accessibility", "inputs"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<form id="signup-form">\n  <!-- TODO: 1. Wrap inputs in a <fieldset> with a <legend> "Account Details" -->\n  \n  <!-- TODO: 2. Add <label for="user-email"> and matching <input id="user-email" type="email" required> -->\n  <div class="field-group">\n    Email:\n    <input type="text">\n  </div>\n\n  <!-- TODO: 3. Add <label for="user-password"> and matching <input id="user-password" type="password" required minlength="8"> -->\n  <div class="field-group">\n    Password:\n    <input type="text">\n  </div>\n\n  <!-- TODO: 4. Add submit button with type="submit" -->\n  <button>Join DevForge</button>\n</form>',
            "css": 'body {\n  background: #0f172a;\n  color: #fff;\n  font-family: system-ui, sans-serif;\n  padding: 30px;\n  display: flex;\n  justify-content: center;\n}\nform {\n  background: #1e293b;\n  padding: 24px;\n  border-radius: 8px;\n  width: 100%;\n  max-width: 400px;\n}\nfieldset {\n  border: 1px solid #334155;\n  border-radius: 6px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\nlegend {\n  color: #38bdf8;\n  font-weight: 600;\n  padding: 0 8px;\n}\n.field-group {\n  margin-bottom: 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\nlabel { font-size: 0.85rem; color: #94a3b8; }\ninput {\n  background: #0f172a;\n  border: 1px solid #334155;\n  color: #fff;\n  padding: 8px 12px;\n  border-radius: 4px;\n}\ninput:focus { outline: 1px solid #38bdf8; }\nbutton[type="submit"] {\n  background: #22c55e;\n  color: #0f172a;\n  font-weight: 700;\n  border: none;\n  padding: 10px;\n  width: 100%;\n  border-radius: 4px;\n  cursor: pointer;\n}\n',
            "javascript": "// Form validation challenge - HTML attributes provide native validation",
        },
        "solution_code": {
            "html": '<form id="signup-form">\n  <fieldset>\n    <legend>Account Details</legend>\n\n    <div class="field-group">\n      <label for="user-email">Email Address</label>\n      <input id="user-email" type="email" required placeholder="you@domain.com">\n    </div>\n\n    <div class="field-group">\n      <label for="user-password">Password (min 8 characters)</label>\n      <input id="user-password" type="password" required minlength="8">\n    </div>\n  </fieldset>\n\n  <button type="submit">Join DevForge</button>\n</form>',
            "css": 'body {\n  background: #0f172a;\n  color: #fff;\n  font-family: system-ui, sans-serif;\n  padding: 30px;\n  display: flex;\n  justify-content: center;\n}\nform {\n  background: #1e293b;\n  padding: 24px;\n  border-radius: 8px;\n  width: 100%;\n  max-width: 400px;\n}\nfieldset {\n  border: 1px solid #334155;\n  border-radius: 6px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\nlegend {\n  color: #38bdf8;\n  font-weight: 600;\n  padding: 0 8px;\n}\n.field-group {\n  margin-bottom: 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\nlabel { font-size: 0.85rem; color: #94a3b8; }\ninput {\n  background: #0f172a;\n  border: 1px solid #334155;\n  color: #fff;\n  padding: 8px 12px;\n  border-radius: 4px;\n}\ninput:focus { outline: 1px solid #38bdf8; }\nbutton[type="submit"] {\n  background: #22c55e;\n  color: #0f172a;\n  font-weight: 700;\n  border: none;\n  padding: 10px;\n  width: 100%;\n  border-radius: 4px;\n  cursor: pointer;\n}\n',
            "javascript": "",
        },
        "requirements": [
            "Wrap the form fields inside a <fieldset> with a <legend> titled 'Account Details'.",
            "Provide a <label for='user-email'> corresponding to <input id='user-email'>.",
            "Email input must have type='email' and the required attribute.",
            "Provide a <label for='user-password'> corresponding to <input id='user-password'>.",
            "Password input must have type='password', required, and minlength='8'.",
            "The submit button must have type='submit'.",
        ],
        "hints": [
            "Ensure the 'for' attribute on <label> matches the 'id' on the input exactly.",
            "Use <fieldset> and <legend> to group related form controls.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-fieldset-legend",
                "description": "Form has fieldset with legend 'Account Details'",
                "test_type": "dom",
                "selector": "fieldset legend",
                "assertion_code": "Boolean(document.querySelector('fieldset legend'))",
            },
            {
                "test_id": "test-email-label-link",
                "description": "Email input has linked label matching its id",
                "test_type": "dom",
                "assertion_code": "(() => { const inp = document.getElementById('user-email'); const lbl = document.querySelector('label[for=\"user-email\"]'); return inp && lbl && inp.type === 'email' && inp.required; })()",
            },
            {
                "test_id": "test-password-label-link",
                "description": "Password input has linked label, required, and minlength 8",
                "test_type": "dom",
                "assertion_code": "(() => { const inp = document.getElementById('user-password'); const lbl = document.querySelector('label[for=\"user-password\"]'); return inp && lbl && inp.type === 'password' && inp.required && inp.minLength >= 8; })()",
            },
            {
                "test_id": "test-submit-button",
                "description": "Button has type='submit'",
                "test_type": "dom",
                "selector": "button[type='submit']",
                "assertion_code": "Boolean(document.querySelector('button[type=\"submit\"]'))",
            },
        ],
    },
    {
        "id": "html-media-figure-003",
        "title": "Accessible Media & Responsive Figure",
        "description": "Create an accessible media showcase using <figure>, <figcaption>, and a modern <picture> element providing responsive source options and fallback alt text.",
        "difficulty": "easy",
        "topics": ["html", "media", "figure", "picture"],
        "mode": "build_component",
        "starter_code": {
            "html": '<div class="media-card">\n  <!-- TODO: 1. Wrap media in a semantic <figure> element -->\n  \n  <!-- TODO: 2. Add an <img> element with src, alt="Mountain landscape at sunset", and loading="lazy" -->\n  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600" />\n  \n  <!-- TODO: 3. Add a <figcaption> describing the photograph credit -->\n  <div>Photo captured in Yosemite Valley by John Doe</div>\n</div>',
            "css": 'body {\n  background: #0b0f17;\n  padding: 30px;\n  color: #fff;\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n}\n.media-card {\n  max-width: 480px;\n  background: #1e293b;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid #334155;\n}\nfigure {\n  margin: 0;\n  padding: 0;\n}\nimg {\n  width: 100%;\n  height: auto;\n  display: block;\n}\nfigcaption {\n  padding: 12px 16px;\n  font-size: 0.85rem;\n  color: #94a3b8;\n  font-style: italic;\n  background: #111827;\n  border-top: 1px solid #1f2937;\n}\n',
            "javascript": "",
        },
        "solution_code": {
            "html": '<div class="media-card">\n  <figure>\n    <img \n      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600" \n      alt="Mountain landscape at sunset"\n      loading="lazy"\n    />\n    <figcaption>Photo captured in Yosemite Valley by John Doe</figcaption>\n  </figure>\n</div>',
            "css": 'body {\n  background: #0b0f17;\n  padding: 30px;\n  color: #fff;\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n}\n.media-card {\n  max-width: 480px;\n  background: #1e293b;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid #334155;\n}\nfigure {\n  margin: 0;\n  padding: 0;\n}\nimg {\n  width: 100%;\n  height: auto;\n  display: block;\n}\nfigcaption {\n  padding: 12px 16px;\n  font-size: 0.85rem;\n  color: #94a3b8;\n  font-style: italic;\n  background: #111827;\n  border-top: 1px solid #1f2937;\n}\n',
            "javascript": "",
        },
        "requirements": [
            "Use a semantic <figure> container element.",
            "The <img> tag must include descriptive alt text: alt='Mountain landscape at sunset'.",
            "The <img> tag must include loading='lazy' for optimized performance.",
            "Use a semantic <figcaption> to display the photo caption text.",
        ],
        "hints": [
            "Place the <img> and <figcaption> as direct children of the <figure> element.",
            "Ensure the alt attribute is non-empty and descriptive.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-figure-exists",
                "description": "Semantic <figure> tag wraps image content",
                "test_type": "dom",
                "selector": "figure",
                "assertion_code": "Boolean(document.querySelector('figure'))",
            },
            {
                "test_id": "test-img-attributes",
                "description": "Image has descriptive alt text and loading='lazy'",
                "test_type": "dom",
                "selector": "figure img",
                "assertion_code": "(() => { const img = document.querySelector('figure img'); return img && img.alt && img.alt.length > 5 && img.getAttribute('loading') === 'lazy'; })()",
            },
            {
                "test_id": "test-figcaption-exists",
                "description": "Semantic <figcaption> tag provides image description",
                "test_type": "dom",
                "selector": "figure figcaption",
                "assertion_code": "Boolean(document.querySelector('figure figcaption'))",
            },
        ],
    },

    # =========================================================================
    # CATEGORY: CSS (Layouts, Flexbox, Grid, Animations, Responsive Design)
    # =========================================================================
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
        "id": "css-grid-gallery-005",
        "title": "Responsive CSS Grid Photo Gallery",
        "description": "Build an auto-fitting responsive image gallery grid using CSS Grid repeat(auto-fit, minmax(180px, 1fr)) with consistent gap spacing.",
        "difficulty": "easy",
        "topics": ["css", "grid", "responsive", "layout"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<div class="gallery-container">\n  <div class="gallery-item">Photo 1</div>\n  <div class="gallery-item">Photo 2</div>\n  <div class="gallery-item">Photo 3</div>\n  <div class="gallery-item">Photo 4</div>\n  <div class="gallery-item">Photo 5</div>\n  <div class="gallery-item">Photo 6</div>\n</div>',
            "css": 'body {\n  margin: 0;\n  padding: 30px;\n  background: #0f172a;\n  color: #fff;\n  font-family: sans-serif;\n}\n.gallery-container {\n  /* TODO: 1. Turn container into CSS grid */\n  display: /* fill in */;\n  /* TODO: 2. Set columns to repeat(auto-fit, minmax(160px, 1fr)) */\n  grid-template-columns: /* fill in */;\n  /* TODO: 3. Set gap to 16px */\n  gap: /* fill in */;\n}\n.gallery-item {\n  background: #1e293b;\n  border: 1px solid #334155;\n  border-radius: 8px;\n  height: 140px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-weight: 600;\n  color: #38bdf8;\n}\n',
            "javascript": "",
        },
        "solution_code": {
            "html": '<div class="gallery-container">\n  <div class="gallery-item">Photo 1</div>\n  <div class="gallery-item">Photo 2</div>\n  <div class="gallery-item">Photo 3</div>\n  <div class="gallery-item">Photo 4</div>\n  <div class="gallery-item">Photo 5</div>\n  <div class="gallery-item">Photo 6</div>\n</div>',
            "css": 'body {\n  margin: 0;\n  padding: 30px;\n  background: #0f172a;\n  color: #fff;\n  font-family: sans-serif;\n}\n.gallery-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n  gap: 16px;\n}\n.gallery-item {\n  background: #1e293b;\n  border: 1px solid #334155;\n  border-radius: 8px;\n  height: 140px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-weight: 600;\n  color: #38bdf8;\n}\n',
            "javascript": "",
        },
        "requirements": [
            "The .gallery-container must have display: grid.",
            "Use repeat(auto-fit, minmax(160px, 1fr)) for grid-template-columns.",
            "Set grid gap to 16px.",
        ],
        "hints": [
            "Use 'display: grid;' and 'gap: 16px;' on .gallery-container.",
            "Use 'grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));'.",
        ],
        "estimated_minutes": 10,
        "tests": [
            {
                "test_id": "test-grid-display",
                "description": "Gallery container has display: grid",
                "test_type": "css",
                "selector": ".gallery-container",
                "assertion_code": "(() => { const el = document.querySelector('.gallery-container'); return el && window.getComputedStyle(el).display === 'grid'; })()",
            },
            {
                "test_id": "test-grid-gap",
                "description": "Gallery container has 16px gap",
                "test_type": "css",
                "selector": ".gallery-container",
                "assertion_code": "(() => { const el = document.querySelector('.gallery-container'); return el && window.getComputedStyle(el).gap === '16px'; })()",
            },
        ],
    },

    # =========================================================================
    # CATEGORY: JAVASCRIPT (DOM APIs, Events, State, Timers, Dynamic UIs)
    # =========================================================================
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
        "topics": ["javascript", "debugging", "modal", "dom"],
        "mode": "fix_broken",
        "starter_code": {
            "html": '<button id="open-btn" class="action-btn">Open Dialog</button>\n\n<div id="modal-overlay" class="modal-backdrop hidden">\n  <div class="modal-content">\n    <h3>Confirmation Required</h3>\n    <p>Are you ready to submit your solution?</p>\n    <button id="close-btn" class="close-btn">Dismiss</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  font-family: sans-serif;\n  padding: 40px;\n}\n.action-btn {\n  background: #3b82f6;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.hidden {\n  display: none !important;\n}\n.modal-content {\n  background: #1e293b;\n  color: white;\n  padding: 24px;\n  border-radius: 8px;\n  min-width: 300px;\n}\n.close-btn {\n  background: #ef4444;\n  color: white;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  margin-top: 12px;\n}\n',
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
        "topics": ["javascript", "components", "animation", "dom"],
        "mode": "build_component",
        "starter_code": {
            "html": '<div class="accordion-item" id="faq-item">\n  <div class="accordion-header" id="faq-header">\n    <span class="faq-title">Can I practice with both local and cloud LLMs?</span>\n    <span class="faq-icon" id="faq-icon">▼</span>\n  </div>\n  <div class="accordion-body" id="faq-body">\n    <p>Yes! DevForge connects seamlessly with both local Ollama models and cloud providers like Gemini, OpenAI, and Groq.</p>\n  </div>\n</div>',
            "css": 'body {\n  background: #0b0f17;\n  padding: 40px;\n  font-family: system-ui, sans-serif;\n}\n.accordion-item {\n  max-width: 500px;\n  background: #1e293b;\n  border-radius: 8px;\n  overflow: hidden;\n  color: #fff;\n  border: 1px solid #334155;\n}\n.accordion-header {\n  padding: 16px 20px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  cursor: pointer;\n  user-select: none;\n}\n.faq-icon {\n  transition: transform 0.3s ease;\n}\n.accordion-body {\n  padding: 0 20px;\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.3s ease, padding 0.3s ease;\n  color: #94a3b8;\n}\n.accordion-item.active .accordion-body {\n  max-height: 200px;\n  padding: 0 20px 20px 20px;\n}\n.accordion-item.active .faq-icon {\n  transform: rotate(180deg);\n}\n',
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
    {
        "id": "js-countdown-timer-007",
        "title": "Countdown Timer With Pause",
        "description": "Implement a countdown timer in JavaScript using setInterval. Support Start, Pause, and Reset controls with live second decrementing.",
        "difficulty": "medium",
        "topics": ["javascript", "timer", "setInterval", "events"],
        "mode": "fill_blanks",
        "starter_code": {
            "html": '<div class="timer-card">\n  <h2>Sprint Countdown</h2>\n  <div id="timer-display" class="timer-value">60</div>\n  <div class="button-group">\n    <button id="btn-start" class="btn btn-start">Start</button>\n    <button id="btn-pause" class="btn btn-pause">Pause</button>\n    <button id="btn-reset" class="btn btn-reset">Reset</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n}\n.timer-card {\n  background: #1e293b;\n  padding: 32px;\n  border-radius: 12px;\n  text-align: center;\n  border: 1px solid #334155;\n  color: #fff;\n}\n.timer-value {\n  font-size: 4rem;\n  font-weight: 800;\n  margin: 16px 0;\n  color: #38bdf8;\n  font-family: monospace;\n}\n.button-group { display: flex; gap: 12px; justify-content: center; }\n.btn {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.btn-start { background: #22c55e; color: #0f172a; }\n.btn-pause { background: #f59e0b; color: #0f172a; }\n.btn-reset { background: #ef4444; color: #fff; }\n',
            "javascript": "let seconds = 60;\nlet timerId = null;\n\nconst display = document.getElementById('timer-display');\nconst startBtn = document.getElementById('btn-start');\nconst pauseBtn = document.getElementById('btn-pause');\nconst resetBtn = document.getElementById('btn-reset');\n\n// TODO: 1. Start timer with setInterval, decrement seconds every 1000ms\nstartBtn.addEventListener('click', () => {\n  if (!timerId) {\n    timerId = setInterval(() => {\n      if (seconds > 0) {\n        seconds--;\n        display.textContent = seconds;\n      }\n    }, 1000);\n  }\n});\n\n// TODO: 2. Pause timer with clearInterval and set timerId to null\npauseBtn.addEventListener('click', () => {\n  clearInterval(timerId);\n  timerId = null;\n});\n\n// TODO: 3. Reset timer to 60, clear interval, and update display\nresetBtn.addEventListener('click', () => {\n  clearInterval(timerId);\n  timerId = null;\n  seconds = 60;\n  display.textContent = seconds;\n});\n",
        },
        "solution_code": {
            "html": '<div class="timer-card">\n  <h2>Sprint Countdown</h2>\n  <div id="timer-display" class="timer-value">60</div>\n  <div class="button-group">\n    <button id="btn-start" class="btn btn-start">Start</button>\n    <button id="btn-pause" class="btn btn-pause">Pause</button>\n    <button id="btn-reset" class="btn btn-reset">Reset</button>\n  </div>\n</div>',
            "css": 'body {\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n}\n.timer-card {\n  background: #1e293b;\n  padding: 32px;\n  border-radius: 12px;\n  text-align: center;\n  border: 1px solid #334155;\n  color: #fff;\n}\n.timer-value {\n  font-size: 4rem;\n  font-weight: 800;\n  margin: 16px 0;\n  color: #38bdf8;\n  font-family: monospace;\n}\n.button-group { display: flex; gap: 12px; justify-content: center; }\n.btn {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.btn-start { background: #22c55e; color: #0f172a; }\n.btn-pause { background: #f59e0b; color: #0f172a; }\n.btn-reset { background: #ef4444; color: #fff; }\n',
            "javascript": "let seconds = 60;\nlet timerId = null;\n\nconst display = document.getElementById('timer-display');\nconst startBtn = document.getElementById('btn-start');\nconst pauseBtn = document.getElementById('btn-pause');\nconst resetBtn = document.getElementById('btn-reset');\n\nstartBtn.addEventListener('click', () => {\n  if (!timerId) {\n    timerId = setInterval(() => {\n      if (seconds > 0) {\n        seconds--;\n        display.textContent = seconds;\n      }\n    }, 1000);\n  }\n});\n\npauseBtn.addEventListener('click', () => {\n  clearInterval(timerId);\n  timerId = null;\n});\n\nresetBtn.addEventListener('click', () => {\n  clearInterval(timerId);\n  timerId = null;\n  seconds = 60;\n  display.textContent = seconds;\n});\n",
        },
        "requirements": [
            "Clicking '#btn-start' starts decrementing the countdown timer every second.",
            "Clicking '#btn-pause' halts the countdown timer at its current value.",
            "Clicking '#btn-reset' restores the timer back to 60.",
        ],
        "hints": [
            "Use setInterval to decrement the seconds variable.",
            "Use clearInterval(timerId) to pause and reset.",
        ],
        "estimated_minutes": 15,
        "tests": [
            {
                "test_id": "test-timer-init",
                "description": "Timer initializes with 60",
                "test_type": "dom",
                "selector": "#timer-display",
                "assertion_code": "document.getElementById('timer-display').textContent.trim() === '60'",
            },
            {
                "test_id": "test-timer-start-click",
                "description": "Start, Pause, and Reset buttons exist",
                "test_type": "dom",
                "assertion_code": "Boolean(document.getElementById('btn-start') && document.getElementById('btn-pause') && document.getElementById('btn-reset'))",
            },
        ],
    },
]


def seed_database():
    import os
    import json

    db = SessionLocal()
    try:
        curriculum_file = os.path.join(os.path.dirname(__file__), "data", "curriculum_311.json")
        if os.path.exists(curriculum_file):
            with open(curriculum_file, "r", encoding="utf-8") as f:
                curriculum_data = json.load(f)
            
            print(f"Syncing curriculum ({len(curriculum_data)} challenges) from curriculum_311.json...")
            for c_data in curriculum_data:
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
                else:
                    s_curr = (c_data.get("starter_code", {}).get("html") or "").strip()
                    if s_curr and existing.starter_html != s_curr:
                        existing.starter_html = s_curr
                        existing.solution_html = c_data.get("solution_code", {}).get("html", "")
                        existing.title = c_data["title"]
                        existing.description = c_data["description"]
                        existing.requirements = c_data.get("requirements", [])
                        existing.hints = c_data.get("hints", [])
            db.commit()
            print("Curriculum syncing complete!")
            return
        
        # Fallback to SEED_CHALLENGES if curriculum file not found
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

