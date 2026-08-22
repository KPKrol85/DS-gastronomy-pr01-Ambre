# Daily Front-End Audit — Ambre

**Audit date:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Audit mode:** Static repository review with focused browser verification

## Overall assessment

The repository has a clear static-site architecture, modular client-side behavior, a defined production build contract, and targeted quality scripts. No critical blocker was detected. The reservation delivery defect recorded as P1-01 and the initial-dialog keyboard defect recorded as P1-02 have been resolved and covered by focused browser verification. One P1 issue remains active: the shared scroll-to-top control is permanently unavailable. Normal development can continue, but that shared navigation defect should be addressed before relying on the control in a public deployment.

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

## P1 — Important issues worth fixing next

### [P1-03] Shared scroll-to-top control remains permanently hidden

- **Classification:** Defect
- **Evidence:** `js/modules/scroll.js:35-42`; `index.html:894`
- **Current behavior:** Six public pages render the scroll-to-top button with `hidden`, `aria-hidden="true"`, and `tabindex="-1"`. The shared script only toggles an `is-visible` class; it never removes those attributes, and no source CSS rule exposes that class.
- **Impact:** The advertised control cannot be discovered, focused, or activated on any page that includes it.
- **Recommended direction:** Use one consistent visibility state that updates the rendered, keyboard, and accessibility states together when the scroll threshold is crossed.

## P2 — Minor refinements

### [P2-01] QA workflow documentation is stale relative to the executable script

- **Classification:** Maintenance risk
- **Evidence:** `doc/settings.md:57-60`; `package.json:27-39`
- **Current behavior:** `doc/settings.md` describes `qa` as a shorter chain than the current `package.json` script. It omits the schema-policy, no-JavaScript, and text-lint stages that the executable `qa` command now runs.
- **Impact:** Maintainers following the documentation can misunderstand the release-check scope or reproduce only part of the configured QA workflow.
- **Recommended direction:** Align the documented `qa` command and its description with the current package script.

## Extra quality improvements

None detected.

## Verification performed

- Inspected the current HTML page shell, form markup, CSS source imports and interaction states, JavaScript modules, Service Worker, manifest, hosting rules, build script, QA scripts, README, and architecture documentation.
- Inspected the Git worktree before creating this audit; no pre-existing tracked-file changes were reported.
- Ran `node scripts/qa-links.mjs` successfully: `QA LINKS: PASS`.
- Ran `npm run qa:reservation` successfully: `QA RESERVATION E2E: PASS (4/4)` for accepted, HTTP-rejected, network-failure, and native-fallback paths.
- Ran `npm run qa:demo-legal` successfully: `QA DEMO LEGAL E2E: PASS (2/2 scenarios)` for keyboard-modal behavior and acceptance persistence.
- Did not perform assistive-technology, production-hosting, real form-provider, deployment, Lighthouse, PWA, or broad regression verification.

## Senior rating

**Rating:** 7/10

The project has a coherent source/build boundary, useful static QA coverage, and several deliberately accessible interaction patterns. The current rating remains limited by the confirmed shared scroll-control defect and the stale QA workflow documentation. The rating does not represent a production or accessibility-conformance certification.
