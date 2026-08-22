# Daily Front-End Audit — Ambre

**Audit date:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Audit mode:** Static repository review with focused browser verification

## Overall assessment

The repository has a clear static-site architecture, modular client-side behavior, a defined production build contract, and targeted quality scripts. No critical blocker was detected. The reservation delivery defect recorded as P1-01 has been resolved and covered by focused browser verification. Two P1 issues remain active: the initial information dialog does not confine keyboard focus, and the shared scroll-to-top control is permanently unavailable. Normal development can continue, but these interaction defects should be addressed before relying on the modal and shared navigation behavior in a public deployment.

## Verified strengths

- Canonical CSS and JavaScript sources are separated from their minified page assets, and `scripts/build-dist.mjs` produces a dedicated distribution directory from those sources.
- `js/script.js` initializes independent features in isolation, so a failing optional module does not stop later initializers.
- The mobile navigation implements focus containment, Escape handling, and focus return in `js/modules/nav.js`; the lightbox uses a native dialog where supported.
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

## P1 — Important issues worth fixing next

### [P1-02] Initial information dialog does not contain keyboard focus

- **Classification:** Defect
- **Evidence:** `js/modules/demo-legal.js:10-48`
- **Current behavior:** The initial overlay is exposed as `aria-modal="true"` and receives focus, but the implementation adds no focus trap and does not make page content outside the dialog inert. Escape closes the overlay, but Tab can move to interactive controls behind it.
- **Impact:** Keyboard users can leave a visually blocking dialog and reach obscured background controls, while assistive technologies are told that the dialog is modal.
- **Recommended direction:** Keep focus within the open dialog and prevent background content from being interactive until the dialog is closed, with focus restored to the originating control where applicable.

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
- Did not perform assistive-technology, production-hosting, real form-provider, deployment, Lighthouse, PWA, or broad regression verification.

## Senior rating

**Rating:** 7/10

The project has a coherent source/build boundary, useful static QA coverage, and several deliberately accessible interaction patterns. The current rating remains limited by two confirmed defects in public interactive behavior, including modal keyboard behavior and the unavailable shared scroll control. The rating does not represent a production or accessibility-conformance certification.
