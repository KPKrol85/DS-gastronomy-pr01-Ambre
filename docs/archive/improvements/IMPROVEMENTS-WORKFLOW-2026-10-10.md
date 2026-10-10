# Ambre — Workflow Improvements

**Analysis date:** 2026-10-10
**Completed:** 2026-10-10
**Status:** COMPLETED — all four selected improvements implemented and verified.
**Scope:** Project-wide development and maintenance workflow.

## Overview

Four workflow improvements were completed across Ambre, covering verification guidance, production preview, selective image regeneration and local QA diagnostics.

The changes improved development efficiency and maintenance safety while preserving existing application behavior, build architecture, quality gates and deployment configuration.

No new dependencies, npm commands or CI jobs were introduced.

## Completed improvements

### IMP-WORKFLOW-01 — Document verification selection by change type

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added verification guidance for seven change types in `docs/settings.md`. Clarified QA aggregates, focused checks, Service Worker testing and CSP maintenance without changing executable commands or quality gates.
- **Verification:** Confirmed 31 documented commands, aggregate definitions and README references against current configuration. `git diff --check` passed. Verification was documentation-only; application QA and browser tests were not run.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-02 — Document production preview using the existing server

- **Status:** COMPLETED — implemented and verified.
- **Result:** Documented production preview of `dist/` using the existing static server, including rebuild instructions, Lighthouse port conflicts and Netlify/offline limitations. Added concise Polish and English README references.
- **Verification:** Static inspection confirmed consistency with build, server, Lighthouse and Service Worker configuration. Markdown links, bilingual documentation and `git diff --check` passed. Server execution and browser tests were not performed.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Support selective image regeneration without cleaning all outputs

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added validated `--source <path>` selection and selection-only `--force` regeneration with WebP/AVIF compatibility. Preserved recursive defaults, timestamps, output paths, encoder settings and concurrency. Invalid arguments fail before processing.
- **Verification:** Isolated fixtures passed 42 checks across 44 runs, followed by 32 CLI validation checks across 36 runs. All 196 tracked image assets retained identical hashes, sizes and modification times. `lint:js` and `git diff --check` passed. Native file symlink testing was unavailable on Windows (`EPERM`); other platforms and full QA were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-WORKFLOW-04 — Keep no-JavaScript failure screenshots outside tracked source

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `/reports/nojs/` to `.gitignore` and documented local screenshot availability. Preserved diagnostic generation, filenames, error reporting and failure exit behavior without affecting maintained assets or archived evidence.
- **Verification:** `git check-ignore` confirmed the intended rule. Five unrelated paths and 221 tracked asset/archive paths remained unaffected. Git inspection found no tracked screenshots; `git diff --check` passed. Runtime screenshot capture was not tested.
- **Impact:** Low
- **Effort:** Small

## Verification limitations

Documentation improvements were verified through source and configuration inspection. Image regeneration received focused fixture-based tests; no full application QA or Lighthouse suite was run solely for these workflow changes.

Native file symlinks, additional operating systems, public deployment behavior and runtime failure-screenshot capture were not fully verified.

No additional tests were performed solely to prepare this archive. The report documents completed work and recorded verification results; current repository files remain the authoritative source for future development.
