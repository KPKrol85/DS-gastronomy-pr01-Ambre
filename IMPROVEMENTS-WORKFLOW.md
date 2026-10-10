# Ambre — Workflow Improvements

**Analysis date:** 2026-10-10
**Project type:** Static, multi-page demonstration website using HTML, modular CSS and Vanilla JavaScript, with a Node.js/npm PostCSS and esbuild production pipeline.
**Analysis mode:** Evidence-based workflow improvement review
**Focus:** Project-wide workflow

## Improvement overview

Ambre already separates canonical sources from ignored production output, provides focused browser checks alongside fast and comprehensive QA, and uses a lockfile-based CI installation. `package.json` owns executable commands; `docs/settings.md` explains them, while the bilingual README provides the entry-level guide. The configured CI runs fast QA and builds `dist/`; it contains no deployment step.

Four bounded opportunities remain: make verification selection more explicit, expose the existing distribution server as a documented preview procedure, support selective image regeneration, and clarify ownership of failure screenshots. These proposals preserve the current tooling and hosting model. They are candidates for approval, not implementation commitments.

The completed plan and archived technical report were checked against current configuration. Script-taxonomy standardization, fast/full QA separation, production-path Lighthouse collection and the shared build asset mapping are already implemented and are not proposed again. No active workflow report or plan was present at the start of this review. Four proposals were selected because no fifth distinct opportunity met the same evidence and scope requirements without repeating existing work or expanding into defect correction or application-quality work.

## Proposed improvements

### IMP-WORKFLOW-01 — Document verification selection by change type

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a verification selection table for seven change types to `docs/settings.md` and clarified aggregate composition, removing the recommendation to run lint separately before `qa:fast`. Distinguished static and browser checks, HTML and Markdown links, the separate Service Worker test, and read-only CSP verification from authorized hash regeneration. Full QA and existing quality gates were preserved; README, npm commands, application code, tests and CI were unchanged.
- **Verification:** Confirmed that all 31 commands referenced in the guide exist, four aggregates and six executable command descriptions match `package.json`, and both README language sections link to the guide. Review of the documentation and relevant scripts confirmed check selection without redundant execution, exclusion of `qa:service-worker` from `qa`, and the distinction between CSP verification and file updates. `git diff --check` passed; changes were limited to the two authorized files and this improvement record. Application QA, builds, browser tests, Lighthouse and dependency installation were not run; verification covered documentation consistency, not application runtime results.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-02 — Document production preview using the existing server

- **Status:** COMPLETED — implemented and verified.
- **Result:** Documented the existing production-preview procedure in `docs/settings.md` with equivalent README PL/EN links, rebuild and shutdown instructions, the shared Lighthouse port, and local hosting/offline limits. Distinguished preview from `qa:server`; source ownership, tooling and application behavior were preserved.
- **Verification:** Static inspection confirmed consistency with current build, server, Lighthouse and Service Worker configuration. Local Markdown links and anchors, README PL/EN technical parity, and `git diff --check` passed. Builds, server execution, application QA, browser tests, Lighthouse and dependency installation were not run; verification covered documentation accuracy only.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Support selective image regeneration without cleaning all outputs

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added validated `--source <path>` selection and selection-only `--force`, compatible with WebP/AVIF switches. Preserved recursive defaults, timestamp skipping, output paths and names, encoder settings, concurrency and reporting; invalid selections fail before writes. Added concise Polish usage guidance and a changelog entry.
- **Verification:** An isolated Sharp 0.35.4 fixture exercise passed 42 checks across 44 optimizer runs, covering selection, forced regeneration, timestamps, formats, recursive defaults, invalid input and boundaries, Windows junction rejection, unchanged unrelated outputs and conversion errors. All 196 tracked image assets retained identical SHA-256, size and modification time. `npm run lint:js` and `git diff --check` passed using existing tooling. Native file symlink fixtures were unavailable on Windows (`EPERM`); other platforms and broad application QA were not tested.
  Follow-up CLI validation passed 32 isolated checks across 36 runs: unknown flags, positional arguments and duplicate `--force` failed without writes; valid selection, force, default and format-only commands remained compatible. All tracked image hashes/mtimes were unchanged; lint and diff checks passed.
- **Impact:** Medium
- **Effort:** Medium

### IMP-WORKFLOW-04 — Keep no-JavaScript failure screenshots outside tracked source

- **Affected workflow:** Git hygiene for local QA diagnostics.
- **Evidence:** `scripts/qa-nojs-e2e.mjs:10`, `scripts/qa-nojs-e2e.mjs:98-113`; `.gitignore:18-22`; `package.json:15`, `package.json:23`. Read-only Git inspection found no tracked files under `reports/nojs/` and no ignore rule matching a representative path there.
- **Current workflow:** On a failed no-JavaScript step, the script writes a screenshot under `reports/nojs/` and prints its path. Existing ignore rules cover `test-results/`, `playwright-report/` and `.lighthouseci/`, but do not classify this screenshot directory. No failure was induced during this review.
- **Proposed improvement:** Explicitly classify the existing no-JavaScript screenshots as disposable local diagnostics and ignore their exact output directory while keeping them available for inspection.
- **Expected practical value:** Keep failure evidence accessible without introducing unrelated generated images into routine Git status and source-review work.
- **Implementation scope:** Add a narrowly scoped rule for `/reports/nojs/` to `.gitignore` and explain its purpose alongside `qa:nojs` in `docs/settings.md`. Preserve the script's screenshot generation, filenames, printed paths and failure exit status. Do not ignore all `reports/`, delete evidence, move archived audits or add cleanup automation.
- **Acceptance criteria:** `git check-ignore` identifies the intended rule for a representative no-JavaScript screenshot path; the rule does not match other report directories or maintained assets. Existing failure capture and reporting remain unchanged, and locally generated screenshots remain readable. No tracked source or archived evidence is removed.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The proposals strengthen verification decisions, distribution inspection, asset maintenance and diagnostic-output ownership. All four can be implemented independently; none requires new dependencies, CI jobs, deployment changes or application refactoring. The verification guide can link to the preview and diagnostic procedures after those are approved, without making their implementation a prerequisite.

Three proposals are small documentation or ownership changes; selective image regeneration has a medium implementation scope and requires focused behavior verification. Together they form a bounded candidate backlog for focused development, potentially suitable for approximately one working day depending on implementation and verification conditions. Impact and effort are relative judgments, not measured gains or completion guarantees.

## Analysis limitations

- Analysis used current source, command implementations, configuration, documentation and read-only Git inspection. Builds, image generation, browser tests, Lighthouse and dependency installation were not run; configured capabilities are not reported as successful executions. In particular, the screenshot path was verified from its failure handler without creating a screenshot, and image output freshness was not assessed.
- Archived plans, audits and the completed technical report were used to exclude repeated work and respect recorded decisions. Their historical test results and deployment observations were not revalidated. Public deployment availability, hosting settings and form delivery were not inspected.
- No measurements of development time or actual frequency of these maintenance actions were available. Expected value follows from the inspected command responsibilities and manual steps rather than measured productivity savings.
