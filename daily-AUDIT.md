# Daily Front-End Audit — Ambre

**Audit date:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Audit mode:** Static repository review with focused browser verification

## Overall assessment

The repository has a clear static-site architecture, modular client-side behavior, a defined production build contract, and targeted quality scripts. No critical blocker was detected. The reservation delivery, initial-dialog keyboard, and shared scroll-to-top defects recorded as P1-01 through P1-03 have been resolved and covered by focused browser verification. Lighthouse Performance remediation is now verified across all eight configured pages. One active contract conflict remains: Lighthouse scores the intentional `noindex` directives on `offline.html` and `404.html` as `is-crawlable` failures, leaving both SEO scores at `0.93` against the unchanged `0.95` threshold. This update does not represent a new comprehensive audit or rating reassessment.

## Verified strengths

- Canonical CSS and JavaScript sources are separated from their minified page assets, and `scripts/build-dist.mjs` produces a dedicated distribution directory from those sources.
- `js/script.js` initializes independent features in isolation, so a failing optional module does not stop later initializers.
- The mobile navigation implements focus containment, Escape handling, and focus return in `js/modules/nav.js`; the lightbox uses a native dialog where supported.
- The initial project-information dialog contains forward and reverse keyboard traversal, makes background content inert while open, and moves focus to the main content after automatic dismissal.
- The reservation form reports success and resets its values only after an accepted HTTP response; rejected responses and network failures keep the entered data and expose a recoverable status message.
- The Service Worker defines explicit application-shell and image-cache strategies plus an offline fallback page.
- `node scripts/qa-links.mjs` passed for the eight declared HTML pages, including local files and anchors.

## P0 — Critical risks

None detected.

## Resolved findings

### [P1-01] Reservation form confirms only accepted delivery responses

- **Status:** Resolved on 2026-08-22 by PH1-01.
- **Evidence:** `js/modules/form.js`; `scripts/qa-reservation-e2e.mjs`.
- **Implemented behavior:** The form checks `response.ok` before displaying confirmation or resetting values. Resolved 4xx/5xx responses and network failures retain entered data, report a recoverable error through the existing status region, and restore the submit control. The native submission path remains available when `fetch` or `FormData` is unavailable.
- **Focused verification:** `npm run test:e2e:reservation` passed 4/4 browser scenarios: accepted HTTP response, rejected HTTP response, network failure, and native fallback without `fetch`.

### [P1-02] Initial information dialog contains keyboard focus

- **Status:** Resolved on 2026-08-22 by PH1-02.
- **Evidence:** `js/modules/demo-legal.js`; `scripts/qa-demo-legal-e2e.mjs`.
- **Implemented behavior:** Initial focus remains on the dialog panel; Tab and Shift+Tab cycle through only its available controls, including the single-control case. Direct body siblings are temporarily made inert so background focus and pointer interaction are unavailable, and their prior inert state is restored on close. Escape still dismisses without recording acceptance, the acceptance button still persists `demoLegalAccepted="true"`, and automatic dismissal moves focus without scrolling to the existing main content target.
- **Focused verification:** `npm run test:e2e:demo-legal` passed 2/2 browser scenarios covering initial focus, forward and reverse wraparound, single-control traversal, background focus and pointer isolation, Escape dismissal and focus placement, acceptance persistence, and persisted first-visit suppression after reload.

### [P1-03] Shared scroll-to-top control synchronizes its interaction state

- **Status:** Resolved on 2026-08-22 by PH1-03.
- **Evidence:** `js/modules/scroll.js`; `css/components/buttons.css`; `scripts/qa-scroll-to-top-e2e.mjs`.
- **Implemented behavior:** One shared state updater retains the existing `> 300` threshold and synchronizes the `is-visible` class, `hidden`, `aria-hidden`, and `tabindex` on the native button. The hidden state is not rendered or focusable; the visible state is fixed within the viewport, exposed to assistive technology, and uses native button keyboard activation. Scroll-to-top still requests smooth behavior by default and automatic behavior when reduced motion is preferred.
- **Focused verification:** `npm run test:e2e:scroll-to-top` passed 3/3 scenarios covering the initial hidden/non-focusable state, threshold visibility, native keyboard focus and Enter activation, return to the hidden state at the threshold, reduced-motion behavior, and the shared default-markup contract across all six intended pages.

### [P2-01] QA workflow documentation matches the executable script

- **Status:** Resolved on 2026-08-22 by PH2-01.
- **Evidence:** `doc/settings.md`; `package.json`.
- **Implemented change:** At PH2-01 completion, the documented `qa` command matched the then-current executable chain and described its schema-policy, no-JavaScript, and text-lint stages alongside the existing checks.
- **Focused verification:** At PH2-01 completion, the complete documented command was compared directly with `scripts.qa` from `package.json`; every then-current stage was present once and in executable order.

## Post-audit maintenance

### Lighthouse remediation follow-up

- **Status:** Performance resolved on 2026-08-22; SEO indexing-policy conflict remains active.
- **Baseline evidence:** Fresh `.lighthouseci/*.report.json` reports measured Performance at `0.61`, `0.60`, `0.62`, `0.62`, `0.62`, `0.60`, `0.66`, and `0.66` for `index`, `menu`, `galeria`, `cookies`, `polityka-prywatnosci`, `regulamin`, `offline`, and `404`. SEO was `0.86` on `offline` and `0.93` on `404`.
- **Shared root cause:** LHCI served canonical source files rather than the existing production output. Each page requested 23 render-blocking CSS files through `@import` and 16 local JavaScript modules; Lighthouse reported `1.50–3.64 s` potential render-blocking savings, while LCP render delay accounted for most of the `6.1–8.4 s` LCP values. TBT, CLS, server latency, modern formats, explicit image dimensions, and third-party usage on longer pages were not shared limiting causes.
- **Implemented path correction:** `lighthouserc.json` now runs the existing build before collection, `scripts/lhci-static-server.mjs` serves `dist/`, and textual responses use gzip when supported. The unchanged audit now receives one bundled stylesheet and one bundled application script; `uses-text-compression` passes.
- **Page-specific remediation:** `menu.html` no longer lazily loads its verified LCP thumbnail and defers its approximately `443 KB` Google Maps embed until explicit activation, with a no-JavaScript fallback link. Its verified final request total fell from 39 to 21 and transfer size from about 728 KB to 285 KB. `offline.html` now has the missing meta description and preloads the two first-render fonts used by its text LCP.
- **Verified final categories:** Performance/SEO were `0.94/1.00` (`index`), `0.92/1.00` (`menu`), `0.95/1.00` (`galeria`), `0.96/1.00` (`cookies`), `0.96/1.00` (`polityka-prywatnosci`), `0.96/1.00` (`regulamin`), `0.99/0.93` (`offline`), and `0.98/0.93` (`404`). Best Practices remained at or above its configured `0.90` threshold.
- **Remaining assertion evidence:** `offline.html` improved from SEO `0.86` to `0.93` after its missing description was added. Its only remaining weighted SEO failure is `is-crawlable`, identical to the sole failure on `404.html`; both pages intentionally declare `noindex`. Removing that directive, hiding it from the local audit, excluding the pages, or lowering the threshold would violate the requested indexing and quality-gate requirements.
- **Focused map verification:** A local Playwright check confirmed that `menu.html` exposes a Google Maps fallback link without JavaScript, sends zero map requests before activation with JavaScript, and reveals the same iframe after one user action.

### npm developer workflow taxonomy

- **Status:** Completed on 2026-08-22 as user-directed maintenance, not as a newly discovered audit finding.
- **Scope:** Consolidated redundant aliases into `build`, `lint:*`, `qa:*`, `test:e2e:*`, `csp:*`, and `img:*`; retained all focused browser regressions; separated `qa:fast` from comprehensive `qa`; and removed only the unused `postcss-cli` dependency.
- **Documentation:** Synchronized `README.md` and `doc/settings.md`; recorded the maintenance separately in `PLAN.md` and `CHANGELOG.md` without changing PH1 or PH2 completion history.
- **Passed verification:** `npm run build`, `npm run lint`, `npm run test:e2e` (9/9 focused scenarios), `npm run qa:nojs`, `npm run qa:a11y`, and `npm run qa:server`.
- **Existing quality-gate failures:** `npm run qa:fast` reached `qa:csp` and reported stale hashes in `_headers`; Lighthouse completed collection for all eight configured pages but missed the existing performance thresholds on every page and the SEO threshold on `offline.html` and `404.html`.
- **Not changed:** CSP hashes, Lighthouse thresholds, application code, generated `dist/`, and the existing project behavior were not altered to mask these failures. The aggregate `npm run qa` was not repeated because its components had been exercised separately and its CSP/Lighthouse failures were already confirmed.

## P1 — Important issues worth fixing next

### [P1-04] Global Lighthouse SEO assertion conflicts with intentional utility-page `noindex`

- **Status:** Active; blocked by incompatible current requirements rather than a missing page metadata fix.
- **Evidence:** Latest `.lighthouseci` JSON reports for `offline.html` and `404.html`; `meta[name="robots"]` in both source documents; `categories:seo >= 0.95` in `lighthouserc.json`.
- **Observed behavior:** Both pages score `0.93` because the weighted `is-crawlable` audit assigns zero to intentional `noindex`. `offline.html` has no other weighted SEO failure after its description fix; `404.html` never had another weighted SEO failure.
- **Safe resolution requirement:** Any future resolution must preserve truthful offline/404 semantics and intentional non-indexing without lowering the threshold, disabling the assertion, excluding either URL, or making the local audit diverge from the deployed indexing policy.

## P2 — Minor refinements

None active.

## Extra quality improvements

None detected.

## Verification performed

- Inspected the current HTML page shell, form markup, CSS source imports and interaction states, JavaScript modules, Service Worker, manifest, hosting rules, build script, QA scripts, README, and architecture documentation.
- Inspected the Git worktree before creating this audit; no pre-existing tracked-file changes were reported.
- Ran `node scripts/qa-links.mjs` successfully: `QA LINKS: PASS`.
- Ran the reservation E2E script successfully: `QA RESERVATION E2E: PASS (4/4)` for accepted, HTTP-rejected, network-failure, and native-fallback paths. Current entry point: `npm run test:e2e:reservation`.
- Ran the initial-dialog E2E script successfully: `QA DEMO LEGAL E2E: PASS (2/2 scenarios)` for keyboard-modal behavior and acceptance persistence. Current entry point: `npm run test:e2e:demo-legal`.
- Ran the scroll-to-top E2E script successfully: `QA SCROLL TO TOP E2E: PASS (3/3 scenarios)` for the shared markup contract, threshold visibility and keyboard activation, return-to-hidden behavior, and reduced-motion activation. Current entry point: `npm run test:e2e:scroll-to-top`.
- Ran the JavaScript, CSS, and HTML checks successfully after the PH1-03 implementation. Current entry points: `npm run lint:js`, `npm run lint:css`, and `npm run qa:html`.
- At PH2-01 completion, compared the then-current documented `qa` command directly with `scripts.qa` from `package.json`; all ten then-current stages matched exactly in content and order.
- During the original audit, did not perform assistive-technology, production-hosting, real form-provider, deployment, Lighthouse, PWA, or broad regression verification. The later workflow-maintenance run is recorded separately above.

## Senior rating

**Rating:** 8/10

The project has a coherent source/build boundary, useful static QA coverage, and several deliberately accessible interaction patterns. The current rating remains limited by verification that does not include production hosting or real assistive technology. Resolving P2-01 did not trigger a rating reassessment. The rating does not represent a production or accessibility-conformance certification.
