# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
