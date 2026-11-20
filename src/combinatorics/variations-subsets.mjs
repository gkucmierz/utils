/**
 * @module combinatorics
 */

import { is } from '../developer-utils/type.mjs';

const resolvePool = (poolOrSize) => {
  if (Number.isInteger(poolOrSize)) {
    if (poolOrSize <= 0) return { pool: [], isIndexMode: true };
    const pool = new Array(poolOrSize);
    for (let i = 0; i < poolOrSize; i += 1) pool[i] = i;
    return { pool, isIndexMode: true };
  }
  if (Array.isArray(poolOrSize)) {
    return { pool: poolOrSize.slice(), isIndexMode: false };
  }
  if (poolOrSize != null && is(poolOrSize[Symbol.iterator], 'callable')) {
    return { pool: [...poolOrSize], isIndexMode: false };
  }
  throw new TypeError('Pool must be a non-negative integer or an Iterable');
};

/**
 * Lazily streams all k-variations without repetition (ordered k-tuples, V(n, k) = n! / (n - k)!)
 * in strict lexicographic order.
 * Accepts either `(k, nOrPool)` (matching `combinations(k, n)`) or `(poolArray, k)`.
 *
 * @param {number|Iterable<*>} kOrPool - Tuple length `k` (or Iterable pool when 2nd arg is `k`)
 * @param {number|Iterable<*>} nOrK - Pool size `n` / Iterable pool (or tuple length `k`)
 * @yields {Array<*>} Current ordered k-variation without repetition
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IG4EMYnXEUB2AknAKYw6wIC+CAZjFGAgEQACA5gNYCuAxmCDIAvAPTdcAGwDOzANzBgGLDjxFS5OLHlA|▶ Try it live in Instacode}
 */
export const variationIterator = function* (kOrPool, nOrK) {
  let k;
  let poolSource;
  if (!Number.isInteger(kOrPool) && Number.isInteger(nOrK)) {
    poolSource = kOrPool;
    k = nOrK;
  } else {
    k = kOrPool;
    poolSource = nOrK;
  }

  if (!Number.isInteger(k) || k < 0) return;
  const { pool } = resolvePool(poolSource);
  const n = pool.length;
  if (k > n) return;
  if (k === 0) {
    yield [];
    return;
  }

  const used = new Uint8Array(n);
  const current = new Array(k);

  const backtrack = function* (depth) {
    if (depth === k) {
      yield current.slice();
      return;
    }
    for (let i = 0; i < n; i += 1) {
      if (used[i]) continue;
      used[i] = 1;
      current[depth] = pool[i];
      yield* backtrack(depth + 1);
      used[i] = 0;
    }
  };

  yield* backtrack(0);
};

/**
 * Synchronously materializes all k-variations without repetition (V(n, k) = n! / (n - k)!)
 * in lexicographic order.
 *
 * @param {number|Iterable<*>} kOrPool - Tuple length `k` (or Iterable pool when 2nd arg is `k`)
 * @param {number|Iterable<*>} nOrK - Pool size `n` / Iterable pool (or tuple length `k`)
 * @returns {Array<Array<*>>} Array of all k-variations
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IG4EMYnXEUB2CAvggGYxRgIBEAAgOYDWArgMZggCmMAXgPTNcAGwDO1ANzBgGLDjz5JQA|▶ Try it live in Instacode}
 */
export const variation = (kOrPool, nOrK) => {
  return [...variationIterator(kOrPool, nOrK)];
};

/**
 * Lazily streams all 2^n subsets (power set) of an integer range `0..n-1` or an Iterable pool
 * ordered by binary bitmask `0 .. 2^n - 1`.
 *
 * @param {number|Iterable<*>} poolOrSize - Pool size `n` or Iterable of elements
 * @yields {Array<*>} Next subset in binary mask order
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcBGqCmcCScOMAhnLAgL4IBmMUYCARAAIDmA1ugMZgjEAvAPTo4IADaomAbmDAM2PIWJlYsoA|▶ Try it live in Instacode}
 */
export const subsetIterator = function* (poolOrSize) {
  const { pool } = resolvePool(poolOrSize);
  const n = pool.length;
  const total = 1n << BigInt(n);

  for (let mask = 0n; mask < total; mask += 1n) {
    const sub = [];
    for (let i = 0; i < n; i += 1) {
      if ((mask & (1n << BigInt(i))) !== 0n) {
        sub.push(pool[i]);
      }
    }
    yield sub;
  }
};

/**
 * Returns either the single m-th subset (when `maskIndex` is provided, in O(n) time)
 * or the entire power set of 2^n subsets (when `maskIndex` is omitted).
 *
 * @param {number|Iterable<*>} poolOrSize - Pool size `n` or Iterable of elements
 * @param {number|bigint} [maskIndex] - Optional 0-based bitmask index (`0 <= maskIndex < 2^n`)
 * @returns {Array<*>|Array<Array<*>>} Single subset for `maskIndex`, or array of all 2^n subsets
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcBGqCmiC+CAZjFGAgEQACA5gNboDGYIOMAXgPTpwgA2qCgG5gwDNjwigA|▶ Try it live in Instacode}
 */
export const subset = (poolOrSize, maskIndex = undefined) => {
  if (!is(maskIndex, 'undefined')) {
    const { pool } = resolvePool(poolOrSize);
    const mask = is(maskIndex, 'bigint') ? maskIndex : BigInt(Math.max(0, Math.trunc(Number(maskIndex) || 0)));
    const out = [];
    for (let i = 0; i < pool.length; i += 1) {
      if ((mask & (1n << BigInt(i))) !== 0n) {
        out.push(pool[i]);
      }
    }
    return out;
  }
  return [...subsetIterator(poolOrSize)];
};
