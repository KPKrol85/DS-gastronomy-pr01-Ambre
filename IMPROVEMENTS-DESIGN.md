# Ambre — Design Improvements

**Analysis date:** 2026-10-18

**Project type:** Static eight-page fine-dining restaurant portfolio/demo; HTML, modular CSS and Vanilla JavaScript

**Status:** Proposed — awaiting owner review; no implementation authorized

**Analysis mode:** Evidence-based creative design review

**Focus:** Project-wide design

## 1. Methodology and evidence

The review covered the homepage, full menu and gallery, shared navigation and footer, reservation presentation, project-information dialog, and the shared visual treatment of legal and utility pages. Direct visual inspection occurred: current local source rendering and screenshots were inspected, including separate views of the hero, photographs, booking panel and closing contact composition.

- **Source:** Root HTML, `css/base/`, relevant component/layout/page styles, and the theme, filtering, gallery loading and lightbox implementation. Canonical ownership was checked against `css/style.css`, `js/script.js`, `package.json` and the build description. Font character maps were inspected directly.
- **Runtime:** Chromium previews of current canonical files, using a local static server and supplementary Playwright request fulfillment from the same files. Homepage samples were 1440 × 1000, 768 × 1024 and 390 × 844 in light and dark themes. Focused interaction and font-rendering probes supplemented screenshots.
- **Visual:** Rendered compositions, the original hero and chef photographs, and menu/gallery imagery. Early full-page captures contained unpainted lazy images; these empty areas were excluded from design findings. Subsequent image review used scrolled, decoded images.
- **Historical:** `docs/CHANGELOG.md`, `docs/archive/plans/PLAN-2026-08-22.md`, the archived UI, UX, TECH, QUALITY and WORKFLOW improvement reports, and relevant sections of the two archived August audits. Their test results are historical, not results of this review.
- **Context:** `AGENTS.md`, `README.md`, `docs/ARCHITECTURE_MAP.md`, relevant `docs/settings.md` guidance and the third-party-material provisions of `LICENSE.md`.
- **Design judgment:** Professional interpretation of those observations, explicitly separated from source facts and runtime results below.

No existing `IMPROVEMENTS-DESIGN.md`, active root plan, or separate current brand brief was found in the inspected project inventory. The discovered plan is completed and archived. The report does not assume a researched customer segment, real restaurant operations, verified reviews, or approved photography rights. No external reference sites or competitors were used.

## 2. Executive design assessment

Ambre already has a recognizable starting vocabulary: an amber cutlery emblem and script wordmark, geometric headings, quiet sans-serif copy, fine accent rules, warm dining imagery and restrained image frames. The current menu and gallery treatments carry this vocabulary across pages; the about section already varies the otherwise centered composition with a larger photograph and an aligned reading column. These are useful foundations to retain.

**Design judgment:** The principal creative limitation is the relationship between the images and the story. A formal table setting, chef at work, disparate dining rooms, large shared dishes and celebration photographs coexist without a clearly prioritized photographic narrative. Equal gallery tiles present that collection as an inventory. At the end of the homepage, a second prominent reservation message restarts the visual pitch after the substantial booking panel.

The next phase should develop an **Amber dining journal**: a coherent sequence of table, craft, food and hospitality, supported by a deliberate opening composition and a quieter closing note. Four improvements qualify. A new typeface, redesigned dish cards, additional animation, or a replacement framework is not justified by this review.

## 3. Current design identity

### Brand and first impression

**Source:** `index.html` combines the shared header identity with a second wordmark inside `.site-hero`, the heading “Sezonowe menu degustacyjne”, descriptive copy and two native anchor actions. `css/components/hero.css` centers this stack over one full-bleed photograph with a vertical wash and central scrim.

**Visual / Design judgment:** The amber tableware and gold identity create a consistent opening mood. Glassware, folded napkins and flowers carry more specific visual information than the seasonal-food promise. The text is readable in the inspected views; the opportunity is to make image and message more deliberately complementary, not to classify the existing overlay as a readability defect.

### Typography and editorial hierarchy

**Source:** `css/base/tokens.css` declares local Poppins 400/600 and Source Sans 3 400/500. `css/base/typography.css` uses Poppins emphasis for headings, balanced wrapping, and a restrained body/lead hierarchy. `.section-title` in `css/base/base.css` supplies the repeated centered accent rule; the about section intentionally aligns its heading left on wider screens.

**Runtime:** Loaded font faces were observed, but loading does not establish character coverage. Character-map inspection found missing Polish glyphs in all four files; Chromium also reported a system-font glyph in the closing heading. This is a prerequisite below. The archived weight-alignment improvement remains completed and is not proposed again.

**Design judgment:** Keep the current families while resolving coverage. Distinctiveness can come from the relationship between heading, photograph and reading column rather than another font. Retain existing readable prose measures on supporting documents.

### Composition, materials and components

**Source:** The about section has its own unequal two-column composition. Menu cards share image, title, price, description and hairline treatments across homepage and full menu. Gallery tiles share their frame and square ratio across both gallery surfaces. Booking uses a contained form/information composition. FAQ disclosures and testimonial cards use related pale or dark surfaces.

**Visual / Design judgment:** The open page around the recent menu and gallery treatments is effective. Replacing those components would discard useful work. Greater variation is justified specifically in the photographic gallery composition and the closing sequence, rather than in every section.

**Source:** The light palette uses white, a pale rose-gray surface (`#f7f2f4`), dark ink and amber; the dark palette uses near-black, a blue-black surface (`#12121a`) and amber. The footer has its own theme-aware gradient treatment. **Design judgment:** Preserve these recognizable editions. Let the photographs supply warmth; avoid introducing a competing palette, texture library or additional glass effects. Surface and accent contrast would require measurement if later changed.

### Imagery and visual storytelling

**Visual:** The hero is a close table-setting scene; the about image shows a chef plating food in a stainless-steel kitchen. The full gallery includes visibly different dining-room settings, overhead shared-food scenes, a toast and a purple-lit event room. The homepage preview combines a shared dish, wine, dessert and an interior.

**Source:** `galeria.html` groups images through the existing Wnętrza, Dania and Imprezy filters. Its gallery has eleven items; the homepage has four. `css/components/gallery.css` and `css/pages/galeria.css` use equal square frames, with a four-column homepage row and a three-column full-gallery grid at their wider breakpoints.

**Design judgment:** Individual subjects are understandable, but the collection does not yet establish one imagined place and one culinary atmosphere. The equal frames are technically useful; their uniform emphasis is the separate compositional opportunity. Neither image provenance nor real-world venue identity can be established from these pictures.

### Motion and responsive art direction

**Source:** Current motion includes modest image scaling, control transitions, the theme switch and native disclosure/dialog behavior, with reduced-motion rules in the relevant components. No additional motion is needed to support the recommended direction.

**Runtime:** The homepage hero measured approximately 860 px high at 1440 × 1000, 881 px at 768 × 1024 and 743 px at 390 × 844. The same central image crop and overprinted-copy model serves those sizes. The menu changes from two desktop columns to a single sequence; homepage gallery tiles change from four columns to two.

**Visual / Design judgment:** Mobile retains clear headline/action hierarchy, but the tall background photograph is predominantly glassware behind the copy. A deliberate mobile opening can express the meal through an unobstructed image while keeping the primary action available. Responsive gallery work should preserve a meaningful sequence, rather than merely shrinking a featured desktop arrangement.

### Closing composition and supporting pages

**Source / Visual:** `index.html` places `#rezerwacja`, `#kontakt`, FAQ and the shared footer in that order. The booking form already has grouped fields and an information column. The following contact section introduces another large heading in a broad panel; `css/components/cta.css` gives `.cta__box` a large shadow and hover lift. The recently refined footer separates navigation, contact, location and social links.

**Design judgment:** Keep booking as the closing action's visual anchor. The following phone invitation can become its editorial postscript instead of another raised destination. Preserve the existing FAQ arrangement and footer composition.

**Source / Visual:** Shared typography, legal document styles and contained 404/offline panels provide continuity at an appropriate level. The privacy page and both utility-page compositions were visually sampled in dark mode. No separate creative redesign of these pages qualifies.

## 4. Design prerequisites

These are dependencies or content-correctness concerns, not optional creative proposals. None was repaired during this review. The Polish font-coverage prerequisite was subsequently resolved under a separate authorized correction, as recorded below; the remaining two prerequisites are still open.

| Prerequisite | Evidence | Follow-up boundary |
| --- | --- | --- |
| Restore Polish character coverage before final typography approval. **Status: RESOLVED — implemented and verified.** | **Original finding:** `assets/fonts/` contained four Latin WOFF2 faces declared in `css/base/tokens.css`. `fontTools.ttLib.TTFont.getBestCmap()` found all four lacked ą, ć, ę, ł, ń, ś, ź, ż and their uppercase equivalents; ó/Ó were present. **Runtime:** Chromium's platform-font inspection of `.cta__title` reported 27 Poppins glyphs and one Segoe UI Semibold glyph; a later exhaustive sweep found Segoe UI or Segoe UI Semibold supplying Polish glyphs on 1370 of 1538 Polish-bearing text nodes. **Resolution:** matching `latin-ext` subsets were added for Poppins 400/600 and Source Sans 3 400/500, with explicit non-overlapping `unicode-range` declarations on all eight faces; families, weights, typography tokens, local hosting and `font-display: swap` are unchanged. **Verification:** the same sweep over 1538 nodes now reports Poppins and Source Sans 3 only, at 390, 768 and 1440 px in both themes, against the canonical sources and the production `dist/` output, with unchanged document heights, no re-wrapped text and no horizontal overflow. | Closed. Typography and wrapping reviews for dependent compositions may now proceed on the corrected faces. The decorative `★` rating glyph in `.testimonials__stars` is still supplied by a system font; it is not a Polish character and was intentionally left outside that correction. |
| Resolve dish/photo correspondence before selecting a named dish as a visual anchor. | **Source:** The Sandacz card in `index.html` and `menu.html` references the `sandacz-*` image family and describes fish with risotto and fennel. **Visual:** The displayed photograph shows sliced rolled meat, inconsistent with that presentation. | Verify and correct the mapping or approve a truthful representative treatment in a separate content/asset task. Do not invent replacement dishes, prices or descriptions. |
| Approve the final representative image set and applicable usage rights before asset-dependent design sign-off. | **Source:** `README.md` and the project-information dialog identify a fictional restaurant demo; `LICENSE.md` reserves separate terms for third-party material. The inspected documentation does not establish item-level image provenance or approval for a replacement set. | Owner approval is required for the selection and its representation as demo imagery. This is an approval dependency, not a claim that files are missing or unlawfully used. No sourcing, generation or licensing work is authorized here. |

## 5. Creative design directions

Two directions are meaningful because the existing material supports both hospitality and kitchen craft. They differ in narrative emphasis, not simply in colors.

| Dimension | Amber dining journal | Seasonal kitchen atelier |
| --- | --- | --- |
| Philosophy | An invitation to a meal, expressed through table, preparation, plate and atmosphere. | An account of culinary making, led by preparation, ingredients and finished plates. |
| Typography | Existing families; clear editorial opening, readable prose, quiet practical information. | Existing families; tighter relationship between dish titles, short process notes and photography. |
| Color / material | Existing light and dark editions, amber rules and open page surfaces; warmth primarily from images. | More visually neutral photographic backgrounds and precise working surfaces; amber reserved for navigation and actions. |
| Composition / imagery | One opening scene, a curated photographic sequence, functional menu cards, restrained closing note. | Chef/process imagery dominates; dining-room and celebration imagery becomes secondary. |
| Motion | Existing state and hover feedback only. | Existing state and hover feedback only. |
| Mobile | Copy and actions stay concise; photographs become an intentional reading sequence. | Process and plate alternate in a more documentary sequence. |
| Strengths | Builds directly on the wordmark, amber table scene, atmosphere copy and current component restraint. | Reinforces the seasonal-cooking message and existing chef image. |
| Trade-offs | Requires disciplined image curation to avoid a generic banquet aesthetic. | Needs substantially stronger process/ingredient material than the current collection establishes. |
| Technical implications | Local HTML/CSS compositions and approved image variants within the existing pipeline. | Similar stack, but greater image/content dependence; no verified process copy should be invented. |

## 6. Recommended direction

Recommend **Amber dining journal**. It preserves more of the current visual identity and requires fewer unsupported content assumptions. Its distinction should come from consistent photographic atmosphere and a deliberate relationship between open typography and images, rather than new decorative components.

The primary objective is to make the existing seasonal-meal invitation feel like one authored sequence. Retain the emblem and script wordmark, Poppins/Source Sans pairing subject to glyph correction, amber accents, refined dish cards and filters, the about composition, and the working booking/footer structures.

The guiding hierarchy is **invitation → craft and food → atmosphere → booking → practical closing note**. This describes emphasis within the existing page order; it does not authorize rearranging sections or changing journeys.

The scope is visual development within semantic HTML, modular CSS and existing JavaScript contracts. Public content remains Polish. Demo disclosure, routes, section IDs, native hero links, ARIA, filters, lightbox modes, form validation/submission, theme storage, reduced motion and PWA behavior remain protected. No rebranding, new feature, framework, library or extra font is required. Legal and utility pages inherit only any subsequently approved shared treatment, without bespoke redesign.

## 7. Prioritized design improvements

Priorities represent implementation value and dependencies, not defect severity. These proposals do not authorize implementation. Acceptance criteria below describe future verification; they are not claims that the proposed designs already exist. Impact and effort are relative professional estimates, not measured business outcomes or delivery commitments.

### IMP-DESIGN-01 — Establish one photographic story for the imagined dining experience

- **Status:** In progress — 01A review and 01B completed; 01C (dish and gallery photography) open. The parent proposal is not completed.
- **Stage 01B — Hero and About photography:** COMPLETED — implemented and verified (2026-10-23). The hero uses `hero-1600x900.jpg` / `hero-2560x1440.jpg` (16:9) and the about section `chef-800x600.jpg` / `chef-1600x1200.jpg` (4:3), with WebP/AVIF from `npm run img:opt -- --source … --force`; `hero-03-*` and `chef-01-*` and their variants were removed. The 1600 × 1200 craft source was supplied as `about-01-800x600.jpg`, verified as the same photograph at its actual 1600 × 1200 size and renamed without resampling. `img:verify`, `qa:links`, `qa:html`, `qa:csp` and `build` passed; Chromium review at 390/768/1440 px in both themes confirmed AVIF delivery, uncropped 4:3 about rendering and no overflow. Provenance: owner-supplied in commit `fd646c8`, no embedded EXIF/XMP/ICC; licence and origin are not recorded in the repository. At 390 px the plated subject sits in the lower-right of the crop beneath the hero actions — a composition matter for IMP-DESIGN-02.
- **Priority:** P1
- **Affected area:** Hero, about, dish photography and both gallery surfaces.
- **Evidence:** **Source:** Image references in `index.html`, `menu.html` and `galeria.html`; local `assets/img/hero/`, `about/`, `dishes/` and `gallery/`. **Visual:** Formal table-setting hero, documentary kitchen image, varied dining rooms, overhead shared dishes and event scenes.
- **Current state:** Images cover the site's subjects, but their settings, food presentation and lighting vary substantially. Image-role and representation approvals are not established by the inspected documentation.
- **Design judgment:** A consistently authored image set would express Ambre more distinctly than additional interface decoration. Color grading alone cannot make unrelated rooms or food subjects coherent.
- **Proposed improvement:** Curate a representative demo sequence around table, craft, plate and hospitality. Favor warm controlled light, believable food color, quiet backgrounds and compatible dining settings. Assign each selected image a specific story role; retain current assets where they fit. Define focal points and usable wide, square and narrow crops before placing images into compositions.
- **Expected value:** A recognizable culinary atmosphere that carries from first impression to gallery without relying on new marketing claims.
- **Implementation scope:** Later authorized asset selection and canonical HTML image references, alternatives, dimensions and responsive variants through the existing image workflow. Separate reviewable slices are the approved selection, hero/about application, then dish/gallery application. Preserve asset delivery formats and lightbox source/variant contracts; never hand-edit generated optimized images or `dist/`.
- **Dependencies:** Owner approval of direction, representative imagery and usage rights; dish/photo correspondence prerequisite. No new assets are assumed approved.
- **Acceptance criteria:** Every selected image has an approved subject/role and recorded provenance sufficient for the owner's intended use. Named dishes correspond to the pictures shown. Desktop, tablet and mobile reviews use the final approved images, with principal subjects retained in each crop and no misleading venue/person identification. Existing image links, text alternatives, responsive variants and loading behavior continue to work; use `npm run img:verify` and `npm run qa:links` after any authorized asset changes.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-02 — Compose the hero as an editorial invitation beside a visible dining scene

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** Homepage `.site-hero` and its responsive composition.
- **Evidence:** **Source:** `index.html`, `.site-hero__media`, `.site-hero__inner` and native actions; `css/components/hero.css` centers the text over a cover image with a central scrim. **Runtime / Visual:** The sampled hero retains that arrangement across three widths; at 390 px the narrow crop places enlarged glassware behind the heading and copy.
- **Current state:** Wordmark, heading, lead and actions form one centered stack over the photograph. The same image area supplies atmosphere and the text's background.
- **Design judgment:** Giving the photograph its own unobstructed field would let it communicate the approved dining story while typography establishes a more distinctive opening rhythm.
- **Proposed improvement:** Develop a bounded editorial composition: a calm text/action field adjacent to a dominant photographic field on wide screens. On mobile, let the concise copy and actions lead into a deliberately cropped scene. Use the current typefaces, wordmark and amber accent; establish the composition through image/type proportion rather than a larger headline or additional copy.
- **Expected value:** A clearer relationship between the seasonal-menu invitation and its imagery, with a purposeful mobile opening.
- **Implementation scope:** `index.html` hero markup where necessary and `css/components/hero.css`. Preserve the heading's meaning, both anchor destinations and accessible labels, header behavior, decorative-media semantics and meaningful reading order. Keep styles local to the hero; no carousel, video or motion library.
- **Dependencies:** Final hero selection/crops from IMP-DESIGN-01 and Polish font coverage before final wrapping approval. Layout exploration can proceed separately from asset production, but final acceptance cannot use unrelated placeholders.
- **Acceptance criteria:** One photographic subject remains legible independently of the text at 1440, 768 and 390 px; the heading and primary action remain the opening's clear text hierarchy. At 390 × 844 the primary action is visible without an image pushing it out of the initial viewport. At 320 px, 200% zoom and a short landscape viewport, content remains reachable without clipping or horizontal overflow. Verify light/dark/system presentation, contrast, keyboard focus, native navigation with JavaScript disabled and reduced-motion scrolling; run existing HTML/links checks when markup changes.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Give the gallery an editorial opening and a readable photographic sequence

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** Homepage gallery preview and `galeria.html` composition.
- **Evidence:** **Source:** Four homepage images and eleven full-gallery images; `.gallery--home .gallery__grid`, `.gallery__item` and `css/pages/galeria.css` define equal square grids. **Visual:** The preview gives dish, wine, dessert and room equal emphasis; the full gallery presents markedly different scenes in a continuous equal-tile sequence.
- **Current state:** Both surfaces use consistent, restrained frames and predictable responsive column counts. The full gallery filters by category and opens the visible group in the existing lightbox.
- **Design judgment:** Those component qualities should remain. The opportunity is to distinguish an opening photographic statement from supporting views, so the section reads as an authored selection rather than an asset sheet.
- **Proposed improvement:** Create a controlled opening spread with one scene carrying the invitation and supporting images showing food and detail. Use a finite grid composition that follows source reading order. Keep filtered results compact and predictable; a selected category need not reproduce the unfiltered opening spread. On mobile, translate emphasis into sequence and image proportion rather than preserving desktop spans.
- **Expected value:** Stronger visual storytelling and a section identity distinct from the functional menu-card sequence.
- **Implementation scope:** `index.html`, `galeria.html`, `css/components/gallery.css` and `css/pages/galeria.css`. Review the homepage preview and full gallery as separate slices of the same objective. Preserve the current frame language, category values, ARIA/state attributes, image links, visibility/load-status contracts and lightbox grouping. Avoid masonry, visual-only reordering and new filtering behavior.
- **Dependencies:** Approved imagery and crops from IMP-DESIGN-01. Coordinate the opening's proportions with IMP-DESIGN-02; no JavaScript rewrite is presumed necessary.
- **Acceptance criteria:** The unfiltered opening has a deliberate scene/detail hierarchy using final assets; subsequent items remain discoverable in meaningful DOM and keyboard order. At 390, 768 and 1440 px, every category produces a compact layout without empty reserved feature slots or cropped-out primary subjects. Item counts, active filters, completed status and visible-group lightbox navigation remain unchanged. Review both themes, touch/focus states and reduced motion; use existing `test:e2e:gallery-status` and `test:e2e:lightbox` for the affected contracts.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-04 — Turn the contact panel into a quiet postscript to booking

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `#kontakt` and its visual relationship to the preceding booking section and following FAQ.
- **Evidence:** **Source:** `index.html` places the substantial booking panel before another reservation heading and telephone invitation; `.cta__box` in `css/components/cta.css` has a bordered surface, large shadow and hover translation. **Runtime / Visual:** The contact section occupies about 462 px at the sampled desktop viewport and appears as another prominent raised panel after booking.
- **Current state:** The form is followed by an independent, centered promotional panel before the practical FAQ and footer.
- **Design judgment:** The second panel restarts the pitch and competes with the form's compositional role. A typographic closing note would better complete the restrained dining-journal direction.
- **Proposed improvement:** Present the existing phone invitation as an open editorial postscript aligned with the booking composition, using a fine rule and clear text hierarchy. Reduce its independent headline/surface emphasis so booking remains the principal closing anchor. Preserve the phone option as an obvious actionable link.
- **Expected value:** A more intentional transition from booking to practical information, without adding another CTA or removing a contact route.
- **Implementation scope:** Local `#kontakt` markup/classes only where needed and its rules in `css/components/cta.css`; nearby section rhythm only as necessary. Keep `#kontakt`, the telephone destination, existing Polish content and document order. Preserve the recently refined form, FAQ grid and footer components. No reservation workflow or testimonial changes.
- **Dependencies:** Direction approval and Polish font coverage before final headline review. Asset-independent; it can proceed independently of IMP-DESIGN-01–03 after separate authorization.
- **Acceptance criteria:** At 390, 768 and 1440 px, contact reads as a continuation of booking with no separate elevated promotional card, while the phone link remains distinguishable and keyboard/touch accessible. FAQ and footer retain their structure and functionality. Verify light/dark/system editions, focus, link contrast, 200% zoom, short viewports and the `#kontakt` anchor offset. Use existing CSS lint, plus HTML/links checks if markup changes; form tests are needed only if the protected form is actually touched.
- **Impact:** Medium
- **Effort:** Small

## 8. Suggested implementation sequence and dependencies

This is an advisory sequence for separately approved work, not authorization to implement it.

1. **Owner decisions and prerequisites:** Choose the direction; authorize the font-coverage and dish/photo corrections separately; approve the image selection/representation boundary. Settle glyph coverage before final text-composition judgments.
2. **Photographic foundation:** Approve the table/craft/plate/hospitality selection and crop suitability under IMP-DESIGN-01. Apply it in bounded asset/source slices through current tooling. Asset selection is the foundation here; a new token system or typography replacement is unnecessary.
3. **Primary composition:** Implement IMP-DESIGN-02 after the hero image and its crops are approved. Review desktop/tablet and mobile composition together.
4. **Dependent gallery composition:** Implement IMP-DESIGN-03 in homepage-preview and full-gallery slices, preserving the functional tile/filter/lightbox layer.
5. **Independent closing work:** IMP-DESIGN-04 can proceed alongside imagery preparation once direction and font coverage are settled. It does not depend on gallery work.
6. **Integration review:** Inspect the opening, about/menu continuity, galleries and closing as one sequence in both themes and under system preference. Sample legal and utility pages for unintended shared-style effects. Use focused existing checks per changed area; do not replace this with one massive redesign change or automatically require every project suite for every slice.

## 9. Verification performed and limitations

### Actual checks

| Area | Inspection performed | Result / boundary |
| --- | --- | --- |
| Source and history | `Get-Content`, `rg --files` and focused `rg` searches; current package scripts and source ownership; discovered archived plan and all five improvement categories. | Completed UI/UX and technical work was considered and excluded from the new proposals. No active approved design implementation was identified in the inspected documents. |
| Homepage rendering | Chromium at 1440 × 1000, 768 × 1024 and 390 × 844, light/dark; screenshots and section-height probes. | No horizontal document overflow in these six samples. This is not a full responsive or zoom audit. |
| Other pages | Menu and gallery captures at 1440 × 1000 and 390 × 844 in dark mode; additional decoded gallery inspection in light mode; privacy, 404 and offline composition at 1440 × 1000 in dark mode. | Direct visual sampling occurred. Cookie/terms pages were considered through shared styling and source/context; they were not independently rendered in this review. Rendering `offline.html` does not test actual offline fallback, and rendering `404.html` does not verify hosting status codes. |
| Focused interactions | Accepted the demo dialog; switched the theme with its control; opened a FAQ disclosure and dish details; opened/dismissed the mobile drawer with Escape; selected Desery and Dania filters; opened/closed a native gallery dialog with Escape. | Observed one dessert and four food-gallery items after filtering, drawer dismissal and native lightbox open/closed states. With no stored choice, changing system preference to dark and back to light produced the expected root theme states. These were discovery probes, not the existing full regression suites. |
| Font files and rendering | Read-only Python/fontTools character-map probe over all four WOFF2 files; Chromium `CSS.getPlatformFontsForNode` on the closing heading. | Confirmed the coverage prerequisite and actual fallback glyph. No font file was modified. |

Commands included the existing server-discovery helper, `npm run dev -- --no-browser`, read-only one-off Node/Playwright probes and the Python/fontTools probe. Restricted localhost access required a static server in the browser's execution context. Supplementary probes fulfilled requests directly from canonical local files, blocked external requests and disabled Service Workers. Temporary analysis captures were kept outside the repository. Neither this preview setup nor early captures with unpainted lazy images establish deployment or missing-asset findings.

### Material limitations

This was a Chromium design review, not cross-browser certification, a formal accessibility audit or a performance benchmark. Browser zoom, 320 px, short/landscape screens, screen readers, full keyboard traversal, native touch/swipe and measured contrast were not verified. Reduced motion was enabled for inspection; normal animation timing was not visually assessed. System preference was inspected in source and exercised in a supplementary focused probe; it is not a fresh execution of the full theme regression suite.

No real reservation was submitted, external map activated, review provenance established, image rights certified, public deployment inspected or production build created. Production headers, Netlify processing, PWA installation and real offline behavior were outside the preview environment. No broad QA suites, dependency installation, automatic fixes, asset generation or write-formatting commands were run.

Only `IMPROVEMENTS-DESIGN.md` was created as a project change. Required-section/proposal-field, sequential-identifier and local evidence-path checks passed. `git diff --check` and the new-file check `git diff --no-index --check -- NUL IMPROVEMENTS-DESIGN.md` reported no whitespace errors; the working-tree check showed only the new report. No proposed design improvement was implemented.

## 10. Owner decisions required

- Approve **Amber dining journal**, or select the more process-dependent **Seasonal kitchen atelier** alternative before implementation planning.
- Approve the representative image selection and its usage rights, including whether images are retained or replaced; resolve the named-dish photo correspondence. Preserve explicit demo representation and do not present selected images or existing reviews as verified real operations.
- Approve the hero trade-off: separate text/image fields and a mobile copy/action-first sequence, instead of the current centered overprint. No new family selection is requested; approve the separate font-coverage correction before final typography sign-off.
- Select any of the four proposals for a later authorized implementation cycle. This report alone does not authorize code, content, asset or delivery changes.
