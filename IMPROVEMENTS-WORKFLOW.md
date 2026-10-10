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

- **Affected workflow:** Maintaining tracked optimized image assets.
- **Evidence:** `scripts/optimize-images.mjs:5-19`, `scripts/optimize-images.mjs:21-54`, `scripts/optimize-images.mjs:67-114`; `package.json:35-39`; `docs/settings.md:75-81`; `scripts/build-dist.mjs:45`, `scripts/build-dist.mjs:170-175`; `.gitignore:72-75`. Read-only `git ls-files assets/img/_optimized` identified 126 tracked outputs.
- **Current workflow:** The optimizer recursively selects all JPEG/PNG sources under `assets/img`, allows format selection, and skips outputs using source/destination modification times. Its arguments do not select an individual source or force regeneration. `img:clean` removes the entire optimized directory; the build copies existing assets without generating replacements.
- **Proposed improvement:** Extend the existing optimizer with an optional source-file selector and an explicit regeneration override for that selection. Retain the current all-source, timestamp-based behavior when no selector or override is supplied.
- **Expected practical value:** Allow a maintainer to refresh one image's existing variants without deleting every tracked optimized asset or depending on timestamps to schedule that regeneration. This is a scoped maintenance capability, not a claim that current output is stale.
- **Implementation scope:** Limit changes to argument handling and work selection in `scripts/optimize-images.mjs`, plus its usage guidance in `docs/settings.md`. Preserve source ownership, output paths and names, encoder settings, format switches, concurrency and error reporting. Accept only supported source files inside `assets/img` and outside `_optimized`; do not change HTML, resize policy, build automation, asset tracking or dependencies.
- **Acceptance criteria:** A selected source regenerates only its requested WebP/AVIF outputs, including when they are newer than the source and explicit regeneration is requested; unrelated output bytes and modification times remain unchanged. Invalid or out-of-root selections fail before writes and never fall back to processing the whole tree. Existing no-argument and format-only behavior is preserved. Verify these conditions with temporary fixtures outside maintained assets; no full clean is required for selective regeneration.
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
