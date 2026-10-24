# Ambre — Development Plan

**Last reviewed:** 2026-10-24

**Project type:** Static, eight-page Polish restaurant portfolio/demo; HTML, modular CSS and Vanilla JavaScript

**Plan status:** Active

## Project boundaries and maintenance

- Preserve the fictional restaurant/demo scope. The reservation UI has a Netlify-compatible submission contract; this repository supplies no reservation backend, database, accounts or payments. Public deployment and actual form receipt are not established by this review.
- Root HTML owns page content and structure; `css/style.css` imports canonical styles, and `js/script.js` initializes feature modules. `scripts/build-dist.mjs` owns production generation, including asset rewrites in copied HTML and `sw.js`. Never hand-edit `dist/` or minified output.
- Preserve Polish public content, responsive behavior, light/dark/system themes, keyboard access, ARIA, DOM hooks, native form fallback and browser-storage contracts.
- For relevant future implementation, inspect this plan and update affected checkboxes only when the approved file scope permits it and the outcome has been verified. Otherwise report the exact pending checkbox updates. Significant completed changes belong separately in `docs/CHANGELOG.md`, subject to its entry policy and the approved scope.
- Phases 1–4 retain the original identifiers and objectives from `docs/archive/plans/PLAN-2026-08-22.md`. Their completed outcomes remain supported by current sources and recorded verification; historical browser/build results have not been rerun for this plan. `PH2-02` and Phases 5–6 describe current remaining work.

## Current priorities

1. `PH5-01` — Restore mobile primary navigation without JavaScript.
2. `PH5-02` — Clear drawer state at the actual desktop breakpoint.
3. `PH5-03` — Associate the mobile toggle with its drawer.
4. `PH6-01` — Keep theme selection and notice dismissal usable when storage fails.
5. `PH6-02` — Restore menu detail-panel enhancements.

## Phase 1 — Public interaction correctness

**Goal:** Preserve the completed form-feedback, information-dialog and scroll-control corrections.

- [x] **PH1-01 — Confirm reservation delivery only after an accepted response**
  - **Result:** `js/modules/form.js` checks HTTP success before confirmation/reset, preserves input on rejected or failed requests, and retains validation and native fallback.
  - **Verification:** Current handler and `scripts/qa-reservation-e2e.mjs` inspected; accepted, rejected, network-failure and native-fallback passes are recorded in `docs/archive/audits/daily-AUDIT-2026-08-22.md`. This verifies client response handling, not provider receipt or a confirmed booking.

- [x] **PH1-02 — Constrain keyboard focus within the initial information dialog**
  - **Result:** `js/modules/demo-legal.js` contains focus, makes background content inert, and restores focus after dismissal while preserving the notice's informational purpose.
  - **Verification:** Current module and `scripts/qa-demo-legal-e2e.mjs` inspected; keyboard-modal and acceptance-persistence passes are recorded in the archived daily audit. Storage-failure resilience remains separately open as `PH6-01`.

- [x] **PH1-03 — Restore the shared scroll-to-top control**
  - **Result:** `js/modules/scroll.js` synchronizes visibility, `hidden`, `aria-hidden` and keyboard reachability, with reduced-motion-aware activation.
  - **Verification:** Current source and `scripts/qa-scroll-to-top-e2e.mjs` inspected; shared markup, threshold/keyboard and reduced-motion scenario passes are recorded in the archived daily audit.

## Phase 2 — Workflow contract alignment

**Goal:** Keep developer-facing QA descriptions aligned with executable commands.

- [x] **PH2-01 — Synchronize the documented QA command with package scripts**
  - **Result:** The original command-alignment correction is retained; the canonical guide is now `docs/settings.md`.
  - **Verification:** Its current `qa`, `qa:fast` and `test:e2e` command descriptions match `package.json`. The archived daily audit records the original command comparison; no application execution is needed to establish this documentation contract.

- [ ] **PH2-02 — Correct the README's regression and image-verification descriptions**
  - [ ] Update both language sections of `README.md`: `test:e2e` currently runs eight focused scripts, including mobile navigation and theme coverage, rather than the documented six.
  - [ ] Describe `img:verify` using `scripts/img-verify.mjs`: referenced raster decoding/format checks, optimized-to-original dimensions and width-descriptor validation, rather than directory existence and file counting alone.
  - **Source:** `README.md` command tables, `package.json`, `scripts/img-verify.mjs` and `docs/settings.md`.
  - **Completion condition:** Both README sections accurately describe the existing commands and their limits, without implying that available tests passed or that density descriptors are pixel-width checks. Verify by direct script/document comparison and a Markdown diff review.

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

- [ ] **PH5-01 — Restore mobile primary navigation without JavaScript** — **Priority:** High
  - [ ] In canonical header/fallback CSS, explicitly reveal the top-level navigation list below 940 px when `no-js` remains; provide wrapping or stacking that fits narrow screens while keeping submenu destinations reachable.
  - [ ] Verify the fallback markers on all eight page shells, including `404.html` and `offline.html`, whose bodies currently lack `no-js`. Preserve their existing page classes and the JavaScript-enhanced layout.
  - [ ] Extend `scripts/qa-nojs-e2e.mjs` beyond its default desktop viewport to cover mobile link visibility and keyboard activation on the homepage and shared shells, with no horizontal page overflow.
  - **Source:** `daily-AUDIT.md` — P1-01; `css/layout/header.css`, `css/components/utilities.css`, root HTML and `scripts/qa-nojs-e2e.mjs`.
  - **Completion condition:** At a narrow mobile viewport with JavaScript disabled, primary links are visible, focusable and navigable; with JavaScript enabled, the mobile drawer and desktop navigation retain their intended behavior. Run the affected CSS/HTML checks and focused no-JavaScript regression.

- [ ] **PH5-02 — Align the drawer lifecycle with the desktop layout boundary**
  - [ ] Reproduce opening at 939 px and resizing to 940 px; align `js/modules/nav.js` with the CSS desktop boundary and clear open state when entering desktop layout.
  - [ ] Ensure desktop entry releases scroll locking and the Tab handler, synchronizes toggle/drawer/overlay state, and leaves focus on an available control.
  - [ ] Replace the existing regression assertion that preserves the 939/940 px discrepancy. Cover an opening at 939 px, crossing to 940 px, returning to mobile and reopening, alongside existing keyboard/dismissal cases.
  - [ ] Update the corresponding boundary description in `docs/settings.md` after verification.
  - **Source:** `daily-AUDIT.md` — P2-02; `js/modules/nav.js`, `css/layout/header.css`, `css/components/utilities.css` and `scripts/qa-mobile-nav-e2e.mjs`.
  - **Completion condition:** JavaScript and CSS agree on the desktop transition, and a drawer hidden by desktop layout leaves no scroll lock or keyboard containment. Run `npm run test:e2e:mobile-nav` and the affected JS/CSS checks; do not preserve an assertion of the known mismatch.

- [ ] **PH5-03 — Point each mobile navigation toggle at the controlled drawer**
  - [ ] Correct the shared toggle relationship across all eight root HTML pages to identify the actual `#mobile-drawer`, preserving existing IDs and test hooks.
  - [ ] Align the initializer's fallback relationship in `js/modules/nav.js` and extend the mobile navigation regression to assert that the controlled element is the region whose expanded/hidden state changes.
  - **Source:** `daily-AUDIT.md` — P2-04; root header markup and `initMobileNav()` in `js/modules/nav.js`.
  - **Completion condition:** Every toggle's `aria-controls` resolves to its mobile drawer and remains consistent with `aria-expanded`, `aria-hidden` and `hidden`. Verify all page shells statically, then run HTML validation and the focused mobile navigation regression.

## Phase 6 — Resilient interaction enhancements

**Goal:** Restore intended enhancements while preserving usable native and current-page behavior.

- [ ] **PH6-01 — Keep theme and notice interactions usable when persistence fails**
  - [ ] Guard storage access in `js/modules/theme.js` and `js/modules/demo-legal.js`, including reads during initialization and system-theme changes; keep the existing keys `theme` and `demoLegalAccepted`.
  - [ ] Apply theme changes and close an accepted notice even when storage writes fail. Retain the current-page theme choice in memory so later system preference changes do not override it; retain the first-visit notice behavior when acceptance cannot persist.
  - [ ] Extend `scripts/qa-theme-e2e.mjs` and `scripts/qa-demo-legal-e2e.mjs` with independently denied reads and writes, checking theme/ARIA synchronization, notice dismissal, released inertness and focus restoration. Preserve normal persistence and system-preference scenarios.
  - **Source:** `daily-AUDIT.md` — P2-01; both runtime modules and their focused E2E scripts.
  - **Completion condition:** Denied storage produces no uncaught interaction error, theme selection works for the current page, and acceptance dismisses the notice with usable background content. Run the two focused regressions and `npm run lint:js`; cross-page persistence remains conditional on available storage.

- [ ] **PH6-02 — Restore the menu detail-panel enhancement contract**
  - [ ] Match initialization to the actual `main.page-menu` root in `menu.html`, rather than the nonexistent `body.page-menu`; keep detail-panel handling scoped to that page.
  - [ ] Ensure opening a native `.dish-more` panel delivers the event needed to close another open panel; retain Escape and outside-click dismissal and native `<details>` use without JavaScript.
  - [ ] Add a focused regression using the existing browser-testing runtime for opening a second panel, Escape and outside-click dismissal; expose it through the existing E2E convention and keep `docs/settings.md`, `docs/ARCHITECTURE_MAP.md` and README coverage descriptions accurate.
  - **Source:** `daily-AUDIT.md` — P2-03; `menu.html`, `js/modules/page-menu.js` and the architecture map's menu-detail entry.
  - **Completion condition:** The real menu page initializes the enhancement, only one panel remains open, dismissal works, and filtering/lightbox hooks and native fallback remain usable. Run the new focused regression and affected JS/HTML checks; verify event delivery rather than relying on the guard fix alone.

## Optional future improvements

- [ ] **O-01 — Restore Polish diacritics in the offline status panel** — **Priority:** Optional
  - **Value:** Correct the visible heading, explanation and return-link spelling in `offline.html`, currently including `Jestes offline`, `polaczenia` and `Wroc na strone glowna`.
  - **Scope boundary:** Non-blocking copy correction; preserve the panel structure, `/` destination, `noindex`, absent JSON-LD and Service Worker fallback contract.
  - **Completion condition:** The three strings use correct Polish spelling. Verify the source diff, run the existing HTML/text checks and inspect the panel at mobile and desktop widths; no new test framework is needed.

## Verification scope and execution order

- This plan is based on static inspection of current sources, configuration, scripts, documentation and audit findings. Source-visible mobile layout/storage risks have not been reproduced in a browser during this review; the menu-root and controlled-region mismatches are directly present in source.
- Historical completion evidence is retained explicitly, rather than presented as a fresh test run. No new build, browser suite, Lighthouse measurement, deployment, form-provider or assistive-technology verification is claimed.
- Execute the current navigation priorities first, followed by the independent interaction corrections. `PH2-02` is independent; if `PH6-02` adds another E2E entry, reconcile its final README counts with that change. Reuse the existing npm commands and browser runtime; no dependency or framework change is required by these tasks.
- Perform each item's focused verification before checking it off. Update related current audit status only when findings are resolved and that documentation is within the approved implementation scope; keep archived records historical. No current task requires an external decision, and no blocked or deliberately deferred implementation item has been established.
