# Changelog

All significant changes to this project are documented in this file.

## [Unreleased]

### Added

- Added the initial static multi-page restaurant front end with responsive navigation, menu and gallery interactions, a reservation form, legal pages, and local media assets.
- Added PWA mechanisms including a Web App Manifest, install prompt, Service Worker cache strategies, and an offline fallback page.
- Added source-to-production CSS and JavaScript build workflows together with project-specific validation for HTML, links, SEO, JSON-LD policy, no-JavaScript behavior, accessibility, and Lighthouse CI.
- Added focused browser regression coverage for the reservation submission paths, the initial project-information dialog's keyboard behavior, and the shared scroll-to-top control.
- Added a repository-wide `.gitattributes` policy that checks out text files with LF endings on every platform, so inline-script hash generation produces identical values on Windows and in CI.

### Changed

- Changed Lighthouse CI to build and audit the production `dist/` path with text compression, while preserving the existing eight URLs, one-run contract, and category thresholds.
- Changed the first menu thumbnail to load eagerly after Lighthouse identified it as the LCP element, and deferred the menu page's embedded Google Map behind an accessible, no-JavaScript-safe user action.
- Added the missing offline-page description and preloaded its first-render fonts; all eight configured pages now meet the Lighthouse Performance threshold, while URL-specific assertions preserve blocking SEO `>= 0.95` on standard pages and retain the intentional utility-page `noindex` result as a warning.
- Changed the project license and package metadata to use the proprietary KP_Code licensing terms.
- Changed the cookie, privacy, and terms pages to use KP_Code legal templates aligned with the implemented browser storage, PWA, and reservation-form behavior.
- Changed reservation delivery feedback so only accepted HTTP responses show success and reset the form; rejected responses and network failures retain entered data and expose a recoverable error state.
- Changed the initial project-information dialog to contain keyboard focus, isolate background interaction while open, and move focus to the main content after automatic dismissal while preserving Escape and acceptance persistence behavior.
- Changed the shared scroll-to-top control to synchronize rendered visibility, keyboard reachability, and accessibility state across all six intended pages while preserving the existing threshold and reduced-motion behavior.
- Changed the npm workflow to use one discoverable `lint:*`, `qa:*`, `test:e2e:*`, `csp:*`, and `img:*` taxonomy, with separate fast and comprehensive quality gates.
- Removed the unused `postcss-cli` development dependency after confirming the production build uses the PostCSS Node API directly.
- Changed the inline script hashes in `_headers` to match the current source content, preserving the existing security headers and Content-Security-Policy directives.
- Changed the `_headers` inline script hashes to the values derived from the LF source bytes, replacing platform-dependent values that made `npm run qa:csp` pass on Windows but fail in CI.

### Documentation

- Recorded the Lighthouse root causes, verified Performance resolution, measured final scores, and final utility-page assertion policy in the archived [plan](doc/archive/plans/PLAN-2026-08-22.md) and [daily audit](doc/archive/audits/daily-AUDIT-2026-08-22.md).
- Added a Polish-first bilingual README describing the current source/build boundary, PWA mechanisms, quality workflows, and verified limitations.
- Added a current daily front-end audit record to establish evidence-based maintenance priorities.
- Synchronized the documented `qa` command and validation scope with the executable package script, including schema-policy, no-JavaScript, and text-lint stages.
- Updated the README and developer settings reference for the streamlined build, lint, QA, E2E, CSP, server-check, and image-tooling commands.
