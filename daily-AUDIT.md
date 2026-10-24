# Daily Front-End Audit — Ambre

**Audit date:** 2026-10-24

**Project type:** Static, eight-page Polish restaurant demonstration site; HTML, modular CSS and Vanilla JavaScript, with a Node.js production build and Netlify-oriented hosting rules.

**Audit mode:** Static repository review

## Overall assessment

Canonical HTML, CSS and JavaScript have clear ownership, with a separate generated distribution and focused QA scripts. The architecture is suitable for continued development within the documented portfolio scope. No critical blocker was detected in the inspected sources; the main concern is the mobile navigation fallback without JavaScript. Smaller interaction defects and resilience risks remain. Production build execution, browser behavior and the public deployment were not verified.

## Verified strengths

- Production generation is centralized: the build processes CSS, bundles JavaScript, copies the eight pages and hosting files, and rewrites HTML and Service Worker asset references. It also rejects obsolete minified assets in source directories (`scripts/build-dist.mjs:74`, `scripts/build-dist.mjs:90`, `scripts/build-dist.mjs:142`).
- Feature initializers are isolated by individual error boundaries, so one initializer failure does not stop subsequent modules (`js/script.js:50`).
- The reservation handler checks native validity and HTTP success, resets fields only after an accepted response, preserves input after delivery failure, and leaves native submission available when fetch/FormData are unavailable (`js/modules/form.js:301`, `js/modules/form.js:310`). These are client-side mechanisms, not proof of form receipt.
- The demonstration dialog implements background inertness, keyboard focus containment and focus restoration; the lightbox restores document scroll state and distinguishes gallery browsing from single-dish previews (`js/modules/demo-legal.js:33`, `js/modules/demo-legal.js:92`, `js/modules/lightbox.js:237`).
- Shared theme tokens, visible focus rules and reduced-motion overrides are present; legal data tables have named, keyboard-focusable scrolling regions (`css/base/tokens.css:18`, `css/components/utilities.css:43`, `css/components/utilities.css:79`, `cookies.html:276`, `polityka-prywatnosci.html:276`).
- Service Worker cache cleanup is restricted to the Ambre namespace and explicit legacy keys; cross-origin requests are excluded (`sw.js:58`, `sw.js:79`).
- Content-page JSON-LD describes the demonstration project rather than a real restaurant; utility pages declare noindex. Dedicated policy checks and fast QA/build steps are configured (`index.html:53`, `404.html:8`, `offline.html:12`, `scripts/schema-policy-check.mjs:16`, `.github/workflows/main.yml:31`).

## P0 — Critical risks

None detected.

## P1 — Important issues worth fixing next

### [P1-01] Mobile no-JavaScript navigation does not reveal its links

- **Classification:** Source-visible risk
- **Evidence:** `css/layout/header.css:131`, `css/layout/header.css:375`, `css/components/utilities.css:2`, `css/components/utilities.css:12`, `index.html:112`.
- **Current behavior:** The header's top-level list defaults to `display: none` and is explicitly revealed only from 940 px. The no-JavaScript rules hide the menu toggle and restyle the navigation, but never override the list's hidden display state. Six content pages retain the `no-js` body class when scripts do not execute.
- **Impact:** Source rules leave mobile visitors without header navigation when JavaScript is disabled or fails before initialization. Footer links remain available, but the intended primary navigation fallback is incomplete. Browser reproduction was not performed.
- **Recommended direction:** Make the no-JavaScript list explicitly visible in a layout usable below the desktop breakpoint, and cover that viewport in the existing fallback regression.

## P2 — Minor refinements

### [P2-01] Storage failures prevent otherwise usable interactions

- **Classification:** Source-visible risk
- **Evidence:** `js/modules/theme.js:11`, `js/modules/theme.js:33`, `js/modules/demo-legal.js:150`, `js/modules/demo-legal.js:155`.
- **Current behavior:** Theme and demonstration-notice storage reads are unguarded. Their click handlers write storage before applying the theme or closing the dialog. A denied read aborts the initializer; a failed write prevents the corresponding action from completing.
- **Impact:** Restricted storage can leave the visible theme control inactive or make the notice's acceptance button fail to dismiss it. Escape and backdrop dismissal are separate paths; this is not a demonstrated site-wide lockout. Storage failure states were not exercised.
- **Recommended direction:** Keep the current-page interaction usable when persistence fails, and treat persistence as best effort.

### [P2-02] Different navigation breakpoints can leave a hidden drawer active

- **Classification:** Source-visible risk
- **Evidence:** `js/modules/nav.js:83`, `js/modules/nav.js:110`, `js/modules/nav.js:170`, `css/layout/header.css:375`, `css/components/utilities.css:49`, `scripts/qa-mobile-nav-e2e.mjs:194`.
- **Current behavior:** JavaScript considers 939 px desktop, while CSS switches at 940 px. If the drawer is opened at 939 px, resizing to 940 px does not change the JavaScript desktop state, so its transition-only close condition does not run. CSS then hides the drawer while the open class and Tab handler can remain active. The existing regression checks closing at 939 px, but does not open there before crossing to 940 px.
- **Impact:** This narrow resize path can retain scroll locking and keyboard containment after the drawer becomes invisible. The path requires browser reproduction; the one-pixel difference alone is not the reported defect.
- **Recommended direction:** Align the responsive state boundary and ensure entering the CSS desktop layout clears any open drawer state.

### [P2-03] Menu detail enhancements never initialize on the menu page

- **Classification:** Defect
- **Evidence:** `js/modules/page-menu.js:4`, `menu.html:110`, `menu.html:185`, `menu.html:229`, `docs/ARCHITECTURE_MAP.md:24`.
- **Current behavior:** The initializer immediately returns unless `body` has `page-menu`. The actual page places that class on `main`, while `body` has only `no-js` before the helper removes it. Consequently, the module registers none of its detail-panel handlers.
- **Impact:** Native details remain usable, but the documented Escape, outside-click dismissal and exclusive-panel enhancement are unavailable. This is a source-level guard mismatch; no browser test was run.
- **Recommended direction:** Match initialization to the actual page root and verify the documented detail-panel behaviors, including event delivery for exclusivity.

### [P2-04] Mobile menu toggle references the desktop navigation

- **Classification:** Defect
- **Evidence:** `index.html:174`, `index.html:845`, `menu.html:172`, `menu.html:483`, `js/modules/nav.js:110`, `js/modules/nav.js:137`.
- **Current behavior:** All eight header toggles declare `aria-controls="site-header-nav"`, although their expanded state opens `#mobile-drawer`. The initializer retains an existing controls attribute, and the original navigation's list remains hidden at mobile widths.
- **Impact:** The exposed control relationship points to a different region from the one being shown, weakening assistive-technology navigation between the button and its controlled content. Pointer operation is not affected by this attribute mismatch.
- **Recommended direction:** Associate the toggle with the actual mobile drawer consistently across the shared page shells.

## Extra quality improvements

None detected.

## Verification performed

- Read `AGENTS.md`, `README.md`, `docs/settings.md`, `docs/ARCHITECTURE_MAP.md`, package scripts and current Git state. The initial working tree was clean; no previous `daily-AUDIT.md` existed.
- Inspected metadata and shared header/footer hooks across all eight HTML pages; reservation markup, menu/gallery filters and details; runtime modules and icon insertion sites; relevant base, theme, navigation, form, lightbox and page CSS.
- Inspected build ownership and asset rewriting, PostCSS configuration, CI, lint/HTML configuration, hosting headers and redirects, robots/sitemap, manifest, Service Worker registration/cache strategies, and relevant QA script coverage.
- Executed the single focused validation `npm run qa:links`: **PASS**, exit code 0. It checks local HTML links, referenced resources and anchors; it does not establish external availability, browser rendering or runtime correctness.
- Reviewed the final document and ran `git diff --check` plus `git diff --no-index --check -- NUL daily-AUDIT.md` to include the untracked report; no whitespace errors were reported. Final Git status showed only the new `daily-AUDIT.md`.
- Did not install dependencies, build or regenerate `dist/`, run fix commands, or execute lint aggregates, browser suites, axe or Lighthouse. The audit budget allowed one focused validation. No implementation fixes were made.
- Browser/assistive-technology behavior, contrast and layout, live Netlify headers/redirects, actual form receipt, installed/offline PWA behavior, dependency vulnerabilities and performance metrics were not verified. Hosting rules and configured QA steps are not claims of successful deployment or test execution.

## Senior rating

**Rating:** 8/10

The static portfolio architecture has clear sources, proportionate tooling, defensive feature boundaries and useful accessibility mechanisms. The mobile fallback gap and smaller interaction mismatches prevent a higher rating. Link integrity passed, but the unexecuted build and browser checks limit confidence in production behavior.
