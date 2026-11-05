# [AMBRE] — PRE-RELEASE CHECK

**Projekt:**  DS-gastronomy-pr01-Ambre
**Marka:** Ambre — KP_Code Digital Studio
**Charakter projektu:** DEMONSTRACYJNY
**Autor / właściciel:** Kamil Król | KP_Code Digital Studio
**Data rozpoczęcia:** 2026-11-03
**Status:** IN PROGRESS
**Cel:** Końcowa weryfikacja projektu przed wydaniem i utworzeniem taga Git.

> **Zasada:** Wszystkie pola rozpoczynają się od `[ ]`. Sprawdź zgodność każdego punktu z danym projektem. Jeśli funkcja nie występuje (np. PWA, formularz, FAQ), odnotuj `N/A` wraz z uzasadnieniem w raporcie; nie oznaczaj jej jako przetestowanej. Dostosuj liczby stron, nazwy narzędzi i komendy do rzeczywistego projektu.

---

## 1. GitHub Actions — CI

- [x] Workflow CI jest poprawnie wykrywany przez GitHub.
- [x] Automatyczne uruchamianie po `push` do głównej gałęzi działa.
- [x] Instalacja zależności w CI przechodzi poprawnie.
- [x] Kontrola jakości i linting kończą się sukcesem.
- [x] Wszystkie skonfigurowane testy automatyczne przechodzą.
- [x] Kontrola referencji źródłowych przechodzi, jeśli jest dostępna.
- [x] Produkcyjny build kończy się sukcesem.
- [ ] Kontrola referencji produkcyjnych przechodzi, jeśli jest dostępna. N/A — brak takiego testu w CI.
- [x] Cały workflow ma status **SUCCESS**.

## 2. PWA — Manifest

- [x] Zweryfikowano poprawność manifestu, jeśli projekt udostępnia PWA.
- [x] `name` i `short_name` są poprawne.
- [x] `start_url` prowadzi do właściwej strony.
- [x] `scope` odpowiada strukturze aplikacji.
- [x] `display` jest właściwie skonfigurowane.
- [x] `theme_color` i `background_color` są odpowiednie.
- [x] Wszystkie ikony istnieją i poprawnie się wyświetlają.
- [x] Instalacja PWA działa na urządzeniu mobilnym.
- [x] Uruchomienie zainstalowanej aplikacji działa poprawnie.

## 3. PWA — Shortcuts

- [x] Sprawdzono wszystkie istniejące skróty w manifeście.
- [x] Nazwy skrótów są czytelne i aktualne.
- [x] Każdy skrót prowadzi do właściwego miejsca.
- [x] Nie występują nieaktualne adresy ani odnośniki.
- [x] Ikony skrótów istnieją i mają odpowiednie parametry.
- [x] Skróty działają po uruchomieniu z zainstalowanej PWA.

## 4. PWA — Screenshots

- [x] Sprawdzono, czy manifest zawiera właściwą sekcję `screenshots`.
- [x] Zweryfikowano wszystkie istniejące zrzuty ekranu.
- [x] Screenshoty przedstawiają aktualny wygląd projektu.
- [x] Zweryfikowano proporcje, rozdzielczość i format plików.
- [x] Sprawdzono poprawność ścieżek do obrazów.
- [ ] W razie potrzeby przygotowano nowe screenshoty mobilne. N/A — obecny screenshot jest aktualny.
- [ ] W razie potrzeby przygotowano nowe screenshoty desktopowe. N/A — obecny screenshot jest aktualny.
- [ ] Po ewentualnej wymianie zweryfikowano manifest ponownie. N/A — nie wymieniano screenshotów.
- [ ] Sprawdzono aktualność osobnych screenshotów portfolio, jeśli istnieją. N/A — brak osobnych screenshotów portfolio w repozytorium.


## 5. PWA — Service Worker i Offline

- [x] Service Worker rejestruje się poprawnie.
- [x] Produkcyjne zasoby są prawidłowo obsługiwane przez cache.
- [x] Strona działa w trybie offline w przewidzianym zakresie.
- [x] Strona lub widok awaryjny offline działa poprawnie, jeśli istnieje.
- [x] Aktualizacja aplikacji nie pozostawia nieaktualnych zasobów.
- [x] Zweryfikowano zachowanie aplikacji po ponownym połączeniu z internetem.
- [x] Nie występują błędy Service Workera w konsoli.

## 6. Standard KP_Code Digital Studio

- [x] Marka demonstracyjna jest jednoznacznie przedstawiona jako fikcyjna, jeśli projekt jest demonstracyjny.
- [x] Autorstwo KP_Code Digital Studio jest prawidłowo oznaczone, jeśli dotyczy.
- [x] Notka demonstracyjna występuje we właściwych miejscach na wszystkich wymaganych stronach.
- [x] Stopki zachowują spójny wygląd i treść.
- [x] Dane kontaktowe są przypisane do właściwego odbiorcy.
- [ ] Telefon, e-mail i adres są aktualne, jeśli są publikowane.
- [ ] Odnośniki `tel:` i `mailto:` działają, jeśli występują.
- [ ] Na właściwych podstronach znajdują się dyskretne noty demonstracyjne, jeśli są wymagane.
- [ ] Nie występują sprzeczne deklaracje dotyczące charakteru działalności.
- [ ] Nie występują zbędne bannery, modale ani powtarzające się komunikaty demonstracyjne.

## 7. Formularz kontaktowy

- [ ] Formularz prawidłowo wyświetla się na desktopie.
- [ ] Formularz prawidłowo wyświetla się na telefonie.
- [ ] Przycisk wysyłania jest prawidłowo ustawiony i czytelny.
- [ ] Wszystkie pola mają właściwe etykiety.
- [ ] Walidacja wymaganych pól działa.
- [ ] Pole wyboru rodzaju zapytania działa poprawnie, jeśli występuje.
- [ ] Zgoda dotycząca polityki prywatności działa, jeśli jest wymagana.
- [ ] Mechanizm antyspamowy działa poprawnie, jeśli jest używany.
- [ ] reCAPTCHA lub inna ochrona przed botami działa w środowisku produkcyjnym, jeśli jest używana.
- [ ] Usługa obsługująca formularz odbiera rzeczywiste zgłoszenie testowe.
- [ ] Formularz kieruje wiadomości do właściwego odbiorcy.
- [ ] Strona lub komunikat sukcesu działa poprawnie.
- [ ] Formularz nie wykazuje błędów w konsoli przeglądarki.

## 8. FAQ i CTA

- [ ] Wszystkie pytania FAQ są aktualne, jeśli sekcja istnieje.
- [ ] Odpowiedzi są zgodne z charakterem projektu i obowiązującymi standardami.
- [ ] FAQ działa przy użyciu klawiatury.
- [ ] FAQ jest zgodne z danymi strukturalnymi JSON-LD, jeśli zostały wdrożone.
- [ ] Wszystkie przyciski CTA prowadzą do właściwych miejsc.
- [ ] CTA nie sugerują nieistniejących usług ani funkcji.
- [ ] Końcowe CTA są prawidłowo wyrównane na wszystkich właściwych podstronach.
- [ ] Zawijanie przycisków na urządzeniach mobilnych działa poprawnie.
- [ ] Nie występują uszkodzone odnośniki.

## 9. Responsywność i wygląd

Sprawdź najważniejsze widoki na szerokościach około 375 px, 768 px i 1280 px oraz dodatkowo 320 px dla wąskich ekranów; dostosuj zakres do projektu.

- [x] Strona główna wygląda poprawnie.
- [x] Wszystkie istotne podstrony wyglądają poprawnie.
- [x] Formularz kontaktowy wygląda poprawnie, jeśli występuje.
- [x] FAQ wygląda poprawnie, jeśli występuje.
- [x] Galeria działa poprawnie, jeśli występuje.
- [x] Nawigacja mobilna działa poprawnie.
- [x] Stopki są responsywne.
- [x] Motyw jasny działa poprawnie, jeśli występuje.
- [x] Motyw ciemny działa poprawnie, jeśli występuje.
- [x] Motyw systemowy działa poprawnie, jeśli występuje.
- [x] Nie występuje niepożądane poziome przewijanie.
- [x] Obrazy zachowują prawidłowe proporcje.
- [x] Nie występują regresje wizualne.

## 10. SEO i metadane

- [ ] Każda strona ma poprawny `title`.
- [ ] Opisy `meta description` są aktualne.
- [ ] Adresy canonical są prawidłowe.
- [ ] Metadane Open Graph są zgodne z charakterem projektu.
- [ ] Metadane Twitter/X są aktualne, jeśli występują.
- [ ] Dane strukturalne JSON-LD są poprawne, jeśli występują.
- [ ] Fikcyjna działalność nie jest przedstawiana jako rzeczywista firma, jeśli dotyczy.
- [ ] `sitemap.xml` zawiera właściwe adresy, jeśli jest używany.
- [ ] `robots.txt` jest poprawny, jeśli jest używany.
- [ ] Nie występują nieaktualne adresy URL.

## 11. Dostępność — Accessibility

- [ ] Nawigacja klawiaturą działa.
- [ ] Fokus interaktywnych elementów jest widoczny.
- [ ] Kontrasty tekstów są prawidłowe.
- [ ] Formularze mają poprawne etykiety i komunikaty, jeśli występują.
- [ ] Obrazy mają odpowiednie teksty alternatywne.
- [ ] Hierarchia nagłówków jest logiczna.
- [ ] Elementy interaktywne mają właściwe nazwy dostępności.
- [ ] Wykonano dostępne testy automatyczne.
- [ ] Zweryfikowano najważniejsze interakcje ręcznie.

## 12. Produkcyjny build i QA

- [ ] Linting projektu — PASS.
- [ ] Testy automatyczne projektu — PASS.
- [ ] Kontrola referencji źródłowych — PASS, jeśli dostępna.
- [ ] Produkcyjny build — PASS.
- [ ] Kontrola referencji produkcyjnych — PASS, jeśli dostępna.
- [ ] Katalog wyjściowy buildu zawiera wymagane pliki.
- [ ] Zweryfikowano poprawność wygenerowanych ścieżek.
- [ ] Sprawdzono konsolę przeglądarki pod kątem błędów.
- [ ] Wykonano końcowy pomiar Lighthouse, jeśli przewidziany.
- [ ] Sprawdzono podstawowe wskaźniki wydajności.
- [ ] Nie wykryto krytycznych regresji.

## 13. Dokumenty i strony pomocnicze

- [ ] Regulamin odpowiada rzeczywistemu charakterowi projektu, jeśli występuje.
- [ ] Polityka prywatności opisuje rzeczywiste przetwarzanie danych.
- [ ] Polityka cookies jest aktualna, jeśli występuje.
- [ ] Strony informacyjne zawierają poprawne informacje, jeśli występują.
- [ ] Treści dotyczące kariery lub rekrutacji nie wprowadzają w błąd, jeśli występują.
- [ ] Strona lub obsługa błędu `404` działa poprawnie.
- [ ] Strona lub obsługa trybu offline działa poprawnie, jeśli występuje.
- [ ] README odpowiada aktualnemu projektowi.
- [ ] CHANGELOG zawiera wymagane wpisy, jeśli jest prowadzony.
- [ ] Dokumentacja nie zawiera nieaktualnych instrukcji.

---

## 14. Raport audytu

**Etap pierwszy: analiza bez modyfikowania plików.**

- [ ] Wykonano audyt wszystkich obszarów objętych zakresem.
- [ ] Przygotowano listę wyników PASS.
- [ ] Przygotowano listę problemów FIX.
- [ ] Wskazano kwestie wymagające decyzji właściciela — REVIEW.
- [ ] Każdy problem ma przypisany plik, lokalizację lub sposób odtworzenia.
- [ ] Zweryfikowano, czy proponowane poprawki mieszczą się w zakresie zadania.
- [ ] Właściciel projektu zatwierdził zakres poprawek.

### Wyniki audytu

**PASS:**
Do uzupełnienia.

**FIX:**
Do uzupełnienia.

**REVIEW:**
Do uzupełnienia.

**N/A (nie dotyczy):**
Do uzupełnienia wraz z uzasadnieniem.

---

## 15. Poprawki po audycie

**Ten etap realizujemy wyłącznie wtedy, gdy audyt wykaże rzeczywiste problemy.**

- [ ] Przygotowano minimalny plan zmian.
- [ ] Właściciel zatwierdził plan.
- [ ] Wprowadzono wyłącznie zatwierdzone poprawki.
- [ ] Nie zmieniono niepowiązanych komponentów.
- [ ] Nie naruszono obowiązujących standardów projektu.
- [ ] Ponownie przeprowadzono wymagane testy.
- [ ] Zweryfikowano poprawione elementy w przeglądarce, jeśli dotyczy.
- [ ] Zmiany zostały przejrzane i zaakceptowane.

---

## 16. Final Release Gate

**Warunki wymagane przed utworzeniem taga Git.**

- [ ] Wszystkie problemy krytyczne zostały rozwiązane.
- [ ] Nie pozostały niezaakceptowane problemy blokujące wydanie.
- [ ] Finalny build produkcyjny przechodzi.
- [ ] GitHub Actions ma status SUCCESS dla finalnego commita, jeśli CI jest używane.
- [ ] Produkcyjna wersja została zweryfikowana po wdrożeniu.
- [ ] Formularz produkcyjny został przetestowany, jeśli występuje.
- [ ] PWA działa prawidłowo, jeśli występuje.
- [ ] Skróty i screenshoty PWA są aktualne, jeśli występują.
- [ ] Obowiązujące standardy projektu są zachowane.
- [ ] Dokumentacja jest aktualna.
- [ ] Wszystkie zatwierdzone zmiany zostały zacommitowane.
- [ ] Drzewo robocze Git jest czyste.
- [ ] Właściciel projektu zatwierdził wydanie.

### Git Tag

- [ ] Ustalono numer wersji.
- [ ] Utworzono tag Git.
- [ ] Wypchnięto tag do GitHub.
- [ ] Zweryfikowano tag w repozytorium.

---

## Final Status

**Audit:** PENDING
**Critical Issues:** UNKNOWN
**GitHub Actions:** PENDING FINAL VERIFICATION
**Production Verification:** PENDING
**Release Approval:** PENDING
**Git Tag:** NOT CREATED

**Project:** [IDENTYFIKATOR_PROJEKTU]
**Owner:** [AUTOR_LUB_WŁAŚCICIEL]

---

*KP_Code — weryfikacja przed zmianą, minimalny zakres poprawek, zgoda właściciela przed wydaniem.*
