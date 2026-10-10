# Ambre

## PL

### Przegląd projektu

**Ambre** to demonstracyjna, wielostronicowa strona fikcyjnej restauracji fine dining, przygotowana przez KP_Code Digital Studio jako projekt portfolio. Interfejs w języku polskim wykorzystuje HTML, CSS i modułowy Vanilla JavaScript bez frameworka aplikacyjnego.

Repozytorium zawiera osiem stron, lokalne zasoby, build produkcyjny i narzędzia QA. Treści restauracyjne są poglądowe. Formularz prezentuje obsługę zgłoszenia; projekt nie zawiera własnego backendu rezerwacji, bazy danych, kont użytkowników ani płatności.

### Wersja online

[Demo Ambre](https://ds-gastronomy-pr01-ambre.netlify.app/) — adres wskazany w `package.json` i `regulamin.html`. Dostępność adresu oraz zgodność wdrożenia z bieżącą rewizją repozytorium nie zostały potwierdzone.

### Kluczowe funkcje

- Strona główna z prezentacją restauracji, podglądem menu i galerii, FAQ oraz formularzem rezerwacji; osobne strony menu, galerii i informacji prawnych, a także widoki 404 i offline.
- Nawigacja mobilna, oznaczanie aktualnej strony i sekcji, przełączanie jasnego i ciemnego motywu oraz przyciski przewijania.
- Filtry kategorii dań i zdjęć, rozwijane szczegóły dań oraz lightbox z obsługą klawiatury: przeglądanie grupy zdjęć galerii lub podgląd pojedynczego dania.
- Formularz z walidacją wymaganych pól, formatowaniem polskiego numeru telefonu, sprawdzaniem zgody, polem honeypot i komunikatami wysyłania.
- Dialog informujący o demonstracyjnym charakterze serwisu oraz mapa Google ładowana po kliknięciu użytkownika.

### Stack technologiczny

- **Interfejs:** HTML, CSS z custom properties i media queries, Vanilla JavaScript oraz ES modules.
- **Build:** Node.js, npm, PostCSS z postcss-import, Autoprefixer i cssnano, esbuild.
- **Development i zasoby:** live-server oraz Sharp do konwersji obrazów.
- **QA:** ESLint, Stylelint, HTML-Validate, własne walidatory Node.js, Playwright z Chromium, axe-core i Lighthouse CI.
- **Mechanizmy przeglądarkowe:** Web App Manifest, Service Worker, Cache Storage i localStorage.

### Architektura

Strony HTML w katalogu głównym są źródłem treści i struktury. `css/style.css` importuje warstwy bazowe, tokeny, typografię, układy, komponenty i style stron. `js/script.js` uruchamia moduły z `js/modules/` po `DOMContentLoaded`, obsługując błąd każdego inicjalizatora osobno. `js/icons.js` zawiera współdzielony rejestr ikon SVG.

Treści menu i galerii są zapisane w HTML; filtry operują na atrybutach elementów. `js/sw-register.js` i `js/pwa-install.js` są osobnymi skryptami. Źródła pozostają czytelne, a bundlowanie i minifikacja odbywają się przy tworzeniu dystrybucji.

### Struktura projektu

```text
.
├── index.html
├── menu.html
├── galeria.html
├── cookies.html
├── polityka-prywatnosci.html
├── regulamin.html
├── 404.html
├── offline.html
├── assets/
├── css/
│   ├── style.css
│   ├── base/
│   ├── layout/
│   ├── components/
│   └── pages/
├── js/
│   ├── script.js
│   ├── icons.js
│   ├── modules/
│   ├── sw-register.js
│   └── pwa-install.js
├── scripts/
├── docs/
├── .github/workflows/main.yml
├── sw.js
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── _headers
├── _redirects
├── package.json
├── package-lock.json
├── LICENSE.md
└── README.md
```

### Instalacja

Wymagane są Node.js i npm. Workflow CI używa Node.js 22; `package.json` nie deklaruje zakresu `engines`. Zależności odtworzysz z `package-lock.json`, wykonując w katalogu głównym:

```bash
npm ci
```

Kontrole przeglądarkowe wymagają dostępnego Chromium dla Playwright, a Lighthouse CI — przeglądarki Chrome/Chromium.

### Development lokalny

```bash
npm run dev
```

Serwer live-server udostępnia źródła pod `http://127.0.0.1:4183` i przeładowuje stronę po zmianach. Nie buduje dystrybucji ani nie emuluje przetwarzania formularzy i reguł hostingu Netlify. Korzystaj z serwera HTTP, ponieważ strony używają modułów JavaScript i ścieżek względem katalogu głównego serwisu.

### Dostępne skrypty

| Polecenie | Zakres |
| --- | --- |
| `npm run build` | Odtworzenie produkcyjnego katalogu `dist/`. |
| `npm run lint` | Lint JavaScriptu, CSS i wybranych błędów w publicznych tekstach. |
| `npm run qa:fast` | Lint, HTML, lokalne linki i kotwice, SEO, polityka JSON-LD oraz kontrola hashy CSP. |
| `npm run test:e2e` | Sześć regresji: formularz, dialog demonstracyjny, przewijanie, tabele prawne, lightbox i status galerii. |
| `npm run qa` | Szybkie QA, zachowanie bez JavaScriptu, E2E, axe-core i Lighthouse CI. |
| `npm run qa:service-worker` | Osobny test aktywacji Service Workera i własności cache; poza agregatem `qa`. |
| `npm run qa:server` | Kontrola odpowiedzi lokalnego serwera dystrybucji; wymaga istniejącego `dist/`. |
| `npm run qa:csp` | Weryfikacja hashy skryptów inline w `_headers` bez zapisu. |
| `npm run csp:hash` | Aktualizacja hashy skryptów inline w `_headers`; zmienia plik. |
| `npm run img:opt` | Generowanie WebP i AVIF w `assets/img/_optimized/`. |
| `npm run img:webp` / `npm run img:avif` | Generowanie wybranego formatu obrazów. |
| `npm run img:verify` | Sprawdzenie istnienia katalogu obrazów wynikowych i policzenie plików. |
| `npm run img:clean` | Usunięcie całego `assets/img/_optimized/`. |

Pojedyncze kontrole są dostępne jako `lint:*`, `qa:*` i `test:e2e:*`. Pełny kontrakt poleceń opisuje [przewodnik skryptów](docs/settings.md); wykonywalnym źródłem prawdy jest `package.json`.

### Build produkcyjny

`scripts/build-dist.mjs` usuwa poprzedni `dist/`, przetwarza CSS do `dist/css/style.min.css`, bundluje JavaScript do `dist/js/script.min.js` i kopiuje osiem stron oraz wymagane pliki statyczne. W kopiach HTML i `dist/sw.js` zastępuje odwołania do źródeł odwołaniami do plików minifikowanych. Osobne skrypty PWA są kopiowane bez bundlowania.

Build kopiuje istniejący `assets/`; nie uruchamia konwersji obrazów. `dist/` jest ignorowany przez Git i stanowi wygenerowany pakiet do publikacji. Nie edytuj go ręcznie ani nie dodawaj plików minifikowanych do źródłowych katalogów `css/` i `js/`.

Ręczny podgląd produkcyjnego `dist/` opisuje [procedura podglądu](docs/settings.md#podgląd-produkcyjny).

### Testy i walidacja

Testy Playwright korzystają z lokalnych serwerów i Chromium. Regresje formularza przechwytują odpowiedzi POST, więc sprawdzają zachowanie klienta, nie rzeczywisty odbiór przez Netlify. `qa:a11y` obejmuje osiem stron oraz stan otwartego dialogu i stan po akceptacji tam, gdzie dialog występuje. Lighthouse CI buduje dystrybucję i zbiera po trzy pomiary dla ośmiu stron; progi w `lighthouserc.json` są wymaganiami konfiguracji, nie deklarowanymi wynikami.

[Workflow CI](.github/workflows/main.yml) jest skonfigurowany dla push i pull request do `main`: instalacja zależności, szybkie QA i build. Nie uruchamia pełnego zestawu QA. Dostępne kontrole nie stanowią deklaracji ich zaliczenia ani zgodności dostępności.

### Wdrożenie

Pakiet do hostingu statycznego powstaje w `dist/`. Build przenosi do niego `_headers` i `_redirects` z regułami dla Netlify: przekierowaniami adresów, odpowiedzią 404 i nagłówkami, w tym CSP. Strony zakładają publikację w katalogu głównym domeny. Workflow CI nie zawiera kroku wdrożenia.

Formularz w `index.html` ma `data-netlify="true"` i ukryte `form-name`. `js/modules/form.js` wysyła dane przez `fetch` metodą POST na `/`, uznaje za sukces tylko `response.ok`, a przy błędzie zachowuje pola i wyświetla komunikat. Natywne wysłanie pozostaje dostępne bez JavaScriptu lub bez `fetch`/`FormData`; błąd żądania nie powoduje automatycznego ponownego wysłania. Odbiór danych wymaga konfiguracji hostingu i nie potwierdza rezerwacji stolika.

### Dostępność

Implementacja zawiera semantyczne regiony, linki pomijające nawigację, etykiety formularza, widoczne style fokusu oraz synchronizację `aria-current`, `aria-expanded` i `aria-pressed`. Dialog demonstracyjny ogranicza fokus do panelu, oznacza tło jako `inert` i przy zamknięciu przywraca fokus; lightbox obsługuje klawiaturę i przywraca fokus po zamknięciu.

Błędy formularza korzystają z `aria-invalid` i komunikatów `aria-live`. Tabele prawne mają fokusowalne obszary przewijania poziomego. Animacje i przewijanie uwzględniają `prefers-reduced-motion`. Są to mechanizmy implementacji, bez deklaracji formalnej zgodności WCAG.

### SEO

Strony mają tytuły, opisy, canonicale, Open Graph i Twitter Cards; repozytorium zawiera `robots.txt` i `sitemap.xml`. Sześć stron treściowych używa JSON-LD z `WebSite`, `CreativeWork`, `WebPage` i osobną `Organization` dla KP_Code Digital Studio. Model opisuje projekt demonstracyjny, nie działającą restaurację.

`404.html` i `offline.html` mają `noindex`, nie występują w sitemapie i nie zawierają JSON-LD. `scripts/schema-policy-check.mjs` egzekwuje podział stron oraz odrzuca fikcyjne encje biznesowe i dane operacyjne.

### PWA i obsługa offline

`manifest.webmanifest` definiuje ikony, skróty, zrzuty ekranu oraz `start_url` i `scope` ustawione na `/`. Przycisk instalacji pojawia się po `beforeinstallprompt`, jeśli aplikacja nie działa już w trybie standalone.

`sw.js` precache’uje strony i podstawowe zasoby. Nawigacja, CSS i JavaScript korzystają najpierw z sieci, a przy błędzie sieci z cache; obrazy korzystają najpierw z cache, a następnie z sieci. Brak dokumentu lub obrazu w trybie offline prowadzi do odpowiednich zasobów zastępczych. Cache mają prefiks `ambre-`; aktywacja usuwa przestarzałe cache projektu i jawnie wskazane stare klucze, zachowując nieznane cache tego samego originu.

`js/sw-register.js` pomija rejestrację na lokalnych hostach i prywatnych adresach IP oraz wyrejestrowuje tam istniejące Service Workery. Zwykły development lokalny nie sprawdza więc działania offline. Zasoby spoza precache zależą od wcześniejszego pobrania; instalacja, cache i zewnętrzna mapa wymagają osobnej weryfikacji w docelowym środowisku.

### Wydajność

Produkcja używa minifikowanego CSS i bundla JavaScript. HTML zawiera obrazy AVIF/WebP z wariantami `srcset`, wymiarami i selektywnym `loading="lazy"`; fonty są lokalne i używają `font-display: swap`. Zewnętrzny iframe mapy jest aktywowany dopiero na żądanie. README opisuje te mechanizmy bez deklarowania wyników pomiarów.

### Dane i trwałość stanu

Treści stron, dania i zdjęcia pochodzą z lokalnego HTML i zasobów. `localStorage` przechowuje wybór motywu pod kluczem `theme` oraz akceptację informacji demonstracyjnej pod `demoLegalAccepted`. Cache Storage służy Service Workerowi do przechowywania odpowiedzi. Nie jest to baza rezerwacji ani synchronizacja między urządzeniami.

### Utrzymanie projektu

[Mapa architektury](docs/ARCHITECTURE_MAP.md) wskazuje powiązania hooków HTML z modułami. Przy dodawaniu strony trzeba uwzględnić jawne listy stron w buildzie, walidatorach, konfiguracji Lighthouse i precache Service Workera.

Po zmianie skryptów inline należy zweryfikować i w razie potrzeby odświeżyć hashe CSP. Wersję i zakres cache utrzymuje źródłowy `sw.js`; produkcyjna kopia jest tworzona przez build. Dokumenty w `docs/archive/` są zapisami historycznymi.

### Licencja

Projekt podlega [Własnościowej Licencji Projektu KP_CODE](LICENSE.md), wersja 1.0, i nie jest udostępniany jako open source. Warunki określają zakres prywatnej oceny i lokalnego uruchamiania oraz ograniczenia dalszego wykorzystania. Materiały podmiotów trzecich podlegają odrębnym licencjom i warunkom.

## EN

### Project Overview

**Ambre** is a demonstration multi-page website for a fictional fine-dining restaurant, created by KP_Code Digital Studio as a portfolio project. Its Polish-language interface uses HTML, CSS, and modular Vanilla JavaScript without an application framework.

The repository contains eight pages, local assets, a production build, and QA tooling. Restaurant content is illustrative. The form demonstrates submission handling; the project does not include its own reservation backend, database, user accounts, or payments.

### Live Version

[Ambre demo](https://ds-gastronomy-pr01-ambre.netlify.app/) — the address listed in `package.json` and `regulamin.html`. Availability and alignment of the deployment with the current repository revision have not been confirmed.

### Key Features

- A homepage with restaurant presentation, menu and gallery previews, FAQ, and a reservation form; separate menu, gallery, and legal pages, plus 404 and offline views.
- Mobile navigation, current page and section indicators, light and dark theme switching, and scroll controls.
- Dish and image category filters, expandable dish details, and a keyboard-operated lightbox for browsing a gallery group or viewing a single dish.
- A form with required-field validation, Polish phone-number formatting, consent checks, a honeypot field, and submission status messages.
- A dialog explaining the demonstration nature of the site and a Google map loaded after user activation.

### Tech Stack

- **Interface:** HTML, CSS custom properties and media queries, Vanilla JavaScript, and ES modules.
- **Build:** Node.js, npm, PostCSS with postcss-import, Autoprefixer and cssnano, esbuild.
- **Development and assets:** live-server and Sharp for image conversion.
- **QA:** ESLint, Stylelint, HTML-Validate, custom Node.js validators, Playwright with Chromium, axe-core, and Lighthouse CI.
- **Browser mechanisms:** Web App Manifest, Service Worker, Cache Storage, and localStorage.

### Architecture

Root-level HTML pages own content and structure. `css/style.css` imports base styles, tokens, typography, layouts, components, and page styles. `js/script.js` initializes modules from `js/modules/` after `DOMContentLoaded`, handling each initializer's errors separately. `js/icons.js` contains the shared SVG icon registry.

Menu and gallery content lives in HTML; filters read element attributes. `js/sw-register.js` and `js/pwa-install.js` are separate scripts. Sources remain readable, while bundling and minification happen when the distribution is built.

### Project Structure

```text
.
├── index.html
├── menu.html
├── galeria.html
├── cookies.html
├── polityka-prywatnosci.html
├── regulamin.html
├── 404.html
├── offline.html
├── assets/
├── css/
│   ├── style.css
│   ├── base/
│   ├── layout/
│   ├── components/
│   └── pages/
├── js/
│   ├── script.js
│   ├── icons.js
│   ├── modules/
│   ├── sw-register.js
│   └── pwa-install.js
├── scripts/
├── docs/
├── .github/workflows/main.yml
├── sw.js
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── _headers
├── _redirects
├── package.json
├── package-lock.json
├── LICENSE.md
└── README.md
```

### Installation

Node.js and npm are required. The CI workflow uses Node.js 22; `package.json` does not declare an `engines` range. Restore dependencies from `package-lock.json` in the repository root:

```bash
npm ci
```

Browser checks require Chromium for Playwright, while Lighthouse CI requires Chrome/Chromium.

### Local Development

```bash
npm run dev
```

live-server serves sources at `http://127.0.0.1:4183` and reloads the page after changes. It does not build the distribution or emulate Netlify form processing and hosting rules. Use an HTTP server because the pages use JavaScript modules and paths relative to the site root.

### Available Scripts

| Command | Scope |
| --- | --- |
| `npm run build` | Recreate the production `dist/` directory. |
| `npm run lint` | Lint JavaScript, CSS, and selected errors in public text. |
| `npm run qa:fast` | Lint, HTML, local links and anchors, SEO, JSON-LD policy, and CSP hash checks. |
| `npm run test:e2e` | Six regressions: form, demonstration dialog, scrolling, legal tables, lightbox, and gallery status. |
| `npm run qa` | Fast QA, no-JavaScript behavior, E2E, axe-core, and Lighthouse CI. |
| `npm run qa:service-worker` | Separate Service Worker activation and cache ownership test; outside the `qa` aggregate. |
| `npm run qa:server` | Check responses from the local distribution server; requires an existing `dist/`. |
| `npm run qa:csp` | Verify inline script hashes in `_headers` without writing. |
| `npm run csp:hash` | Update inline script hashes in `_headers`; modifies the file. |
| `npm run img:opt` | Generate WebP and AVIF files in `assets/img/_optimized/`. |
| `npm run img:webp` / `npm run img:avif` | Generate the selected image format. |
| `npm run img:verify` | Check that the output image directory exists and count its files. |
| `npm run img:clean` | Delete the entire `assets/img/_optimized/` directory. |

Individual checks are available as `lint:*`, `qa:*`, and `test:e2e:*`. The [script guide](docs/settings.md) describes the full command contract; `package.json` is the executable source of truth.

### Production Build

`scripts/build-dist.mjs` removes the previous `dist/`, processes CSS into `dist/css/style.min.css`, bundles JavaScript into `dist/js/script.min.js`, and copies eight pages and required static files. It rewrites source asset references in copied HTML and `dist/sw.js` to the minified files. Separate PWA scripts are copied without bundling.

The build copies the existing `assets/`; it does not run image conversion. `dist/` is ignored by Git and is the generated package for publication. Do not edit it manually or add minified files to the source `css/` and `js/` directories.

For a manual preview of production `dist/`, see the [preview procedure](docs/settings.md#podgląd-produkcyjny).

### Testing and Validation

Playwright tests use local servers and Chromium. Form regressions intercept POST responses, testing client behavior rather than actual Netlify receipt. `qa:a11y` covers eight pages, including the open-dialog and accepted states where a dialog exists. Lighthouse CI builds the distribution and collects three measurements per page across eight pages; thresholds in `lighthouserc.json` are configured requirements, not reported results.

The [CI workflow](.github/workflows/main.yml) is configured for pushes and pull requests to `main`: dependency installation, fast QA, and a build. It does not run the full QA suite. Available checks do not establish that they passed or that accessibility conformance was achieved.

### Deployment

The static-hosting package is built into `dist/`. The build copies `_headers` and `_redirects` with Netlify rules: URL redirects, a 404 response, and headers including CSP. Pages assume publication at the domain root. The CI workflow has no deployment step.

The form in `index.html` has `data-netlify="true"` and a hidden `form-name`. `js/modules/form.js` uses `fetch` to send a POST to `/`, treats only `response.ok` as success, and preserves fields while displaying a message on failure. Native submission remains available without JavaScript or without `fetch`/`FormData`; a request failure does not trigger an automatic resubmission. Data receipt requires hosting configuration and does not confirm a table reservation.

### Accessibility

The implementation includes semantic regions, skip links, form labels, visible focus styles, and synchronized `aria-current`, `aria-expanded`, and `aria-pressed`. The demonstration dialog contains focus within its panel, marks the background `inert`, and restores focus on close; the lightbox supports keyboard input and restores focus when closed.

Form errors use `aria-invalid` and `aria-live` messages. Legal tables have focusable horizontal scrolling regions. Animations and scrolling account for `prefers-reduced-motion`. These are implementation mechanisms, without a claim of formal WCAG conformance.

### SEO

Pages include titles, descriptions, canonicals, Open Graph, and Twitter Cards; the repository contains `robots.txt` and `sitemap.xml`. Six content pages use JSON-LD with `WebSite`, `CreativeWork`, `WebPage`, and a separate `Organization` for KP_Code Digital Studio. The model describes a demonstration project, not an operating restaurant.

`404.html` and `offline.html` use `noindex`, are absent from the sitemap, and contain no JSON-LD. `scripts/schema-policy-check.mjs` enforces the page classification and rejects fictional business entities and operational data.

### PWA and Offline Support

`manifest.webmanifest` defines icons, shortcuts, screenshots, and `start_url` and `scope` set to `/`. The install control appears after `beforeinstallprompt` if the application is not already running in standalone mode.

`sw.js` precaches pages and basic assets. Navigation, CSS, and JavaScript use the network first with a cache fallback on network failure; images use the cache first, then the network. Missing offline documents or images lead to their respective fallback assets. Cache names use the `ambre-` prefix; activation removes obsolete project caches and explicitly listed legacy keys while preserving unknown caches on the same origin.

`js/sw-register.js` skips registration on local hosts and private IP addresses and unregisters existing Service Workers there. Ordinary local development therefore does not exercise offline behavior. Assets outside precache depend on earlier retrieval; installation, caching, and the external map require separate verification in the target environment.

### Performance

Production uses minified CSS and a JavaScript bundle. HTML contains AVIF/WebP images with `srcset` variants, dimensions, and selective `loading="lazy"`; fonts are local and use `font-display: swap`. The external map iframe is activated only on request. This README describes these mechanisms without asserting measured results.

### Data and State Persistence

Page content, dishes, and images come from local HTML and assets. `localStorage` stores the theme choice under `theme` and acceptance of the demonstration notice under `demoLegalAccepted`. Cache Storage holds Service Worker responses. This is neither a reservation database nor synchronization between devices.

### Project Maintenance

The [architecture map](docs/ARCHITECTURE_MAP.md) links HTML hooks to modules. Adding a page requires considering explicit page lists in the build, validators, Lighthouse configuration, and Service Worker precache.

After inline script changes, verify and refresh CSP hashes as needed. The source `sw.js` owns cache versioning and scope; its production copy is generated by the build. Documents in `docs/archive/` are historical records.

### License

The project is governed by the [KP_CODE Proprietary Project License](LICENSE.md), version 1.0, and is not released as open source. The terms define private evaluation and local execution permissions and restrictions on further use. Third-party materials remain subject to their separate licenses and terms.
