# Konstytucja Architektoniczna `@gkucmierz/utils` — 100% Pure JS (Zero DOM)

> [!IMPORTANT]
> Pakiet `@gkucmierz/utils` to fundament algorytmiczny i strukturalny całego ekosystemu. Każda funkcja i klasa w tym repozytorium **MUSI pozostać w 100% czystym, środowiskowo niezależnym kodem JavaScript (ECMAScript)**, całkowicie ślepym na istnienie drzewa DOM, przeglądarki, frameworków UI (Vue/React) czy systemu plików Node.js.

---

## 1. Całkowity Zakaz Sprzężenia z DOM i API Przeglądarki (`Zero DOM Rule`)

1. **Brak dostępu do obiektów przeglądarki / DOM:**
   - W kodzie źródłowym (`src/**/*.mjs`) oraz testach (`spec/**/*.mjs`) obowiązuje **bezwzględny zakaz** odwoływania się do:
     `window`, `document`, `navigator`, `location`, `history`, `localStorage`, `sessionStorage`, `HTMLElement`, `Element`, `Node`, `Event`, `querySelector*`, `getBoundingClientRect`, `getComputedStyle`, `checkVisibility` itp.
   - Zakaz ten jest dodatkowo egzekwowany automatycznie przez regułę `no-restricted-globals` w [`eslint.config.js`](file:///Users/gkucmierz/workspace/utils/eslint.config.js) uruchamianą w `.githooks/pre-commit`.
2. **Uniwersalność uruchomieniowa (Universal Runtime & Instacode Compatibility):**
   - Każda wyeksportowana funkcja i klasa musi działać identycznie w:
     - czystym silniku V8 / Node.js / Deno / Bun,
     - Web Workerach i Service Workerach (Manifest V3),
     - piaskownicy **Instacode** (`▶ Try it live in Instacode` generowane przez `scripts/generate_instacode_links.mjs`).

---

## 2. Czysta Abstrakcja Danych i Funkcje Wyższego Rzędu (Zero Wycieków Domenowych)

1. **Brak wycieków z domen aplikacji (`Zero Domain Leakage`):**
   - Nigdy nie umieszczaj w `@gkucmierz/utils` selektorów CSS (np. `.ext-card`), nazw klas, URL-i ani stałych biznesowych powiązanych z konkretną aplikacją.
2. **Wzorzec Projektorów / Funkcji Wyższego Rzędu zamiast obiektów DOM:**
   - Jeśli algorytm rozwiązuje problem geometryczny lub układania elementów (np. `detectGridColumns`, `navigateGrid`, `binarySearch`, `nelderMead`), przyjmuj **czyste struktury danych JS** (`Array`, `Iterable`, `Map`, `Set`, liczby, obiekty) oraz opcjonalną **czystą funkcję wyższego rzędu** (projektor `(item, index) => number`, predykat `(item) => boolean` lub komparator `(a, b) => number`).
   - Przykład prawidłowy (Pure JS w `@gkucmierz/utils`):
     ```js
     detectGridColumns(items, (item) => item.y, tolerance);
     ```
   - Przykład adaptera DOM (który należy umieścić w `@gkucmierz/nano-ui` lub warstwie UI aplikacji, **NIGDY** w `@gkucmierz/utils`):
     ```js
     const cols = detectGridColumns(
       gridEl.children,
       (el) => el.getBoundingClientRect().top,
       10
     );
     ```

---

## 3. Obowiązkowy Rygor Wydawniczy w `@gkucmierz/utils`

Przed każdym commitem lub wydaniem nowej wersji w `/Users/gkucmierz/workspace/utils`:
1. Uruchom generowanie eksportów głównych i linków Instacode:
   ```bash
   npm run build:main
   ```
2. Uruchom pełny zestaw testów jednostkowych Jasmine oraz linter:
   ```bash
   npm test && npm run lint
   ```
3. Zaktualizuj wersję SemVer w `package.json` oraz opis zmian w `CHANGELOG.md`.
