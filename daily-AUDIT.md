# Daily Front-End Audit — Ambre

**Audit date:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Audit mode:** Static repository review with focused browser verification

## Overall assessment

The repository has a clear static-site architecture, modular client-side behavior, a defined production build contract, and targeted quality scripts. No critical blocker was detected. The reservation delivery, initial-dialog keyboard, and shared scroll-to-top defects recorded as P1-01 through P1-03 have been resolved and covered by focused browser verification. The P2 QA-documentation alignment item has also been resolved; no active audit finding remains. This closure reflects the documented tasks and does not represent a new comprehensive audit.

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
- **Focused verification:** `npm run qa:reservation` passed 4/4 browser scenarios: accepted HTTP response, rejected HTTP response, network failure, and native fallback without `fetch`.

### [P1-02] Initial information dialog contains keyboard focus

- **Status:** Resolved on 2026-08-22 by PH1-02.
- **Evidence:** `js/modules/demo-legal.js`; `scripts/qa-demo-legal-e2e.mjs`.
- **Implemented behavior:** Initial focus remains on the dialog panel; Tab and Shift+Tab cycle through only its available controls, including the single-control case. Direct body siblings are temporarily made inert so background focus and pointer interaction are unavailable, and their prior inert state is restored on close. Escape still dismisses without recording acceptance, the acceptance button still persists `demoLegalAccepted="true"`, and automatic dismissal moves focus without scrolling to the existing main content target.
- **Focused verification:** `npm run qa:demo-legal` passed 2/2 browser scenarios covering initial focus, forward and reverse wraparound, single-control traversal, background focus and pointer isolation, Escape dismissal and focus placement, acceptance persistence, and persisted first-visit suppression after reload.

### [P1-03] Shared scroll-to-top control synchronizes its interaction state

- **Status:** Resolved on 2026-08-22 by PH1-03.
- **Evidence:** `js/modules/scroll.js`; `css/components/buttons.css`; `scripts/qa-scroll-to-top-e2e.mjs`.
- **Implemented behavior:** One shared state updater retains the existing `> 300` threshold and synchronizes the `is-visible` class, `hidden`, `aria-hidden`, and `tabindex` on the native button. The hidden state is not rendered or focusable; the visible state is fixed within the viewport, exposed to assistive technology, and uses native button keyboard activation. Scroll-to-top still requests smooth behavior by default and automatic behavior when reduced motion is preferred.
- **Focused verification:** `npm run qa:scroll-to-top` passed 3/3 scenarios covering the initial hidden/non-focusable state, threshold visibility, native keyboard focus and Enter activation, return to the hidden state at the threshold, reduced-motion behavior, and the shared default-markup contract across all six intended pages.

### [P2-01] QA workflow documentation matches the executable script

- **Status:** Resolved on 2026-08-22 by PH2-01.
- **Evidence:** `doc/settings.md`; `package.json`.
- **Implemented change:** The documented `qa` command now matches the executable chain exactly and describes its schema-policy, no-JavaScript, and text-lint stages alongside the existing checks.
- **Focused verification:** Compared the complete documented command directly with `scripts.qa` from `package.json`; every stage is present once and in the executable order.

## P1 — Important issues worth fixing next

None active.

## P2 — Minor refinements

None active.

## Extra quality improvements

None detected.

## Verification performed

- Inspected the current HTML page shell, form markup, CSS source imports and interaction states, JavaScript modules, Service Worker, manifest, hosting rules, build script, QA scripts, README, and architecture documentation.
- Inspected the Git worktree before creating this audit; no pre-existing tracked-file changes were reported.
- Ran `node scripts/qa-links.mjs` successfully: `QA LINKS: PASS`.
- Ran `npm run qa:reservation` successfully: `QA RESERVATION E2E: PASS (4/4)` for accepted, HTTP-rejected, network-failure, and native-fallback paths.
- Ran `npm run qa:demo-legal` successfully: `QA DEMO LEGAL E2E: PASS (2/2 scenarios)` for keyboard-modal behavior and acceptance persistence.
- Ran `npm run qa:scroll-to-top` successfully: `QA SCROLL TO TOP E2E: PASS (3/3 scenarios)` for the shared markup contract, threshold visibility and keyboard activation, return-to-hidden behavior, and reduced-motion activation.
- Ran `npm run qa:js`, `npm run qa:css`, and `npm run qa:html` successfully after the PH1-03 implementation.
- Compared the documented `qa` command directly with `scripts.qa` from `package.json`; all ten stages match exactly in content and order.
- Did not perform assistive-technology, production-hosting, real form-provider, deployment, Lighthouse, PWA, or broad regression verification.

## Senior rating

**Rating:** 8/10

The project has a coherent source/build boundary, useful static QA coverage, and several deliberately accessible interaction patterns. The current rating remains limited by verification that does not include production hosting or real assistive technology. Resolving P2-01 did not trigger a rating reassessment. The rating does not represent a production or accessibility-conformance certification.
