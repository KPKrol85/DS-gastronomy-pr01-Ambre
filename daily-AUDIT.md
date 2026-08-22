# Daily Front-End Audit — Ambre

**Audit date:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Audit mode:** Static repository review

## Overall assessment

The repository has a clear static-site architecture, modular client-side behavior, a defined production build contract, and targeted quality scripts. No critical blocker was detected. Three P1 issues affect implemented public interactions: the reservation form can claim success after an HTTP error, the initial information dialog does not confine keyboard focus, and the shared scroll-to-top control is permanently unavailable. Normal development can continue, but these interaction defects should be addressed before relying on the form and modal behavior in a public deployment.

## Verified strengths

- Canonical CSS and JavaScript sources are separated from their minified page assets, and `scripts/build-dist.mjs` produces a dedicated distribution directory from those sources.
- `js/script.js` initializes independent features in isolation, so a failing optional module does not stop later initializers.
- The mobile navigation implements focus containment, Escape handling, and focus return in `js/modules/nav.js`; the lightbox uses a native dialog where supported.
- The Service Worker defines explicit application-shell and image-cache strategies plus an offline fallback page.
- `node scripts/qa-links.mjs` passed for the eight declared HTML pages, including local files and anchors.

## P0 — Critical risks

None detected.

## P1 — Important issues worth fixing next

### [P1-01] Reservation form treats every resolved HTTP response as success

- **Classification:** Defect
- **Evidence:** `js/modules/form.js:135-147`
- **Current behavior:** The form's `fetch()` chain displays the success message and resets the form in `.then()` without checking the response status. A rejected network request uses the fallback, but a resolved 4xx or 5xx response follows the success path.
- **Impact:** A visitor can be told that a reservation request was accepted even when the receiving endpoint rejected it, while their entered data has already been cleared.
- **Recommended direction:** Make the success state conditional on a successful HTTP response and retain the entered data when delivery is not confirmed.

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
- Did not run HTML validation, linters, accessibility automation, no-JavaScript browser checks, or Lighthouse CI because `node_modules` is not available locally. No dependencies were installed.
- Did not perform browser, assistive-technology, production-hosting, form-provider, or deployment verification.

## Senior rating

**Rating:** 7/10

The project has a coherent source/build boundary, useful static QA coverage, and several deliberately accessible interaction patterns. The current rating is limited by three confirmed defects in public interactive behavior, including one that can misrepresent reservation delivery and one that conflicts with modal keyboard behavior. The rating does not represent a production or accessibility-conformance certification.
