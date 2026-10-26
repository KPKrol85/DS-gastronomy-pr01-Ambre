# Ambre — Final Technical Front-End Audit

**Audit date:** 2026-10-26

**Project type:** Eight-page Polish portfolio demonstration of a fictional restaurant; static HTML, modular CSS and Vanilla JavaScript, with a Node.js production build and Netlify-oriented hosting rules.

**Audit mode:** Final repository and implementation review

**Current readiness:** Ready with minor refinements

## 1. Executive assessment

The architecture is coherent for this demonstration site: root HTML owns content, readable CSS and JavaScript own presentation and interactions, and a separate build prepares the distribution. Current local validation and browser regressions support the core client-side navigation, menu, gallery, reservation-form and theme behavior. No P0 or P1 findings were detected.

Three contained accessibility and progressive-enhancement issues remain: low-contrast actions in the no-JavaScript dark-system fallback, incomplete background isolation for the mobile drawer, and enabled controls without a no-JavaScript action. These warrant refinement without an architectural rewrite. The assessment applies to the repository and tested local behavior; it does not establish an active deployment, provider receipt of forms, or complete production PWA operation.

## 2. Audit scope and verification

### Areas inspected

- All eight page routes and their shared shell, navigation, metadata, local references, form contracts and utility-page behavior; menu/gallery content and representative public copy.
- Canonical runtime modules, initialization order, DOM insertion, storage/error handling, filtering, disclosures, dialogs, scrolling, theme selection and deferred maps.
- CSS entry/import structure, tokens, local font declarations, shared components, page styles, responsive rules, focus and reduced-motion behavior.
- Production build and image tooling; package/lockfile declarations; lint, validation, browser-test and Lighthouse configuration; GitHub Actions workflow.
- `_headers`, `_redirects`, manifest, robots, sitemap, Service Worker registration, precache, runtime caching and cache ownership.
- README, architecture map, command guide, changelog, license metadata and archived audit context. Historical findings were rechecked rather than copied into this assessment; archived files remain unchanged. No root `AUDIT.md` existed at the start.
- Current Git state and source-visible security concerns, including credential-like material, user-controlled HTML handling and external-reference behavior. This was a repository review, without penetration testing or a dependency-vulnerability assessment.

### Verification performed

- `git status --short` — clean at the start. Final scope and whitespace checks confirmed that only the new `AUDIT.md` was added.
- `npm run qa:fast` — **PASS**: JavaScript/CSS/text lint, eight-page HTML validation, local links/anchors, SEO checks, JSON-LD policy and six current CSP hashes.
- `npm run img:verify` — **PASS**: 171 referenced rasters decoded with matching formats, 114 optimized/original dimension comparisons and 147 width-descriptor checks. The tool also identified 66 density descriptors, which are not pixel-width assertions.
- `npm run test:e2e` — **PASS**, all nine suites: reservation 17/17, demo dialog 4/4, scroll-to-top 3/3, legal tables 4/4, lightbox 13/13, gallery status 6/6, mobile navigation 4/4, theme 6/6 and menu details 7/7; 64 scenarios in total.
- `scripts/qa-nojs-e2e.mjs`, executed through an in-memory wrapper — **PASS**. All original assertions were retained; only failure-directory and screenshot writes were suppressed. Coverage included navigation on eight pages at 320/390/939/940/1280 px, keyboard access and native form constraints/submission interception. Its passing result does not cover the contrast or inactive-control findings below.
- `npm run qa:a11y` — **PASS**, 14 axe scans across eight pages: open notice and accepted-page states on six pages, accepted-page states on two utility pages, plus the negative control proving that full-page scans detect content outside the notice.
- `npm run qa:service-worker` — **PASS**: canonical worker activation/cache ownership, preservation of unrelated caches, document-fixture delivery with the server stopped, uncached navigation fallback and negative controls after removing cached responses. The test uses isolated document fixtures, not a complete installed production application.
- In-memory PostCSS and esbuild processing with the existing production configuration — **completed**, producing 83,180 bytes of CSS and 39,858 bytes of JavaScript without writing `dist/`. A nonfatal `postcss-calc` warning concerned `css/components/hero.css:12`; Browserslist also reported old compatibility data. These messages did not prevent processing; no update was performed.
- An ephemeral HTTP server served those compiled assets and the build-equivalent HTML asset substitutions, applying the repository CSP. **96 layout checks passed**: eight pages × six widths (320/390/768/939/940/1280 px) × two explicit themes, at 844 px height, without document horizontal overflow. No captured console errors, uncaught page errors or HTTP responses of 400 or higher occurred in that matrix.
- Additional axe scans of the compiled homepage, menu and gallery in both explicit themes — **PASS**, six scans. First dish/gallery lightbox images decoded at 1200/1600 px respectively.
- Focused Chromium probes reproduced enabled, inactive menu controls without JavaScript; measured no-JavaScript action colors; and inspected the open drawer's DOM and accessibility tree at 390 × 844 px. The contrast ratios below were calculated from the measured opaque foreground/background pairs, not estimated from screenshots.

### Verification limitations

- `npm run build`, `npm run qa:server`, `npm run qa:lighthouse` and the full `npm run qa` aggregate were **not executed**. The build deletes/recreates `dist/`, and Lighthouse builds/writes reports; this audit preserved the requested file boundary. In-memory compilation and asset substitution do not establish successful filesystem packaging, copying or deployment. No current Lighthouse scores or Core Web Vitals are claimed.
- Initial browser attempts encountered sandbox-specific browser-path and localhost-access failures. Subsequent suite runs used the already installed Chromium and permitted local HTTP access. These environment failures were not classified as application defects.
- Supplemental axe attempts in a JavaScript-disabled context **failed** with execution-context destruction; they supplied no successful scan results. The no-JavaScript findings rely on direct DOM, interaction and computed-color probes instead.
- Browser evidence is limited to local Chromium with Playwright 1.58.2 and Node.js 22.23.3. Other engines, real devices, manual screen-reader use, comprehensive zoom/short-viewport behavior and every focus/hover/layered contrast combination were not verified.
- No explicit live URL was supplied. The origin embedded in metadata and documentation was not treated as authorization or proof of deployment. Live Netlify redirects, response headers, form detection/delivery and notification handling remain unverified; all tested form POST responses were intercepted.
- Native installation UI, standalone behavior, worker updates and the complete production offline experience were not tested. Ordinary localhost registration is intentionally disabled by `js/sw-register.js:6-23`. The documented native date fallback uses fixed HTML bounds and cannot reject Mondays; client-side validation is not server-side reservation processing.

## 3. Verified strengths

- **Clear source ownership and isolated initialization:** `scripts/build-dist.mjs:16-48,83-155` maps readable source assets to production copies; `js/script.js:16-60` initializes features behind separate error boundaries. Compilation and the local compiled-asset checks succeeded within the limitations above.
- **Defensive form delivery:** `js/modules/form.js:238-340` prevents duplicate client submissions, validates fields, accepts only successful HTTP responses, preserves input after delivery failure and retains native submission when fetch/FormData are unavailable. The 17 reservation regressions passed; provider receipt remains outside their scope.
- **Tested dialog and persistence handling:** `js/modules/demo-legal.js:34-175` contains focus, saves/restores background inertness and treats storage as best-effort. Notice and theme regressions passed with independently denied storage reads/writes.
- **Native interaction foundations:** `js/modules/page-menu.js:4-34` captures native disclosure events within the real menu root; lightbox source separates gallery browsing from single-dish previews and restores document state. Relevant keyboard, dismissal, filtering and repeated-session regressions passed.
- **Useful accessibility verification:** focusable legal-table regions, responsive navigation fallback and explicit modal/accepted-page axe states have executable coverage. Their current passing results support those tested contracts, while the findings below identify states outside that coverage.
- **Scoped cache cleanup and tested fallback mechanics:** `sw.js:1-7,47-61` limits removal to Ambre-owned/explicit legacy cache names. The isolated worker test passed ownership and disconnected-delivery checks, including negative controls.
- **Demo-appropriate structured data:** the six content pages describe a demonstration project rather than an operating restaurant; utility pages use `noindex` and omit JSON-LD. Current SEO/schema/CSP checks passed, and `scripts/schema-policy-check.mjs:6-48` defines the relevant policy explicitly.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

None detected.

## 6. P2 — Minor refinements

### [P2-01] Dark-system fallback gives action labels insufficient contrast without JavaScript

- **Classification:** Defect
- **Affected area:** Theme fallback, accessibility, native reservation submission and 404 recovery.
- **Evidence:** `css/base/tokens.css:224-233`; `css/components/buttons.css:3-12,52-60,271-292`; `index.html:631`; `404.html:137`.
- **Current behavior:** With JavaScript disabled and a dark system preference, `data-theme` remains absent. System tokens change the text color, while the corrective button rules require an explicit dark attribute. Chromium measured the reservation label as `#eef1f6` on `#fab204` (1.62:1) and the 404 return label as `#eef1f6` on white (1.13:1). Both actions retain their native behavior.
- **Impact:** Labels become difficult to read in a supported fallback state, including the form submission action and the error-page recovery link. JavaScript-enabled theme regressions do not exercise this state.
- **Recommended direction:** Make the effective system fallback apply coherent component foreground/background pairs, while preserving explicit light/dark overrides and native actions.
- **Verification criteria:** Without JavaScript, check these actions under both system preferences and confirm readable, passing normal-text contrast; repeat explicit-theme checks with JavaScript enabled.

### [P2-02] Mobile drawer traps keyboard focus while leaving background accessibility content exposed

- **Classification:** Source-visible risk
- **Affected area:** Mobile navigation, dialog semantics and assistive-technology interaction.
- **Evidence:** `js/modules/nav.js:85-130`; `index.html:844-847`; `css/components/utilities.css:88-91`.
- **Current behavior:** Opening the drawer displays an overlay, locks page scrolling and traps Tab within the drawer, but the dialog has no declared modal state and the background remains non-inert. A Chromium accessibility-tree probe at 390 × 844 px still exposed the page banner, main content and reservation controls alongside the open navigation dialog.
- **Impact:** Accessibility navigation may reach background controls that the visual overlay and keyboard trap make unavailable through the ordinary interface. Actual screen-reader traversal was not tested, so that user impact remains a source-visible risk rather than a claimed assistive-technology failure.
- **Recommended direction:** Align the drawer's modality, background availability and keyboard model; preserve dismissal, focus restoration and cleanup at the desktop breakpoint.
- **Verification criteria:** While open, the intended modal background is unavailable to focus and accessibility navigation; closing or crossing 940 px restores prior background state and usable focus. Verify with a screen reader as well as the existing drawer regressions.

### [P2-03] JavaScript-only controls remain enabled in the native baseline

- **Classification:** Defect
- **Affected area:** Progressive enhancement, menu filters, image previews and theme control.
- **Evidence:** `menu.html:153-170,203-218`; `css/components/utilities.css:1-53`; `js/modules/tabs.js:5-47`; `js/modules/lightbox.js:306-325`.
- **Current behavior:** The no-JavaScript CSS hides the mobile toggle but leaves other enhancement-only buttons visible and enabled. On `menu.html` at 390 px with JavaScript disabled, activating Desery left all four dishes visible; the theme button and dish-preview buttons also remained available without an action or native image destination. Native page links and disclosures remained usable.
- **Impact:** The baseline offers keyboard stops and apparent actions that do nothing, despite keeping the underlying content accessible.
- **Recommended direction:** Expose enhancement controls only when their feature initializes, or provide a meaningful native fallback. Retain menu content, images and navigation in the baseline.
- **Verification criteria:** With JavaScript disabled, no enabled filter/theme/preview control promises an unavailable action; native links and disclosures still work. With JavaScript enabled, current filtering, theme and lightbox regressions continue to pass.

## 7. Extra quality improvements

None detected.

## 8. Current readiness conclusion

**Status:** Ready with minor refinements

No release-blocking repository defect was detected within the tested portfolio-demo scope. Core local client interactions passed their existing regressions, and the three P2 findings are contained refinements. Deployment readiness remains conditional on producing the distribution and verifying the target host, form provider and production PWA behavior; those outcomes were not established by this audit.

## 9. Senior rating

**Rating:** 8/10

The project combines appropriate source boundaries, defensive interactions, demo-accurate structured data and substantial focused regression tooling. Current local checks provide useful evidence across routes, themes and fallback behavior. The remaining accessibility/progressive-enhancement gaps and unexecuted filesystem-build/production checks limit the assessment; absent backend, accounts or payments are intentional product boundaries and do not reduce the rating.
