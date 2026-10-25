# Daily Front-End Audit — Ambre

**Audit date:** 2026-10-24
**Completion/archive date:** 2026-10-25
**Status: COMPLETED**

**Project type:** Eight-page Polish restaurant demonstration site; HTML, modular CSS, Vanilla JavaScript, Node.js production build and Netlify-oriented hosting rules.

**Audit mode:** Original static review, followed by source/regression verification and editorial closure.

## Overall assessment

All five findings are resolved, supported by the completed [development plan](../plans/PLAN-2026-10-25.md), canonical-source review and relevant regression coverage. The architecture remains appropriate for the portfolio scope. Historical test results and final static checks are distinguished below; no fresh comprehensive QA is claimed.

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

## P1 — Important issues (resolved)

### [P1-01] Mobile no-JavaScript navigation does not reveal its links

- **Status:** RESOLVED
- **Issue:** Below 940 px, `.no-js` hid the toggle without revealing the primary list, leaving footer links as fallback.
- **Resolution:** [utilities.css](../../../css/components/utilities.css) reveals and wraps navigation/submenus and places the expanded header in document flow; all eight shells retain `body.no-js`.
- **Verification:** PH5-01 records historical PASS for CSS lint, HTML QA and the [no-JavaScript regression](../../../scripts/qa-nojs-e2e.mjs): eight pages at 320/390/939/940/1280 px, visibility, keyboard/focus behavior, link activation and overflow.

## P2 — Minor refinements (resolved)

### [P2-01] Storage failures prevent otherwise usable interactions

- **Status:** RESOLVED
- **Issue:** Unguarded storage access could abort initialization or block theme/notice actions; Escape/backdrop remained independent, without a demonstrated site-wide lockout.
- **Resolution:** [theme.js](../../../js/modules/theme.js) and [demo-legal.js](../../../js/modules/demo-legal.js) guard reads/writes and complete UI actions before best-effort persistence, preserving manual theme state, focus and `inert` cleanup.
- **Verification:** PH6-01 records historical PASS: [theme](../../../scripts/qa-theme-e2e.mjs) 6/6, [notice](../../../scripts/qa-demo-legal-e2e.mjs) 4/4, JS lint and whitespace checks; independently denied reads/writes leave interactions usable without uncaught errors, though denied persistence remains unavailable.

### [P2-02] Different navigation breakpoints can leave a hidden drawer active

- **Status:** RESOLVED
- **Issue:** Opening at 939 px and resizing to 940 px could hide the drawer while retaining scroll locking and keyboard containment because JavaScript entered desktop state earlier than CSS.
- **Resolution:** [nav.js](../../../js/modules/nav.js) matches the 940 px boundary in [header.css](../../../css/layout/header.css); desktop entry clears drawer/ARIA state and keyboard containment, releases scrolling and restores visible focus when needed.
- **Verification:** PH5-02 records historical PASS for `qa:nojs` and [mobile navigation E2E](../../../scripts/qa-mobile-nav-e2e.mjs), covering the 939→940 px path, desktop traversal, repeated transitions and mobile reopening.

### [P2-03] Menu detail enhancements never initialize on the menu page

- **Status:** RESOLVED
- **Issue:** The initializer required `body.page-menu` although [menu.html](../../../menu.html) used `main.page-menu`, leaving native details usable but enhancements inactive.
- **Resolution:** [page-menu.js](../../../js/modules/page-menu.js) selects the actual root, captures non-bubbling native `toggle` events for exclusivity and scopes Escape/outside-click dismissal to its panels.
- **Verification:** PH6-02 records historical PASS: [menu details](../../../scripts/qa-menu-details-e2e.mjs) 7/7, [lightbox](../../../scripts/qa-lightbox-e2e.mjs) 13/13, HTML QA, JS lint and whitespace checks; coverage includes native events without clicks, mouse/keyboard dismissal, scope, filtering, lightbox and no-JavaScript fallback.

### [P2-04] Mobile menu toggle references the desktop navigation

- **Status:** RESOLVED
- **Issue:** All eight toggles referenced `site-header-nav` instead of the opened drawer, exposing an incorrect accessibility relationship without affecting pointer operation.
- **Resolution:** Every shell now declares `aria-controls="mobile-drawer"`; [nav.js](../../../js/modules/nav.js) derives missing controls from the drawer ID and synchronizes expanded/hidden states.
- **Verification:** PH5-03 records historical PASS: eight-page static checks, HTML QA, JS lint and [mobile navigation](../../../scripts/qa-mobile-nav-e2e.mjs) 4/4, including actual controlled-element identity and missing-attribute fallback; manual assistive-technology testing remains unperformed.

## Extra quality improvements

None detected in the original audit; no additional scope introduced during closure.

## Verification performed

- **Original audit, 2026-10-24:** Static review covered project instructions/documentation, eight-page markup/metadata, runtime/CSS, build/CI/QA, hosting, SEO and PWA configuration. `npm run qa:links`: **PASS**, exit 0, for local HTML links/resources/anchors; document/whitespace checks passed. No fixes, dependency installation, build, lint aggregates or browser suites were performed.
- **Historical remediation:** The linked plan records PH5-01–PH5-03 and PH6-01–PH6-02 results cited above. Regression assertions and [package registration](../../../package.json) were reviewed against sources, with [settings](../../settings.md) and the [architecture map](../../ARCHITECTURE_MAP.md) as context; historical PASS records were not rerun.
- **Final closure, 2026-10-25 — PASS:** Source/regression review of all five findings; static assertions for eight shells' `no-js`, canonical assets and toggle/drawer relationships, plus the menu root/four panels; audit-only relocation verified.
- **Editorial validation — PASS:** Complete-file review, original finding IDs/titles/order/groups, dates/status, relative links, scope and whitespace checked, including `git status`, `git diff --check` and explicit validation of the untracked archive.
- **NOT RUN during closure/editing:** Application QA/E2E, build, axe, Lighthouse or deployment checks. This editorial pass did not repeat the technical audit; Markdown checks do not establish runtime correctness.

### Verification limits

The original audit did not exercise browser behavior; P1-01, P2-01 and P2-02 were source-visible risks, while P2-03/P2-04 were source defects. Historical Chromium regressions support their resolution, with Service Workers blocked in navigation/theme/notice/menu/lightbox tests. Other engines, manual assistive-technology testing, broad contrast/layout checks, live Netlify headers/redirects, provider receipt, installed/offline PWA operation, dependency vulnerabilities and performance metrics remain outside this verification. Configured checks do not prove deployment success.

## Senior rating

**Historical rating (2026-10-24):** 8/10

The original assessment credited clear sources, proportionate tooling and defensive/accessibility mechanisms; navigation/interaction defects and unexecuted build/browser checks limited confidence. The findings are now resolved; the historical rating is retained without assigning a new score.
