# Ambre — UX Improvements

**Analysis date:** 2026-10-17
**Completion date:** 2026-10-18
**Status:** COMPLETED — 5/5 improvements implemented and verified
**Project:** Ambre — static eight-page fine-dining restaurant demo
**Scope:** Project-wide UX, accessibility and progressive enhancement

## Overview

Five UX improvements were implemented within the existing HTML, modular CSS and Vanilla JavaScript architecture. The changes address mobile navigation state, reservation validation, legal-document anchors, lightbox accessibility and native hero navigation.

All five tasks were completed without new dependencies, architectural changes or modifications to generated assets.

## Completed improvements

### IMP-UX-01 — Synchronize mobile drawer navigation state

- **Status:** COMPLETED — implemented and verified.
- **Result:** Synchronized drawer `href` and `aria-current` with the resolved header navigation whenever the drawer opens. Preserved submenu behavior, focus management, Escape, overlay and responsive styling without rebuilding the DOM.
- **Verification:** Mobile navigation E2E 3/3 PASS; ESLint and `git diff --check` PASS. Chromium at 390 px confirmed destinations, active page/section states and visual highlighting.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-02 — Enforce reservation date and time constraints

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added accessible hints and field-specific validation for reservations Tuesday–Sunday, 17:00–22:00 in 15-minute intervals, from the visitor's local today through 90 days ahead (inclusive). Invalid requests are blocked while existing submission, recovery and no-JavaScript behavior remain intact.
- **Verification:** Reservation E2E 17/17 PASS; no-JS QA, HTML, CSP, text lint, ESLint and `git diff --check` PASS. Chromium at 390/1440 px confirmed no horizontal overflow.
- **Limitation:** Without JavaScript, date boundaries remain static and Mondays cannot be excluded natively. No server-side validation or availability enforcement.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-03 — Fix legal-document anchor offsets

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `scroll-margin-top: calc(var(--header-h, 64px) + 12px)` to `.legal__doc h2` in `css/pages/legal.css`. All three legal documents now position anchored headings below the fixed header without changing HTML, JavaScript or existing scrolling behavior.
- **Verification:** CSS lint, HTML QA and `git diff --check` PASS. Chromium confirmed all 40 anchors at 320/390/1440 px, in both themes and header states. Headings landed 10.5–11.5 px below the normal header and 18.5–19.5 px below the shrunk header. Homepage, skip-link and footer anchor offsets remained unchanged.
- **Limitation:** Browser verification used instant scrolling; animated transitions were not observed because the hidden browser pane suspended `requestAnimationFrame`.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Synchronize lightbox accessibility with active mode

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended `applyMode()` to synchronize the dialog title and guidance with `gallery` / `single` and `canNavigate()`. Navigable galleries announce arrow-key navigation and Escape; isolated galleries and dish previews announce Escape only. Standardized `aria-labelledby="lb-title"` and `#lb-help` descriptions across `index.html`, `menu.html` and `galeria.html`. Existing navigation, counter, focus, swipe, fullscreen and document restoration remain unchanged.
- **Verification:** Lightbox E2E 13/13 PASS, including cross-page naming and single-item gallery scenarios; accessibility QA 14 scans across 8 pages PASS. HTML validation, text lint, CSP, focused ESLint and `git diff --check` PASS.
- **Limitation:** Accessible names and descriptions were verified through DOM/ARIA references, not the platform accessibility tree or a screen reader.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Convert hero actions to native in-page links

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced the hero buttons with native links to `#rezerwacja` and `#menu`. Removed `data-target` from both controls, retaining existing CSS-based smooth scrolling, reduced-motion behavior and header offsets. Preserved classes and accessible labels; pinned CTA typography in `css/components/hero.css` using `font-size: calc(1rem / 1.2)` for visual parity. `initScrollTargets()` remains unchanged and finds no triggers.
- **Verification:** HTML QA, links QA, CSS lint, text lint and `git diff --check` PASS; scroll-to-top E2E 3/3 PASS. Focused Chromium checks confirmed link semantics, working navigation without JavaScript, no double scrolling, reduced-motion jumps and visual parity at 320/390/1440 px.
- **Impact:** Medium
- **Effort:** Small

## Excluded candidate

A sixth improvement — reporting matching-item counts after menu and gallery filtering — was considered but excluded.

`scripts/qa-gallery-status-e2e.mjs` explicitly verifies the existing completed status text. Changing it would alter a protected interaction contract and requires a separate decision.

## Observations outside scope

The original analysis identified two additional issues that were intentionally excluded:

1. **Mobile navigation without JavaScript:** Below 940 px, the header navigation is hidden while `.no-js` rules also hide the drawer toggle. Footer navigation remains available. This was identified through CSS inspection but not verified at runtime.
2. **Offline-page content:** Visible text in `offline.html` lacks Polish diacritics, representing a content-quality issue rather than a UX interaction improvement.

Neither observation was addressed by this improvement series.

## Verification limitations

Implementation checks were performed locally, primarily in Chromium. Coverage varied by task and included focused E2E tests, accessibility scans, HTML/CSS/JavaScript checks and responsive browser inspections.

No cross-browser verification, manual screen-reader testing, touch-device testing or deployed-environment validation was reported. Individual task limitations are recorded above.

Impact and effort ratings are relative engineering estimates, not measured user outcomes.

## Final status

**COMPLETED — 5/5 UX improvements.**

All approved improvements were implemented and verified within their documented scope. The report is closed and archived.
