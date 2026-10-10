# Ambre — Technical Improvements

**Analysis date:** 2026-10-09
**Project type:** Static, eight-page demonstration website using HTML, modular CSS, and Vanilla JavaScript ES modules; PostCSS/esbuild production packaging and browser PWA mechanisms.
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Improvement overview

Root HTML owns content, `css/style.css` assembles styles, and `js/script.js` initializes feature modules through individual error boundaries. `scripts/build-dist.mjs` owns production bundles, copied HTML, and the rewritten Service Worker in generated `dist/`. Menu and gallery data remain in HTML; theme and demonstration-notice preferences use localStorage.

The main opportunities are small consolidations of existing responsibilities: category matching, category-control styling, production asset paths, image variant resolution, and drawer focus discovery. These proposals preserve public behavior and the current stack. They do not assert runtime defects or measured performance gains.

No existing technical improvement report or active plan was found. The completed plan and audits in `docs/archive/`, together with `docs/CHANGELOG.md`, were consulted to exclude previously completed work. The proposals below are candidates for separate approval, not approved implementation tasks.

## Proposed improvements

### IMP-TECH-01 — Share normalized category matching across existing filters

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extracted shared category normalization and matching into `js/modules/category-match.js`, reused across three filtering paths in `tabs.js` and `load-more.js`. Preserved existing filtering, loading states, ARIA behavior, and menu load-more exact matching.
- **Verification:** JavaScript lint passed; 3,885 matching comparisons and 18 edge cases passed. Focused gallery browser tests passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-02 — Give category-tab styling one shared component owner

- **Status:** COMPLETED — implemented and verified.
- **Result:** Consolidated shared menu and gallery category-tab styles in `css/components/tabs.css`. Preserved feature-specific spacing, resets, cascade, focus, hover, pressed states, responsive sizing, themes, and reduced-motion behavior.
- **Verification:** CSS lint and `git diff --check` passed. Focused Chromium comparison passed 576/576 checks with zero pixel differences. Earlier intermittent focus-outline rendering variation was also observed in baseline CSS.
- **Impact:** Medium
- **Effort:** Medium

### IMP-TECH-03 — Define source-to-production asset paths once in the build

- **Status:** COMPLETED — implemented and verified.
- **Result:** Defined one `assetPaths` mapping with CSS/JavaScript `source` and `production` paths in `scripts/build-dist.mjs`, reused for bundles, HTML and Service Worker replacements, asset-path safeguards, and output directories. Preserved filenames, replacement coverage, validation behavior, copy lists, build options, and execution order.
- **Verification:** `npm run lint:js`, `npm run build`, and `git diff --check` passed. All 235 production files were byte-identical to the pre-refactor build, including eight HTML pages, both bundles, and the rewritten Service Worker; canonical application sources remained unchanged. All 28 in-memory comparisons against the original script passed, covering existing safeguards, replacement semantics, error messages, build options, and execution order without modifying source fixtures. Build emitted an existing Browserslist data-age warning; browser and broader QA suites were not run.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Resolve lightbox display and preload variants through one helper

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added local `resolveImageVariants()` in `js/modules/lightbox.js`, shared by `setImage()` and `preload()` for JPEG, WebP, and AVIF URLs. Preserved normalization, extension/query/fragment stripping, optimized-directory deduplication, empty-input no-ops, optional elements, alt text, and WebP → AVIF → JPEG preload order; trigger selection, gallery/single modes, navigation, counters, dialog/focus/document-state handling, swipe, zoom/fullscreen, and public APIs remain unchanged.
- **Verification:** `npm run lint:js`, `npm run test:e2e:lightbox` (11/11 scenarios), and `git diff --check` passed. All 5544 in-memory comparisons of the original and refactored display/preload operations passed across 42 inputs (including 15 current HTML references) and three page URLs, covering supported extensions, extensionless paths, optimized/repeated-optimized directories, query strings/fragments, empty/missing values, optional elements, alt text, preload guards, `Image()` creation count, and variant order; 36 additional comparisons with distinct images confirmed adjacent selection and index wrapping. Installed existing locked dependencies without changing manifests; E2E passed using the existing browser cache outside the sandbox after missing-dependency/browser-path and localhost-access failures. Swipe and zoom/fullscreen were not separately exercised; full QA, production build, and performance measurements were not run.
- **Impact:** Low
- **Effort:** Small

### IMP-TECH-05 — Reuse the existing focus-discovery helper in the mobile drawer

- **Affected area:** Focus candidate collection in `js/modules/nav.js`.
- **Evidence:** Shared helper at `js/modules/utils.js:21-30`; equivalent local collection at `js/modules/nav.js:63-70`, consumed by Tab handling at `js/modules/nav.js:72-95` and opening focus at `js/modules/nav.js:97-110`.
- **Current implementation:** `utils.js` exports `getFocusable(root)`, while the mobile navigation repeats its selector, hidden/ARIA exclusions, DOM ordering, and missing-root result. The shared export has no current importing consumer. The demonstration modal intentionally uses a different, stricter discovery policy.
- **Proposed improvement:** Import the existing helper into `nav.js` and use it with the drawer root for the two current collection sites, removing the equivalent local implementation.
- **Expected engineering value:** The existing drawer-compatible discovery rule would have one maintained definition and a concrete consumer, without adding another focus abstraction.
- **Implementation scope:** Only the helper import and candidate collection in `nav.js`; retain the helper's semantics. Preserve drawer cloning, submenu behavior, breakpoint handling, open-state guards, Tab/Shift+Tab wrapping, outside-focus handling, Escape, ARIA, listener lifecycle, and focus return. Leave demonstration-modal discovery and native-dialog lightbox behavior unchanged.
- **Acceptance criteria:** Both drawer collection sites use `getFocusable(drawer)` and return the same ordered candidates, including an empty array without a drawer. A focused mobile check confirms unchanged initial focus, boundary wrapping, native interior Tab traversal, Escape dismissal, and return to the opener. Desktop transition and the closed-drawer keyboard path retain their existing behavior.
- **Impact:** Low
- **Effort:** Small

## Selection summary

These five proposals consolidate responsibilities that already exist and have identifiable consumers. Category interpretation, CSS control styling, build asset mapping, lightbox filename policy, and drawer focus discovery are distinct objectives; no proposal depends on another being completed first. The JavaScript helper changes can be implemented independently, and the CSS and build changes each remain within their own source layer.

The set is suitable for consideration as a focused development-day candidate backlog: four Small changes and one Medium change, subject to the stated behavior checks. Impact and effort are relative judgments, not measured gains or completion guarantees. Wider template extraction, page-registry/QA reorganization, new dependencies, and new UI behavior were not selected because they would broaden this scope or belong primarily to another improvement category.

## Analysis limitations

- Analysis used current canonical sources, module consumers, configuration, relevant test source, README, architecture/settings documentation, changelog, and archived plan/audits. Historical passing results were not treated as verification of this checkout.
- No application validation, browser test, production build, deployment check, performance measurement, or dependency audit was run. The opportunities are source-supported; future implementations still require the acceptance checks above. Existing test inspection does not establish complete coverage of CSS equivalence, image URL variants, or mobile-drawer behavior.
- Current HTML contains no `[data-load-more]` button, so its shipped initialization uses the all-items-loaded path. The existing stepwise loading implementation remains a contract to preserve, not evidence of a currently exposed pagination interaction.
- No improvement was implemented. Only this report was created; generated output, application sources, other documentation, dependencies, and repository delivery state were left unchanged.
