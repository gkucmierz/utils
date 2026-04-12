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

## 🚀 What's New in v2.0.0
- **Combinatorics Arsenal**: High-performance, memory-safe O(1) generators powered by native `BigInt`.
- **OOP Encapsulation**: `Heap` and `Trie` data structures were refactored into robust ES6 Classes (`new Heap()`, `new Trie()`).

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

- **Sequences & Formulas**:
  - `gpn`: Generalized Pentagonal Numbers.
  - `heronsFormula`: Triangle area calculation.
  - `squareRoot`: Integer square root using Newton's method.

- **String & Encoding & Arrays**:
  - `base64`: Base64 and Base64Url encoding/decoding.
  - `copyCase`: Match case of a string to another.
  - `arrayHistogram`: Creates Map mappings counting absolute frequencies across any `Iterable`.
  - `bijectiveNumeration`: Bijective base-k numeration system.

- **Developer Utilities**:
  - `consumeIteratorNonBlocking`: Yield consumption macro-tasks queue resolver for heavy computations.
  - `memoize`: Function memoization based on arguments.
  - `binarySearch`: Various binary search implementations (exact, lower bound, upper bound).
  - `range2array`, `array2range`: Convert between ranges and arrays.
  - `getType`: Precise dynamic type checking.

## 📚 Documentation

Full API documentation with examples is available at:
👉 **[https://gitea.7u.pl/gkucmierz/utils/pages](https://gitea.7u.pl/gkucmierz/utils/pages)** *(or GitHub parity)*

## 🔗 Repository
- **Internal Gitea**: [https://gitea.7u.pl/gkucmierz/utils](https://gitea.7u.pl/gkucmierz/utils)
- **NPM Package**: [https://www.npmjs.com/package/@gkucmierz/utils](https://www.npmjs.com/package/@gkucmierz/utils)

## 📄 License
MIT
