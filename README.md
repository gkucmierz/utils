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
  - `naturalSearch`: Natural sorting/search utility for human-readable string comparisons.
  - `range2array`, `array2range`: Convert between ranges and arrays.
  - `Type`, `is`, `of`, `same`: High-performance runtime type detection, introspection, and safe comparison system (v5.0.0).

## 📚 Documentation

- **Production Docs**: 👉 **[https://docs-utils.7u.pl](https://docs-utils.7u.pl)**
- **GitHub Pages Mirror**: [https://gkucmierz.github.io/utils](https://gkucmierz.github.io/utils)

## 🔗 Repository
- **Internal Gitea**: [https://gitea.7u.pl/gkucmierz/utils](https://gitea.7u.pl/gkucmierz/utils)
- **NPM Package**: [https://www.npmjs.com/package/@gkucmierz/utils](https://www.npmjs.com/package/@gkucmierz/utils)

## 📄 License
MIT
