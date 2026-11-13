/**
 * @module combinatorics
 */

import { is } from '../developer-utils/type.mjs';

const normalizePool = (poolOrSize) => {
  if (Number.isInteger(poolOrSize)) {
    if (poolOrSize <= 0) return [];
    const arr = new Array(poolOrSize);
    for (let i = 0; i < poolOrSize; ++i) arr[i] = i;
    return arr;
  }
  if (Array.isArray(poolOrSize)) return poolOrSize.slice();
  if (poolOrSize != null && is(poolOrSize[Symbol.iterator], 'callable')) {
    return [...poolOrSize];
  }
  throw new TypeError('Pool must be a non-negative integer or an Iterable');
};

/**
 * Lazily yields an arithmetic progression of numbers in O(1) memory, mirroring Python's range().
 * When called with a single argument (stop), yields 0, 1, ..., stop - 1.
 *
 * @param {number} startOrStop - Start value (when stop is provided) or exclusive stop bound (from 0).
 * @param {number} [stop] - Exclusive upper (or lower when step < 0) bound.
 * @param {number} [step=1] - Non-zero increment step.
 * @yields {number} Next value in the arithmetic progression.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JgQwHYHMCmBJOHdOWBAXwQDMYowEAiAASwGsBXAYzBCIC8B6NnBAAbAM70A3MGDps+QsVjSgA|▶ Try it live in Instacode}
 */
export const rangeIterator = function* (startOrStop, stop, step) {
  const hasStop = !is(stop, 'undefined');
  const from = hasStop ? startOrStop : 0;
  const to = hasStop ? stop : startOrStop;
  const delta = is(step, 'undefined') ? 1 : step;
  if (delta === 0) {
    throw new RangeError('rangeIterator step must not be zero');
  }
  if (delta > 0) {
    for (let v = from; v < to; v += delta) yield v;
  } else {
    for (let v = from; v > to; v += delta) yield v;
  }
};

/**
 * Lazily streams the N-ary Cartesian product (A_1 x A_2 x ... x A_m) across arbitrary pools
 * using an iterative mixed-radix odometer in O(m) working index space and zero recursion depth.
 * Each pool may be a non-negative integer N (shorthand for 0..N-1), an Array, or any Iterable.
 *
 * @param {...(number|Iterable<*>)} pools - Factor pools (integer size or Iterable).
 * @yields {Array<*>} Current tuple from the Cartesian product.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYEN4FMDOJ0B2ACjFACYCuqcAknFjOnLAgL4IBmpYCARAAIBzANZUwIBgC8A9BTggANjl4BuYMAzY8hEuSq16jZjDVA|▶ Try it live in Instacode}
 */
export const cartesianProductIterator = function* (...pools) {
  const dims = pools.length;
  if (dims === 0) {
    yield [];
    return;
  }

  const normalized = new Array(dims);
  for (let d = 0; d < dims; ++d) {
    const p = normalizePool(pools[d]);
    if (p.length === 0) return;
    normalized[d] = p;
  }

  const indices = new Int32Array(dims);
  const tuple = new Array(dims);
  for (let d = 0; d < dims; ++d) {
    tuple[d] = normalized[d][0];
  }
  yield tuple.slice();

  while (true) {
    let pos = dims - 1;
    while (pos >= 0 && indices[pos] + 1 >= normalized[pos].length) {
      indices[pos] = 0;
      tuple[pos] = normalized[pos][0];
      --pos;
    }
    if (pos < 0) break;
    const nextIdx = indices[pos] + 1;
    indices[pos] = nextIdx;
    tuple[pos] = normalized[pos][nextIdx];
    yield tuple.slice();
  }
};

/**
 * Synchronously materializes the N-ary Cartesian product across arbitrary pools.
 * WARNING: Scales as |A_1| * |A_2| * ... * |A_m|; prefer cartesianProductIterator for large spaces.
 *
 * @param {...(number|Iterable<*>)} pools - Factor pools (integer size or Iterable).
 * @returns {Array<Array<*>>} All Cartesian product tuples.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYEN4FMDOJ0B2ACjFACYCuqiAvggGalgIBEAAgOYDWVYIWMAF4B6CnBAAbHCwDcwYBmx5CJclThygA|▶ Try it live in Instacode}
 */
export const cartesianProduct = (...pools) => {
  return [...cartesianProductIterator(...pools)];
};

/**
 * Lazily streams the k-fold Cartesian power (A^repeat) of a single pool or integer range 0..N-1,
 * mirroring Python's itertools.product(pool, repeat=k) in O(|A| + repeat) memory and zero recursion.
 *
 * @param {number|Iterable<*>} poolOrSize - Non-negative integer N (0..N-1) or any Iterable pool.
 * @param {number} [repeat=1] - Tuple length (number of nested loop dimensions).
 * @yields {Array<*>} Current k-tuple with repetition.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKATArgYzgSTgFMYBDOWBAXwQDN0wEAiAAQHMBrXMEEgLwD0WOCAA2AZyYBuYMDSZcBYmQowZQA|▶ Try it live in Instacode}
 */
export const productIterator = function* (poolOrSize, repeat = 1) {
  if (!Number.isInteger(repeat) || repeat < 0) return;
  const pool = normalizePool(poolOrSize);
  if (repeat === 0) {
    yield [];
    return;
  }
  const len = pool.length;
  if (len === 0) return;

  const indices = new Int32Array(repeat);
  const tuple = new Array(repeat).fill(pool[0]);
  yield tuple.slice();

  while (true) {
    let pos = repeat - 1;
    while (pos >= 0 && indices[pos] + 1 >= len) {
      indices[pos] = 0;
      tuple[pos] = pool[0];
      --pos;
    }
    if (pos < 0) break;
    const nextIdx = indices[pos] + 1;
    indices[pos] = nextIdx;
    tuple[pos] = pool[nextIdx];
    yield tuple.slice();
  }
};

/**
 * Synchronously materializes the k-fold Cartesian power (A^repeat) of a pool or integer range 0..N-1.
 * WARNING: Scales as N^repeat; prefer productIterator for streaming large spaces.
 *
 * @param {number|Iterable<*>} poolOrSize - Non-negative integer N (0..N-1) or any Iterable pool.
 * @param {number} [repeat=1] - Tuple length.
 * @returns {Array<Array<*>>} All N^repeat ordered tuples.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKATArgY0QXwQDN0wEAiAAQHMBrXMEAUxgC8B6LOEAGwGdyAbmDA0mXHGFA|▶ Try it live in Instacode}
 */
export const product = (poolOrSize, repeat = 1) => {
  return [...productIterator(poolOrSize, repeat)];
};

/**
 * Lazily streams all multiset combinations of size n with replacement from k indices (0..k-1) or an Iterable pool,
 * yielding C(k + n - 1, n) non-decreasing tuples in O(n) space and O(1) amortized transition time.
 *
 * @param {number} n - Size of each combination tuple.
 * @param {number|Iterable<*>} kOrPool - Set size k (indices 0..k-1) or an Iterable pool of items.
 * @yields {Array<*>} Current non-decreasing combination with replacement.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZTAIxAOwIZwhQ4DOA6iHABYBKAphADZ6p1h05wCScdMBsBAF8EAMxgYEAIgACAcwDWAV1RgQfAF4B6JYUYkpAbmDB0WXASKkK1ekxZsO3XvzixjQA|▶ Try it live in Instacode}
 */
export const combinationsWithReplacementIterator = function* (n, kOrPool) {
  if (!Number.isInteger(n) || n < 0) return;
  const isIndexMode = Number.isInteger(kOrPool);
  const pool = isIndexMode ? null : normalizePool(kOrPool);
  const poolLen = isIndexMode ? kOrPool : pool.length;

  if (n === 0) {
    yield [];
    return;
  }
  if (poolLen <= 0) return;

  const indices = new Int32Array(n);
  const buildTuple = () => {
    const out = new Array(n);
    if (isIndexMode) {
      for (let i = 0; i < n; ++i) out[i] = indices[i];
    } else {
      for (let i = 0; i < n; ++i) out[i] = pool[indices[i]];
    }
    return out;
  };

  yield buildTuple();

  while (true) {
    let i = n - 1;
    while (i >= 0 && indices[i] === poolLen - 1) {
      --i;
    }
    if (i < 0) break;
    const nextIdx = indices[i] + 1;
    for (let j = i; j < n; ++j) {
      indices[j] = nextIdx;
    }
    yield buildTuple();
  }
};

/**
 * Synchronously returns all multiset combinations of size n with replacement from k indices or an Iterable pool.
 *
 * @param {number} n - Size of each combination tuple.
 * @param {number|Iterable<*>} kOrPool - Set size k (indices 0..k-1) or an Iterable pool of items.
 * @returns {Array<Array<*>>} Array of C(k + n - 1, n) combinations with replacement.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZTAIxAOwIZwhQ4DOA6iHABYBKAphADZ6p1h06IC+CAZjBgQAiAAIBzANYBXVGBB0YALwD0UwoxJCA3MGDosuAkVIVq9JizYc4OoA|▶ Try it live in Instacode}
 */
export const combinationsWithReplacement = (n, kOrPool) => {
  return [...combinationsWithReplacementIterator(n, kOrPool)];
};

/**
 * Computes the multiplicative product of all numbers in an Iterable or generator,
 * mirroring Python's math.prod(iterable, start=1) without intermediate array allocation.
 *
 * @param {Iterable<number>} iterable - Sequence or generator of numeric factors.
 * @param {number} [start=1] - Multiplicative identity / initial accumulator.
 * @returns {number} Product of all elements multiplied by start.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKATBBfBAzdMBAIgAEBzAawFcBjMEAUxgC8B6auEAGwGdiA3MGBpMQoA|▶ Try it live in Instacode}
 */
export const prod = (iterable, start = 1) => {
  let acc = start;
  for (const val of iterable) {
    acc *= val;
  }
  return acc;
};

/**
 * Arbitrary-precision BigInt twin of prod(), multiplying all elements of an Iterable or generator as BigInts.
 *
 * @param {Iterable<bigint|number|string>} iterable - Sequence or generator of integer factors.
 * @param {bigint|number} [start=1n] - Initial BigInt accumulator.
 * @returns {bigint} Exact BigInt product of all elements.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKATAQgSQQXwQDN0wEAiAAQHMBrAVwGMwQBTGALwHp64QAbAM7kA3MGBpMuMUA|▶ Try it live in Instacode}
 */
export const prodBI = (iterable, start = 1n) => {
  let acc = is(start, 'bigint') ? start : BigInt(start);
  for (const val of iterable) {
    acc *= is(val, 'bigint') ? val : BigInt(val);
  }
  return acc;
};
