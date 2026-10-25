# Ambre — Development Plan

**Last reviewed:** 2026-10-25

**Project type:** Static, eight-page Polish restaurant portfolio/demo; HTML, modular CSS and Vanilla JavaScript

**Plan status:** Active

## Project boundaries and maintenance

- Preserve the fictional restaurant/demo scope. The reservation UI has a Netlify-compatible submission contract; this repository supplies no reservation backend, database, accounts or payments. Public deployment and actual form receipt are not established by this review.
- Root HTML owns page content and structure; `css/style.css` imports canonical styles, and `js/script.js` initializes feature modules. `scripts/build-dist.mjs` owns production generation, including asset rewrites in copied HTML and `sw.js`. Never hand-edit `dist/` or minified output.
- Preserve Polish public content, responsive behavior, light/dark/system themes, keyboard access, ARIA, DOM hooks, native form fallback and browser-storage contracts.
- For relevant future implementation, inspect this plan and update affected checkboxes only when the approved file scope permits it and the outcome has been verified. Otherwise report the exact pending checkbox updates. Significant completed changes belong separately in `docs/CHANGELOG.md`, subject to its entry policy and the approved scope.
- Phases 1–4 retain the original identifiers and objectives from `docs/archive/plans/PLAN-2026-08-22.md`. Their completed outcomes remain supported by current sources and recorded verification; historical browser/build results have not been rerun for this plan. `PH2-02` and Phases 5–6 describe current remaining work.

## Current priorities

No required implementation items remain. Optional `O-01` is complete.

## Phase 1 — Public interaction correctness

**Goal:** Preserve the completed form-feedback, information-dialog and scroll-control corrections.

- [x] **PH1-01 — Confirm reservation delivery only after an accepted response**
  - **Result:** `js/modules/form.js` checks HTTP success before confirmation/reset, preserves input on rejected or failed requests, and retains validation and native fallback.
  - **Verification:** Current handler and `scripts/qa-reservation-e2e.mjs` inspected; accepted, rejected, network-failure and native-fallback passes are recorded in `docs/archive/audits/daily-AUDIT-2026-08-22.md`. This verifies client response handling, not provider receipt or a confirmed booking.

- [x] **PH1-02 — Constrain keyboard focus within the initial information dialog**
  - **Result:** `js/modules/demo-legal.js` contains focus, makes background content inert, and restores focus after dismissal while preserving the notice's informational purpose.
  - **Verification:** Current module and `scripts/qa-demo-legal-e2e.mjs` inspected; keyboard-modal and acceptance-persistence passes are recorded in the archived daily audit. Storage-failure resilience is covered by the `PH6-01` verification below.

- [x] **PH1-03 — Restore the shared scroll-to-top control**
  - **Result:** `js/modules/scroll.js` synchronizes visibility, `hidden`, `aria-hidden` and keyboard reachability, with reduced-motion-aware activation.
  - **Verification:** Current source and `scripts/qa-scroll-to-top-e2e.mjs` inspected; shared markup, threshold/keyboard and reduced-motion scenario passes are recorded in the archived daily audit.

## Phase 2 — Workflow contract alignment

**Goal:** Keep developer-facing QA descriptions aligned with executable commands.

- [x] **PH2-01 — Synchronize the documented QA command with package scripts**
  - **Result:** The original command-alignment correction is retained; the canonical guide is now `docs/settings.md`.
  - **Verification:** Its current `qa`, `qa:fast` and `test:e2e` command descriptions match `package.json`. The archived daily audit records the original command comparison; no application execution is needed to establish this documentation contract.

- [x] **PH2-02 — Correct the README's regression and image-verification descriptions**
  - [x] Align both README language sections with the eight configured `test:e2e` regressions, including mobile navigation and theme behavior.
  - [x] Describe the implemented `img:verify` checks for referenced local rasters, optimized/original dimensions and `w` descriptors.
  - **Result:** Both command tables now match the current scripts, without implying test success or treating density descriptors as pixel widths.
  - **Verification:** Direct comparison with `package.json` and `scripts/img-verify.mjs` confirmed equivalent, supported descriptions in Polish and English; the Markdown diff was reviewed and `git diff --check` passed. Verification was documentation-only; no build, E2E, Lighthouse or image-verification command was run.

## Phase 3 — Developer workflow maintenance

**Goal:** Preserve the completed npm command organization and source/build boundary.

- [x] **PH3-01 — Standardize the npm script taxonomy**
  - **Result:** `build`, `lint:*`, `qa:*`, `test:e2e:*`, `csp:*` and `img:*` have defined responsibilities; fast and full QA compose their stages, and the unused `postcss-cli` was removed.
  - **Verification:** `package.json`, `package-lock.json`, `docs/settings.md` and build ownership inspected. The original completion is retained from the archived plan and `docs/CHANGELOG.md`; the E2E aggregate has since expanded beyond its original three regressions. The remaining README description gap is `PH2-02`.

## Phase 4 — Lighthouse remediation

**Goal:** Preserve production-path measurement and intentional utility-page indexing semantics.

- [x] **PH4-01 — Complete the Lighthouse quality gate without weakening its contract**
  - **Result:** `lighthouserc.json` builds and serves compressed `dist/` across eight URLs with three runs each. Standard-page SEO remains blocking; utility-page SEO is a warning, preserving `noindex` on `offline.html` and `404.html`. The menu image/map and offline metadata/font changes remain present.
  - **Verification:** Configuration, `scripts/lhci-static-server.mjs`, build sources and affected HTML inspected. Successful historical Lighthouse verification is recorded in the archived plan and daily audit; this checked record does not assert current performance scores or a newly passed build.

## Phase 5 — Reliable shared navigation

**Goal:** Make the existing header usable without JavaScript and keep mobile drawer state consistent with layout and accessibility semantics.

The three items address independent defects and can be implemented separately. Preserve resolved drawer link destinations, `aria-current`, submenu behavior, dismissal and ordinary desktop keyboard traversal.

- [x] **PH5-01 — Restore mobile primary navigation without JavaScript** — **Priority:** High
  - [x] In canonical header/fallback CSS, explicitly reveal the top-level navigation list below 940 px when `no-js` remains; provide wrapping or stacking that fits narrow screens while keeping submenu destinations reachable.
  - [x] Verify the fallback markers on all eight page shells, including `404.html` and `offline.html`. Preserve their existing page classes and the JavaScript-enhanced layout.
  - [x] Extend `scripts/qa-nojs-e2e.mjs` beyond its default desktop viewport to cover mobile link visibility and keyboard activation on the homepage and shared shells, with no horizontal page overflow.
  - **Source:** `daily-AUDIT.md` — P1-01; `css/layout/header.css`, `css/components/utilities.css`, root HTML and `scripts/qa-nojs-e2e.mjs`.
  - **Result:** Below 940 px, the no-JavaScript header occupies normal document flow with wrapping links, 44 px minimum link height and always-visible submenus. All eight shells retain the fallback marker, preserving page classes, destinations, ARIA and JavaScript navigation contracts.
  - **Verification:** `npm run lint:css`, `npm run qa:html`, `npm run qa:nojs`, focused ESLint and `git diff --check` passed; the no-JavaScript regression covers all eight shells at 320/390/939/940/1280 px, keyboard/submenu navigation, horizontal overflow and existing native-form checks. The existing homepage JavaScript navigation regression passed 3/3, and six touch/light-dark checks passed on home/404/offline; PH5-02 and PH5-03 remain open.

- [x] **PH5-02 — Align the drawer lifecycle with the desktop layout boundary**
  - [x] Reproduce opening at 939 px and resizing to 940 px; align `js/modules/nav.js` with the CSS desktop boundary and clear open state when entering desktop layout.
  - [x] Ensure desktop entry releases scroll locking and the Tab handler, synchronizes toggle/drawer/overlay state, and leaves focus on an available control.
  - [x] Replace the existing regression assertion that preserves the 939/940 px discrepancy. Cover an opening at 939 px, crossing to 940 px, returning to mobile and reopening, alongside existing keyboard/dismissal cases.
  - [x] Update the corresponding boundary description in `docs/settings.md` after verification.
  - **Source:** `daily-AUDIT.md` — P2-02; `js/modules/nav.js`, `css/layout/header.css`, `css/components/utilities.css`, `scripts/qa-mobile-nav-e2e.mjs` and `scripts/qa-nojs-e2e.mjs`.
  - **Result:** JavaScript now follows the 940 px CSS desktop boundary and clears drawer/overlay state, scroll locking and Tab containment while preserving visible header focus and mobile dismissal/reopening. The no-JavaScript regression cancels pending smooth scrolling locally before its unchanged consent-checkbox check.
  - **Verification:** `npm run qa:nojs` and `npm run test:e2e:mobile-nav` passed in one full verification run each, covering all 40 navigation page/width combinations, native-form checks and 3/3 mobile scenarios. Targeted diagnostics reproduced the checkbox timeout and isolated scroll-driven geometry changes; focused ESLint and `git diff --check` passed.

- [x] **PH5-03 — Point each mobile navigation toggle at the controlled drawer**
  - **Source:** `daily-AUDIT.md` — P2-04; root header markup and `initMobileNav()` in `js/modules/nav.js`.
  - **Result:** All eight root toggles and the initializer's missing-attribute fallback now reference the actual `#mobile-drawer`, preserving existing IDs, test hooks and the PH5-02 navigation lifecycle.
  - **Verification:** Static relationship checks passed on all eight pages; `npm run qa:html`, `npm run test:e2e:mobile-nav` (4/4 scenarios), `npm run lint:js` and `git diff --check` passed. The regression verifies the controlled drawer's identity and synchronized expanded/hidden/ARIA states through opening, dismissal, 939/940 px transitions and missing-attribute initialization; manual assistive-technology testing was not performed.

## Phase 6 — Resilient interaction enhancements

**Goal:** Restore intended enhancements while preserving usable native and current-page behavior.

- [x] **PH6-01 — Keep theme and notice interactions usable when persistence fails**
  - **Source:** `daily-AUDIT.md` — P2-01; both runtime modules and their focused E2E scripts.
  - **Result:** Both modules guard storage reads and writes while preserving `theme`, `demoLegalAccepted` and existing UI/accessibility contracts. Manual theme selection remains authoritative in module memory, and notice acceptance completes dismissal and focus/inert cleanup even without persistence.
  - **Verification:** `npm run test:e2e:theme` passed 6/6 isolated scenarios and `npm run test:e2e:demo-legal` passed 4/4, covering independently denied reads/writes, system changes, keyboard/ARIA behavior, dismissal/reload, focus/inert cleanup and existing persistence without uncaught errors; `npm run lint:js` and `git diff --check` passed. E2E used installed Chromium via `PLAYWRIGHT_BROWSERS_PATH` outside the sandbox for localhost access; full QA and manual assistive-technology checks were not run.

- [x] **PH6-02 — Restore the menu detail-panel enhancement contract**
  - **Source:** `daily-AUDIT.md` — P2-03; `menu.html`, `js/modules/page-menu.js` and the architecture map's menu-detail entry.
  - **Result:** Initialization now recognizes `main.page-menu` and captures native `toggle` events to enforce one open panel within that root, preserving Escape/outside-click dismissal, native summary activation, filtering, lightbox behavior and no-JavaScript details. The focused regression is registered as the ninth E2E command; settings, architecture and both README language sections describe the updated contract.
  - **Verification:** `npm run test:e2e:menu-details` passed 7/7 scenarios, including trusted non-bubbling `toggle` delivery during capture and exclusivity without a click, dismissal, keyboard activation, scoped effects, filters/lightbox, no-JavaScript operation and no uncaught errors; `npm run test:e2e:lightbox` passed 13/13, and `npm run qa:html`, `npm run lint:js` and `git diff --check` passed. E2E used installed Chromium via `PLAYWRIGHT_BROWSERS_PATH` outside the sandbox for localhost access; the full E2E aggregate, full QA, Lighthouse and manual assistive-technology checks were not run.

## Optional future improvements

- [x] **O-01 — Restore Polish diacritics in the offline status panel** — **Priority:** Optional
  - **Result:** Restored Polish diacritics in the three visible offline-panel strings, preserving all markup, attributes, styling, navigation, metadata and Service Worker fallback sources.
  - **Verification:** `npm run qa:html`, `npm run lint:text`, `git diff --check` and exact source/byte comparison passed; `/`, `noindex`, absent JSON-LD and the fallback integration were confirmed by source inspection. Visual inspection at 390/1280 px was NOT RUN because the existing Chromium environment could not complete localhost access; Service Worker runtime behavior was not independently tested.

## Verification scope and execution order

- The initial plan review used static inspection of sources, configuration, scripts, documentation and audit findings. Subsequent navigation, storage and menu-detail verification is recorded in Phases 5–6.
- Historical completion evidence is retained explicitly, rather than presented as a fresh test run. No new build, full browser suite, Lighthouse measurement, deployment, form-provider or assistive-technology verification is claimed.
- Required interaction work in Phase 6 is complete; the E2E aggregate and both README language sections now list nine focused regressions. Reuse the existing npm commands and browser runtime for future approved work.
- Perform each item's focused verification before checking it off. Update related current audit status only when findings are resolved and that documentation is within the approved implementation scope; keep archived records historical. No current task requires an external decision, and no blocked or deliberately deferred implementation item has been established.
