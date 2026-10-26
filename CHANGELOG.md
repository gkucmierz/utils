# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.1] - 2026-10-26

### ♻️ Changed & Added
- **Pure JS `detectGridColumns(items, getRowOffset, tolerance)`:** Replaced DOM-coupled `detectRenderedGridColumns` in `src/developer-utils/grid-navigation.mjs` with a 100% pure, higher-order geometric/data function that accepts any `Iterable` of offsets or items with a pure projector `(item, index) => number` and optional `tolerance`.
- **Strict Zero-DOM Enforcement:** Removed browser globals from `eslint.config.js` and added `no-restricted-globals` (`window`, `document`, `navigator`, `HTMLElement`, `Element`, `Node`, `localStorage`, `sessionStorage`, `location`, `history`) along with `.agents/rules/01-pure-js-architecture.md`.

## [5.3.0] - 2026-10-26

### ✨ Added
- **`navigateGrid(currentIndex, totalItems, direction, columnsOrOptions, maybeOptions)`:** 2D jagged grid / matrix navigation (`src/developer-utils/grid-navigation.mjs`) that properly handles incomplete last rows (trailing gaps) by computing valid row counts per column ($R_c = \lfloor(N - 1 - c)/C\rfloor + 1$) and supporting hierarchical wrapping options (`wrap = true` master default, with granular `wrapHoriz` / `wrapHorizontal`, `wrapVert` / `wrapVertical`, and `rowStrict` overrides).

## [5.2.0] - 2026-10-26

### ✨ Added
- **`slugify(text, options)`:** Unicode-preserving URL/heading slug generator (`src/string-arrays/slugify.mjs`) that retains all Unicode letters (`\p{L}`, including Polish, European, and Cyrillic diacritics) and numbers (`\p{N}`) while stripping HTML tags, inline backticks, and punctuation.
- **`parseHeading(rawText, options)`:** Markdown/HTML heading parser (`src/string-arrays/parse-heading.mjs`) that extracts hierarchical section numbers (e.g. `4.2.`), clean titles, and Unicode-preserving slugs.
- **`isCallable` & `Type.isCallable(val)`:** Comprehensive callable type guard (`src/developer-utils/type.mjs`) accurately detecting synchronous functions, async functions, generator functions, and async generator functions while safely rejecting non-callables.
- **Callable Constants:** Added `Type.ASYNC_FUNCTION` (`'asyncfunction'`), `Type.GENERATOR_FUNCTION` (`'generatorfunction'`), `Type.ASYNC_GENERATOR_FUNCTION` (`'asyncgeneratorfunction'`), and `Type.CALLABLE` (`'callable'`).
- **`Type.is` Callable Integration:** `Type.is(fn, Type.CALLABLE)` and `is(fn, 'callable')` directly leverage `isCallable(val)`.

## [5.1.0] - 2026-09-25

### ✨ Added
- **`Stack` Class:** High-performance, array-backed LIFO (Last-In-First-Out) stack data structure (`src/data-structures/Stack.mjs`).
  - Private `#items = []` encapsulation protecting internal storage from accidental index mutation and leveraging V8 memory locality.
  - Fluent `push(...items)` and `clear()` method chaining.
  - Standard LIFO operations: `pop()`, `peek()`, `isEmpty()`, and `size`/`length` getters.
  - Snapshot export via `toArray()` and native LIFO traversal via `*[Symbol.iterator]()`.

## [5.0.0] - 2026-09-17

### 💥 Breaking Changes
- **Removed `getType`:** The legacy `getType` function has been removed in favor of the modern, idiomatic `Type.of(val)` (or standalone `of(val)`).
- **`NaN` Type Detection:** `Type.of(NaN)` and `of(NaN)` now return `'nan'` instead of `'number'`, solving JavaScript's historic `typeof NaN === 'number'` flaw and preventing silent numerical error propagation.

### ✨ Added
- **`Type` Class:** Centralized, highly-optimized runtime type introspection and validation system (`src/developer-utils/type.mjs`).
- **Semantic 4-Tier Type Constants:**
  - *Bottom values & Primitives:* `Type.UNDEFINED`, `Type.NULL`, `Type.BOOLEAN`, `Type.NUMBER`, `Type.NAN`, `Type.BIGINT`, `Type.STRING`, `Type.SYMBOL`
  - *Core Objects & Callables:* `Type.OBJECT`, `Type.ARRAY`, `Type.FUNCTION`
  - *Standard Built-ins:* `Type.DATE`, `Type.REGEXP`, `Type.ERROR`, `Type.PROMISE`
  - *Collections:* `Type.MAP`, `Type.SET`, `Type.WEAKMAP`, `Type.WEAKSET`, `Type.WEAKREF`
- **`Type.is(val, expected)` & `is(val, expected)`:** Dynamic type checking supporting:
  - String constants (`Type.is(42, Type.NUMBER)`)
  - Constructors and classes (`Type.is([], Array)`, `Type.is(fn, Function)`, `Type.is(obj, Object)` including `Object.create(null)`)
  - Union arrays (`Type.is(id, [Type.STRING, Type.NUMBER])`)
- **`Type.same(a, b)` & `same(a, b)`:** Safe type equality comparator preventing standard JavaScript traps (`same(42, NaN) === false`, `same(null, {}) === false`, `same([], {}) === false`).
- **`Types` Alias:** Re-exported `Types` alias for flexible imports (`import { Types } from '@gkucmierz/utils'`).
