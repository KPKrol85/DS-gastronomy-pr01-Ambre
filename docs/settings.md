# Kontrakt poleceń npm

Plik `package.json` jest wykonywalnym źródłem prawdy. Poniższy opis rozróżnia codzienny szybki zestaw, skupione testy E2E i pełną bramkę jakości.

## Główne punkty wejścia

### `dev`

- **Command:** `live-server --host=127.0.0.1 --port=4183 --ignore=node_modules,dist`
- **Purpose:** Serwuje katalog źródłowy pod `http://127.0.0.1:4183` z przeładowaniem po zmianie plików; port leży poza zakresem serwerów QA.
- **Use:** Codzienna praca nad źródłami. Nie buduje `dist/` i nie zastępuje serwerów uruchamianych przez skrypty QA.

### `build`

- **Command:** `node scripts/build-dist.mjs`
- **Purpose:** Czyści `dist/`, buduje minifikowane `css/style.min.css` i `js/script.min.js`, kopiuje wymagane zasoby i przepisuje odwołania HTML na artefakty produkcyjne.
- **Use:** Standardowe przygotowanie katalogu produkcyjnego. Czytelne pliki źródłowe pozostają w `css/` i `js/`; pliki `.min.*` istnieją wyłącznie w `dist/`.

### `lint`

- **Command:** `npm run lint:js && npm run lint:css && npm run lint:text`
- **Purpose:** Agreguje lint JavaScriptu, CSS i publicznego tekstu.
- **Use:** Samodzielna kontrola lint po zmianach źródłowych. `qa:fast` już uruchamia `lint`, więc nie trzeba wykonywać go osobno bezpośrednio wcześniej.

### `qa:fast`

- **Command:** `npm run lint && npm run qa:html && npm run qa:links && npm run qa:seo && npm run qa:schema && npm run qa:csp`
- **Purpose:** Szybka, niezmieniająca plików kontrola źródeł i integralności projektu bez szerokich testów przeglądarkowych oraz Lighthouse.
- **Use:** Codzienna bramka podczas pracy.

### `test:e2e`

- **Command:** `npm run test:e2e:reservation && npm run test:e2e:demo-legal && npm run test:e2e:scroll-to-top && npm run test:e2e:legal-tables && npm run test:e2e:lightbox && npm run test:e2e:gallery-status`
- **Purpose:** Uruchamia deterministycznie sześć skupionych regresji przeglądarkowych.
- **Use:** Po zmianach interakcji formularza, dialogu, wspólnego sterowania przewijaniem, responsywnego osadzania tabel prawnych, lightboxa galerii i podglądu dania lub statusu ukończenia galerii.

### `qa`

- **Command:** `npm run qa:fast && npm run qa:nojs && npm run test:e2e && npm run qa:a11y && npm run qa:lighthouse`
- **Purpose:** Najpełniejsza skonfigurowana bramka jakości: szybkie QA, zachowanie bez JavaScriptu, skupione E2E, automatyczna dostępność i Lighthouse CI.
- **Use:** Przed wydaniem lub jako pełny pipeline jakości. Jest wyraźnie droższa od `qa:fast`.

Poniższa tabela pomaga dobrać najmniejszy zalecany zestaw do zakresu i ryzyka zmiany; nie zmienia obowiązujących bramek jakości. Przy zmianie kilku obszarów połącz właściwe kontrole lub wybierz szerszy agregat.

| Rodzaj zmiany | Skupione kontrole statyczne | Weryfikacja w przeglądarce / szerszy zakres |
| --- | --- | --- |
| Wyłącznie dokumentacja wewnętrzna | Przegląd treści, odnośników i zgodności z konfiguracją oraz `git diff --check`. | QA aplikacji nie jest automatycznie wymagane; `qa:links` nie waliduje Markdown. |
| CSS i wygląd | `npm run lint:css`. | Sprawdź zmienione widoki, responsywność, motywy jasny/ciemny/systemowy i widoczność fokusu; przy wpływie na interakcję wybierz właściwy test E2E. |
| Publiczny HTML, linki, metadane i dane strukturalne | `npm run qa:html`; dla treści `npm run lint:text`, linków `npm run qa:links`, metadanych `npm run qa:seo`, JSON-LD także `npm run qa:schema` i kontrola CSP z wiersza poniżej. | Przy zmianie struktury lub obsługi sprawdź renderowanie i klawiaturę; dobierz E2E. Przy wpływie na dostępność użyj `npm run qa:a11y`, a na zachowanie bez JavaScriptu — `npm run qa:nojs`; zmiana może wymagać obu kontroli. |
| Moduły JavaScript i pojedyncze interakcje | `npm run lint:js`. | Wybierz właściwe polecenie z [listy skupionych testów E2E](#skupione-testy-e2e), np. `npm run test:e2e:reservation` lub `npm run test:e2e:lightbox`; sprawdź ręcznie zmienione zachowanie poza ich pokryciem. |
| Skrypty inline i hashe CSP (także JSON-LD) | `npm run qa:csp` — kontrola bez zapisu; ewentualna regeneracja wymaga autoryzacji opisanej w sekcji CSP. | Po zmianie wykonywanego skryptu sprawdź jego działanie i ewentualne blokady CSP w środowisku stosującym `_headers`; lokalny serwer źródeł nie potwierdza tych nagłówków. |
| Service Worker i cache | `npm run lint:js`. | Jawnie uruchom `npm run qa:service-worker` (poza `qa`); test obejmuje aktywację i własność cache. Zmienione pobieranie zasobów lub fallback offline sprawdź dodatkowo w środowisku z aktywnym SW. |
| Zmiany przekrojowe i przygotowanie wydania | `npm run qa:fast` podczas pracy; przed wydaniem lub przy szerokim ryzyku wybierz `npm run qa`. | `qa` zawiera testy przeglądarkowe i Lighthouse; przy zmianach SW dodaj osobno `npm run qa:service-worker`. |

Agregaty wykonują już swoje składowe: `lint` zawiera `lint:js`, `lint:css` i `lint:text`; `qa:fast` zawiera `lint` i statyczne QA; `qa` zawiera `qa:fast`, `qa:nojs`, `test:e2e`, `qa:a11y` i `qa:lighthouse`. W jednym zestawie kontroli nie powtarzaj etapów zawartych w wybranym agregacie; po kolejnej zmianie ponów dotknięte kontrole.

## Podgląd produkcyjny

W katalogu głównym repozytorium wygeneruj świeże `dist/`, a następnie uruchom istniejący serwer:

```bash
npm run build
node scripts/lhci-static-server.mjs
```

Przy domyślnych ustawieniach otwórz `http://127.0.0.1:4174`. Podgląd serwuje wygenerowane strony HTML oraz minifikowany CSS i główny bundle JavaScript z `dist/`, zamiast plików źródłowych. Zatrzymaj serwer przez `Ctrl+C`.

- Podgląd nie ma automatycznego buildu ani live reload. Po zmianie źródeł ponów `npm run build` i ręcznie odśwież stronę.
- Przed `npm run qa:lighthouse` zatrzymaj podgląd — Lighthouse uruchamia ten sam serwer na porcie 4174.
- `npm run qa:server` domyślnie uruchamia serwer na porcie 4180, sprawdza `/` i `/menu.html`, po czym go zatrzymuje; jest to tymczasowa kontrola dwóch tras, nie stały podgląd w przeglądarce.
- Serwer nie emuluje przekierowań, nagłówków bezpieczeństwa ani przetwarzania formularzy Netlify. `js/sw-register.js` wyłącza lokalną rejestrację Service Workera, więc podgląd nie weryfikuje działania offline.

## Skrypty lintujące

- `lint:js` — `eslint --max-warnings 0 "js/**/*.js" "scripts/**/*.mjs"`.
- `lint:css` — `stylelint --max-warnings 0 "css/**/*.css"`.
- `lint:text` — `node scripts/text-lint.mjs`.

## Skrypty QA

- `qa:html` — waliduje osiem stron źródłowych przez HTML-Validate.
- `qa:links` — sprawdza lokalne linki i kotwice w HTML aplikacji; nie waliduje odnośników Markdown.
- `qa:seo` — sprawdza metadane SEO, canonicale i JSON-LD.
- `qa:schema` — egzekwuje politykę obecności JSON-LD na właściwych stronach.
- `qa:csp` — tylko sprawdza, czy hashe CSP w `_headers` są aktualne; nie zapisuje pliku.
- `qa:nojs` — sprawdza bazowe zachowanie stron bez JavaScriptu w przeglądarce.
- `qa:a11y` — uruchamia automatyczny audyt Playwright + axe na ośmiu stronach w dwóch jawnych stanach: pierwszej wizyty z otwartym modalem informacyjnym oraz stanu po akceptacji, czyli pełnej strony osiąganej przez kliknięcie wysyłanego z projektem przycisku akceptacji. Przed każdym skanem axe weryfikuje warunki wstępne stanu — widoczność i `aria-hidden` modala, kontrakt `inert` na tle oraz obecność treści głównej w drzewie dostępności Chromium — więc wynik nie może zostać zgłoszony dla niewłaściwego stanu strony. Wynik raportowany jest osobno dla każdej pary strona–stan. Pełne pokrycie po akceptacji obejmuje wszystkie osiem stron; skan modal-open dotyczy wyłącznie stron faktycznie zawierających modal, a strony narzędziowe bez niego (`offline.html`, `404.html`) zgłaszają jawne pominięcie tego stanu zamiast sztucznie tworzonego modala. Na koniec wykonywana jest kontrola negatywna: wyłącznie w czasie działania wstrzykiwany jest niepoprawny obraz poza modalem, co potwierdza, że skan pełnej strony go wykrywa i na nim nie przechodzi, a skan modal-open go nie widzi; zaszczepiony znacznik nigdy nie trafia do źródeł projektu.
- `qa:lighthouse` — uruchamia Lighthouse CI zgodnie z `lighthouserc.json`.
- `qa:server` — sprawdza odpowiedzi lokalnego serwera statycznego używanego przez narzędzia jakości; nie potwierdza działania wdrożenia publicznego.

## Skupione testy E2E

- `test:e2e:reservation` — regresje wysyłania formularza rezerwacji i natywnego fallbacku.
- `test:e2e:demo-legal` — regresje początkowego dialogu informacyjnego i jego pamięci akceptacji.
- `test:e2e:scroll-to-top` — regresje wspólnego przycisku przewijania do góry.
- `test:e2e:legal-tables` — regresje poziomego przepełnienia, dostępności i obsługi klawiaturą tabel na stronach prawnych przy szerokościach 320 px i 390 px.
- `test:e2e:lightbox` — regresje przywracania stanu dokumentu przez lightbox galerii: dokładna poprzednia wartość `scroll-behavior` w stylu inline elementu głównego, zachowana pozycja przewijania i powrót fokusu do klikniętego elementu galerii we wszystkich obsługiwanych ścieżkach zamknięcia (przycisk zamykania, Escape/cancel, tło i natywne zamknięcie dialogu). Sprawdza też kontrakt trybów: galeria otwiera sesję przeglądaną z licznikiem oraz nawigacją, a podgląd dania w menu pozostaje pojedynczy, z ukrytymi i niedostępnymi z klawiatury przyciskami nawigacji.
- `test:e2e:gallery-status` — regresje ukończonego statusu galerii: treść statusu dokładnie równa `Wszystko załadowane`, bez zbędnych znaków i obcych węzłów tekstowych, dekoracyjna ikona SVG wykluczona z drzewa dostępności oraz niezmienione filtrowanie galerii i moment pojawienia się stanu ukończonego.

## CSP

- `csp:hash` — regeneruje hashe skryptów inline w `_headers`; jest jawnym poleceniem utrzymaniowym zmieniającym plik. W razie potrzeby użyj `npm run csp:hash`, a następnie zweryfikuj wynik przez `npm run qa:csp`. Regeneracja wymaga osobnej autoryzacji, jeśli zapis `_headers` nie jest już objęty zatwierdzonym zakresem zadania.
- `qa:csp` — wykonuje wyłącznie weryfikację i należy do `qa:fast` oraz pełnego `qa`.

## Obrazy

- `img:opt` — generuje skonfigurowane warianty WebP i AVIF.
- `img:webp` — generuje tylko warianty WebP.
- `img:avif` — generuje tylko warianty AVIF.
- `img:clean` — usuwa katalog `assets/img/_optimized`; używaj świadomie przed pełną regeneracją.
- `img:verify` — sprawdza obecność i spójność wygenerowanych wariantów obrazów.

Bez dodatkowych argumentów polecenia generujące obrazy przeszukują źródła JPEG/PNG w `assets/img/` i pomijają warianty, których czas modyfikacji jest równy lub nowszy niż czas źródła. Aby przetworzyć tylko jeden obraz, podaj ścieżkę względem katalogu głównego repozytorium:

```bash
npm run img:opt -- --source assets/img/hero/hero-03-1600x900.jpg
```

Dodaj `--force`, aby regenerować żądane warianty wybranego obrazu niezależnie od czasów modyfikacji; ta opcja wymaga `--source`. Bez `--force` wybrane źródło nadal podlega kontroli czasu modyfikacji. Obie opcje można przekazywać tak samo do `img:webp` i `img:avif`, aby ograniczyć format wyjściowy. Źródło musi być istniejącym zwykłym plikiem JPEG/PNG wewnątrz `assets/img/`, poza `_optimized/`, bez dowiązań w ścieżce.
