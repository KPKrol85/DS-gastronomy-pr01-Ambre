# Changelog

Significant completed changes to Ambre are recorded here.

## Entry policy

Record changes that materially affect UI/UX, accessibility, public content, build and QA workflows, dependencies, deployment, PWA behavior, or architecture.

- Record verified changes only, within an approved task marked `Changelog: yes`.
- Judge significance by impact, not file count.
- Exclude routine cleanup, report status and archiving, temporary checks, internal wording updates, and isolated cosmetic details without meaningful impact.
- If the changelog is outside the approved scope, report the required update without editing it.

## [Unreleased]

### Added

- Added the eight-page restaurant demo with responsive navigation, menu and gallery interactions, reservation form, legal pages, and local assets.
- Added PWA support with a Web App Manifest, installation prompt, Service Worker caching, and offline fallback.
- Added production CSS/JavaScript builds and automated HTML, link, SEO, JSON-LD, no-JavaScript, accessibility, and Lighthouse checks.
- Added GitHub Actions CI to run `npm ci`, `npm run qa:fast`, and `npm run build` on pushes and pull requests to `main`.
- Added focused E2E tests for reservation delivery, the demo-information dialog, and scroll-to-top controls.
- Added Service Worker regression tests for cache activation, obsolete Ambre cache cleanup, and preservation of unrelated same-origin caches.
- Added `.gitattributes` to enforce LF line endings and consistent CSP hashes across platforms.
- Added `npm run dev` with live reload on `127.0.0.1:4183`, excluding `node_modules` and `dist` from watching.

### Changed

- Converted the homepage reservation form into a KP_Code Digital Studio project inquiry form with name, email, optional phone, subject, and message fields, renaming the Netlify form from `reservation` to `contact` while preserving the honeypot, AJAX, and native submission paths.
- Standardized the footer demonstration disclosure on all eight pages and attributed the real telephone, email, and address to KP_Code Digital Studio instead of the fictional restaurant.
- Replaced the restaurant-operation FAQ with four project-oriented questions and labeled testimonials and the rating badge as illustrative, removing the Google reviews attribution and link.
- Aligned navigation labels, hero and contact CTAs, the PWA shortcut, homepage metadata, legal documents, and form regression tests with the contact workflow.
- Redesigned the homepage contact card as an open editorial postscript with an amber rule, smaller heading, and accessible telephone link.
- Added header-aware scroll offsets to headings on the cookies, privacy, and terms pages while preserving existing anchor behavior.
- Enforced reservation dates from today through 90 days ahead, Tuesday–Sunday, 17:00–22:00 in 15-minute intervals, with field-specific feedback; native no-JavaScript limits cannot exclude Mondays.
- Added image-optimizer `--source <path>` and scoped `--force` options for selective WebP/AVIF regeneration.
- Reused the shared focusable-element helper for mobile drawer focus and Tab containment without changing navigation behavior.
- Unified JPEG/WebP/AVIF URL resolution for lightbox display and adjacent-image preloading.
- Consolidated CSS and JavaScript build paths into one source-to-production mapping without changing generated output.
- Replaced scripted homepage hero buttons with native reservation and menu anchors, preserving styling, focus, and reduced-motion scrolling.
- Consolidated menu and gallery tab styles in `css/components/tabs.css`, preserving responsive and theme behavior.
- Shared normalized category matching between menu/gallery filtering and gallery load-more logic.
- Restricted minified CSS/JavaScript output to `dist/` and switched source pages to canonical assets, with production HTML and Service Worker paths rewritten during builds.
- Configured Lighthouse CI to audit compressed production `dist/` pages across eight URLs, three runs each, using existing thresholds.
- Eager-loaded the menu LCP thumbnail and deferred the menu-page Google Map until user activation.
- Deferred the 404-page Google Map until activation; focused Lighthouse Performance reached 0.99 across six runs, and the complete Lighthouse suite passed.
- Added the offline-page description and critical font preloads; all eight Lighthouse pages met Performance thresholds, with `noindex` utility-page SEO treated as a warning.
- Adopted proprietary KP_Code licensing in `LICENSE.md` and package metadata.
- Updated cookie, privacy, and terms content to match implemented storage, PWA, and reservation behavior.
- Limited reservation success feedback and form reset to accepted HTTP responses; failed requests preserve input and display errors.
- Preserved native reservation constraints until JavaScript enhancement initializes, with no-JavaScript submission regression tests.
- Contained keyboard focus within the initial demo-information dialog and isolated background interaction, preserving dismissal and acceptance behavior.
- Synchronized scroll-to-top visibility, focusability, and accessibility state across six pages.
- Made wide legal tables horizontally scrollable and keyboard accessible without page overflow; added focused E2E coverage.
- Restored the lightbox's exact prior inline scroll behavior after closing, retaining scroll position and trigger focus; added E2E coverage.
- Corrected the gallery completion-status icon markup without changing its text or accessibility semantics; added E2E coverage.
- Expanded accessibility tests to scan both modal-open and accepted full-page states, with state preconditions and a negative control.
- Standardized npm commands into `lint:*`, `qa:*`, `test:e2e:*`, `csp:*`, and `img:*` groups with fast and full QA gates.
- Corrected mobile-drawer Menu and Galeria destinations below 940 px and synchronized `aria-current`, preserving drawer keyboard behavior.
- Removed unused `postcss-cli` after confirming the build uses the PostCSS Node API.
- Updated CSP inline-script hashes in `_headers` to match current source content.
- Regenerated CSP hashes from LF source bytes for consistent Windows and CI validation.
- Updated Service Worker caches to `ambre-app-shell-v1.8` and `ambre-runtime-img-v1.8`, preserving unrelated same-origin caches.
- Standardized the public Netlify origin across metadata, JSON-LD, sitemap, robots, package metadata, and terms links.
- Replaced fictional `Restaurant` JSON-LD with demo-accurate `WebSite`, `CreativeWork`, `WebPage`, and KP_Code `Organization` entities.
- Linked X and LinkedIn social controls to verified KP_Code profiles instead of platform homepages.
- Updated `postcss`, `sharp`, and `@lhci/cli`; reduced development audit high findings from 22 to 7, with no critical or production findings.
- Preserved build, E2E, no-JavaScript, accessibility, CI, and Lighthouse contracts during dependency updates.
- Documented remaining `@lhci/cli` transitive audit findings without forcing an unsupported downgrade or override.
- Refined footer column alignment, contact/location order, social-media row, and map size; removed the NIP line.
- Deferred footer Google Maps embeds across all pages until explicit activation.
- Simplified the Opinie section to one Google reviews link and introduced the shared SVG icon registry.
- Migrated footer contact and social icons to the shared `js/icons.js` registry, removing duplicated inline SVG markup.
- Replaced theme-toggle icons with a reduced-motion-aware animated sun/moon SVG, preserving theme persistence.
- Refined reservation form layout, responsive fields, information panel, select icon, and native date/time controls across themes.
- Unified the homepage menu preview and full menu page under the same premium dish-card and category-filter styling.
- Set accessible lightbox names and instructions by gallery/dish mode, preserving navigation, focus, and filtering contracts.
- Replaced hero and About photographs with the Amber dining journal set and regenerated responsive WebP/AVIF variants.
- Redesigned the homepage hero with an editorial text/image split, theme-aware wordmark, and responsive photographic framing.
- Redesigned homepage and full-gallery layouts as editorial photo sequences with responsive width-based `srcset` and gap-free category filtering.

### Fixed

- Restored Polish glyph coverage in local Poppins and Source Sans 3 fonts using `latin-ext` subsets and explicit `unicode-range`; verified intended font rendering without overflow at 390–1440 px.
- Updated 15 gallery image descriptions to match the replacement photographs, including accessible lightbox alternatives; verified with accessibility and gallery E2E tests.

### Documentation

- Added a Polish-first bilingual README covering architecture, builds, PWA, QA, and limitations.
- Added a daily front-end audit to establish maintenance priorities.
- Aligned documented `qa` coverage with schema, no-JavaScript, and text-lint checks.
- Updated cookie-policy cache names to match the Service Worker.
- Updated README and developer settings for current build, lint, QA, E2E, CSP, server, and image commands.
