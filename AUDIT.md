# Ambre — Final Technical Front-End Audit

**Audit date:** 2026-08-27  
**Project type:** Static multi-page restaurant portfolio/demo built with HTML, modular CSS, Vanilla JavaScript, PWA mechanisms, and a Netlify-oriented production build  
**Audit mode:** Final repository and implementation review  
**Current readiness:** Release-ready with minor refinements outstanding

## 1. Executive summary

Ambre has a strong static-site foundation: its source/build boundary is explicit, core features are modular, the configured fast QA suite passes, the focused interaction tests pass, the no-JavaScript navigation baseline works, and the deployed site provides a functional custom 404 and offline navigation fallback. Responsive navigation, gallery filtering, lightbox focus return, and the first-visit legal modal were also exercised successfully in Chromium.

The previously open P1 development-toolchain finding has been remediated. `postcss`, `sharp`, and `@lhci/cli` were updated to current supported releases, the full development audit fell from 22 high findings to 7 while keeping 0 critical findings, and the production dependency audit remains at 0 vulnerabilities. The remaining high rows are development-only, reduce to an upstream-unpatched `extract-zip` path and legacy `tmp` paths inside the current supported `@lhci/cli` chain, and are accepted with a written applicability decision rather than removed by a forced downgrade or an unsupported override; see the residual dependency-risk decision in section 2. Three P2 findings affect audit coverage, gallery polish, and current documentation accuracy.

No P0 blocker was confirmed and no P1 finding remains open. Current finding count: **0 P0, 0 P1, 3 P2, 0 optional improvements**.

## 2. Audit scope and verification

### Areas reviewed

- Repository identity, current documentation, archived audit context, license, and Git state.
- All eight HTML entry pages, shared and page-specific CSS, JavaScript bootstrap and feature modules, structured data, metadata, navigation, forms, gallery, legal content, and public identity claims.
- PWA manifest, Service Worker install/activate/fetch behavior, offline page, cache lifecycle, custom 404 routing, Netlify headers, redirects, and CSP hash contract.
- Build script, production-path rewrites, image pipeline, package graph, CI workflow, Lighthouse configuration, and repository QA scripts.
- Accessibility semantics, focus behavior, keyboard interaction, no-JavaScript behavior, responsive layout, horizontal overflow, and automated axe coverage.
- Supplied live deployment behavior at `https://gastronomy-pr01-ambre.netlify.app/`, used as supplementary runtime evidence rather than as proof that the deployment is identical to the audited commit.

### Verification performed

- Confirmed a clean initial worktree at detached commit `394e820f873b33ec8c8d6eba7a745de7d9a1b720` before creating this report.
- `npm run qa:fast` — passed on the audited checkout: ESLint, Stylelint, text lint, validation of eight HTML pages, internal-link checks, SEO policy, schema policy, and six CSP hashes. On the post-remediation rerun the Stylelint, text-lint, HTML-validation, internal-link, SEO, schema, and CSP stages passed unchanged, while the ESLint stage could not report from the worktree checkout for the environment reason recorded under Limitations; ESLint passed for the same sources and the same dependency graph at an unaffected path. `qa:fast` is therefore not claimed as an unconditional pass in that environment.
- `npm run img:verify` — passed for 126 optimized image files.
- `npm ls --depth=0` — passed; the installed direct dependency graph is internally resolved.
- `npm audit --json` — reported 33 development-tool findings before remediation (22 high, 6 moderate, 5 low, 0 critical) and 10 after it (7 high, 1 moderate, 2 low, 0 critical).
- `npm audit --omit=dev --json` — passed with 0 production dependency findings both before and after remediation; the delivered site has no npm runtime dependency graph.
- `npm run test:e2e` — passed all 19 configured scenarios: four reservation outcomes, two legal-modal scenarios, three scroll-to-top scenarios, four legal-table page/viewport scenarios at 320 px and 390 px, and six lightbox document-state scenarios. The six lightbox scenarios were added with the P2-02 remediation and passed on the post-remediation rerun of the aggregate.
- `npm run qa:nojs` — passed after an environment-only Chromium `spawn EPERM` on the sandboxed attempt; the exact command was rerun outside that launch restriction.
- `npm run qa:a11y` — passed its configured eight-page axe scan after the same environment-only Chromium launch restriction was bypassed. A separate scope comparison confirmed that this command scans the first-visit modal state rather than the complete page state; see P2-01.
- `npm run build` — passed after the toolchain update; the production `dist/` output was generated from source with the updated PostCSS and esbuild path.
- `npm run qa:lighthouse` — executed with the existing `lighthouserc.json`, its eight URLs, three runs per URL, and unchanged category thresholds. The first execution failed one assertion: `offline.html` Performance returned a median of 0.74 against the 0.85 threshold, across runs of 0.72, 0.99, and 0.74. The failing runs showed first-contentful-paint near 3,440 ms against 1,549 ms in the passing run on identical content, with total blocking time at 0, and `404.html` showed the same bimodal pattern; the cause was host contention rather than a scoring or content change. A clean rerun on an unloaded host passed with status 0, with `offline.html` and `404.html` at 0.99 in all three runs and every configured page meeting its threshold. No threshold, URL, run count, or assertion was modified, and the intentional utility-page `noindex` result remained a warning as configured.
- Supplementary Chromium checks covered all eight live pages at 390 × 844 and 1440 × 1000, mobile-drawer keyboard behavior, gallery filters, lightbox opening/closing and focus return, custom 404 status, Service Worker control and cache activation, and an uncached offline navigation.
- A separate live axe scan after accepting the legal modal reported no automated violations on any of the eight pages. This is automated browser evidence, not assistive-technology verification.
- A no-JavaScript form probe confirmed that native constraint validation blocks an invalid empty submission and that a completed valid form can still initiate the intended native POST; the valid request was intercepted before data left the browser.
- Targeted source searches covered unsafe DOM sinks, external `_blank` links, hard-coded secret patterns, stale markers, absolute public URLs, form constraints, cache deletion, and current-vs-historical Lighthouse claims. No P0 issue was found by those searches.

### Residual dependency-risk decision

- Seven high `npm audit` rows remain in the development graph after remediation.
- They reduce to two upstream root advisories: the unpatched `extract-zip` path and the legacy `tmp` paths reached through the current supported `@lhci/cli` chain. The other remaining rows are ancestors of those two paths rather than independently vulnerable packages.
- No patched `extract-zip` release exists at any published version, and the current supported `@lhci/cli` still declares the legacy `tmp` ranges, so neither path can be closed by a supported update.
- The affected paths are development-only. `npm audit --omit=dev` remains at 0 vulnerabilities and the delivered site has no npm runtime dependency graph.
- The `extract-zip` browser-download and archive-extraction path was not exercised by Ambre's verified workflow; the local browser cache was unchanged across both Lighthouse executions.
- The `tmp` consumer is tied to the `lhci open` command, while Ambre's Lighthouse contract uses `lhci autorun`, which invokes only its healthcheck, collect, assert, and upload stages.
- The committed lockfile and `npm ci` pin the verified dependency graph for local and CI use.
- These advisories are accepted as residual on the applicability reasoning above. They are not patched and not eliminated, and they were not suppressed; the registry's suggested `@lhci/cli` downgrade and an unsupported transitive override were both rejected as unsafe for the Lighthouse contract.

### Limitations

- The aggregate `npm run qa` was not executed as a single command. Its constituent stages were run individually, including the production build and the Lighthouse collection that were unavailable at the original audit date; the first Lighthouse execution and its clean rerun are both recorded under Verification performed.
- The ESLint stage of `qa:fast` cannot report results from a worktree checked out beneath a dot-directory such as `.claude/worktrees/`. The project's `.eslintrc.cjs` sets no `root: true`, so ESLint also resolves the parent checkout's configuration, shifts its ignore base path to that parent, and then treats every worktree source path as an ignored dot-path. A controlled comparison reproduced the behavior with both the previous and the current `minimatch` versions and confirmed that the same sources and dependency graph lint cleanly at an unaffected path. This is an environment limitation of dot-path worktrees, not a lint failure and not a dependency regression, and it does not affect CI, which checks out at an ordinary path.
- Live checks are supplementary. The supplied deployment may not be byte-for-byte identical to the audited detached commit, and no deployment action or revision comparison was performed.
- Browser execution used Chromium only. Firefox, WebKit, mobile operating systems, browser zoom/reflow, reduced-data behavior, and installation through a real PWA prompt were not verified.
- No real reservation was delivered to or inspected in Netlify Forms. Accepted, rejected, network-failure, native-fallback, and no-JavaScript request behavior was tested locally or intercepted, so backend delivery and stored-data handling remain outside the verified scope.
- axe and DOM inspection do not replace keyboard testing across every control, screen-reader testing, cognitive review, or a manual contrast assessment of every visual state.
- The review is not a penetration test, legal opinion, privacy certification, or production performance certification.

## 3. Confirmed strengths

1. **Clear source/build boundary.** `scripts/build-dist.mjs` produces an ignored production directory from source HTML/CSS/JS, applies minification and path rewrites, copies static assets, and adjusts Service Worker asset paths rather than treating generated files as authoring sources.
2. **Broad fast QA contract.** `package.json:7-25` composes linting, eight-page HTML validation, links, SEO, structured-data policy, and CSP-hash verification. The complete `qa:fast` command passed on the audited checkout.
3. **Feature isolation and focused regressions.** `js/script.js` initializes independent modules through guarded feature boundaries. Reservation outcomes, legal-modal behavior, scroll-to-top behavior, responsive legal-table containment, and lightbox document-state restoration all passed their configured end-to-end scenarios.
4. **Good interaction mechanics in checked states.** The mobile drawer exposed the correct expanded state, trapped interaction in the open drawer, closed on Escape, and restored focus. The lightbox used a native dialog, focused its close control, loaded the selected image, and returned focus to the triggering gallery item.
5. **Working progressive navigation baseline.** The configured no-JavaScript suite passed navigation, reservation-section discovery, required-control presence, blocked invalid submission, intercepted valid native submission, and legal-link traversal.
6. **Functional offline and error fallbacks.** The deployed Service Worker controlled the application, an uncached offline navigation reached the dedicated offline page at the requested URL, and an unknown route returned the custom page with HTTP 404 rather than a soft 200.
7. **Strong static security baseline.** The CSP hash check passed for six inline blocks, live responses carried a CSP, external new-tab links consistently used `noopener noreferrer`, and targeted source inspection did not reveal a confirmed exposed secret or unsafe user-controlled HTML sink.
8. **Disciplined media pipeline.** Responsive AVIF/WebP/JPEG sources are present and `npm run img:verify` passed for all 126 optimized files.
9. **Explicit demo and ownership disclosure.** Visible modal, terms content, and machine-readable data identify Ambre as a demonstration, operator social controls point to the declared KP_Code profiles, and the proprietary `LICENSE` is aligned with `package.json`.

## 4. P0 — Critical blockers

None detected.

## 5. P1 — Important before release

None detected.

## 6. P2 — Minor refinements

### P2-01 — The configured axe gate scans the modal-dominated state instead of the full pages

**Classification:** Contract mismatch  
**Affected area:** Accessibility QA, regression confidence, and state coverage  
**Evidence:** `scripts/qa-a11y.mjs:92-111` opens each page and immediately calls `AxeBuilder.analyze()` without accepting or closing the first-visit legal modal. `js/modules/demo-legal.js:33-49` makes every other body child inert while that modal is open. On the live home page, the current state produced 30 passing axe rules across 106 pass nodes; pre-accepting the modal produced 50 passing rules across 1,034 pass nodes. Both states reported zero violations, and a supplementary accepted-state scan of all eight pages also reported zero violations.  
**Current behavior:** The command is green, but most underlying content is excluded from the accessibility tree during its configured scan, so the result does not prove that the full pages were covered.  
**Impact:** Future regressions in the main navigation, form, menu, gallery, legal content, or footer can escape the release gate while the modal itself continues to pass.  
**Recommended direction:** Scan the modal-open state and the accepted/full-page state explicitly, with an assertion that the intended inert state is active before each scan. Add key interactive states only where they materially change semantics.  
**Verification criteria:** The QA output identifies each scanned state, asserts modal/inert preconditions, covers the full underlying DOM after acceptance on all eight pages, and fails when a seeded violation is introduced outside the modal.

### P2-03 — The completed gallery status renders a stray `>` character

**Classification:** Defect  
**Affected area:** Gallery status UI, visual polish, and live-status announcements  
**Evidence:** `js/modules/load-more.js:5` contains an extra `>` immediately inside the status SVG string, before the first `<path>`. `js/modules/load-more.js:22` injects that string into the status region. The deployed gallery rendered the text content as `>Wszystko załadowane`.  
**Current behavior:** The completion status includes an unintended visible/text-node character before its icon and label.  
**Impact:** The UI looks unfinished and assistive output can include punctuation that has no semantic meaning.  
**Recommended direction:** Remove the stray character from the trusted SVG constant and keep the icon hidden from accessibility APIs while retaining the meaningful status text.  
**Verification criteria:** The rendered status text is exactly `Wszystko załadowane`, the icon remains decorative, and the gallery's filter/load behavior is unchanged.

### P2-04 — Current Lighthouse documentation describes the wrong run count

**Classification:** Documentation mismatch  
**Affected area:** Release documentation, audit duration expectations, and QA contract maintenance  
**Evidence:** `lighthouserc.json:16` currently sets `numberOfRuns` to 3 for eight configured URLs. `CHANGELOG.md:17` in the active Unreleased section says the production-path change preserved a “one-run contract.”  
**Current behavior:** Executable configuration requests 24 Lighthouse collections, while current release documentation describes eight. Historical archived one-run records remain valid as history and are not themselves defects.  
**Impact:** Maintainers can misestimate local/CI duration and misunderstand what current Lighthouse evidence represents.  
**Recommended direction:** Correct the active current-state documentation to match the intentional executable contract. If the run count itself is reconsidered, change it only as an explicit performance/coverage decision without weakening category thresholds or utility-page indexing semantics.  
**Verification criteria:** Current documentation and `lighthouserc.json` agree on URL count, run count, production-path collection, thresholds, and the special SEO treatment of offline/404 pages.

## 7. Extra quality improvements

None detected.

## 8. Production readiness assessment

**Release-ready with minor refinements outstanding.** No P0 or P1 finding remains open. The production build succeeds with the updated toolchain, the eight-URL three-run Lighthouse contract passes on a clean host with unchanged thresholds, the end-to-end, no-JavaScript, accessibility, and image-verification suites pass, and the production dependency audit is at 0 vulnerabilities. The remaining development-only advisories are recorded as an accepted residual with a written applicability decision rather than as an open blocker.

The three remaining P2 items should still be closed or explicitly accepted with evidence before final sign-off, and the residual `@lhci/cli` chain should be revisited when an upstream `extract-zip` fix, or a Lighthouse CI release that drops those paths, becomes available. Final sign-off should preserve the existing CSP, custom 404 status, offline fallback, form-host integration, and intentional noindex semantics of utility pages.

## 9. Final quality rating

**8/10**

Both conditions that held the previous 6/10 below release-ready territory no longer apply. The high-severity development-toolchain advisories that constituted the open P1 finding were remediated as far as upstream support allows, with the remainder accepted as a documented development-only residual, and the previously missing evidence now exists: the production build passes and the eight-URL, three-run Lighthouse contract passes on a clean host with its original thresholds, alongside passing end-to-end, no-JavaScript, accessibility, and image-verification suites and a zero-vulnerability production dependency audit.

The rating stops short of the 9-10 range because three P2 findings remain open, including a user-visible gallery status defect and an accessibility gate that scans the modal-dominated state rather than the full pages; because seven development-only high audit rows persist upstream and cannot yet be closed by a supported update; and because browser verification remains Chromium-only, with the environment limitations recorded in section 2.
