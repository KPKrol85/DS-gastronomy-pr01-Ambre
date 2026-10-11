# Ambre — UI Improvements

**Analysis date:** 2026-10-11

**Project type:** Static eight-page portfolio/demo website for a fictional fine-dining restaurant; HTML, modular CSS and Vanilla JavaScript, with PostCSS/esbuild packaging and PWA mechanisms.

**Analysis mode:** Evidence-based UI improvement review

**Focus:** Project-wide UI

## Improvement overview

Ambre uses local Poppins and Source Sans 3 fonts, gold accents, theme-aware surfaces and modular component styles. Menu cards, gallery tiles and category tabs already have shared presentation rules. The strongest remaining opportunities concern typography ownership, legal-table hierarchy, FAQ spacing, lightbox controls and the offline page's composition.

The review covered shared navigation and footer styling, homepage sections, booking states, menu and gallery pages, dialogs, legal documents and utility views. Current source was compared with the README, architecture map, settings, changelog and archived plan, audit and improvement records. No active plan or earlier `IMPROVEMENTS-UI.md` exists in this checkout. Completed work was excluded from the proposals below.

These are optional presentation improvements, not confirmed defect findings. Implementation belongs to root HTML and imported source CSS; `scripts/build-dist.mjs` owns generated `dist/` and minified assets.

## Proposed improvements

### IMP-UI-01 — Align typographic emphasis with the declared local font weights

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added family-specific emphasis tokens for Poppins 600 and Source Sans 3 500 and aligned active heading, label, link and native bold-text roles with declared faces. Preserved font assets/loading, existing type sizes, spacing, colors, responsive layout and interaction contracts; correct booking and dish-price weights remain unchanged.
- **Verification:** `npm run lint:css` (existing dependencies from another local worktree) and `git diff --check` passed. A focused Chromium comparison on five pages at 390px/1440px in light/dark themes confirmed declared weights, loaded emphasis faces, unchanged wrapping/height, no visible-text clipping or document overflow and system-theme switching; representative screenshots were inspected. Other browsers and full application behavior were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UI-02 — Give legal tables a shared visual hierarchy

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added shared token-based padding, left/top alignment, thin row separators and a theme-aware header surface to all three legal tables. Preserved HTML content, native semantics, labelled keyboard-accessible scroll regions, focus styling and Source Sans 3 header emphasis at 500.
- **Verification:** `npm run lint:css`, `npm run test:e2e:legal-tables` (4/4) and `git diff --check` passed using existing dependencies from another local Ambre worktree; Chromium ran outside the sandbox due to blocked localhost access. Checks at 320px/390px/1440px in light/dark themes, system-theme switching and representative screenshots confirmed consistent presentation, visible focus, mobile column reachability and desktop containment without document overflow. Other browsers and full application QA were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-03 — Give FAQ rows a stable top-aligned spacing rhythm

- **Affected area:** The homepage's four native FAQ disclosures.
- **Evidence:** `index.html:650-675`; `css/base/base.css:94-99` and `129-133`; `css/components/faq.css:3-16` and `80-93`; `js/modules/faq.js`, `initFaqAria()`.
- **Current state:** FAQ uses the generic `.grid-2`, inheriting centered item alignment and unequal desktop columns. Its spacing combines a small grid gap, margins on every disclosure and an additional margin on adjacent disclosures. These rules determine presentation independently of the questions' open states.
- **Proposed improvement:** Give `.faq__grid` explicit top alignment and equal desktop columns, and let its token-based row/column gaps own inter-card spacing instead of layered item margins. Retain the current one-column mobile layout and 760px transition.
- **Expected value:** A consistent starting line for neighbouring questions and a simpler spacing rule when answers have different lengths or open states.
- **Implementation scope:** FAQ-specific layout and margin rules in `css/components/faq.css`; leave the generic grid used by other sections unchanged. Preserve content order, native `details`/`summary`, independent opening, chevrons, focus presentation, reduced motion and the existing ARIA synchronizer.
- **Acceptance criteria:** At desktop widths, paired FAQ cards have equal column widths and aligned top edges with either or both answers open. Inter-card spacing comes from the grid across all four items. Below 760px, disclosures keep their current DOM order in one column; keyboard and no-JavaScript disclosure behavior remain intact.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Unify lightbox control surfaces across display modes

- **Affected area:** Close, previous/next and counter presentation in gallery and dish lightboxes.
- **Evidence:** `css/components/lightbox.css:42-151` and `173-218`; `index.html:802-812`; `menu.html:465-471`; `js/modules/lightbox.js:135-148` and `371-407`.
- **Current state:** Normal-mode close controls use a translucent white surface, navigation uses a black surface at 0.42 opacity and the counter uses black at 0.55. Zoom/fullscreen styling already groups all three on a shared black surface at 0.65. Normal-mode hover treatments and shadows are defined separately.
- **Proposed improvement:** Define a component-scoped dark media-overlay surface and ink treatment for the controls and counter, with coordinated hover/focus styling for actionable controls and a quieter status treatment. Apply the same visual family in normal, zoom and fullscreen modes while retaining role-specific dimensions and placement.
- **Expected value:** A more consistent control layer over existing photographs and fewer independent surface recipes to maintain across viewing modes.
- **Implementation scope:** Presentation rules in `css/components/lightbox.css`. Preserve selectors, dialog markup, image fitting, existing size breakpoints, coarse-pointer navigation visibility, gallery/single mode rules, counter announcements, keyboard/swipe/zoom/fullscreen behavior and focus/scroll restoration. No changes to image assets or variant resolution.
- **Acceptance criteria:** Visible controls share the chosen surface/ink rules across homepage, gallery and menu lightboxes, including zoom/fullscreen where supported. Counter status remains visually separate from actions. Check the resulting control glyphs and focus indicators against representative light and dark image regions; navigation and counter remain hidden in single-image mode, and existing reduced-motion behavior is retained.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Bring the offline message into Ambre's status-panel presentation

- **Affected area:** The existing offline fallback page's main content.
- **Evidence:** `offline.html:95-99`; `css/base/base.css:57-60`; `css/style.css:25-30`; `css/pages/404.css:1-44`. Source searches across imported CSS found no `.offline-card` or `.offline-page` presentation rules.
- **Current state:** Offline content consists of a heading, message and existing return link directly inside `main.offline-card`, using global typography and button styling. The 404 view has an explicit centered, constrained status panel with component padding, a surface, border and spacing.
- **Proposed improvement:** Give the offline message a constrained panel and responsive outer spacing using the existing status-view visual language. Group the heading, explanation and return action with deliberate gaps, without introducing additional actions or status logic.
- **Expected value:** Consistent utility-page presentation and a clearer visual grouping of the explanation and recovery link.
- **Implementation scope:** `offline.html` only if a panel wrapper is needed, plus a small page stylesheet imported by `css/style.css`. Reuse existing typography, spacing, surface and button tokens. Preserve Polish content, `main`/skip-link target, `/` return URL, shared header/footer, metadata, `noindex`, theme support and all Service Worker/cache behavior; add no remote assets.
- **Acceptance criteria:** The message panel has a bounded desktop width and token-based spacing at 320px, 390px and desktop widths, with its action fully visible. Light, dark and system-theme presentation uses existing theme colors. The content and link remain usable without JavaScript using the existing local stylesheet; the page does not change caching or imply that uncached destinations are available offline.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The five proposals have separate objectives: typography policy, tabular hierarchy, disclosure layout, media-control surfaces and utility-page composition. They target existing content and interactions without requiring a redesign, new features, dependencies or media assets. Ordering reflects shared scope and practical implementation value, not measured user outcomes.

Each can be implemented independently. Typography choices from IMP-UI-01 can be reused in later table or status-panel work, but are not a prerequisite. FAQ layout stays isolated from other grids; lightbox presentation stays isolated from its interaction logic. Production copies would be regenerated through the existing build only during a separately approved implementation task.

## Analysis limitations

This is a static review of the current checkout. Evidence establishes CSS declarations, markup and interaction contracts; browser rendering, responsive behavior, font-face usage and contrast were not measured. Acceptance criteria describe future implementation checks, not results obtained during this analysis.

No build, application test suite, deployment check or runtime offline scenario was executed. Historical verification records were used to avoid recycling completed work, not as proof of current behavior. Impact and effort are relative engineering estimates; no usability, performance or commercial outcomes are claimed.
