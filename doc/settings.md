# settings.md

## npm scripts (z `package.json`)

### `build`
- **Command:** `npm run build:dist`
- **What it does:** Czyści `dist/`, tworzy w nim minifikowane `css/style.min.css` i `js/script.min.js`, kopiuje zasoby statyczne oraz przepisuje odwołania HTML na artefakty produkcyjne.
- **When to use:** Standardowy krok przygotowania artefaktów produkcyjnych.
- **Technical note:** Źródłowe strony używają czytelnych `css/style.css` i `js/script.js`; pliki `.min.*` istnieją wyłącznie w `dist/`.

### `build:dist`
- **Command:** `node scripts/build-dist.mjs`
- **What it does:** Wykonuje ten sam produkcyjny przepływ co `build`.
- **When to use:** Gdy chcesz jawnie wskazać docelowy katalog generowany.

### `img:opt`
- **Command:** `node scripts/optimize-images.mjs`
- **What it does:** Uruchamia optymalizację obrazów zgodnie z konfiguracją skryptu.
- **When to use:** Przy aktualizacji assetów graficznych.

### `img:webp`
- **Command:** `node scripts/optimize-images.mjs --webp`
- **What it does:** Generuje warianty WebP.
- **When to use:** Gdy potrzebujesz odświeżyć tylko format WebP.

### `img:avif`
- **Command:** `node scripts/optimize-images.mjs --avif`
- **What it does:** Generuje warianty AVIF.
- **When to use:** Gdy potrzebujesz odświeżyć tylko format AVIF.

### `img:clean`
- **Command:** `node -e "require('fs').rmSync('assets/img/_optimized', { recursive: true, force: true })"`
- **What it does:** Czyści wygenerowane obrazy z `assets/img/_optimized`.
- **When to use:** Przed pełną regeneracją assetów lub przy porządkowaniu repo.

### `img:verify`
- **Command:** `node scripts/img-verify.mjs`
- **What it does:** Weryfikuje obecność/stan wygenerowanych obrazów.
- **When to use:** Po optymalizacji obrazów, przed commitem.

### `qa`
- **Command:** `npm run qa:links && npm run qa:seo && npm run lint:schema-policy && npm run qa:html && npm run qa:nojs && npm run qa:a11y && npm run qa:lighthouse && npm run qa:text && npm run qa:js && npm run qa:css`
- **What it does:** Uruchamia pełny pakiet QA obejmujący linki, SEO, politykę schematów, HTML, działanie bez JavaScriptu, dostępność, Lighthouse CI oraz lint tekstu, JavaScriptu i CSS.
- **When to use:** Przed wydaniem lub jako pipeline quality gate.

### `qa:links`
- **Command:** `node scripts/qa-links.mjs`
- **What it does:** Sprawdza integralność linków/anchorów.
- **When to use:** Po zmianach nawigacji, URL-i i treści.

### `qa:seo`
- **Command:** `node scripts/qa-seo.mjs`
- **What it does:** Waliduje SEO i structured-data (metadata, canonical, OG, JSON-LD).
- **When to use:** Po zmianach head/meta/schema.

### `qa:html`
- **Command:** `html-validate index.html menu.html galeria.html cookies.html polityka-prywatnosci.html regulamin.html 404.html offline.html`
- **What it does:** Waliduje składnię i jakość HTML.
- **When to use:** Po zmianach w strukturze stron.

### `qa:js`
- **Command:** `eslint --max-warnings 0 "js/**/*.js" "scripts/**/*.mjs"`
- **What it does:** Lintuje kod JS i skrypty narzędziowe.
- **When to use:** Po każdej zmianie JS.

### `qa:css`
- **Command:** `stylelint --max-warnings 0 "css/**/*.css"`
- **What it does:** Lintuje CSS.
- **When to use:** Po każdej zmianie stylów.

### `qa:a11y`
- **Command:** `node scripts/qa-a11y.mjs`
- **What it does:** Uruchamia automatyczny audyt dostępności (Playwright + axe).
- **When to use:** Po zmianach UI, nawigacji, formularzy i komponentów interaktywnych.

### `qa:lighthouse`
- **Command:** `lhci autorun --config=./lighthouserc.json`
- **What it does:** Uruchamia Lighthouse CI na zdefiniowanej konfiguracji.
- **When to use:** Do kontroli wydajności, SEO i best-practices przed wdrożeniem.
