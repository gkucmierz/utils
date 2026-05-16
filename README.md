# @gkucmierz/utils

[![Socket Badge](https://socket.dev/api/badge/npm/package/@gkucmierz/utils)](https://socket.dev/npm/package/@gkucmierz/utils)
![NPM Version](https://img.shields.io/npm/v/@gkucmierz/utils)
![License](https://img.shields.io/npm/l/@gkucmierz/utils)
![Downloads](https://img.shields.io/npm/dm/@gkucmierz/utils)

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
  - `SetCnt`: A set-like structure with element counting (`class`).
  - `Trie`: Efficient prefix tree implementation (`class`).
  - `Heap`: Min-heap priority queue (`class`).
  - `ListNode`: Linked list node implementation (`class`).
  - `matrixAsArray`: 2D matrix representation as a flat array.

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

- **Math & 3D Geometry**:
  - `math3d`: Utilities for 3D vector and matrix math (`crossProduct`, `dotProduct`, `normalize`, `multiplyMatrix4`, `projectToTrackball`, `getRotationMatrixFromVectors`).
  - `randNormal`: Normal (Gaussian) distribution random number generator (Box-Muller transform).

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
  - `measurePerformance`: A micro-benchmarking tool for high-iteration performance testing.
  - `setSafeInterval`: A safe, asynchronous alternative to `setInterval` that prevents overlapping executions and supports immediate yielding.
  - `consumeIteratorNonBlocking`: Yield consumption macro-tasks queue resolver for heavy computations.
  - `memoize`: Function memoization based on arguments.
  - `binarySearch`: Various binary search implementations (exact, lower bound, upper bound).
  - `naturalSearch`: Natural sorting/search utility for human-readable string comparisons.
  - `range2array`, `array2range`: Convert between ranges and arrays.
  - `getType`: Precise dynamic type checking.

## 📚 Documentation

Full API documentation with examples is available at:
👉 **[https://gkucmierz.github.io/utils](https://gkucmierz.github.io/utils)**

## 🔗 Repository
- **Internal Gitea**: [https://gitea.7u.pl/gkucmierz/utils](https://gitea.7u.pl/gkucmierz/utils)
- **NPM Package**: [https://www.npmjs.com/package/@gkucmierz/utils](https://www.npmjs.com/package/@gkucmierz/utils)

## 📄 License
MIT
