# @gkucmierz/utils

[![NPM Version](https://img.shields.io/npm/v/@gkucmierz/utils?color=3b82f6&logo=npm)](https://www.npmjs.com/package/@gkucmierz/utils)
[![Socket Security](https://img.shields.io/badge/Security-Socket.dev-7036fe?logo=socket&logoColor=white)](https://socket.dev/npm/package/@gkucmierz/utils)
[![Tests](https://img.shields.io/badge/Tests-153%20passed-22c55e?logo=jasmine&logoColor=white)](https://gitea.7u.pl/gkucmierz/utils)
[![Downloads](https://img.shields.io/npm/dm/@gkucmierz/utils?color=8b5cf6)](https://www.npmjs.com/package/@gkucmierz/utils)
[![License](https://img.shields.io/npm/l/@gkucmierz/utils?color=f59e0b)](https://gitea.7u.pl/gkucmierz/utils)
[![Node Version](https://img.shields.io/node/v/@gkucmierz/utils?color=43853d&logo=node.js&logoColor=white)](https://nodejs.org)

A collection of useful utility functions and data structures for solving algorithmic tasks, competitive programming, and everyday development.

## 📦 Installation

```bash
npm install @gkucmierz/utils
```

## ✨ Features

This library provides a wide range of mathematical functions and data structures, including:

- **Combinatorics**:
  - `combinations`, `combinationsIterator`: Fast base-k combinations builder via Lexicographic progressions.
  - `permutations`, `permutationsIterator`: Pointer-optimized `yield*` permutations generator.
  - `nChooseK`: Massive scale limit-breaker for combinatorial variation calculations (Newton's Symbol via `BigInt`).
  - `bin2gray`, `gray2bin`: Pure array-cloning bit formatters for Gray code translations.

- **Data Structures**:
  - `ConflatingQueue`: Asynchronous coalescing work queue with key-based deduplication and controllable concurrency (`class`).
  - `SetCnt`: A set-like structure with element counting (`class`).
  - `Trie`: Efficient prefix tree implementation (`class`).
  - `Heap`: Min-heap priority queue (`class`).
  - `ListNode`: Linked list node implementation (`class`).

- **Number Theory**:
  - `gcd`, `lcm`: Greatest Common Divisor and Least Common Multiple (supports BigInt).
  - `factors`: Prime factorization.
  - `phi`: Euler's totient function.
  - `mod`, `powMod`: Modular arithmetic with Python-like behavior for negative numbers.
  - `egcd`: Extended Euclidean Algorithm.
  - `tonelliShanksBI`: Modular square root algorithm.
  - `lucasLehmerBI`: Lucas-Lehmer primality test for Mersenne primes.

- **Sequences & Formulas**:
  - `gpn`: Generalized Pentagonal Numbers.
  - `heronsFormula`: Triangle area calculation.
  - `squareRoot`: Integer square root using Newton's method.
  - `goldenRatio`, `goldenRatioBI`: The Golden Ratio calculation (with arbitrary precision support).

- **Optimization & Machine Learning**:
  - `nelderMead`: Nelder-Mead (simplex) optimization algorithm for multi-dimensional functions.
  - `particleSwarmOptimization`: PSO algorithm for global optimization.
  - `simulatedAnnealing`: Probabilistic technique for approximating the global optimum of a given function.

- **Geometry & Math**:
  - `barycentricCoordinates`: Triangle barycentric coordinates computation (supports coordinate arrays).
  - `matrixAsArray`: 2D matrix representation as a flat array.
  - `math3d`: Utilities for 3D vector and matrix math (`crossProduct`, `dotProduct`, `normalize`, `multiplyMatrix4`, `projectToTrackball`, `getRotationMatrixFromVectors`).

- **Automata & Simulation**:
  - `createLangtonsAnt`, `createUnlimitedGrid`: Infinite 2D grid and Langton's Ant cellular automaton engine (Project Euler 349 compatible).

- **String & Encoding & Arrays**:
  - `chunks`, `chunksIterator`, `chunksAsyncIterator`: Synchronous and asynchronous array/string chunking generators.
  - `base64`: Base64 and Base64Url encoding/decoding.
  - `copyCase`: Match case of a string to another.
  - `arrayHistogram`: Creates Map mappings counting absolute frequencies across any `Iterable`.
  - `bijectiveNumeration`: Bijective base-k numeration system.
  - `formatBigNumber`: Intelligent formatting for massively large numbers with suffixes.

- **Developer Utilities**:
  - `randNormal`: Normal (Gaussian) distribution random number generator (Box-Muller transform).
  - `measurePerformance`: A micro-benchmarking tool for high-iteration performance testing.
  - `setSafeInterval`: A safe, asynchronous alternative to `setInterval` that prevents overlapping executions and supports immediate yielding.
  - `consumeIteratorNonBlocking`: Yield consumption macro-tasks queue resolver for heavy computations.
  - `memoize`: Function memoization based on arguments.
  - `binarySearch`: Various binary search implementations (exact, lower bound, upper bound).
  - `naturalSearch`, `naturalSearchBI`: Exponential-galloping + binary-search boundary solver (`Number` up to `2^53 - 1` and arbitrary-precision `BigInt` twin via shared monadic factory `getNaturalSearch`, with `maxCap` loop protection).
  - `range2array`, `array2range`: Convert between ranges and arrays.
  - `Type`, `is`, `of`, `same`: High-performance runtime type detection, introspection, and safe comparison system (v5.0.0).

## ⚠️ `naturalSearchBI` — JS Engine `BigInt` Limits & Quadratic `O(B²)` Warning

ECMAScript (TC39) does not standardize `BigInt.MAX_VALUE`. Every JavaScript engine enforces its own internal bit-length ceiling and throws `RangeError: Maximum BigInt size exceeded` when exceeded — **most notably a `1024×` gap between 64-bit V8 and Safari / Firefox**:

| JS Engine | Runtimes | Hard Bit Ceiling | Max `BigInt` Value | RAM / Value | Worst-Case Fail-Safe Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Default `maxCap`** | All engines (portable default) | `16,384` bits (`2^14`) | `(1n << 16384n) - 1n` (~`4,932` digits) | `2 KiB` | `~3 ms` |
| **SpiderMonkey / JSC** | Firefox, Safari, iOS WebKit, Bun | **`1,048,576` bits (`2^20`)** | `(1n << 1048576n) - 1n` (~`315,652` digits) | `128 KiB` | `~7.3 s` |
| **V8 (32-bit)** | 32-bit Android / WASM32 | `536,870,912` bits (`2^29`) | `2^(2^29) - 1` (~`161.6M` digits) | `64 MiB` | Unbounded (days) |
| **V8 (64-bit)** | Chrome, Node.js, Edge, Deno | **`1,073,741,824` bits (`2^30`)** | `2^(2^30) - 1` (~`323.2M` digits) | `128 MiB` | Unbounded (~88 days) |

1. **Non-V8 Crash Risk (`RangeError`):** Passing a custom `maxCap >= (1n << 1048576n)` works on 64-bit V8, but **will immediately throw `RangeError: Maximum BigInt size exceeded` on Firefox, Safari (macOS/iOS), and Bun**.
2. **Quadratic `O(B²)` Galloping Cost:** Unlike 64-bit `Number` (`O(1)` shift), doubling a `b`-bit `BigInt` copies `O(b)` machine words, making `B` doublings cost `O(B²)` CPU time. Keep `maxCap` bounded to your domain's realistic upper scale so unsatisfiable predicates fail fast (`-1n`).
3. **Zero-Extra-Bit Invariant:** Both `naturalSearch` and `naturalSearchBI` guard galloping via `max > halfCap ? cap : max * TWO` and bisection via `min + half(max - min)`, never allocating even 1 bit beyond `maxCap`.

## 📚 Documentation

- **Production Docs**: 👉 **[https://docs-utils.7u.pl](https://docs-utils.7u.pl)**
- **GitHub Pages Mirror**: [https://gkucmierz.github.io/utils](https://gkucmierz.github.io/utils)

## 🔗 Repository
- **Internal Gitea**: [https://gitea.7u.pl/gkucmierz/utils](https://gitea.7u.pl/gkucmierz/utils)
- **NPM Package**: [https://www.npmjs.com/package/@gkucmierz/utils](https://www.npmjs.com/package/@gkucmierz/utils)

## 📄 License
MIT
