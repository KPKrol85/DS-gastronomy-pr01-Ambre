# IMP-DESIGN-01A — Image inventory and photographic art direction

**Project:** `DS-gastronomy-pr01-Ambre` — Ambre, a fictional fine-dining restaurant demo.

**Review date:** 2026-10-22 (baseline `d9586e8`).

**Parent:** `IMPROVEMENTS-DESIGN.md` → IMP-DESIGN-01.

## Historical review (stage 01A)

Stage 01A was a read-only review that prepared owner decisions for stages 01B (Hero and About) and 01C (dishes and gallery). It changed no assets, and its findings describe the image set as of 2026-10-22.

**Approved direction:** *Amber dining journal* — one imagined venue presented as table → craft → plate → hospitality, in warm controlled light with believable food colour and quiet, consistent settings.

**Inventory:** 19 narrative photographs: Hero, About, four menu-dish photographs and thirteen gallery photographs.

**Findings:** the gallery showed seven unrelated venues and overhead communal dishes unrelated to the menu. The Sandacz and Polik wołowy photographs did not show their named dishes. Every photograph carried a baked-in Ambre emblem that layouts cropped inconsistently, and no per-asset provenance was recorded.

## Implementation outcome (verified 2026-10-23)

- **01B — completed:** new `hero-*` (16:9) and `about-*` (4:3) families replaced `hero-03-*` and `chef-01-*`, which were removed.
- **01C — completed:** all four dish and thirteen gallery photographs were replaced in place under their existing basenames and sizes, with regenerated WebP/AVIF variants and rewritten gallery text alternatives. The dish photographs now match their menu descriptions, the set presents one consistent warm-lit venue, and no photograph carries the emblem.
- **Limitation:** provenance and licensing of the current photographs are not recorded in the repository, and the files carry no EXIF/XMP metadata.
