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

- **Affected area:** CSS/JavaScript bundle destinations and reference rewriting in `scripts/build-dist.mjs`.
- **Evidence:** HTML replacements at `scripts/build-dist.mjs:85-98`, CSS paths at `scripts/build-dist.mjs:100-115`, JavaScript paths at `scripts/build-dist.mjs:118-134`, and Service Worker replacements at `scripts/build-dist.mjs:137-150`; precache inputs at `sw.js:12-25`.
- **Current implementation:** The same two source-to-production relationships are separately written in bundle path construction, copied-HTML replacements, and Service Worker replacements. Existing checks also repeat the associated path literals. This is working packaging logic, with multiple declarations of one asset naming contract.
- **Proposed improvement:** Introduce one small asset mapping inside the existing build script and derive the relevant bundle paths, reference replacements, and associated checks from it. Keep HTML and Service Worker replacement rules specific to their respective syntax.
- **Expected engineering value:** A bundle naming change would have one source of truth shared by asset production and its consumers, reducing the number of independently maintained path pairs.
- **Implementation scope:** Only `scripts/build-dist.mjs`; two fixed CSS/JavaScript mappings, without a generic build framework. Preserve page lists, copy lists, PostCSS/esbuild options, replacement coverage, validation behavior, and source-only asset safeguards. Do not change canonical HTML, `sw.js`, output names, caching policy, or npm/CI commands.
- **Acceptance criteria:** Both asset pairs are declared once and consumed by bundle creation and both rewriting paths. A subsequent authorized `npm run build` still packages all eight pages, emits `css/style.min.css` and `js/script.min.js`, and rewrites copied HTML and Service Worker references to those same files. Existing source-minified-asset, unprocessed-import, and source-reference safeguards remain effective; canonical source files remain unchanged by the build. Generated output is never edited by hand.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Resolve lightbox display and preload variants through one helper

- **Affected area:** Image URL derivation inside `js/modules/lightbox.js`.
- **Evidence:** Existing URL/path helpers at `js/modules/lightbox.js:29-54`, displayed-image derivation at `js/modules/lightbox.js:72-85`, and preload derivation at `js/modules/lightbox.js:262-278`; extensionless dish inputs at `menu.html:209-223` and JPEG gallery inputs at `galeria.html:208-223`.
- **Current implementation:** URL normalization, extension stripping, and optimized-directory handling already have shared local helpers. `setImage()` and `preload()` nevertheless repeat the final base/optimized-base calculation and JPEG/WebP/AVIF URL assembly.
- **Proposed improvement:** Add one local image-variant resolver returning the existing JPEG, WebP, and AVIF addresses, then use that result for both image display and adjacent-image preloading.
- **Expected engineering value:** The displayed and preloaded variants would share the complete filename policy, rather than maintaining its final step twice.
- **Implementation scope:** Only the URL-derivation portions of `lightbox.js`; keep the resolver in this module. Preserve trigger source precedence, alt text, visible-group selection, gallery/single modes, preload order, dialog lifecycle, document-state restoration, swipe/fullscreen behavior, and `window.openLB`/`window.closeLB`. Do not alter asset names, formats, or image generation.
- **Acceptance criteria:** Display and preload paths use the same resolver and produce the previous addresses for current extensionless dish paths and JPEG gallery links, including the existing query/fragment stripping and optimized-directory deduplication behavior. Empty input retains its current no-op behavior. Gallery navigation and single-dish previews retain their image sources, counters, focus return, and close behavior; the existing focused lightbox regression remains passing after implementation. No reduction in requests or loading time is claimed.
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
