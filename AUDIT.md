# Ambre — Final Technical Front-End Audit

**Audit date:** 2026-08-27  
**Project type:** Static multi-page restaurant portfolio/demo built with HTML, modular CSS, Vanilla JavaScript, PWA mechanisms, and a Netlify-oriented production build  
**Audit mode:** Final repository and implementation review  
**Current readiness:** Needs important fixes

## 1. Executive summary

Ambre has a strong static-site foundation: its source/build boundary is explicit, core features are modular, the configured fast QA suite passes, the focused interaction tests pass, the no-JavaScript navigation baseline works, and the deployed site provides a functional custom 404 and offline navigation fallback. Responsive navigation, gallery filtering, lightbox focus return, and the first-visit legal modal were also exercised successfully in Chromium.

The project is not yet ready for an unqualified final release. One P1 finding remains: the development toolchain contains current high-severity advisories. Four P2 findings affect audit coverage, lightbox state restoration, gallery polish, and current documentation accuracy.

No P0 blocker was confirmed. Current finding count: **0 P0, 1 P1, 4 P2, 0 optional improvements**.

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
- `npm run qa:fast` — passed: ESLint, Stylelint, text lint, validation of eight HTML pages, internal-link checks, SEO policy, schema policy, and six CSP hashes.
- `npm run img:verify` — passed for 126 optimized image files.
- `npm ls --depth=0` — passed; the installed direct dependency graph is internally resolved.
- `npm audit --json` — completed against the current registry and reported 33 development-tool findings: 22 high, 6 moderate, 5 low, and 0 critical.
- `npm audit --omit=dev --json` — passed with 0 production dependency findings; the delivered site has no npm runtime dependency graph.
- `npm run test:e2e` — passed all 13 configured scenarios: four reservation outcomes, two legal-modal scenarios, three scroll-to-top scenarios, and four legal-table page/viewport scenarios at 320 px and 390 px.
- `npm run qa:nojs` — passed after an environment-only Chromium `spawn EPERM` on the sandboxed attempt; the exact command was rerun outside that launch restriction.
- `npm run qa:a11y` — passed its configured eight-page axe scan after the same environment-only Chromium launch restriction was bypassed. A separate scope comparison confirmed that this command scans the first-visit modal state rather than the complete page state; see P2-01.
- Supplementary Chromium checks covered all eight live pages at 390 × 844 and 1440 × 1000, mobile-drawer keyboard behavior, gallery filters, lightbox opening/closing and focus return, custom 404 status, Service Worker control and cache activation, and an uncached offline navigation.
- A separate live axe scan after accepting the legal modal reported no automated violations on any of the eight pages. This is automated browser evidence, not assistive-technology verification.
- A no-JavaScript form probe confirmed that native constraint validation blocks an invalid empty submission and that a completed valid form can still initiate the intended native POST; the valid request was intercepted before data left the browser.
- Targeted source searches covered unsafe DOM sinks, external `_blank` links, hard-coded secret patterns, stale markers, absolute public URLs, form constraints, cache deletion, and current-vs-historical Lighthouse claims. No P0 issue was found by those searches.

### Limitations

- `npm run build`, `npm run qa:lighthouse`, and the aggregate `npm run qa` were not executed because they create `dist/` and Lighthouse artifacts, which would violate the explicit single-file modification boundary for this task. The build script and Lighthouse configuration were inspected statically, but no current build or performance score is claimed.
- Live checks are supplementary. The supplied deployment may not be byte-for-byte identical to the audited detached commit, and no deployment action or revision comparison was performed.
- Browser execution used Chromium only. Firefox, WebKit, mobile operating systems, browser zoom/reflow, reduced-data behavior, and installation through a real PWA prompt were not verified.
- No real reservation was delivered to or inspected in Netlify Forms. Accepted, rejected, network-failure, native-fallback, and no-JavaScript request behavior was tested locally or intercepted, so backend delivery and stored-data handling remain outside the verified scope.
- axe and DOM inspection do not replace keyboard testing across every control, screen-reader testing, cognitive review, or a manual contrast assessment of every visual state.
- The review is not a penetration test, legal opinion, privacy certification, or production performance certification.

## 3. Confirmed strengths

1. **Clear source/build boundary.** `scripts/build-dist.mjs` produces an ignored production directory from source HTML/CSS/JS, applies minification and path rewrites, copies static assets, and adjusts Service Worker asset paths rather than treating generated files as authoring sources.
2. **Broad fast QA contract.** `package.json:7-25` composes linting, eight-page HTML validation, links, SEO, structured-data policy, and CSP-hash verification. The complete `qa:fast` command passed on the audited checkout.
3. **Feature isolation and focused regressions.** `js/script.js` initializes independent modules through guarded feature boundaries. Reservation outcomes, legal-modal behavior, scroll-to-top behavior, and responsive legal-table containment all passed their configured end-to-end scenarios.
4. **Good interaction mechanics in checked states.** The mobile drawer exposed the correct expanded state, trapped interaction in the open drawer, closed on Escape, and restored focus. The lightbox used a native dialog, focused its close control, loaded the selected image, and returned focus to the triggering gallery item.
5. **Working progressive navigation baseline.** The configured no-JavaScript suite passed navigation, reservation-section discovery, required-control presence, blocked invalid submission, intercepted valid native submission, and legal-link traversal.
6. **Functional offline and error fallbacks.** The deployed Service Worker controlled the application, an uncached offline navigation reached the dedicated offline page at the requested URL, and an unknown route returned the custom page with HTTP 404 rather than a soft 200.
7. **Strong static security baseline.** The CSP hash check passed for six inline blocks, live responses carried a CSP, external new-tab links consistently used `noopener noreferrer`, and targeted source inspection did not reveal a confirmed exposed secret or unsafe user-controlled HTML sink.
8. **Disciplined media pipeline.** Responsive AVIF/WebP/JPEG sources are present and `npm run img:verify` passed for all 126 optimized files.
9. **Explicit demo and ownership disclosure.** Visible modal, terms content, and machine-readable data identify Ambre as a demonstration, operator social controls point to the declared KP_Code profiles, and the proprietary `LICENSE` is aligned with `package.json`.

## 4. P0 — Critical blockers

None detected.

## 5. P1 — Important before release

### P1-01 — The development toolchain contains unresolved high-severity advisories

**Classification:** Source-visible risk  
**Affected area:** Dependency security, local build tooling, CI, image processing, and release verification  
**Evidence:** `package.json:27-42` declares the build and QA toolchain. On 2026-08-27, `npm audit --json` reported 33 findings in the development graph: 22 high, 6 moderate, 5 low, and 0 critical. Direct installed packages include `postcss@8.5.6`, affected by current file-disclosure/path-traversal advisories, and `sharp@0.33.5`, affected by inherited libvips advisories; `@lhci/cli@0.13.0` also carries a vulnerable transitive graph. `npm audit --omit=dev --json` reported 0 production findings.  
**Current behavior:** The shipped static site has no npm runtime dependencies, but repository-controlled tooling processes CSS, images, build inputs, browser artifacts, and Lighthouse data with versions that the current advisory registry marks as vulnerable.  
**Impact:** Exposure is concentrated in developer and CI environments, not in browser runtime. Malicious or untrusted build inputs could nevertheless affect confidentiality, integrity, or availability of a developer machine or release pipeline, and a green functional suite does not resolve these advisories.  
**Recommended direction:** Triage the current advisory paths and make the smallest supported direct-package updates that remove applicable high-severity findings. Review `postcss`, `sharp`, and the Lighthouse CI chain separately; do not rely on the registry's suggested `@lhci/cli@0.1.0` downgrade or use a forced bulk remediation without validating the tool contract.  
**Verification criteria:** A fresh full `npm audit` has no unresolved high or critical findings, or each remaining finding has a written applicability decision and compensating control; `npm ls --depth=0`, the production build, `qa:fast`, browser suites, image verification, and Lighthouse collection still pass with unchanged intended thresholds.

## 6. P2 — Minor refinements

### P2-01 — The configured axe gate scans the modal-dominated state instead of the full pages

**Classification:** Contract mismatch  
**Affected area:** Accessibility QA, regression confidence, and state coverage  
**Evidence:** `scripts/qa-a11y.mjs:92-111` opens each page and immediately calls `AxeBuilder.analyze()` without accepting or closing the first-visit legal modal. `js/modules/demo-legal.js:33-49` makes every other body child inert while that modal is open. On the live home page, the current state produced 30 passing axe rules across 106 pass nodes; pre-accepting the modal produced 50 passing rules across 1,034 pass nodes. Both states reported zero violations, and a supplementary accepted-state scan of all eight pages also reported zero violations.  
**Current behavior:** The command is green, but most underlying content is excluded from the accessibility tree during its configured scan, so the result does not prove that the full pages were covered.  
**Impact:** Future regressions in the main navigation, form, menu, gallery, legal content, or footer can escape the release gate while the modal itself continues to pass.  
**Recommended direction:** Scan the modal-open state and the accepted/full-page state explicitly, with an assertion that the intended inert state is active before each scan. Add key interactive states only where they materially change semantics.  
**Verification criteria:** The QA output identifies each scanned state, asserts modal/inert preconditions, covers the full underlying DOM after acceptance on all eight pages, and fails when a seeded violation is introduced outside the modal.

### P2-02 — Closing the gallery lightbox does not restore the document's inline scroll behavior

**Classification:** Defect  
**Affected area:** Gallery interaction, global document state, and subsequent anchor navigation  
**Evidence:** `js/modules/lightbox.js:151-158` sets `document.documentElement.style.scrollBehavior = "auto"` while opening the lightbox. The close path at `js/modules/lightbox.js:178-209` restores body position, top, width, scroll offset, and focus, but never restores the prior root value. Runtime observation showed an empty inline value before opening and `auto` after closing.  
**Current behavior:** One lightbox use leaves a page-global inline override in place for the rest of the session.  
**Impact:** Subsequent anchor or scripted scrolling can lose the site's intended smooth-scroll behavior. The defect is recoverable on reload and does not prevent gallery use.  
**Recommended direction:** Capture the previous root inline `scrollBehavior` alongside the other saved styles and restore it in every close path, including exceptional/dialog-close paths.  
**Verification criteria:** Open and close the lightbox from multiple gallery items; the exact prior root inline value is restored, focus and scroll position remain correct, and later in-page navigation follows the intended motion preference.

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

**Needs important fixes.** The site is functionally mature and no catastrophic blocker was found, but the release cannot be described as final while high-severity development-tool advisories remain unresolved.

After the remaining P1 item is resolved, the full production build and three-run/eight-URL Lighthouse contract should be executed in a verification context that permits generated artifacts. The P2 items should then be closed or explicitly accepted with evidence. Final sign-off should preserve the existing CSP, custom 404 status, offline fallback, form-host integration, and intentional noindex semantics of utility pages.

## 9. Final quality rating

**6/10**

The implementation demonstrates solid engineering discipline, good static QA, focused browser coverage, and a functioning PWA baseline. The rating remains held below release-ready territory by the unresolved high-severity development-toolchain advisories. The absence of a current production build and Lighthouse run also limits confidence in final performance readiness, without being counted as a defect by itself.
