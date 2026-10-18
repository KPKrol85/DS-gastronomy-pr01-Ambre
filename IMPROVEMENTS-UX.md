# Ambre — UX Improvements

**Analysis date:** 2026-10-17
**Project type:** Static eight-page demonstration website for a fictional fine-dining restaurant; HTML pages as content source, modular CSS, Vanilla JavaScript ES modules, PostCSS/esbuild production build, Service Worker and Web App Manifest, static hosting with Netlify rules
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

The implemented journeys — browsing the homepage sections, opening the full menu and gallery, filtering categories, previewing images, reading legal documents and sending a reservation request — are in place and operable, with established focus, ARIA and progressive-enhancement contracts around them.

The opportunities found are concentrated in orientation and feedback rather than in missing functionality. Mobile users navigate through a drawer that is a static copy of the header list and therefore carries none of the navigation state the desktop header receives. The reservation form enforces a date and time window that it never states, and reports a rejected value with one generic sentence. In-page anchors inside the legal documents land under the fixed header, unlike the homepage sections, which already use a header-aware offset. The image lightbox resolves two different session modes but presents one fixed, partly inaccurate name and a single Esc hint. The homepage hero's two primary calls to action are the only navigation controls on the site with no native baseline behind them.

All five proposals stay inside the current architecture: canonical HTML pages, `js/modules/`, the existing CSS layers and the established accessibility hooks.

## Proposed improvements

### IMP-UX-01 — Give the mobile drawer the navigation state the header nav already has

- **Status:** COMPLETED — implemented and verified.
- **Result:** `initMobileNav()` pairs the cloned drawer anchors with the header-list anchors once, in document order, and mirrors their resolved `href` and `aria-current` onto the drawer each time it opens, so the drawer reflects `initSmartNav()`, `initAriaCurrent()` and `initScrollspy()` instead of an early snapshot. The cloned structure, injected submenu triggers, `aria-expanded` contract, focus containment, Escape and overlay dismissal, focus return, resize handling and the existing CSS hooks are unchanged; no DOM is rebuilt and no listener or observer was added.
- **Verification:** `npm run test:e2e:mobile-nav` passes (3/3 scenarios), `git diff --check` is clean and ESLint reports no findings for `js/modules/nav.js`. A focused Chromium inspection at 390 px confirmed drawer/header parity with no page errors: `menu.html` and `galeria.html` expose `Menu → menu.html` and `Galeria → galeria.html` with exactly one `aria-current="page"` entry, and `index.html#faq` and a homepage scroll to `Opinie` expose exactly one `aria-current="location"` entry, each rendering the existing drawer current-state background. Only Chromium at 390 px was exercised; no assistive technology, other browser or deployed environment was tested.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-02 — State and enforce the reservation form's date and time window

- **Status:** COMPLETED — implemented and verified.
- **Result:** The date and time rows state the accepted window in Polish hints, carry native `min`/`max` boundaries and `17:00`–`22:00` with `step="900"`, and own `#date-error` / `#time-error` nodes wired through `aria-describedby` alongside `#form-msg`; `initReservationForm()` recomputes the inclusive today-to-90-days window from local calendar components (no UTC conversion), rejects past, too distant and Monday dates as well as hours outside `17:00`–`22:00` or off the 15-minute step with field-specific messages, `aria-invalid="true"` and a window-specific status line, clears a stale field error once its value becomes valid, and prevents the POST while retaining entered values. Honeypot detection, phone normalization, consent validation, the single-POST path, `response.ok`-only success with reset, the delivery-error state and the native no-JavaScript submission are unchanged, and no CSS was added.
- **Verification:** `npm run test:e2e:reservation` passes (17/17, including the today and 90-day boundaries, past, too distant, Monday, pre-17:00, post-22:00 and off-step rejections with correction and single-POST re-submission) and `npm run qa:nojs` passes (native `rangeUnderflow`, `rangeOverflow` and `stepMismatch` rejection with zero POST requests, plus a step recording that a Monday inside the native window stays natively valid); `npm run qa:html`, `npm run qa:csp`, `npm run lint:text`, ESLint on the changed files and `git diff --check` are clean, and a focused Chromium pass at 390 px and 1440 px in both themes showed the hints, errors and status without horizontal overflow. Limitations: without JavaScript the native `min`/`max` pair is a static boundary in `index.html` that does not advance with the calendar and must be refreshed by maintenance, native attributes cannot express the Monday exclusion, and nothing here is server-side enforcement or a table-availability guarantee — the form remains a demonstration request path. Only Chromium was exercised; no assistive technology, other browser or deployed environment was tested.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-03 — Land legal-document anchors below the fixed header

- **Affected journey:** Table-of-contents and deep-link navigation on `cookies.html`, `polityka-prywatnosci.html` and `regulamin.html`.
- **Evidence:** `cookies.html:210-221`, `css/pages/legal.css:94-99`, `css/base/base.css:57-60`, `css/base/base.css:88-91`, `css/layout/header.css:16-29`
- **Current experience:** Each legal page opens with a numbered table of contents linking to the `h2` section headings. The header is fixed, and the homepage sections compensate for it through `scroll-margin-top` on `main` and `.l-section`; the legal headings have no such offset. Verified in Chromium at 1440 × 900 on `cookies.html`: activating the `Podstawy prawne` link leaves the target heading at viewport top `0` while the header's bottom edge sits at `57`, so the heading is behind the header, and its computed `scroll-margin-top` is `0px` against `84px` for a homepage section.
- **Proposed improvement:** Apply the project's existing header-aware scroll offset to legal section headings so an activated table-of-contents link or a hash URL places the heading in view.
- **Expected user value:** Readers see the heading of the section they jumped to and can confirm where they are in a long document, instead of starting mid-paragraph with the heading hidden.
- **Implementation scope:** CSS only — extend the existing `scroll-margin-top` pattern to the legal document's anchored headings in `css/pages/legal.css` (or the shared rule in `css/base/base.css`), reusing the current header-height custom properties. No markup, table-of-contents order, heading level, JavaScript or scroll-behavior change.
- **Acceptance criteria:** After activating each table-of-contents link on the three legal pages, the target heading's top edge is below the fixed header's bottom edge at 320 px, 390 px and 1440 px, in light and dark themes, and with the header in both its normal and shrunk state. Loading a page directly with a section hash lands the same way. Homepage section anchors, the skip link and the footer anchor keep their current landing positions, and `npm run qa:html` and `npm run lint:css` pass.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Name and describe the lightbox according to its active mode

- **Affected journey:** Image preview from the gallery grids and from menu dish thumbnails on `index.html`, `menu.html` and `galeria.html`.
- **Evidence:** `galeria.html:498-507`, `index.html:802-811`, `menu.html:464-470`, `js/modules/lightbox.js:97-98`, `js/modules/lightbox.js:137-149`, `js/modules/lightbox.js:401-408`
- **Current experience:** One dialog serves two sessions: `gallery` browses the visible group with a counter and previous/next controls, `single` isolates one image and hides both. The dialog markup differs per page and is fixed regardless of mode: `galeria.html` is named `Podgląd zdjęcia dania` ("dish photo preview") although its grid holds interiors, dishes and event photos; `index.html` uses the neutral `Podgląd zdjęcia`; `menu.html` uses `aria-label="Podgląd dania"` and ships no guidance text and no counter host at all. Verified in Chromium on `galeria.html`: opening the first photo resolves mode `gallery`, shows previous/next and the counter `1 / 11`, focuses the close control, and offers `Naciśnij Esc, aby zamknąć.` as the only guidance — the implemented arrow-key navigation, swipe and `F` fullscreen shortcut are described nowhere.
- **Proposed improvement:** Derive the dialog's accessible name and its guidance line from the resolved mode, so a gallery session is named as a photo preview and states that the previous and next photos are reachable, while a single dish preview keeps its dish-specific name and the close hint.
- **Expected user value:** Users, and screen-reader users in particular, learn which preview they opened and that a navigable group exists, instead of inferring it from a counter or discovering the controls by accident.
- **Implementation scope:** The three dialog blocks in the pages (align the markup so each has a title and guidance node) and the part of `js/modules/lightbox.js` that already mirrors the resolved mode on the dialog. Keep the `lb`, `lb-title`, `lb-help`, `lb-counter` ids and the `aria-modal`, `aria-labelledby` and `aria-describedby` wiring, the counter contract, close-control focus on open, focus return to the trigger, document-state restoration and the existing control styling. Content stays Polish; no new control is added.
- **Acceptance criteria:** Opening a gallery photo on `galeria.html` or `index.html` exposes a dialog name describing a photo preview and guidance naming both closing and previous/next navigation while previous/next are visible. Opening a dish thumbnail on `menu.html` or `index.html` exposes a dish-preview name and close-only guidance, with previous/next and the counter hidden. The guidance line is present on all three pages. `npm run test:e2e:lightbox` and `npm run qa:a11y` pass.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Give the hero's primary actions native in-page navigation

- **Affected journey:** Entry path from the homepage hero to the reservation form and the menu section.
- **Evidence:** `index.html:208-209`, `js/modules/scroll.js:77-93`, `css/components/utilities.css:1-14`, `css/base/tokens.css:7-15`, `css/base/base.css:88-91`
- **Current experience:** The hero's two primary calls to action, `Zarezerwuj stolik` and `Zobacz menu`, are `<button>` elements whose only behavior comes from `initScrollTargets()`, which reads `[data-target]` and calls `scrollIntoView()`. Every other in-page destination on the site — header navigation, footer navigation, the legal tables of contents — is a real anchor, and the project maintains a no-JavaScript baseline elsewhere (native form submission, the `noscript` map fallback, the `.no-js` header rules). The hero controls have no such baseline and no link semantics.
- **Proposed improvement:** Turn the two hero actions into anchors pointing at `#rezerwacja` and `#menu`, keeping their current appearance and the smooth-scroll behavior.
- **Expected user value:** The site's two most prominent actions behave like the rest of its in-page navigation: they announce as links, expose their destination, support opening in a new tab, and still work when the JavaScript enhancement is unavailable.
- **Implementation scope:** The two controls in `index.html` plus, if `[data-target]` is kept, the `initScrollTargets()` handler in `js/modules/scroll.js` so a native jump and a scripted scroll do not both run. The global `scroll-behavior: smooth` with its `prefers-reduced-motion` override and the `.l-section` scroll offset already cover smooth, header-aware landing, so the simplest variant needs no new JavaScript. Preserve the existing button styling classes, the first control's accessible label, and the hero layout at all breakpoints.
- **Acceptance criteria:** Both hero actions expose a link role with a resolvable in-page destination, move the view to the reservation form and the menu section respectively, and land below the fixed header. The target is reached once per activation, with no double scroll. With JavaScript disabled both actions still reach their sections. Reduced-motion users get an instant jump. `npm run qa:html`, `npm run qa:links` and `npm run test:e2e:scroll` pass.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The set is ordered by practical relevance. IMP-UX-01 affects every page for every visitor below 940 px, where the drawer is the only navigation, and it unlocks a drawer state treatment that already exists in CSS. IMP-UX-02 addresses the only data-entry journey in the project, where a request for an impossible slot is currently confirmed as accepted. IMP-UX-03 and IMP-UX-05 are small, well-bounded corrections that extend patterns the project already uses elsewhere. IMP-UX-04 improves comprehension of an interaction shared by three pages without touching its mechanics.

All five are independent: they touch different files, or different regions of `js/modules/nav.js`, `js/modules/scroll.js`, `js/modules/form.js`, `js/modules/lightbox.js` and the CSS layers, and none depends on another being implemented first. Each is verifiable with a focused existing check plus a short browser inspection, which keeps the set appropriate for focused development work. No proposal is Large, and none requires new dependencies, new pages, backend work or design-system changes.

A sixth candidate — reporting the number of matching items after a category filter in the menu and gallery grids — was considered and excluded: `scripts/qa-gallery-status-e2e.mjs` deliberately asserts that the status node keeps exactly the completed text under every filter, so changing that feedback would alter a protected, intentionally verified contract rather than extend an existing one.

## Analysis limitations

Runtime verification was a single focused Chromium pass over `galeria.html`, `menu.html`, `index.html` and `cookies.html` in a local static server, with the demonstration notice pre-accepted and POST requests intercepted. It covered the drawer and header navigation state at 390 px, the legal anchor landing and a homepage comparison at 1440 px, the lightbox state in gallery mode, and two reservation submissions. No other browser, no assistive technology, no touch device and no deployed environment were exercised, so expected benefits are reasoned improvement opportunities, not measured outcomes. Impact and effort are relative engineering estimates.

Two observations outside this report's scope were noted and intentionally not converted into proposals. First, with JavaScript disabled below 940 px the header navigation list stays `display: none` while the `.no-js` rules hide the navigation toggle, so the header exposes no navigation links in that combination and only the footer navigation remains; this follows from the CSS cascade in `css/layout/header.css:131-133`, `css/layout/header.css:375-399` and `css/components/utilities.css:1-14`, was not confirmed at runtime, and belongs in an audit or review rather than in an optional improvement. Second, the visible copy on `offline.html` is written without Polish diacritics, which is a content defect for the project's text-quality rules rather than an interaction improvement.
