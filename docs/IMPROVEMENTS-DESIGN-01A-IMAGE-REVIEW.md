# IMP-DESIGN-01A — Image inventory and photographic art direction

**Review date:** 2026-10-22

**Repository:** `DS-gastronomy-pr01-Ambre`, branch `kodek/ambre-photo-inventory-review-305236`, clean working tree at review start (`d9586e8`).

**Status:** Review only — no implementation authorized, no photographic asset changed.

**Parent proposal:** `IMPROVEMENTS-DESIGN.md` → IMP-DESIGN-01 (Status: Proposed).

**Stage:** 01A of three. 01B (hero and about photography) and 01C (dish and gallery photography) are future, separately authorized tasks.

**Follow-up (2026-10-23):** 01B has been implemented. `hero-03-*` and `chef-01-*`, reviewed below, were replaced by owner-supplied `hero-*` and `about-*` families and removed from the repository; references to them in this review are historical. See `IMPROVEMENTS-DESIGN.md` → IMP-DESIGN-01.

---

## 1. Purpose and approved creative direction

### 1.1 Purpose

Establish, from the current repository only, which photographs Ambre actually has, what each one shows, where each is used, how each relates to the approved **Amber dining journal** direction, and which owner decisions and licensing checks must precede any asset work.

This document prepares decisions. It does not authorize them, does not select replacement sources, and does not change any image, markup, style or script.

### 1.2 Approved direction

`IMPROVEMENTS-DESIGN.md` §6 records **Amber dining journal** as the recommended and owner-approved direction: one authored sequence expressing *invitation → craft and food → atmosphere*, carried by warm controlled light, believable food colour, quiet backgrounds and compatible dining settings, inside the existing amber identity, existing Poppins / Source Sans 3 typography, existing components and both themes.

The four narrative roles used throughout this review are:

| Role | Question the photograph answers | Primary surfaces today |
| --- | --- | --- |
| **Table — Invitation** | What does arriving at Ambre feel like? | Homepage hero |
| **Craft — Culinary preparation** | Who makes the food, and how? | About section (`#onas`) |
| **Plate — Food presentation** | What will actually be served? | Dish cards (`index.html`, `menu.html`), gallery `dania` filter |
| **Hospitality — Dining atmosphere** | What is the room and the evening like? | Gallery `wnetrza` / `imprezy` filters, homepage gallery preview |

### 1.3 Truthfulness constraint

`README.md` describes Ambre as a demonstration site for a **fictional** restaurant; the first-visit project dialog repeats this; `LICENSE.md` §8 reserves separate terms for third-party material. Nothing in this review asserts that any photograph depicts a real Ambre venue, a real Ambre dish or a real Ambre guest, and no recommendation below assumes that any image is licensed, original, client-supplied or production-ready.

---

## 2. Methodology and evidence

Evidence categories are used consistently below and never blended.

| Category | What it means here |
| --- | --- |
| **Source** | Directly read canonical files: root HTML, `css/`, `js/modules/`, `scripts/`, `package.json`, project documentation, or asset metadata read programmatically. |
| **Runtime** | Behaviour actually observed in a browser against the current canonical files. |
| **Visual** | Direct inspection of the decoded photographs themselves, or of rendered screenshots. |
| **Historical** | Statements already recorded in `docs/CHANGELOG.md`, `docs/archive/**` or `IMPROVEMENTS-DESIGN.md`. Their results are historical, not results of this review. |
| **Design judgment** | Professional photographic / art-direction interpretation, explicitly separated from the three categories above. |

### 2.1 Source inspection

Read in full or in the relevant part: `AGENTS.md`, `CLAUDE.md`, `README.md`, `LICENSE.md` (§3, §8, §9), `IMPROVEMENTS-DESIGN.md`, `docs/ARCHITECTURE_MAP.md`, `docs/CHANGELOG.md`, `docs/archive/improvements/*`, `docs/archive/audits/*`, `docs/archive/plans/PLAN-2026-08-22.md`, `package.json`, `scripts/optimize-images.mjs`, `scripts/img-verify.mjs`, `index.html`, `menu.html`, `galeria.html`, `css/components/hero.css`, `css/components/about.css`, `css/components/menu.css`, `css/components/gallery.css`, `css/components/lightbox.css`, `css/pages/galeria.css`, `js/modules/lightbox.js`, `js/modules/demo-legal.js`, `.gitignore`, `sw.js`.

All eight HTML pages plus `sw.js` and `manifest.webmanifest` were swept for `assets/img/**` references.

### 2.2 Asset metadata

Every raster file under `assets/img/` (excluding `_optimized/`) was decoded with the project's own pinned Sharp (0.35.4, resolved from the main checkout — the worktree has no `node_modules/`) to read pixel dimensions, colour space, density and embedded EXIF/XMP. A second read-only pass sampled the bottom-right corner of each file to locate the embedded emblem described in §3.4. No file was written, renamed, re-encoded or optimized.

### 2.3 Direct visual inspection

**Direct visual inspection did occur.** Two independent methods were used:

1. **Decoded source photographs.** Each canonical photograph was downscaled to a temporary preview outside the repository and inspected directly, plus native-resolution crops of the bottom-right corner where a mark was detected.
2. **Rendered pages.** A temporary read-only static server (a scratchpad Node script, outside the repository, serving the worktree unchanged) was fronted by the in-app Chromium pane. `demoLegalAccepted` was seeded in `localStorage` so the first-visit dialog did not inert the page. Lazy images were forced to decode before each capture; early captures with unpainted images were discarded and are not used as evidence.

Sampled views:

| Page | Widths | Theme | What was captured |
| --- | --- | --- | --- |
| `index.html` | 1440 × 1000, 768 × 1024, 390 × 844 | light | Hero, about, dish cards, gallery preview |
| `index.html` | 390 × 844 | light | Mobile dish cards and gallery preview |
| `galeria.html` | 1440 × 1000 | light + dark | Full eleven-item grid, top and bottom |

Box geometry, selected `srcset` candidates and computed grid columns were read from the live DOM rather than inferred.

### 2.4 What was deliberately not done

No image was downloaded, generated, edited, cropped, renamed or re-optimized. `npm run img:opt`, `img:webp`, `img:avif` and `img:clean` were not run. The full QA suite, Lighthouse, the E2E suites, `img:verify` and `qa:links` were not run — §13 explains why and what that leaves unverified.

---

## 3. Existing photographic inventory

### 3.1 Canonical source ownership

**Source:** `assets/img/` holds the canonical originals. `assets/img/_optimized/` is **generated output** of `scripts/optimize-images.mjs` (WebP q80/effort4, AVIF q50/effort4, same pixel dimensions as the original) and is never a source. Both are tracked by Git: 196 files under `assets/img/`, of which 126 are under `_optimized/`. `dist/` is ignored (`.gitignore:11`) and is likewise not a source.

Not every directory holds one subject type: `assets/img/gallery/` mixes interiors, food, a wine still life and celebration scenes; `assets/img/dishes/` holds only menu-card food; `assets/img/avatars/` holds testimonial portraits; `assets/img/og-img/` holds designed share cards, not photographs; `assets/img/logo-img/` holds SVG identity marks.

### 3.2 Counts

| Set | Distinct photographs | Source raster files | Generated variants |
| --- | --- | --- | --- |
| Hero | 1 | 2 | 4 |
| About | 1 | 2 | 4 |
| Dishes | 4 | 12 | 24 |
| Gallery | 13 | 39 | 78 |
| **Narrative subtotal (01A scope)** | **19** | **55** | **110** |
| Testimonial avatars (secondary, §3.6) | 3 | 6 | 12 |
| **Photographs, total** | **22** | **61** | **122** |
| Open Graph cards (non-photographic) | — | 2 | 4 |
| Identity marks (SVG) | — | 6 | — |

**19 canonical photographs are in the Table → Craft → Plate → Hospitality scope**; 3 further photographs (avatars) are inventoried as a secondary set because they are photographs of people used on `index.html`.

### 3.3 Inventory table

Dimensions and ratios are decoded from the files. "Variants" lists source JPEG sizes; each has a matching `.webp` and `.avif` under `_optimized/` at identical pixel dimensions. "XMP" records embedded provenance metadata (see §11).

#### Hero

| Path | Subject (Visual) | Role | Px | Ratio | Variants | Used on | XMP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `assets/img/hero/hero-03-2560x1440.jpg` | Close banquet table setting: gold/champagne satin napkins on gold-rimmed chargers, crystal stemware, rolled ribboned menus, pink-and-peach flowers, warm shallow depth of field | Table | 2560×1440 | 16:9 | 1600×900, 2560×1440 | `index.html` `.site-hero__media` (`alt=""`, `fetchpriority="high"`, `sizes="100vw"`) | Canva render, 2025-10-14 |

#### About

| Path | Subject (Visual) | Role | Px | Ratio | Variants | Used on | XMP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `assets/img/about/chef-01-1600x1200.jpg` | Chef in white jacket and black apron plating three white plates in a stainless-steel professional kitchen; visible steam, forearm tattoo, identifiable face | Craft | 1600×1200 | 4:3 | 800×600, 1600×1200 | `index.html` `.about__photo` (`loading="lazy"`, descriptive Polish `alt`) | none |

#### Dishes (menu cards)

All four are square originals. Each is referenced at `-200` / `-600` in the card `srcset` and at the extensionless `-1200` base in `data-full` for the lightbox.

| Path | Subject (Visual) | Associated dish | Px | Used on | XMP |
| --- | --- | --- | --- | --- | --- |
| `assets/img/dishes/ostrygi-z-granita-1200.jpg` | Eight opened oysters on a round white plate with two lemon halves and flat-leaf herbs; rustic wood table, blue-checked cloth | Ostrygi z granitą — 58 zł — *przystawki* | 1200×1200 | `index.html`, `menu.html` | none |
| `assets/img/dishes/polik-wolowy-1200.jpg` | Thick grill-marked steak with a herb-butter medallion and rosemary on a wooden board; metal cup of french fries behind | Polik wołowy — 92 zł — *dania-glowne* | 1200×1200 | `index.html`, `menu.html` | none |
| `assets/img/dishes/sandacz-1200.jpg` | Two slices of a pink rolled roulade with a dark spiral filling, on a white plate with magenta/beet sauce, red berries, basil and a cream-and-beet quenelle | Sandacz — 88 zł — *dania-glowne* | 1200×1200 | `index.html`, `menu.html` | none |
| `assets/img/dishes/creme-z-brulee-z-tonka-1200.jpg` | White ramekin of crème brûlée with a cracked caramel crust, spoon lifting a portion, mint sprig, redcurrants, hessian cloth on wood | Crème brûlée z tonką — 36 zł — *desery* | 1200×1200 | `index.html`, `menu.html` | none |

#### Gallery

All thirteen are square originals at 600 / 1200 / 1600. `galeria.html` opens the `-1600.jpg` via `href`; `index.html` additionally sets the extensionless `-1600` in `data-full`.

| Path | Subject (Visual) | Category | Role | Used on | XMP |
| --- | --- | --- | --- | --- | --- |
| `gallery/interior-01-*.jpg` | Warm terracotta-walled modern bistro: cone pendant lights, round wooden tables laid with stemware and navy napkins, open kitchen pass in the background | `wnetrza` | Hospitality | `galeria.html` **and** `index.html` preview | none |
| `gallery/interior-02-*.jpg` | Industrial casual restaurant: exposed ducting lit green-yellow, black dome pendants, bare wooden tables with teal cups and bowls | `wnetrza` | Hospitality | `galeria.html` | Canva render, 2025-09-16 |
| `gallery/interior-03-*.jpg` | Event room under a draped gold fabric ceiling: cream tub chairs, yellow tabletops, dark floor, spot highlights | `wnetrza` | Hospitality | `galeria.html` | Canva render, 2025-09-16 |
| `gallery/interior-04-*.jpg` | Bright daytime hotel-style dining room: white tablecloths, burgundy chairs, crystal chandelier under a circular ceiling recess, large windows, tiled floor | `wnetrza` | Hospitality | `galeria.html` | Canva render, 2025-09-16 |
| `gallery/dish-01-*.jpg` | Large communal metal platter of spiced rice with lamb, chicken quarters, tomato and lemon on dark wood; overhead | `dania` | Plate | `galeria.html` **and** `index.html` preview | none |
| `gallery/dish-02-*.jpg` | Bowl of coconut-style curry with rice, basil, chilli and cauliflower on a wooden crate; overhead | `dania` | Plate | `galeria.html` | Canva render, 2025-09-16 |
| `gallery/dish-03-*.jpg` | Spanish tapas spread in terracotta cazuelas on wooden boards: meatballs, croquettes, olives, charcuterie, seafood; overhead, dark wood | `dania` | Plate | `galeria.html` | Canva render, 2025-09-16 |
| `gallery/dish-04-*.jpg` | Mixed casual table: sandwich, salads, skewers, french fries, spring rolls, a paella pan; overhead, light wood | `dania` | Plate | `galeria.html` | Canva render, 2025-09-17 |
| `gallery/party-01-*.jpg` | Champagne toast among heavy bokeh fairy lights; several identifiable guests, silver ice bucket, white cloth | `imprezy` | Hospitality | `galeria.html` | Canva render, 2025-09-17 |
| `gallery/party-02-*.jpg` | Toast at a long table in a rustic brick-and-timber room; candles, wine, identifiable guests | `imprezy` | Hospitality | `galeria.html` | Canva render, 2025-09-17 |
| `gallery/party-03-*.jpg` | Banquet hall under violet lighting with a projected starfield; round tables, floral centrepieces, dark chargers | `imprezy` | Hospitality | `galeria.html` | Canva render, 2025-09-17 |
| `gallery/wine-01-*.jpg` | Two glasses of red wine on an oak barrel outdoors with grape bunches; backlit vineyard foliage | *(homepage only)* | Hospitality / detail | `index.html` preview only | none |
| `gallery/dessert-01-*.jpg` | Two strawberry-and-cream parfaits in glasses with mint, fresh strawberries and spoons; bright high-key styling | *(homepage only)* | Plate / detail | `index.html` preview only | none |

**Reuse and surface asymmetry (Source):** `interior-01` and `dish-01` appear on both gallery surfaces. `wine-01` and `dessert-01` appear **only** in the homepage preview and carry no `data-filter`; they are absent from `galeria.html`, so the four-image homepage taste is not a subset of the eleven-image gallery. Any 01C sequencing work must decide deliberately whether that stays true.

#### Open Graph cards (not photographs)

`assets/img/og-img/og-1200x630.jpg` (1200×630) and `og-1200x1200.jpg` (1200×1200) are designed amber-gradient cards carrying the Ambre wordmark, the cutlery emblem and Polish copy. `og-1200x630.jpg` is referenced from all eight pages. They are outside the photographic direction and need no action under 01B/01C.

### 3.4 Embedded brand emblem — a project-wide condition

**Visual + Source:** a filled amber disc with knocked-out fork, spoon and knife is composited into the lower-right corner of **every** source photograph in `assets/img/` — hero, about, all four dish photographs, all thirteen gallery photographs and the three avatars. Native-resolution crops confirm the motif matches `assets/img/logo-img/logo-light.svg`; it is Ambre's own identity mark, not a third-party watermark. The disc itself is opaque; the fork, spoon and knife are knocked out of it, so the photograph shows through the cutlery shapes. The two Open Graph cards do not carry it as an overlay.

Its relative size is inconsistent: roughly 150 px on a 1600 px square gallery original (≈9 % of the edge), ≈54 px on the 2560 px hero (≈2 %), ≈23 px on the 1600 px about photograph (≈1.4 %).

**Runtime:** because the surfaces crop differently, the mark appears on some and vanishes on others. It is visible in every square gallery tile at every sampled width; it is cropped out of the 3:2 / ~1.27:1 dish thumbnails; it is cropped out of the hero at 1440 px (the right ~3.4 % of the source is discarded) and further at 768 and 390 px. The lightbox uses `object-fit: contain`, so opening any dish thumbnail reveals a mark that the thumbnail did not show.

**Design judgment:** a baked-in identity mark is the single most direction-defining property of the current set. It fixes a logo into pixels that the layout then crops unpredictably, it prevents any future reframing or focal-point change from being lossless, it duplicates identity already carried by the header, hero wordmark and footer, and it reads as stock-photo branding rather than authored restaurant photography. Whether the mark stays, is removed, or is standardised is an owner decision (§12, D-1) and a precondition for most crop work.

### 3.5 Crop and focal-point constraints as they exist today

**Source:** no photograph in the project has an `object-position` other than the hero's `center`, and no image carries a focal-point attribute or `data-*` hint. Every crop is a centre crop.

| Surface | Rule | Source ratio | Effect |
| --- | --- | --- | --- |
| `.site-hero__media img` | `object-fit: cover; object-position: center` (`hero.css:50–51`), container `min-height: 88vh` | 16:9 | Heavy centre crop that varies with viewport (§8) |
| `.about__photo img` | `object-fit: cover`, `width: 100%`, no fixed box (`about.css:38–42`) | 4:3 | Effectively uncropped |
| `.dish__thumb` | `aspect-ratio: 3 / 2` (`menu.css:223–226`); above 480 px the card grid stretches the thumb to card height (`menu.css:125–131`, `282–285`) | 1:1 | Centre crop removes ≈33 % of source height below 480 px and ≈21–23 % above it |
| `.gallery__item` | `aspect-ratio: 1 / 1` + `cover` (`gallery.css:28`, `47`) | 1:1 | No crop — the comment in `gallery.css` states this explicitly |
| `#lb-img` | `object-fit: contain` (`lightbox.css:40`) | native | No crop |

### 3.6 Testimonial avatars (secondary set)

**Source + Visual:** `index.html` pairs three photographs of identifiable real people with invented attributions — "Anna K., recenzja z Google", "Marek S., recenzja z Google", "Julia P., recenzja z Google" — beside an invented aggregate rating ("4.8", "327 opinii") linking to a Google search URL. The images are `alt=""` (decorative). `customer-01` shows a smiling woman at a table with other diners; `customer-02` shows two men across a counter; `customer-03` shows a woman in a bakery or shop interior. None is from the Ambre room.

**Source discrepancy:** `assets/img/avatars/customer-02-128.jpg` is **96×96 px**, not 128 px as its filename and its `2x` `srcset` position imply. `scripts/img-verify.mjs` validates `w` descriptors only and treats `x` descriptors as "density descriptors (not pixel widths)", so this passes the existing gate silently.

These are outside the four narrative roles but are photographs of people on a public page of a fictional-business demo; they belong in §12 as an owner decision, not in 01B/01C scope.

---

## 4. Photographic coherence assessment

### 4.1 Table — Invitation

**Visual:** the sole candidate, `hero-03`, is a tight, warm, shallow-focus table setting in gold and champagne, with crystal, silver chargers and flowers. Colour temperature and material vocabulary sit squarely inside the amber identity, and the depth of field is genuinely photographic rather than flat.

**Runtime:** the hero media box measures 1425 × 859 at 1440 px, 753 × 880 at 768 px and 390 × 742 at 390 px. Against the 16:9 source that leaves roughly 93 %, 48 % and 30 % of the frame's width visible.

**Design judgment:** the palette is right and the role is right; the composition is not yet. The specific cues — ribboned rolled menus, satin napkin folds, massed pink-and-peach florals, repeated identical covers — read as a wedding or banquet cover rather than an intimate degustation table. At 390 px the surviving 30 % strip is enlarged stemware and a blurred charger: the invitation narrative disappears entirely while the copy and both actions remain. This is one usable photograph, not yet one deliberate opening scene.

### 4.2 Craft — Culinary preparation

**Visual:** `chef-01` is the strongest single photograph in the project for the approved direction. It shows credible kitchen work — a real pass, real steam, three plates mid-service, restrained plating — in neutral stainless light that lets the food carry the colour.

**Design judgment:** one photograph is, however, the entire Craft chapter. The gallery contributes nothing to it; there is no ingredient, prep, pass or service detail anywhere else in the set. A journal that promises craft and shows one frame of it will lean on Plate and Hospitality by default. The open questions are representation (an identifiable person fronting a fictional restaurant) and the baked emblem, not subject suitability.

### 4.3 Plate — Food presentation

**Visual:** the Plate role is served by two disjoint sets that do not belong to the same restaurant.

- The four **menu-card** photographs are individually plated, close, warm and shallow-focus. Two of them show something other than the dish they are labelled with (§7).
- The four **gallery `dania`** photographs are all overhead communal spreads: a Middle-Eastern rice-and-meat platter, a coconut-style curry bowl, a Spanish tapas table and a casual mixed buffet with french fries and spring rolls. None corresponds to any item on the Ambre card. Three are recognisably other cuisines. All are shot top-down on bare or rustic wood.
- `dessert-01`, on the homepage only, is a bright high-key strawberry parfait in the register of a domestic food blog.

**Design judgment:** a visitor who reads "Sezonowe menu degustacyjne" on the hero and then reaches the gallery sees shared platters from four cuisines. That is not a styling nuance — it contradicts the proposition. Nothing in this set establishes a plating language, a plate vocabulary, a background discipline or a consistent camera distance, and no colour grade can reconcile top-down buffet tables with close plated courses.

### 4.4 Hospitality — Dining atmosphere

**Visual:** the four `wnetrza` photographs are four different buildings. Terracotta walls with cone pendants and an open pass; exposed green-lit ducting with black domes and teal tableware; a draped gold fabric ceiling over yellow tabletops; a white-tablecloth daytime room with a chandelier and tiled floor. Architecture, ceiling, lighting fixtures, floor, table shape and tableware differ in every case. The three `imprezy` photographs add a bokeh-heavy champagne toast, a rustic brick-and-timber toast and a violet-lit banquet hall with a projected starfield.

**Runtime:** `galeria.html` presents these in DOM order — four rooms, then four food spreads, then three celebrations — as eleven identical square tiles, three per row at 1440 px. In the dark theme the daylight room (`interior-04`) and the high-key celebration frames read as bright plates against a near-black page, while the violet hall fights the amber accents directly.

**Design judgment:** the equal-tile frame is good component work and should survive. What it currently frames is an inventory of seven unrelated venues, not one imagined place. The `imprezy` category compounds it by adding identifiable guests at venues that are visibly not the `wnetrza` rooms. Hospitality is the role with the most material and the least coherence.

### 4.5 Cross-cutting findings

1. **No single venue identity.** Seven distinct rooms appear across `wnetrza` and `imprezy`. (Visual)
2. **No single culinary identity.** The gallery food is Middle-Eastern, South-East Asian, Spanish and mixed-casual; the menu is a Polish/French degustation card. (Visual + Source)
3. **Two confirmed dish/photo mismatches.** Sandacz and Polik wołowy (§7). (Visual + Source)
4. **A baked-in brand emblem on every photograph,** inconsistently sized and unpredictably cropped. (§3.4)
5. **Colour temperature swings** from terracotta orange through green-yellow and neutral daylight to violet within one scroll. (Visual + Runtime)
6. **Camera grammar is split** between close shallow-focus plated food and flat overhead spreads. (Visual)
7. **Identifiable people appear in six photographs** — `chef-01`, `party-01`, `party-02` and the three avatars — on a site that states it portrays a fictional restaurant. (Visual + Source)
8. **No provenance for the strongest assets.** The photographs that best support the direction (`chef-01`, `interior-01`, all four dish photographs) are precisely the ones with no embedded metadata at all. (§11)

---

## 5. Amber dining journal art-direction guidelines

Project-specific, derived from what the approved direction requires and what the current set lacks. These are the standard against which 01B and 01C selections should be judged; they introduce no second brand direction and change no token, typeface or component.

### 5.1 Narrative roles and sequence

One pass through the site should read **Table → Craft → Plate → Hospitality**, matching the existing page order (hero → about → menu → gallery) without rearranging sections. Each selected photograph is assigned exactly one role and is not reused across roles.

### 5.2 Atmosphere

One imagined place, one evening. Interiors are the same room or demonstrably the same building. A second room is admissible only if its materials, fixtures and light temperature are consistent with the first. Celebration scenes, if retained, happen in that room.

### 5.3 Light

Warm, controlled, directional, low-key. Practical light sources (pendants, candles, window) are visible and motivated. Avoid: on-camera flash, heavy bokeh-light overlays, coloured architectural lighting (violet, green, magenta), and bright midday daylight interiors. Highlights should fall on glass, glaze and sauce rather than on tablecloth.

### 5.4 Food colour

Believable and unsaturated. Sauces, proteins and vegetables keep their natural hue; no orange push, no global warm filter to force amber. Amber comes from the room and the light, never from a grade applied to the plate.

### 5.5 Subject selection

Single plated courses that correspond to a named card item. One or two credible preparation frames. One or two room views. One or two restrained details (glass, pour, pass, hands). No communal platters, no buffet tables, no cuisine that is not on the card, no foreign-brand items in frame.

### 5.6 Background and surface

Quiet and consistent: a dark table, linen, or the room softly out of focus. One wood tone at most across the set. Avoid bare rustic planks, hessian, checked cloths, crates and printed props — the current dish set uses four different surfaces.

### 5.7 Camera perspective

Close to low-three-quarter for plated food (roughly 20–45° above the plate), eye level for the room, documentary mid-distance for craft. Reserve true overhead for at most one deliberate frame; today it is the default for all four gallery food images.

### 5.8 Depth of field

Shallow for plate and detail, with a clearly chosen focus point on the principal element. Deeper for interiors so the room reads as architecture. Depth of field should never be used to hide an incoherent background.

### 5.9 Sequencing

Hero carries the invitation alone. The homepage preview is a taste, not a sample of everything: ideally one room, one plate, one craft or detail frame, in that reading order. The full gallery reads as room → craft → plate → evening, with category filters still producing compact, meaningful subsets.

### 5.10 Consistency across surfaces

The hero, about, dish and gallery photographs must survive being seen within one scroll. Practical tests: white balance within one visible step; no frame more than roughly one stop brighter than its neighbours in the dark theme; one plate vocabulary; one table surface family.

### 5.11 Responsive focal points

Every selected photograph declares, in writing before implementation, where its subject sits, so §8's crop requirements can be met without guesswork.

### 5.12 Theme interaction

Photographs are chosen so they hold in both editions. In light they must not wash out against `#f7f2f4`; in dark they must not punch out of `#12121a`. High-key daylight frames are the current failure mode and should be avoided rather than corrected in CSS.

### 5.13 Distinctiveness

Distinctiveness comes from subject, light and sequence. Not from filters, duotones, vignettes, grain, or overlay graphics — and, specifically, not from a logo burned into the photograph.

---

## 6. Image-by-image recommendations

Classification: **KEEP** · **KEEP WITH CROP REVIEW** · **REVIEW / OWNER DECISION** · **REPLACE CANDIDATE**. A recommendation is a reviewer's proposal, never owner approval.

### 6.1 Summary

| Classification | Narrative photographs (19) | Avatars (3) | Total (22) |
| --- | --- | --- | --- |
| KEEP | 1 | 0 | 1 |
| KEEP WITH CROP REVIEW | 2 | 0 | 2 |
| REVIEW / OWNER DECISION | 5 | 3 | 8 |
| REPLACE CANDIDATE | 11 | 0 | 11 |

The eleven replace candidates are not a blanket rejection. Each rests on named visual or content evidence: two confirmed dish mismatches, four food images from cuisines absent from the card, two interiors of demonstrably different buildings, one violet-lit hall, one bokeh-overlaid party frame and one high-key dessert outside the approved register. Eight photographs — including the strongest Table and Craft frames — are proposed for retention or decision, and replacement is staged (§9, §10) rather than wholesale.

### 6.2 Hero

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `hero/hero-03-*` | **KEEP WITH CROP REVIEW** | **Visual:** warm gold-and-champagne table setting, crystal, flowers, shallow focus. **Runtime:** ≈93 % / 48 % / 30 % of frame width visible at 1440 / 768 / 390 px; the baked emblem is cropped out at 1440 px and below. | Role **Table**. Palette, material and light already belong to the direction, and it is the only Table candidate in the project — replacing it for novelty is unjustified. The problem is framing: the mobile crop destroys the scene, and the composition reads as a banquet cover rather than a degustation table. | Accept the banquet-style table as Ambre's invitation, or commission/select a quieter two-cover table in the same palette (§12, D-2). |

### 6.3 About

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `about/chef-01-*` | **REVIEW / OWNER DECISION** | **Visual:** credible kitchen pass, steam, three plates mid-service, restrained plating, identifiable face and forearm tattoo; Ambre emblem at lower right. **Source:** no EXIF/XMP; descriptive Polish `alt`; `loading="lazy"`. | Role **Craft**. Photographically the best fit in the set and the only Craft frame; subject suitability is not in question. What is unresolved is presenting an identifiable individual as the chef of a fictional restaurant, with no recorded provenance or release. | Confirm the representation is acceptable and that usage rights cover it, or designate a non-identifying craft frame (§12, D-3 and D-7). |

### 6.4 Dish photographs

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `dishes/sandacz-*` | **REPLACE CANDIDATE** | **Visual:** sliced pink roulade with a dark spiral filling, magenta/beet sauce, red berries, cream quenelle. **Source:** card reads "Sandacz sauté, risotto szafranowe, fenkuł glazurowany"; `alt="Sandacz z risotto szafranowym i fenkulem"`. No fish fillet, no risotto, no fennel is visible. | Role **Plate**. A confirmed content-integrity defect (§7), already flagged as a prerequisite in `IMPROVEMENTS-DESIGN.md` §4. | Correct the mapping with a truthful pike-perch image, or change nothing until one exists. Inventing a different dish is out of scope (§12, D-4). |
| `dishes/polik-wolowy-*` | **REPLACE CANDIDATE** | **Visual:** thick grill-marked steak with herb butter and rosemary on a board, with a cup of french fries. **Source:** card reads "Długo duszony polik, krem z selera, sos na porto"; `alt="Polik wolowy z kremem z selera i sosem porto"`. No braised cheek, no celeriac purée, no port reduction. | Role **Plate**. A second confirmed mismatch (§7), newly identified in this review; the fries also contradict the fine-dining register. | As above (§12, D-4). |
| `dishes/ostrygi-z-granita-*` | **REVIEW / OWNER DECISION** | **Visual:** eight opened oysters, two lemon halves, flat-leaf herbs, rustic wood and blue-checked cloth. **Source:** card promises "granita z ogórka i yuzu, mikro zioła". The principal subject matches; no granita and no micro-herbs are visible, and the styling is casual. | Role **Plate**. The dish name is honoured; the described garnish is not evidenced and the rustic staging sits outside §5.6. Worth keeping if the owner accepts the simplification. | Accept oysters-without-visible-granita as a truthful simplification, or treat as a replace candidate in 01C (§12, D-5). |
| `dishes/creme-z-brulee-z-tonka-*` | **KEEP WITH CROP REVIEW** | **Visual:** ramekin with a cracked caramel crust, spoon lifting a portion, mint, redcurrants, hessian on wood. **Source:** card reads "Wanilia, fasola tonka, karmelizowany cukier". | Role **Plate**. The most accurate of the four: the dish is unmistakably crème brûlée and the caramelised crust is the hero of the frame. Hessian conflicts with §5.6 and the 3:2 crop needs checking (§8). | Confirm the hessian background is acceptable, or schedule a restyle in 01C. |

### 6.5 Gallery — interiors

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `gallery/interior-01-*` | **KEEP** | **Visual:** terracotta walls, cone pendants, round tables laid with stemware and navy napkins, open pass behind. Warm, evening, restaurant-specific. **Source:** the only interior reused on both gallery surfaces. | Role **Hospitality**, and the natural anchor room. Closest of the four to the amber palette and the only one that shows both a set table and a working kitchen. | None, unless the owner prefers a different anchor room (§12, D-6). |
| `gallery/interior-02-*` | **REPLACE CANDIDATE** | **Visual:** exposed ducting under green-yellow light, black dome pendants, bare tables with teal cups and bowls. | Role **Hospitality**. A different building with a different light temperature, fixture family and tableware; the green cast contradicts §5.3 and cannot coexist with `interior-01` as one venue. | Confirm `interior-01` as the anchor, which makes this a replacement (§12, D-6). |
| `gallery/interior-03-*` | **REPLACE CANDIDATE** | **Visual:** draped gold fabric ceiling, cream tub chairs, yellow tabletops, dark floor, spot highlights. | Role **Hospitality**. Reads as an event marquee, not a restaurant; the heavy decorative gold competes with the brand amber instead of supporting it. | As above (§12, D-6). |
| `gallery/interior-04-*` | **REVIEW / OWNER DECISION** | **Visual:** bright daytime room, white tablecloths, burgundy chairs, chandelier, tiled floor, large windows. **Runtime:** the brightest tile on the gallery page in the dark theme. | Role **Hospitality**. The least stylistically alien of the three non-anchor rooms and the only daylight option, but its architecture and register still differ from `interior-01`, and §5.12 cautions against high-key frames. | Accept a second, daytime room identity, or retire it with the other two (§12, D-6). |

### 6.6 Gallery — food

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `gallery/dish-01-*` | **REPLACE CANDIDATE** | **Visual:** communal metal platter of spiced rice with lamb, chicken, tomato and lemon on dark wood; overhead. **Source:** reused in the homepage preview, so it is the first food image a visitor meets. | Role **Plate**. A shared platter from a cuisine absent from the Ambre card, presented as Ambre's lead food image. The most consequential of the four because of its homepage placement. | Confirm that gallery food must correspond to the card (§12, D-8). |
| `gallery/dish-02-*` | **REPLACE CANDIDATE** | **Visual:** coconut-style curry bowl with rice, basil and chilli on a wooden crate; overhead. **Source:** `alt` correctly describes it as curry. | Role **Plate**. Another cuisine and another communal format; the `alt` being truthful makes the mismatch with the menu explicit rather than excusing it. | As above (§12, D-8). |
| `gallery/dish-03-*` | **REPLACE CANDIDATE** | **Visual:** Spanish tapas in terracotta cazuelas on boards; overhead, dark wood. | Role **Plate**. A third cuisine; small-plates service in terracotta is a different hospitality model from a tasting menu. | As above (§12, D-8). |
| `gallery/dish-04-*` | **REPLACE CANDIDATE** | **Visual:** mixed casual table — sandwich, salads, skewers, french fries, spring rolls, paella pan; overhead, light wood. | Role **Plate**. The furthest from the direction: several cuisines in one frame, casual format, and fries directly contradicting the fine-dining proposition. | As above (§12, D-8). |
| `gallery/dessert-01-*` | **REPLACE CANDIDATE** | **Visual:** strawberry-and-cream parfaits in glasses, bright high-key styling, saturated red. **Source:** homepage preview only; no corresponding menu dessert (the card dessert is crème brûlée). | Role **Plate / detail**. Competent and accurately described, but the high-key daylight register and saturated red sit outside §5.3 and §5.12, and in the dark theme it is among the brightest elements on the page. | Confirm that the homepage preview must follow the same register as the rest (§12, D-8). |
| `gallery/wine-01-*` | **REVIEW / OWNER DECISION** | **Visual:** two glasses of red wine on an oak barrel outdoors, backlit vineyard foliage, grapes. **Source:** homepage preview only. | Role **Hospitality / detail**. The golden backlight is genuinely on-palette and the subject supports the "starannie dobrane wina" copy, but it is an outdoor vineyard still life, not Ambre, and it reads as generic stock. | Accept an off-venue wine still life as a permitted detail, or require an in-room pour, cellar or glass detail in 01C (§12, D-9). |

### 6.7 Gallery — celebrations

| Image | Class | Evidence | Rationale and role | Owner decision needed |
| --- | --- | --- | --- | --- |
| `gallery/party-02-*` | **REVIEW / OWNER DECISION** | **Visual:** toast at a long table in a rustic brick-and-timber room; candles, wine, warm low light, identifiable guests. | Role **Hospitality**. Warmest and most hospitable of the three and the closest to the approved evening register, but the venue is visibly not `interior-01` and the guests are identifiable. | Decide whether `imprezy` may show a venue other than the anchor room, and whether identifiable guests are acceptable (§12, D-3 and D-6). |
| `gallery/party-01-*` | **REPLACE CANDIDATE** | **Visual:** champagne toast behind a dense bokeh fairy-light overlay; several identifiable guests; silver ice bucket. | Role **Hospitality**. The bokeh overlay is exactly the decorative effect §5.13 excludes, the register is New-Year party stock, and no venue is identifiable. | §12, D-3 and D-8. |
| `gallery/party-03-*` | **REPLACE CANDIDATE** | **Visual:** banquet hall under violet lighting with a projected starfield; round tables, floral centrepieces. | Role **Hospitality**. Violet architectural lighting directly contradicts the amber identity and §5.3; the scale reads as a conference banquet, not a restaurant. | §12, D-6. |

### 6.8 Testimonial avatars (secondary)

| Image | Class | Evidence | Rationale | Owner decision needed |
| --- | --- | --- | --- | --- |
| `avatars/customer-01-*` | **REVIEW / OWNER DECISION** | **Visual:** identifiable woman at a table with other diners. **Source:** attributed to "Anna K., recenzja z Google"; `alt=""`. | Outside the four roles. A photograph of a real person is presented as a named reviewer of a fictional restaurant, beside an invented 4.8 / 327 rating. | Confirm the representation and rights, or replace the portraits with non-identifying treatment (§12, D-3). |
| `avatars/customer-02-*` | **REVIEW / OWNER DECISION** | As above; additionally `customer-02-128.jpg` is **96×96 px**, contradicting its filename and its `2x` position. | As above, plus a naming/dimension discrepancy the current QA gate cannot catch. | As above, plus decide whether the file discrepancy is corrected with the avatar work (§12, D-10). |
| `avatars/customer-03-*` | **REVIEW / OWNER DECISION** | **Visual:** identifiable woman in a bakery or shop interior — not a restaurant. | As above. | As above. |

---

## 7. Confirmed dish/photo mismatches

A dish/photo mismatch is a content-integrity prerequisite, not a cosmetic improvement. Both entries below are confirmed by direct visual inspection of the canonical source file against the canonical HTML on both pages that show the dish. No content, `alt` text or image reference was changed.

### 7.1 Sandacz — confirmed

| | |
| --- | --- |
| **Dish** | Sandacz — 88 zł — `data-cat="dania-glowne"` |
| **Pages** | `index.html:361–381` (card), `menu.html:311–339` (card plus `details` panel) |
| **Source image** | `assets/img/dishes/sandacz-1200.jpg` (1200×1200); card `srcset` uses `-200` / `-600`; lightbox uses `data-full="/assets/img/dishes/sandacz-1200"` |
| **Declared content** | Title "Sandacz"; description "Sandacz sauté, risotto szafranowe, fenkuł glazurowany" (`index.html`) / "Sandacz sauté, risotto szafranowe, fenkuł" (`menu.html`); detail panel "Filet z sandacza smażony na skórze, risotto al dente z szafranem, glazurowany fenkuł, cytrusowa redukcja"; allergens "ryby, laktoza"; `alt="Sandacz z risotto szafranowym i fenkulem"`; button label "Powiększ zdjęcie: Sandacz / szafran / fenkuł" |
| **Observable discrepancy** | The photograph shows two slices of a pink rolled roulade with a dark spiral filling, plated on white with a magenta/beet sauce, red berries, basil leaves and a cream-and-beet quenelle. No fish fillet, no skin, no saffron risotto and no fennel are visible. The yellow of saffron risotto is absent from the frame entirely. |
| **Reuse** | The `sandacz-*` family appears only on these two cards; it is not in the gallery. |
| **Status** | Independently confirms the prerequisite already recorded in `IMPROVEMENTS-DESIGN.md` §4. |
| **Correction boundary (future)** | Replace the image so it matches the existing dish text, within 01C. Do not rewrite the dish, its description, its allergens or its price to match the picture. Keep the `sandacz-*` basename family, all three sizes, both generated formats, the `data-full` contract and the `single` lightbox mode. |

### 7.2 Polik wołowy — confirmed

| | |
| --- | --- |
| **Dish** | Polik wołowy — 92 zł — `data-cat="dania-glowne"` |
| **Pages** | `index.html:307–333` (card), `menu.html:239–274` (card plus `details` panel) |
| **Source image** | `assets/img/dishes/polik-wolowy-1200.jpg` (1200×1200); card `srcset` uses `-200` / `-600`; lightbox uses `data-full="/assets/img/dishes/polik-wolowy-1200"` |
| **Declared content** | Title "Polik wołowy"; description "Długo duszony polik, krem z selera, sos na porto" (`index.html`) / "Długoduszony polik, krem z selera, sos na porto" (`menu.html`); detail panel "Polik z polskiej wołowiny, purée z selera, redukcja porto i aromatyczne demi-glace. Konfekcja z pieczonej szalotki"; allergens "seler, laktoza"; `alt="Polik wolowy z kremem z selera i sosem porto"`; button label "Powiększ zdjęcie: Polik wołowy / seler / porto" |
| **Observable discrepancy** | The photograph shows a thick, grill-marked steak with a herb-butter medallion and a rosemary sprig on a wooden board, with a metal cup of french fries behind it. A braised beef cheek is a slow-cooked, fork-tender cut with no grill marks; the frame shows no celeriac purée, no port reduction and no roasted shallot. The visible side is french fries, which also contradicts the fine-dining presentation of the card. |
| **Reuse** | The `polik-wolowy-*` family appears only on these two cards; it is not in the gallery. |
| **Status** | Newly confirmed in this review; not previously recorded. |
| **Correction boundary (future)** | Identical to §7.1, applied to the `polik-wolowy-*` family. |

### 7.3 Partial correspondence, not classified as a mismatch

`ostrygi-z-granita-*` shows the named principal subject (oysters) but no visible cucumber-and-yuzu granita and no micro-herbs; the garnish reads as flat-leaf herbs. This is recorded as a **REVIEW / OWNER DECISION** (§6.4), not a mismatch: the dish name is honoured and the discrepancy concerns an unphotographable-at-this-scale garnish rather than the wrong food.

`creme-z-brulee-z-tonka-*` matches its dish. Tonka bean is not visually verifiable in any crème brûlée photograph and its absence from the frame is not a defect.

### 7.4 Gallery food — correspondence is not claimed

The gallery `dania` items carry no dish names, prices or descriptions, so none of them is a dish/photo mismatch in the strict sense, and each `alt` truthfully describes what is shown. Their problem is narrative coherence (§4.3), handled through classification in §6.6 rather than as a content-integrity defect.

---

## 8. Responsive crop and focal-point requirements

All figures are **Runtime** measurements read from the live DOM against the current canonical files, in the in-app Chromium pane at device pixel ratio 1 (light theme unless noted).

### 8.1 Measured geometry

| Surface | 1440 × 1000 | 768 × 1024 | 390 × 844 | Source ratio |
| --- | --- | --- | --- | --- |
| Hero media (`index.html`) | 1425 × 859 | 753 × 880 | 390 × 742 | 16:9 |
| About photo (`index.html`) | 688 × 516 | — | — | 4:3 |
| Dish thumb (`index.html`) | 242 × 190 | 247 × 190 | 356 × 237 | 1:1 |
| Gallery tile (`index.html`) | 295 × 295 (4 cols) | 349 × 349 (2 cols) | 169 × 169 (2 cols) | 1:1 |
| Gallery grid (`galeria.html`) | 3 columns (observed) | 2 columns from 480 px (Source: `galeria.css:24–33`) | 1 column below 480 px | 1:1 |

### 8.2 Hero — the binding constraint

With `object-fit: cover` and a 16:9 source, the proportion of the frame's **width** that survives is:

| Width | Media box | Visible | Cropped |
| --- | --- | --- | --- |
| 1440 px | 1425 × 859 | ≈ 93 % | ≈ 7 % (≈ 3.4 % per side) |
| 768 px | 753 × 880 | ≈ 48 % | ≈ 52 % (≈ 26 % per side) |
| 390 px | 390 × 742 | ≈ 30 % | ≈ 70 % (≈ 35 % per side) |

**Requirement for 01B:** any hero candidate must carry its principal subject inside the **central 30 % of the frame width**, because that is all a 390 px viewport shows. Content placed outside it — including the current baked emblem, which sits in the outer 2 % and is already discarded at 1440 px — must be treated as decorative and expendable. If a wide composition is wanted at desktop *and* a readable subject at mobile, that needs either a dedicated narrow source in the existing `<picture>` or an explicit `object-position`, both of which are 01B implementation decisions rather than approvals granted here.

### 8.3 Dish thumbnails

Square sources are centre-cropped into a wider box at every width:

| Width | Box | Effective ratio | Source height removed |
| --- | --- | --- | --- |
| 390 px | 356 × 237 | 1.50 (`aspect-ratio: 3 / 2`) | ≈ 33 % (≈ 17 % top and bottom) |
| 768 px | 247 × 190 | 1.30 (card grid stretch) | ≈ 23 % |
| 1440 px | 242 × 190 | 1.27 (card grid stretch) | ≈ 21 % |

**Requirement for 01C:** the plated subject must sit inside the **central 67 % of the source height**. Nothing load-bearing — plate rim, garnish, a mark — may occupy the top or bottom sixth. The crop is centred and there is no `object-position` to tune, so this is a selection and framing constraint, not something CSS can later rescue.

### 8.4 Gallery tiles

`aspect-ratio: 1 / 1` against square sources means **no crop at any width**, on either surface, in either theme. Square originals are therefore a hard requirement for any gallery replacement: a non-square source would start being cropped and would break the explicit "the frame crops nothing" contract documented in `css/components/gallery.css`.

### 8.5 About photograph

`object-fit: cover` with `width: 100%` and no fixed box means the 4:3 source renders at its own ratio; the measured 688 × 516 box is 4:3. **No crop requirement applies today.** If 01B changes the about composition this becomes a new constraint and must be re-measured rather than assumed.

### 8.6 Lightbox

`object-fit: contain` shows the whole frame. Every selected photograph must therefore be presentable **uncropped**, including whatever sits in the corners that the thumbnail crops away. This is the surface on which the baked emblem is always visible.

### 8.7 Variant-delivery observations (for 01C, not for correction now)

1. **Dish thumbnails are under-served.** The card `srcset` uses density descriptors (`-600 2x`, `-200 1x`) with `width="64" height="64"`, while the rendered box measures 242–356 px. At device pixel ratio 1 the browser selected `dishes/ostrygi-z-granita-200.avif` for a 242 × 190 box — a 200 px source upscaled into a 242 px slot. At 390 px (mobile emulation) it selected the 600 px variant. Any 01C work that touches these cards should reconsider the descriptor model.
2. **Gallery `sizes` understates the gallery page.** Both surfaces declare `sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"`. That matches the homepage (4 columns from 900 px ≈ 25vw) but not `galeria.html`, whose grid is 3 columns from 900 px (≈ 33vw) and 2 columns from 480 px.
3. **Source weight is uneven.** Within the same 1600 px square gallery family, files range from 151 KB (`wine-01-1600.jpg`) to 2 381 KB (`dish-04-1600.jpg`) — a 16× spread for identical pixel dimensions. The heavy files are those carrying Canva XMP.

---

## 9. Future scope: IMP-DESIGN-01B — Hero and About photography

A future, separately authorized work package. Nothing here is approved.

### 9.1 Images in scope

| Image | Incoming classification | Expected 01B outcome |
| --- | --- | --- |
| `hero/hero-03-*` (2 sizes) | KEEP WITH CROP REVIEW | Retain and reframe, or replace with a quieter table in the same palette, subject to D-2 |
| `about/chef-01-*` (2 sizes) | REVIEW / OWNER DECISION | Retain subject to D-3 and D-7, or substitute a non-identifying craft frame |

### 9.2 Required subject and photographic character

- **Hero (Table).** A laid table in Ambre's room, warm practical light, two to four covers, one clear focal object (glass, candle, plated amuse), quiet background. Not a banquet cover; not massed florals; not repeated identical settings.
- **About (Craft).** Credible preparation or plating in a working kitchen or at the pass. Neutral working light so food colour stays true. One subject, mid-distance, documentary.
- Both must satisfy §5.3, §5.4, §5.6 and §5.12.

### 9.3 Crop expectations

- Hero: principal subject inside the **central 30 % of frame width** (§8.2); the frame must still read at 1440 px where ≈93 % is visible. State the intended focal point in writing before implementation.
- About: no crop today (§8.5); re-measure if the composition changes.

### 9.4 Possible responsive variant requirements

The hero currently ships 1600 × 900 and 2560 × 1440 with `sizes="100vw"`. If the owner decides the mobile crop must show a different framing, 01B would need either a narrow source added to the existing `<picture>` or an explicit `object-position` — both local to `index.html` and `css/components/hero.css`, and both out of scope until 01B is authorized.

### 9.5 Canonical references to protect

`index.html:188–200` (hero `<picture>`), `index.html:243–261` (about `<picture>`), `css/components/hero.css:36–52`, `css/components/about.css:29–42`, `assets/img/hero/`, `assets/img/about/`, `assets/img/_optimized/hero/`, `assets/img/_optimized/about/`.

### 9.6 Contracts to protect

- Hero `<img>` keeps `alt=""` inside `aria-hidden="true"` media; the about `<img>` keeps a meaningful Polish `alt` describing what is actually shown.
- Hero keeps `fetchpriority="high"` and **no** `loading="lazy"`; the about image keeps `loading="lazy"`.
- Both keep explicit `width`/`height`, the AVIF → WebP → JPEG `<source>` order and matching `sizes`.
- Basenames and the `_optimized/` mirror relationship stay intact; `img-verify` compares optimized variants against their single JPEG/PNG original by basename.
- Optimized output is regenerated by `npm run img:opt` (or `--source`/`--force`) only; `assets/img/_optimized/` and `dist/` are never hand-edited.
- Hero heading, lead, both native anchors, `#rezerwacja` / `#menu` destinations, section IDs, reading order, keyboard access, reduced-motion behaviour, both themes and the service-worker image strategy are unchanged.
- No hero layout redesign: that is IMP-DESIGN-02.

---

## 10. Future scope: IMP-DESIGN-01C — Dish and gallery photography

A future, separately authorized work package. Nothing here is approved. Recommended internal order: **dish correspondence first** (content integrity), then gallery food, then interiors and celebrations.

### 10.1 Slice 1 — dish correspondence (prerequisite)

| Image | Class | Action |
| --- | --- | --- |
| `dishes/sandacz-*` | REPLACE CANDIDATE | Truthful pike-perch / saffron risotto / glazed fennel image (§7.1) |
| `dishes/polik-wolowy-*` | REPLACE CANDIDATE | Truthful braised beef cheek / celeriac / port image (§7.2) |
| `dishes/ostrygi-z-granita-*` | REVIEW / OWNER DECISION | Keep, or restyle per D-5 |
| `dishes/creme-z-brulee-z-tonka-*` | KEEP WITH CROP REVIEW | Verify the 3:2 crop; consider a background restyle |

Dish names, descriptions, detail panels, allergens, prices and categories are **not** rewritten to match pictures. Replacement images keep the existing basename families and all three sizes.

### 10.2 Slice 2 — gallery food

`dish-01` … `dish-04` and `dessert-01` are replace candidates (§6.6). Replacements should be plated courses in the Ambre register, ideally corresponding to card items, shot per §5.5–§5.8. `dish-01` and `interior-01` are reused in the homepage preview, so changing `dish-01` changes both surfaces at once.

### 10.3 Slice 3 — interiors and celebrations

`interior-01` is the proposed anchor. `interior-02` and `interior-03` are replace candidates; `interior-04` and `party-02` are owner decisions; `party-01` and `party-03` are replace candidates. `wine-01` is an owner decision.

### 10.4 Gallery narrative sequencing

Target reading order within the existing DOM and the existing filters: **room → craft/detail → plate → evening**. The homepage preview should become a deliberate taste — one room, one plate, one detail — rather than four unrelated subjects, and 01C should state explicitly whether `wine-01` / `dessert-01` remain homepage-only or join `galeria.html`.

### 10.5 Category constraints

The three filters `wnetrza`, `dania`, `imprezy` and their Polish labels are an existing contract. Every category must keep at least one item after any replacement; emptying `imprezy` is not an acceptable outcome of retiring `party-01` and `party-03`.

### 10.6 Crop requirements

- Dish sources: **square**, subject inside the central 67 % of height (§8.3).
- Gallery sources: **square**, 600 / 1200 / 1600 (§8.4). A non-square source would break the no-crop contract.
- Every replacement must hold up uncropped in the `contain` lightbox (§8.6).

### 10.7 Canonical references to protect

`index.html:280–381` (dish cards) and `index.html:396–457` (gallery preview grid), `menu.html:209–344` (dish cards and detail panels), `galeria.html:201–378` (filters and grid), `css/components/menu.css`, `css/components/gallery.css`, `css/pages/galeria.css`, `css/components/lightbox.css`, `assets/img/dishes/`, `assets/img/gallery/` and their `_optimized/` mirrors.

### 10.8 Contracts to protect

- **Filtering:** `.tabs__tab[data-filter]`, `aria-pressed`, `.gallery__item[data-filter]`, `.dish[data-cat]`, `data-load-hidden`, the `aria-live="polite"` results region and the "Wszystko załadowane" status (`initGalleryFilter`, `initTabs`, `initLoadMoreGallery`, `initLoadMoreMenu`).
- **Lightbox:** `[data-lightbox-mode]` scoping — `gallery` on both `.gallery__grid` elements, `single` behaviour for `.dish__thumb` — plus `data-full` / `href` source resolution, the extensionless-base convention, `resolveImageVariants()`'s `_optimized/` mapping, the counter, prev/next, focus return and the `#lb-avif` / `#lb-webp` / `#lb-img` triple. `test:e2e:lightbox` and `test:e2e:gallery-status` cover these.
- **Markup and a11y:** `.gallery__item` stays a real `<a>` with an image `href`; `.dish__thumb` stays a `<button>` with `aria-haspopup="dialog"`, `aria-controls="lb"` and its Polish `aria-label`; every content image keeps a meaningful Polish `alt` that describes what the new picture actually shows; `alt` text is updated **with** the image, never to paper over a mismatch.
- **Delivery:** AVIF → WebP → JPEG order, explicit `width`/`height`, `loading="lazy"` on below-fold images, existing `sizes`, the `-200` / `-600` / `-1200` and `-600` / `-1200` / `-1600` size families, and `npm run img:opt` as the only producer of `_optimized/`.
- **After any authorized asset change:** `npm run img:verify` and `npm run qa:links`, per the acceptance criteria already recorded for IMP-DESIGN-01.
- No gallery layout redesign: that is IMP-DESIGN-03. No JavaScript behaviour change in any slice.

---

## 11. Dependencies, provenance, and licensing

### 11.1 What the repository actually records

**Source:** `README.md` and the first-visit dialog state that Ambre is a demonstration site for a fictional restaurant. `LICENSE.md` §3 excludes third-party material from the project licence and §8 states that rights to third-party photographs remain with their owners and that the user is responsible for complying with their licences. `package.json` names Kamil Król / KP_Code Digital Studio as author.

**No per-asset provenance record exists anywhere in the repository.** There is no image credits file, no licence manifest, no `docs/` entry and no CHANGELOG line recording where any photograph came from.

**Historical:** all 196 image files entered the repository in the initial commit `5bc5150` (2026-08-21), so Git history establishes no acquisition path either.

### 11.2 Embedded metadata — what it does and does not prove

| Finding | Files | What it establishes | What it does **not** establish |
| --- | --- | --- | --- |
| XMP `xmp:CreatorTool = "Canva (Renderer) doc=… user=… brand=…"`, `pdf:Author = "Kamil Krol"`, `Attrib:Created` dates 2025-09-16 / 2025-09-17 (gallery), 2025-10-14 (hero), 2026-01-02 (OG cards) | `hero/*` (2), `gallery/dish-02..04`, `gallery/interior-02..04`, `gallery/party-01..03` (30 files), `og-img/*` (2) | These files were **exported from Canva** by this account. The export step is attributable. | Who owns the photograph *inside* the export, or which Canva licence tier and content-licence terms apply to it. A Canva export is a processing record, not a photographic rights record. |
| No EXIF, no XMP, no ICC profile at all | `about/chef-01-*`, all four `dishes/*`, `gallery/dish-01-*`, `gallery/interior-01-*`, `gallery/wine-01-*`, `gallery/dessert-01-*`, all `avatars/*` (29 files) | Nothing. Metadata was stripped or never present. | Origin, author, licence or acquisition date — none of it is recoverable from the file. |
| Ambre emblem composited into every photograph (§3.4) | all 22 photographs | The files passed through a compositing step after capture. | Rights to the underlying photograph. Applying one's own logo to an image confers no licence to it. |

**This is missing provenance evidence, not evidence of misuse.** The two must not be conflated. Nothing observed indicates that any photograph is used unlawfully; what is observed is that the repository cannot currently demonstrate, per asset, what may lawfully be done with it.

### 11.3 Licensing checks to perform before 01B/01C

1. For the 32 Canva-exported files: identify the source element inside each Canva design and record its Canva content type (free, Pro, or externally imported) and the licence terms attached to it, including whether a public demonstration deployment is covered.
2. For the 29 metadata-free files — which include `chef-01` and all four dish photographs, i.e. the assets this review most wants to keep — establish origin from outside the repository. If origin cannot be established, they cannot be approved for retention regardless of their photographic merit.
3. For the six photographs containing identifiable people (`chef-01`, `party-01`, `party-02`, three avatars): confirm whether model releases exist and whether depicting these individuals as the chef and the named reviewers of a fictional restaurant is within those releases.
4. Record the outcome per asset. A durable credits/licence record is the only way `img-verify` and `qa:links` can be joined by a provenance check later; creating such a record is itself a future task and is not authorized here.

### 11.4 Asset-dependent blockers

| Blocker | Blocks |
| --- | --- |
| No per-asset provenance for the retained set | Final approval of any KEEP or KEEP WITH CROP REVIEW classification |
| Emblem decision (D-1) undecided | Most crop work in 01B and 01C, because the mark's presence changes what a safe crop is |
| Dish correspondence (D-4) unresolved | Using any named dish as a visual anchor; also blocks IMP-DESIGN-02 and -03 acceptance, which require final approved images |
| Anchor-room decision (D-6) undecided | All interior and celebration classification in 01C slice 3 |
| No approved replacement sources | Every REPLACE CANDIDATE. This review deliberately proposes no source, supplier, generator or search; selecting them is an owner task. |

---

## 12. Owner decisions required

Each decision is independent and can be answered on its own. "Review recommendation" is this document's proposal, not an approval.

| ID | Decision | Review recommendation | Blocks |
| --- | --- | --- | --- |
| **D-1** | Does the Ambre emblem stay burned into the photographs, get removed from them, or get standardised in size and position? | Remove it from the photography. Identity is already carried by the header, hero wordmark and footer; the baked mark crops unpredictably (§3.4) and conflicts with §5.13. | 01B and 01C crop work |
| **D-2** | Is the current banquet-style table acceptable as Ambre's invitation, or is a quieter degustation table required? | Keep `hero-03` for now and decide this alongside the 01B mobile-crop work. | 01B |
| **D-3** | May identifiable real people appear as Ambre's chef, guests and named reviewers on a site that states the restaurant is fictional? | Decide explicitly and record the answer. It governs `chef-01`, `party-01`, `party-02` and all three avatars at once. | 01B, 01C slice 3, avatar work |
| **D-4** | Are the Sandacz and Polik wołowy images corrected by replacing the photographs (not by rewriting the dishes)? | Yes — replace the photographs; the dish text, prices and allergens stay as written. | 01C slice 1; acceptance of IMP-DESIGN-01 |
| **D-5** | Is `ostrygi-z-granita` acceptable as a truthful simplification without visible granita or micro-herbs? | Acceptable; schedule a background restyle with slice 1 rather than a replacement. | 01C slice 1 |
| **D-6** | Which single interior is Ambre's room? | `interior-01`. That makes `interior-02` and `interior-03` replacements and puts `interior-04` and `party-02` to the two-rooms question. | 01C slice 3 |
| **D-7** | Is one Craft photograph enough, or should 01B/01C add preparation and service frames? | Add at least one more craft or service detail; one frame cannot carry a quarter of the narrative. | 01B scope, 01C slice 2 |
| **D-8** | Must gallery food correspond to the Ambre card and its register? | Yes. This is what makes `dish-01`–`dish-04`, `dessert-01` and `party-01` replacements. | 01C slices 2 and 3 |
| **D-9** | Is an off-venue wine still life (`wine-01`) a permitted detail? | Permit it for now; prefer an in-room pour or cellar detail when 01C produces one. | 01C slice 2 |
| **D-10** | Are the testimonial avatars in scope for photographic work at all, and is the `customer-02-128.jpg` 96 px discrepancy corrected with them? | Treat avatars as a separate task from 01B/01C; fix the discrepancy whenever that task runs. | Avatar work only |
| **D-11** | Who establishes provenance and licence for the 29 metadata-free files and the 32 Canva exports, and by when? | Required before any KEEP classification is final; 01C slice 1 can proceed on correctness grounds in parallel. | Final approval of every retained asset |

### 12.1 Decision summary by status

- **Suitable for retention, pending provenance only:** `interior-01` (KEEP); `hero-03`, `creme-z-brulee-z-tonka` (KEEP WITH CROP REVIEW).
- **Requiring approval before retention:** `chef-01`, `ostrygi-z-granita`, `interior-04`, `wine-01`, `party-02`, and the three avatars.
- **Requiring replacement or correction:** `sandacz`, `polik-wolowy`, `dish-01`–`dish-04`, `dessert-01`, `interior-02`, `interior-03`, `party-01`, `party-03`.
- **Content-integrity prerequisites:** D-4 (both dish mismatches), and D-3 where it concerns presenting real people as Ambre's staff and reviewers.
- **Missing provenance evidence:** 29 files with no metadata, 32 Canva exports with processing metadata only. Neither is evidence of misuse.

---

## 13. Verification performed and limitations

### 13.1 Checks actually performed

| Area | What was done | Result |
| --- | --- | --- |
| Repository state | `git status`, `git branch --show-current`, `git ls-files assets/img`, `git log --diff-filter=A` on four representative photographs | Clean worktree on `kodek/ambre-photo-inventory-review-305236` at `d9586e8`; 196 tracked image files, 126 of them generated; all photographs added in `5bc5150` (2026-08-21) |
| Source reading | Files listed in §2.1 read directly | Inventory, usage, crop rules and JS contracts in §3, §8 and §10.8 come from these files |
| Reference sweep | All eight HTML pages plus `sw.js` and `manifest.webmanifest` swept for `assets/img/**` | Every reference accounted for; no reference to a missing file was observed, and no orphaned photograph was found beyond the homepage-only `wine-01` / `dessert-01` noted in §3.3 |
| Asset metadata | Read-only Sharp 0.35.4 decode of all 61 source rasters and five optimized samples: dimensions, ratio, colour space, density, EXIF/XMP presence, file size | Figures in §3.2, §3.3 and §11.2; optimized samples matched their originals' pixel dimensions |
| Emblem detection | Read-only corner sampling of all 61 source rasters plus native-resolution crops of `about/chef-01-1600x1200.jpg`, `gallery/dessert-01-1600.jpg` and `hero/hero-03-2560x1440.jpg`, compared against a render of `logo-img/logo-light.svg` | §3.4 |
| Visual inspection — photographs | Every canonical photograph decoded and inspected at preview scale | Subject descriptions in §3.3, §4 and §6 |
| Visual inspection — rendering | `index.html` at 1440 × 1000, 768 × 1024 and 390 × 844 (light); `galeria.html` at 1440 × 1000 in light and dark; lazy images forced to decode before capture | §4.4, §4.5 and §8 |
| Runtime geometry | Live-DOM reads of bounding boxes, selected `currentSrc` and computed `grid-template-columns` | §8.1–§8.4 and §8.7 |
| Document integrity | `git diff --check` on the created document | See §13.3 |

### 13.2 Checks deliberately not performed

`npm run img:opt`, `img:webp`, `img:avif`, `img:clean` — all write images. `npm run img:verify` and `npm run qa:links` — reserved for authorized asset changes, per the task boundary. The full QA suite, Lighthouse, `qa:html`, `qa:a11y`, `qa:nojs` and the eight E2E suites — none is required for a documentation-only review and none was run. No dependency was installed in the worktree; Sharp was resolved read-only from the main checkout.

### 13.3 Material limitations

1. **Provenance is unknowable from inside the repository.** §11 reports what the files and history contain. Origin, authorship and licence terms for all 22 photographs must come from outside this repository.
2. **Visual subject identification is interpretation.** Cuisine and venue descriptions in §3.3 and §4 are a reviewer's reading of the photographs. The dish mismatches in §7 rest on unambiguous absences (no fish fillet and no risotto; grill marks and french fries instead of a braised cheek), but finer judgements — "Spanish tapas", "coconut-style curry" — are design judgment, not verified fact.
3. **Rendering was sampled, not audited.** Three widths on `index.html`, one on `galeria.html`, and `menu.html` not rendered at all — its dish cards share the `.dish--has-thumb` component and the same four images as `index.html`, so its geometry was inferred from shared CSS rather than measured. This is not a responsive, zoom, contrast or accessibility audit.
4. **Dark theme was sampled on one page only** (`galeria.html` at 1440 px). Statements about dark-theme luminance elsewhere are design judgment extrapolated from that sample and from the photographs themselves.
5. **Measurements come from the in-app browser pane** at device pixel ratio 1 against a temporary static server, not from the production deployment or `dist/`. Box geometry and selected variants are reliable for this configuration; the 390 px capture used mobile emulation, which influenced `srcset` candidate selection (§8.7).
6. **No lightbox, filter or load-more interaction was exercised** in this review. Statements about those contracts in §10.8 are read from `js/modules/lightbox.js`, `docs/ARCHITECTURE_MAP.md` and the HTML, not observed. Historical E2E results in `docs/archive/**` are historical.
7. **Emblem size figures are approximate.** The corner sampler keys on saturated amber and is therefore unreliable on images whose own content is amber (`interior-03`, `party-01`); the sizes quoted in §3.4 come from the clean cases and from native-resolution crops.
8. **Classifications are proposals.** None constitutes owner approval, and none authorizes an asset change.

### 13.4 Confirmation of non-modification

No photograph, optimized variant, SVG, icon, HTML file, CSS file, JavaScript file, configuration file, test, build script, Service Worker or production output was created, edited, renamed, moved or deleted. `IMPROVEMENTS-DESIGN.md`, `docs/CHANGELOG.md`, `README.md` and all other documentation are unchanged. Exactly one file was added: `docs/IMPROVEMENTS-DESIGN-01A-IMAGE-REVIEW.md`. Temporary analysis scripts, preview renders and the static server lived in the session scratchpad outside the repository; the server was stopped at the end of the review. Nothing was staged, committed, pushed or deployed.
