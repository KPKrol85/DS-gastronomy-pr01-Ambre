# Ambre — UX Improvements

**Analysis date:** 2026-10-17
**Project type:** Static eight-page demonstration website for a fictional fine-dining restaurant; HTML pages as content source, modular CSS, Vanilla JavaScript ES modules, PostCSS/esbuild production build, Service Worker and Web App Manifest, static hosting with Netlify rules
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

The implemented journeys — browsing the homepage sections, opening the full menu and gallery, filtering categories, previewing images, reading legal documents and sending a reservation request — are in place and operable, with established focus, ARIA and progressive-enhancement contracts around them.

The opportunities found are concentrated in orientation and feedback rather than in missing functionality. Mobile users navigate through a drawer that is a static copy of the header list and therefore carries none of the navigation state the desktop header receives. The reservation form enforces a date and time window that it never states, and reports a rejected value with one generic sentence. In-page anchors inside the legal documents land under the fixed header, unlike the homepage sections, which already use a header-aware offset. The image lightbox resolves two different session modes but presents one fixed, partly inaccurate name and a single Esc hint. The homepage hero's two primary calls to action are the only navigation controls on the site with no native baseline behind them.

All five proposals stay inside the current architecture: canonical HTML pages, `js/modules/`, the existing CSS layers and the established accessibility hooks.

## Proposed improvements

### IMP-UX-01 — Give the mobile drawer the navigation state the header nav already has

- **Status:** COMPLETED — implemented and verified.
- **Result:** Synchronized mobile drawer `href` and `aria-current` with the resolved desktop navigation on every opening. Preserved submenu, focus management, Escape, overlay, responsive behavior and existing CSS without rebuilding the DOM.
- **Verification:** Mobile navigation E2E passed (3/3). ESLint and `git diff --check` passed. Chromium at 390 px confirmed correct destinations, active page/section states and visual highlighting. Other browsers, assistive technologies and deployment were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-02 — State and enforce the reservation form's date and time window

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added accessible hints and inline validation for reservations Tuesday–Sunday, 17:00–22:00 in 15-minute intervals, from today through 90 days ahead. Invalid requests are blocked with field-specific errors while existing submission, recovery and no-JavaScript behavior remain intact.
- **Verification:** Reservation E2E passed (17/17), no-JS QA passed, and HTML, CSP, text lint, ESLint and `git diff --check` passed. Chromium checks at 390/1440 px showed no horizontal overflow. Without JS, date boundaries remain static and Mondays cannot be excluded natively. No server-side enforcement; other browsers and assistive technologies were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-03 — Land legal-document anchors below the fixed header

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `scroll-margin-top: calc(var(--header-h, 64px) + 12px)` to the existing `.legal__doc h2` rule in `css/pages/legal.css`, reusing the header-height token and the anchor-offset pattern already used for `main` and `.l-section`. Markup, table-of-contents structure, section IDs, heading levels, JavaScript and scroll behavior are unchanged.
- **Verification:** `git diff --check`, `npm run lint:css` and `npm run qa:html` passed. Chromium measurement of all 40 anchored headings on the three legal pages at 320, 390 and 1440 px, in light and dark themes, placed every heading 10.5-11.5 px below the normal header and 18.5-19.5 px below the shrunk header, while homepage section, skip-link and footer anchors kept their existing 76 px and 84 px offsets. The verification browser ran with its pane hidden, where rAF-driven animation is suspended, so landings were measured with instant scrolling, matching the reduced-motion path rather than the animated transition.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Name and describe the lightbox according to its active mode

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended the existing `applyMode()` so the shared dialog's title and guidance follow the resolved mode and the real `canNavigate()` result: `Podgląd zdjęć` with arrow-key and Escape guidance for a navigable group, `Podgląd zdjęć` with Escape-only guidance when no siblings are visible, and `Podgląd dania` with Escape-only guidance in single mode. Aligned the three dialogs on `aria-labelledby="lb-title"` with `#lb-help` in `aria-describedby`, replacing the competing `aria-label` on `menu.html`. Mode resolution, grouping, filtering, navigation, counter, focus, swipe, fullscreen and document-state restoration are unchanged.
- **Verification:** `npm run test:e2e:lightbox` passed 13/13 scenarios (two new: the cross-page naming contract and a gallery session without siblings), `npm run qa:a11y` passed 14 scans across 8 pages, and `html-validate`, text lint, `qa:csp`, focused ESLint and `git diff --check` passed. Names and descriptions were asserted from the referenced, non-hidden nodes rather than from a platform accessibility tree; no screen reader, other browser engine or deployed environment was tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Give the hero's primary actions native in-page navigation

- **Affected journey:** Entry path from the homepage hero to the reservation form and the menu section.
- **Evidence:** `index.html:208-209`, `js/modules/scroll.js:77-93`, `css/components/utilities.css:1-14`, `css/base/tokens.css:7-15`, `css/base/base.css:88-91`
- **Current experience:** The hero's two primary calls to action, `Zarezerwuj stolik` and `Zobacz menu`, are `<button>` elements whose only behavior comes from `initScrollTargets()`, which reads `[data-target]` and calls `scrollIntoView()`. Every other in-page destination on the site — header navigation, footer navigation, the legal tables of contents — is a real anchor, and the project maintains a no-JavaScript baseline elsewhere (native form submission, the `noscript` map fallback, the `.no-js` header rules). The hero controls have no such baseline and no link semantics.
- **Proposed improvement:** Turn the two hero actions into anchors pointing at `#rezerwacja` and `#menu`, keeping their current appearance and the smooth-scroll behavior.
- **Expected user value:** The site's two most prominent actions behave like the rest of its in-page navigation: they announce as links, expose their destination, support opening in a new tab, and still work when the JavaScript enhancement is unavailable.
- **Implementation scope:** The two controls in `index.html` plus, if `[data-target]` is kept, the `initScrollTargets()` handler in `js/modules/scroll.js` so a native jump and a scripted scroll do not both run. The global `scroll-behavior: smooth` with its `prefers-reduced-motion` override and the `.l-section` scroll offset already cover smooth, header-aware landing, so the simplest variant needs no new JavaScript. Preserve the existing button styling classes, the first control's accessible label, and the hero layout at all breakpoints.
- **Acceptance criteria:** Both hero actions expose a link role with a resolvable in-page destination, move the view to the reservation form and the menu section respectively, and land below the fixed header. The target is reached once per activation, with no double scroll. With JavaScript disabled both actions still reach their sections. Reduced-motion users get an instant jump. `npm run qa:html`, `npm run qa:links` and `npm run test:e2e:scroll` pass.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The set is ordered by practical relevance. IMP-UX-01 affects every page for every visitor below 940 px, where the drawer is the only navigation, and it unlocks a drawer state treatment that already exists in CSS. IMP-UX-02 addresses the only data-entry journey in the project, where a request for an impossible slot is currently confirmed as accepted. IMP-UX-03 and IMP-UX-05 are small, well-bounded corrections that extend patterns the project already uses elsewhere. IMP-UX-04 improves comprehension of an interaction shared by three pages without touching its mechanics.

All five are independent: they touch different files, or different regions of `js/modules/nav.js`, `js/modules/scroll.js`, `js/modules/form.js`, `js/modules/lightbox.js` and the CSS layers, and none depends on another being implemented first. Each is verifiable with a focused existing check plus a short browser inspection, which keeps the set appropriate for focused development work. No proposal is Large, and none requires new dependencies, new pages, backend work or design-system changes.

A sixth candidate — reporting the number of matching items after a category filter in the menu and gallery grids — was considered and excluded: `scripts/qa-gallery-status-e2e.mjs` deliberately asserts that the status node keeps exactly the completed text under every filter, so changing that feedback would alter a protected, intentionally verified contract rather than extend an existing one.

## Analysis limitations

Runtime verification was a single focused Chromium pass over `galeria.html`, `menu.html`, `index.html` and `cookies.html` in a local static server, with the demonstration notice pre-accepted and POST requests intercepted. It covered the drawer and header navigation state at 390 px, the legal anchor landing and a homepage comparison at 1440 px, the lightbox state in gallery mode, and two reservation submissions. No other browser, no assistive technology, no touch device and no deployed environment were exercised, so expected benefits are reasoned improvement opportunities, not measured outcomes. Impact and effort are relative engineering estimates.

Two observations outside this report's scope were noted and intentionally not converted into proposals. First, with JavaScript disabled below 940 px the header navigation list stays `display: none` while the `.no-js` rules hide the navigation toggle, so the header exposes no navigation links in that combination and only the footer navigation remains; this follows from the CSS cascade in `css/layout/header.css:131-133`, `css/layout/header.css:375-399` and `css/components/utilities.css:1-14`, was not confirmed at runtime, and belongs in an audit or review rather than in an optional improvement. Second, the visible copy on `offline.html` is written without Polish diacritics, which is a content defect for the project's text-quality rules rather than an interaction improvement.
