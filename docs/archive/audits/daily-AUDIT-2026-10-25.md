# Daily Front-End Audit — Ambre

**Audit date:** 2026-10-24

**Completion/archive date:** 2026-10-25

**Status:** COMPLETED — all findings resolved; archived

**Project type:** Eight-page Polish restaurant demonstration site; HTML, modular CSS, Vanilla JavaScript, Node.js production build and Netlify-oriented hosting rules.

**Audit mode:** Original static review, followed by source/regression verification and editorial closure.

## Overall assessment

**Closure (2026-10-25):** All five findings are resolved through PH5-01–PH5-03 and PH6-01–PH6-02 of the completed [development plan](../plans/PLAN-2026-10-25.md), supported by canonical-source review and focused Chromium regressions. The architecture remains appropriate for the portfolio scope. Historical test results and closure checks are distinguished below; no fresh comprehensive QA is claimed.

**Original assessment (2026-10-24):** Canonical HTML, CSS and JavaScript have clear ownership, with a separate generated distribution and focused QA scripts. The architecture is suitable for continued development within the documented portfolio scope. No critical blocker was detected in the inspected sources; the main concern is the mobile navigation fallback without JavaScript. Smaller interaction defects and resilience risks remain. Production build execution, browser behavior and the public deployment were not verified.

## Verified strengths

- [Build ownership](../../../scripts/build-dist.mjs): centralized CSS/JS generation, page/hosting-file copying and HTML/Service Worker asset rewriting; obsolete minified source assets are rejected.
- [Feature initialization](../../../js/script.js): separate error boundaries prevent one initializer failure from stopping subsequent modules.
- [Reservation handling](../../../js/modules/form.js): native validation, HTTP-success checks, reset only after acceptance, preserved input after failure and native submission when fetch/FormData are unavailable; provider receipt is unconfirmed.
- [Demo dialog](../../../js/modules/demo-legal.js): focus containment/restoration and background `inert`; [lightbox](../../../js/modules/lightbox.js): scroll restoration and separate gallery/single-dish modes.
- Accessibility: shared [theme tokens](../../../css/base/tokens.css), [focus/reduced-motion rules](../../../css/components/utilities.css) and named, keyboard-focusable legal-table scrolling regions.
- [Service Worker](../../../sw.js): cache cleanup limited to the Ambre namespace/legacy keys; cross-origin requests excluded.
- Demonstration-project JSON-LD, utility-page `noindex`, [schema policy checks](../../../scripts/schema-policy-check.mjs) and configured [CI fast QA/build](../../../.github/workflows/main.yml).

## P0 — Critical risks

None detected in the original static audit.

## P1 — Important issues worth fixing next (resolved)

### [P1-01] Mobile no-JavaScript navigation does not reveal its links

- **Status:** COMPLETED — verified.
- **Classification:** Source-visible risk
- **Issue:** Below 940 px, `.no-js` hid the toggle without revealing the primary list, leaving footer links as fallback.
- **Resolution:** [utilities.css](../../../css/components/utilities.css) reveals and wraps navigation and submenus and places the expanded header in document flow; all eight shells retain `body.no-js`.
- **Verification:** PH5-01 records historical PASS for CSS lint, HTML QA and the [no-JavaScript regression](../../../scripts/qa-nojs-e2e.mjs) on eight pages at 320/390/939/940/1280 px, covering visibility, keyboard/focus behavior, link activation and overflow.

## P2 — Minor refinements (resolved)

### [P2-01] Storage failures prevent otherwise usable interactions

- **Status:** COMPLETED — verified.
- **Classification:** Source-visible risk
- **Issue:** Unguarded storage access could abort initialization or block theme/notice actions; Escape and backdrop dismissal remained independent, without a demonstrated site-wide lockout.
- **Resolution:** [theme.js](../../../js/modules/theme.js) and [demo-legal.js](../../../js/modules/demo-legal.js) guard reads and writes and complete UI actions before best-effort persistence, preserving manual theme state, focus and `inert` cleanup.
- **Verification:** PH6-01 records historical PASS for [theme](../../../scripts/qa-theme-e2e.mjs) (6/6) and [notice](../../../scripts/qa-demo-legal-e2e.mjs) (4/4) E2E, JS lint and whitespace checks; with independently denied reads and writes, interactions remained usable without uncaught errors, although denied persistence remains unavailable.

### [P2-02] Different navigation breakpoints can leave a hidden drawer active

- **Status:** COMPLETED — verified.
- **Classification:** Source-visible risk
- **Issue:** Opening at 939 px and resizing to 940 px could hide the drawer while retaining scroll locking and keyboard containment, because JavaScript entered desktop state earlier than CSS.
- **Resolution:** [nav.js](../../../js/modules/nav.js) matches the 940 px boundary in [header.css](../../../css/layout/header.css); desktop entry clears drawer/ARIA state and keyboard containment, releases scrolling and restores visible focus when needed.
- **Verification:** PH5-02 records historical PASS for `qa:nojs` and [mobile navigation E2E](../../../scripts/qa-mobile-nav-e2e.mjs), covering the 939→940 px path, desktop traversal, repeated transitions and mobile reopening.

### [P2-03] Menu detail enhancements never initialize on the menu page

- **Status:** COMPLETED — verified.
- **Classification:** Defect
- **Issue:** The initializer required `body.page-menu` although [menu.html](../../../menu.html) used `main.page-menu`, leaving native details usable but enhancements inactive.
- **Resolution:** [page-menu.js](../../../js/modules/page-menu.js) selects the actual root, captures non-bubbling native `toggle` events for exclusivity and scopes Escape/outside-click dismissal to its panels.
- **Verification:** PH6-02 records historical PASS for [menu details](../../../scripts/qa-menu-details-e2e.mjs) (7/7) and [lightbox](../../../scripts/qa-lightbox-e2e.mjs) (13/13) E2E, HTML QA, JS lint and whitespace checks, covering native events without clicks, mouse/keyboard dismissal, scope, filtering, lightbox and the no-JavaScript fallback.

### [P2-04] Mobile menu toggle references the desktop navigation

- **Status:** COMPLETED — verified.
- **Classification:** Defect
- **Issue:** All eight toggles referenced `site-header-nav` instead of the opened drawer, exposing an incorrect accessibility relationship without affecting pointer operation.
- **Resolution:** Every shell now declares `aria-controls="mobile-drawer"`; [nav.js](../../../js/modules/nav.js) derives missing controls from the drawer ID and synchronizes expanded/hidden states.
- **Verification:** PH5-03 records historical PASS for eight-page static checks, HTML QA, JS lint and [mobile navigation](../../../scripts/qa-mobile-nav-e2e.mjs) E2E (4/4), including the actual controlled-element identity and the missing-attribute fallback; manual assistive-technology testing was not performed.

## Extra quality improvements

None detected in the original audit; no additional scope was introduced during closure.

## Verification performed

- **Original audit (2026-10-24):** Static review of project instructions and documentation, eight-page markup and metadata, runtime modules and CSS, build/CI/QA, hosting, SEO and PWA configuration. `npm run qa:links` — **PASS** (exit 0) for local HTML links, resources and anchors; `git diff --check`, including the untracked report, found no whitespace errors. No fixes, dependency installation, build, lint aggregates, browser suites, axe or Lighthouse runs were performed.
- **Historical remediation (2026-10-24 – 2026-10-25):** The linked plan records the PH5-01–PH5-03 and PH6-01–PH6-02 results cited above (`856b8dc`, `8d9e04a`, `effb237`, `30aeba8`, `107e291`); these results were not rerun at closure.
- **Closure checks (2026-10-25) — PASS:** Source and regression review of all five findings, with regression assertions and [package registration](../../../package.json) checked against sources and [settings](../../settings.md) and the [architecture map](../../ARCHITECTURE_MAP.md) as context; static assertions confirmed `no-js`, canonical assets and toggle/drawer relationships in all eight shells, plus the menu root and its four panels. Editorial checks covered the complete file, original finding IDs, titles, order and groups, dates and status, relative links, scope and whitespace (`git status`, `git diff --check` and the untracked archive), and confirmed an audit-only relocation.
- **Not run during closure:** application QA/E2E, build, axe, Lighthouse or deployment checks. Closure did not repeat the technical audit, and Markdown checks do not establish runtime correctness.

### Verification limitations

The original audit did not exercise browser behavior; its classifications reflect source review. Historical Chromium regressions support the resolutions, with Service Workers blocked in the navigation, theme, notice, menu and lightbox tests. Other engines, manual assistive-technology testing, broad contrast/layout checks, live Netlify headers/redirects, provider receipt, installed/offline PWA operation, dependency vulnerabilities and performance metrics remain outside this verification. Configured checks do not prove deployment success.

## Senior rating

**Rating:** 8/10 — original 2026-10-24 rating, retained at closure without reassessment

The static portfolio architecture has clear sources, proportionate tooling, defensive feature boundaries and useful accessibility mechanisms. The mobile fallback gap and smaller interaction mismatches prevent a higher rating. Link integrity passed, but the unexecuted build and browser checks limit confidence in production behavior.

**Closure note:** All five findings, including the mobile fallback gap and interaction mismatches cited above, were resolved; the rating was not reassessed.
