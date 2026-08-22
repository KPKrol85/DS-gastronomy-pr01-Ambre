# Changelog

All significant changes to this project are documented in this file.

## [Unreleased]

### Added

- Added the initial static multi-page restaurant front end with responsive navigation, menu and gallery interactions, a reservation form, legal pages, and local media assets.
- Added PWA mechanisms including a Web App Manifest, install prompt, Service Worker cache strategies, and an offline fallback page.
- Added source-to-production CSS and JavaScript build workflows together with project-specific validation for HTML, links, SEO, JSON-LD policy, no-JavaScript behavior, accessibility, and Lighthouse CI.

### Changed

- Changed the project license and package metadata to use the proprietary KP_Code licensing terms.
- Changed the cookie, privacy, and terms pages to use KP_Code legal templates aligned with the implemented browser storage, PWA, and reservation-form behavior.
- Changed reservation delivery feedback so only accepted HTTP responses show success and reset the form; rejected responses and network failures retain entered data and expose a recoverable error state.
- Changed the initial project-information dialog to contain keyboard focus, isolate background interaction while open, and move focus to the main content after automatic dismissal while preserving Escape and acceptance persistence behavior.

### Documentation

- Added a Polish-first bilingual README describing the current source/build boundary, PWA mechanisms, quality workflows, and verified limitations.
- Added a current daily front-end audit record to establish evidence-based maintenance priorities.
