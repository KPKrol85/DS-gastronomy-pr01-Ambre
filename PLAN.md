# Ambre — Development Plan

**Last reviewed:** 2026-08-22
**Project type:** Static multi-page front-end (HTML, CSS, Vanilla JavaScript)
**Plan status:** Active

## Planning principles

- The plan reflects the current verified repository state.
- Main items are checked only after their required behavior and focused verification are complete.
- Canonical HTML, CSS, JavaScript, and build sources own implementation changes; generated minified assets are refreshed only through the project workflow.
- Significant completed changes are recorded separately in `CHANGELOG.md`.

## Current priorities

No active items.

## Phase 1 — Public interaction correctness

**Goal:** Remove current user-facing defects in form feedback, modal keyboard behavior, and shared navigation controls.

- [x] **PH1-01 — Confirm reservation delivery only after an accepted response** — **Priority:** High
  - [x] preserve the existing required-field validation, phone formatting, honeypot handling, Netlify-compatible POST format, and native submission fallback.
  - [x] treat non-successful HTTP responses as delivery failures rather than displaying the confirmation message or clearing entered values.
  - [x] communicate the failure in the existing accessible status area and restore the submit control to a usable state.
  - [x] add focused regression coverage for accepted, rejected, and network-failure submission paths using the existing browser-testing runtime.
  - **Source:** `daily-AUDIT.md` — [P1-01].
  - **Completion condition:** the success message and form reset occur only after an accepted response; rejected and failed requests keep the user’s data and expose a recoverable failure state.

- [x] **PH1-02 — Constrain keyboard focus within the initial information dialog** — **Priority:** High
  - [x] preserve the current first-visit display rule, acceptance persistence, and Escape dismissal behavior.
  - [x] keep Tab and Shift+Tab within the visible dialog while it is open and ensure background content cannot receive focus or pointer interaction.
  - [x] retain a logical post-close focus state without changing the dialog’s informational purpose.
  - [x] add focused browser verification for initial focus, forward and reverse Tab traversal, and Escape dismissal.
  - **Source:** `daily-AUDIT.md` — [P1-02].
  - **Completion condition:** the dialog’s rendered and ARIA modal states match its keyboard behavior, and background controls are unreachable until dismissal.

- [x] **PH1-03 — Restore the shared scroll-to-top control** — **Priority:** High
  - [x] establish one visibility state that synchronizes rendered visibility, keyboard reachability, and accessibility attributes after the scroll threshold.
  - [x] apply the same state contract to every page that exposes the shared control.
  - [x] preserve reduced-motion behavior when returning to the top of the page.
  - [x] verify threshold visibility and keyboard activation on a representative page, then confirm the shared markup contract across the remaining pages.
  - **Source:** `daily-AUDIT.md` — [P1-03].
  - **Completion condition:** the control becomes visible and operable after the threshold on all six intended pages and remains absent from keyboard navigation while hidden.

## Phase 2 — Workflow contract alignment

**Goal:** Keep developer-facing QA documentation synchronized with the executable project workflow.

- [x] **PH2-01 — Synchronize the documented QA command with package scripts** — **Priority:** Medium
  - [x] update the `qa` command description in `doc/settings.md` to include the schema-policy, no-JavaScript, and text-lint stages present in `package.json`.
  - [x] preserve the existing descriptions of individual checks unless the executable command contradicts them.
  - [x] compare the final documented command with `package.json` without running commands that rewrite generated output.
  - **Source:** `daily-AUDIT.md` — [P2-01].
  - **Completion condition:** the documented `qa` workflow accurately represents the current executable command and its validation scope.

## Phase 3 — Developer workflow maintenance

**Goal:** Keep the established build and quality capabilities behind a clear, non-redundant npm interface.

- [x] **PH3-01 — Standardize the npm script taxonomy** — **Priority:** Maintenance
  - [x] use `build`, `lint:*`, `qa:*`, `test:e2e:*`, `csp:*`, and `img:*` consistently.
  - [x] provide separate fast and comprehensive QA entry points without duplicating expensive checks.
  - [x] preserve the three focused browser regressions under one deterministic `test:e2e` aggregate.
  - [x] remove only the dependency proven to have no current repository consumer and synchronize the lockfile.
  - [x] update README, developer settings, changelog, plan, and audit maintenance notes without rewriting PH1 or PH2 history.
  - **Source:** User-directed developer-experience maintenance on 2026-08-22; not an earlier audit finding.
  - **Completion condition:** documented commands match `package.json`, retained capabilities have clear owners, and focused workflow verification is executed with any pre-existing project failures reported separately.
