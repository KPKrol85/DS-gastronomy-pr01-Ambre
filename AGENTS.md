# Ambre — Agent Instructions

This file defines a small set of stable project guardrails for coding agents working on Ambre.

The current task and the current repository are the primary sources of truth. Do not treat this file as a substitute for inspecting the implementation.

## Core principles

- Act as a senior software engineer and use professional engineering judgment.
- Inspect the relevant current files before making decisions or changes.
- Work only within the approved task scope.
- Do not fix unrelated issues or expand the task without approval.
- Prefer clear, maintainable solutions over unnecessary complexity or mechanical preservation of weaker patterns.
- Treat existing architecture and conventions as the current baseline, not as permanent restrictions.

## Project safeguards

- Edit canonical source files only. Never hand-edit generated `dist/` output or minified assets.
- Preserve existing functionality unless the task intentionally changes it.
- Preserve accessibility, responsive behavior, SEO, and light/dark/system theme support when affected by a change.
- Preserve established ARIA, `data-*`, navigation, form, storage, PWA, and interaction contracts unless the approved task explicitly changes them.
- Keep public-facing site content in Polish unless the task explicitly requires otherwise.
- Do not add or update dependencies unless technically justified and within the approved scope.
- Do not create additional process, workflow, architecture, or maintenance documentation unless the task requires it.

## Verification

Use verification appropriate to the scope and risk of the change.

- Prefer focused checks for focused changes.
- Use existing project commands and current repository tooling.
- Verify affected behavior directly when practical.
- Do not weaken checks merely to obtain a passing result.
- Never claim verification passed unless it was actually performed successfully.

## Completed improvement records

When an approved improvement is implemented and verified, replace its detailed proposal with a concise completion record.

Use this format in `IMPROVEMENTS-*.md`:

### IMP-CATEGORY-XX — Original improvement title

- **Status:** COMPLETED — implemented and verified.
- **Result:** Concise description of the actual implementation and preserved contracts.
- **Verification:** Checks performed, actual results, and relevant limitations.
- **Impact:** Original impact rating.
- **Effort:** Original effort rating.

Preserve the original identifier, title, impact, and effort. Remove obsolete proposal details, evidence, implementation plans, and acceptance criteria only after verified completion.

Keep open or incomplete proposals unchanged. Never claim completion or verification without evidence. Update improvement records only within the approved task scope.

## Delivery safety

Do not stage, commit, push, tag, deploy, create or modify branches or worktrees, or perform other repository-delivery actions unless the project owner explicitly requests them.

## Reporting

After implementation, report concisely:

- what changed;
- which files were changed;
- what was actually verified;
- what was not verified;
- any relevant limitation or issue intentionally left outside scope.

Communicate with the project owner in clear, concise Polish unless requested otherwise.
