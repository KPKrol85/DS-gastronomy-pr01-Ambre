# Ambre — Quality Improvements

**Analysis date:** 2026-10-10
**Project type:** Static eight-page restaurant portfolio/demo using HTML, modular CSS and Vanilla JavaScript, with a PostCSS/esbuild production build and PWA mechanisms.
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Improvement overview

Ambre already has project-specific static validators, six focused Playwright regression scripts, a no-JavaScript test, two-state axe checks, Lighthouse configuration and an isolated Service Worker activation check. The existing assertions protect submission outcomes, demo-dialog behavior, scrolling, legal tables, lightbox state restoration and gallery status/filtering. Their presence is implementation evidence, not a fresh passing result.

The five candidates below strengthen specific existing contracts through the current Node.js, Playwright and Sharp tooling. They extend assurance without changing public interactions, architecture, dependencies or CI. Canonical application sources are root HTML, `css/`, `js/` and `sw.js`; `scripts/build-dist.mjs` generates production HTML, bundles and the rewritten Service Worker in `dist/`.

The completed archived plan, technical/workflow reports and relevant audit/changelog records were checked for overlap. No active quality report or active plan was present. Historical implementation checks are not treated as current runtime verification. All entries are proposals requiring separate implementation approval.

## Proposed improvements

### IMP-QUALITY-01 — Protect reservation validation and correction before submission

- **Status:** COMPLETED — implemented and verified.
- **Result:** Expanded `scripts/qa-reservation-e2e.mjs` from four to nine isolated scenarios on the real initialized homepage. Invalid empty, short-phone and missing-consent submissions send zero POSTs, retain values and leave the submit button usable. Phone/consent correction clears custom validity, `aria-invalid` and Polish field errors; local, `+48` and `0048` phone representations normalize to `+48 123 456 789`. Each corrected submission sends exactly one intercepted POST with the full existing Netlify payload. Application behavior and all four delivery/fallback scenarios are preserved.
- **Verification:** `npm run test:e2e:reservation` passed (9/9, including the original four scenarios); `npm run lint:js` and `git diff --check` passed. Chromium required a run outside the sandbox for localhost access. Requests were intercepted locally; live Netlify delivery, the separate no-JavaScript test, other browser engines, builds and broader QA were not verified.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Retain a repeatable mobile-drawer keyboard regression

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `scripts/qa-mobile-nav-e2e.mjs` and `test:e2e:mobile-nav`, included in `test:e2e` and documented in `docs/settings.md`. Three isolated Chromium scenarios exercise the initialized homepage after accepting the demo dialog, with Service Workers blocked. At 390×844 they protect Enter activation, initial focus, visible/enabled control traversal and Tab/Shift+Tab wrapping, both submenus, synchronized body/hidden/ARIA states, Escape and overlay dismissal, focus return and four open/close cycles with trap release. Resizing through 938/939px checks automatic closing; 940px checks desktop presentation and keyboard traversal, including CSS-revealed submenu links. Application code, markup, CSS, dependencies and breakpoint definitions are preserved.
- **Verification:** `npm run test:e2e:mobile-nav` passed (3/3 scenarios); `npm run lint:js` and `git diff --check` passed, with an additional whitespace check of the new untracked script. The checkout lacks `node_modules`, so verification used existing primary-checkout dependencies through a temporary loader/PATH, without installation. Chromium required execution outside the sandbox for localhost access. The existing boundary difference was reproduced: at 939px JavaScript closes the drawer while CSS still shows the mobile toggle and hides desktop links; desktop presentation begins at 940px. No other application defect was confirmed. The full E2E aggregate, broader QA, Lighthouse, production build/deployment and other browser engines were not verified.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-03 — Exercise document fallbacks with the network unavailable

- **Affected area:** Service Worker document retrieval after network failure.
- **Evidence:** `sw.js:9-36`, `sw.js:75-99`; `scripts/qa-service-worker.mjs:93-134`, `scripts/qa-service-worker.mjs:136-179`; `js/sw-register.js:5-23`; `scripts/build-dist.mjs:142-156`.
- **Current implementation:** The source worker precaches documents and the offline page. Its navigation handler prefers the network and falls back to a cached request or `/offline.html` on a network exception. The isolated QA script registers `/sw.js` directly and asserts activation, cache ownership and offline-page cache presence, but does not navigate with the server unavailable. Ordinary localhost pages deliberately unregister workers. Production rewrites of CSS/JS paths are owned by the build script.
- **Proposed improvement:** Extend the existing isolated Service Worker test with cached-document and uncached-document navigation scenarios under actual network unavailability.
- **Expected quality value:** Protect response delivery through the fetch handler, beyond merely proving that a fallback file exists in Cache Storage.
- **Implementation scope:** Extend `scripts/qa-service-worker.mjs` using its fresh browser context and direct registration of canonical `sw.js`. Use isolated document fixtures that do not execute the localhost auto-unregistration script. Preserve activation assertions and cache policy. This source-worker regression does not require a build, generated-output edits, production-header emulation or update-lifecycle redesign.
- **Acceptance criteria:** Assert worker control and the required cached bodies before disconnecting. Stop the local server or otherwise prove network access unavailable, disable ordinary browser HTTP caching as a confounder, then navigate to one precached document and verify its expected body. Navigate to a unique uncached document path and verify the offline document body at that requested URL. A temporary test-only removal of the relevant cached responses must make the corresponding body assertion fail, demonstrating that the network/browser cache cannot satisfy it. Existing cache-preservation assertions remain passing, and browser/server cleanup runs on success and failure.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-04 — Verify decoded integrity of referenced image variants

- **Affected area:** Local responsive-image assets checked by `img:verify`.
- **Evidence:** `scripts/img-verify.mjs:4-35`; `scripts/qa-links.mjs:123-143`, `scripts/qa-links.mjs:153-185`; `scripts/optimize-images.mjs:148-162`; `index.html:187-199`; `package.json:35-39`, `package.json:50-53`.
- **Current implementation:** `img:verify` checks the optimized directory and counts entries; it does not decode images or validate their format/dimensions. It completed successfully in this analysis and reported 126 files. The link validator already checks local `src`/`srcset` target existence. HTML supplies AVIF/WebP alternatives and JPEG fallbacks; the generator converts source files without resizing them, and Sharp is already a development dependency.
- **Proposed improvement:** Strengthen the existing image verifier to check the decoded integrity and dimensions of raster variants referenced by canonical HTML.
- **Expected quality value:** Detect an existing-but-corrupt, incorrectly encoded or incorrectly sized referenced variant that a file count and existence check cannot identify. No loading-time or visual-quality gain is claimed.
- **Implementation scope:** Extend `scripts/img-verify.mjs` with read-only validation using existing Sharp. Deduplicate local raster URLs from the eight source pages, map optimized variants to their JPEG/PNG originals using the existing naming convention, and report actionable file/page diagnostics. Exclude remote resources and SVGs. Do not regenerate assets, change encoder settings or require unused sources to have every output format.
- **Acceptance criteria:** Referenced raster files decode successfully and AVIF/WebP content matches the declared format. Each optimized variant retains its corresponding original's intrinsic dimensions; width descriptors, where present, match the decoded candidate width. Density descriptors are not incorrectly interpreted as intrinsic widths. A current valid set exits zero; isolated corrupt-file, wrong-format and wrong-dimension fixtures each produce a nonzero result identifying the affected asset/reference. The check leaves assets and generated output unchanged and complements the existing link validator.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-05 — Protect system-theme and persisted-choice precedence

- **Affected area:** Theme state synchronization across preference changes, reloads and page navigation.
- **Evidence:** `js/modules/theme.js:3-41`; `index.html:155-173`; `package.json:27-33`; `scripts/qa-demo-legal-e2e.mjs:110`, background-control use of the theme toggle.
- **Current implementation:** The switcher initializes from the `theme` storage key or system preference, synchronizes `data-theme` and `aria-pressed`, persists explicit toggles and follows system changes when no choice is stored. The existing E2E scripts do not assert this preference/persistence sequence; the demo-dialog test uses the toggle as a background focus target rather than testing theme behavior.
- **Proposed improvement:** Add one focused browser regression for the precedence of system preference and an explicit saved theme.
- **Expected quality value:** Detect disagreement between displayed state, toggle accessibility state and the saved choice during ordinary multi-page use.
- **Implementation scope:** A small Playwright script with a focused npm entry, following existing browser-test conventions. Exercise real `index.html` and `menu.html` in one origin/context, accept the demo dialog and emulate system color preference. Preserve the two-state toggle, storage key, public labels and current system behavior. Storage-denial recovery, new settings UI and visual redesign are outside this proposal.
- **Acceptance criteria:** Fresh contexts without a saved theme initialize correctly under light and dark system preferences. Changing the emulated preference updates `data-theme` and `aria-pressed` while leaving `theme` unset. Keyboard activation persists the explicit next theme and synchronizes both DOM attributes. The saved choice survives reload and navigation to `menu.html`, takes precedence over subsequent system changes, and toggles back correctly. All assertions use the real initializer; runtime exceptions and mismatched state fail the check.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The selected candidates cover client validation, keyboard accessibility, offline retrieval, asset integrity and preference persistence. Each protects a concrete existing behavior rather than increasing test counts as an end in itself. They extend current assurance beyond delivery-outcome tests, historical drawer checks, cache-presence assertions and image counts.

All five can be implemented independently. IMP-QUALITY-01 and IMP-QUALITY-03 extend existing focused scripts; IMP-QUALITY-04 strengthens an existing validator; IMP-QUALITY-02 and IMP-QUALITY-05 follow the existing browser-test convention. Completed category matching, shared tab CSS, build-path consolidation, lightbox helpers, drawer helper reuse and workflow guidance are not proposed again. Broader CI automation, dependency remediation and already completed audit fixes are excluded.

The set is a candidate backlog for a focused development day, with Small/Medium relative scope. Browser fixture work and image parsing may affect actual effort; no completion time is guaranteed. Approval and implementation remain separate from discovery.

## Analysis limitations

- This was static inspection of canonical sources, executable configuration, test assertions, project documentation and relevant archived records. Historical passes and deployment observations were not rerun or independently confirmed.
- The only application validation executed was `npm run img:verify`: exit 0, 126 entries reported. Its present directory/count result does not establish decoding, variant integrity or responsive selection correctness.
- No build, browser test, broad QA suite, Lighthouse measurement, public deployment check or real form delivery was performed. Proposed runtime acceptance criteria are future verification requirements, not current results. Cross-browser behavior, screen-reader behavior and formal accessibility/security compliance were not established.
- Offline analysis concerns the canonical source worker and isolated test contract. It does not establish offline completeness of the generated production bundles, cold-cache assets, hosting headers or installed-PWA behavior.
- No proposed improvement was implemented. Only `IMPROVEMENTS-QUALITY.md` was created; application sources, tests, configuration, dependencies and generated assets were left unchanged.
