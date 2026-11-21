/**
 * @module developer-utils
 */

import { is } from './type.mjs';

/**
 * Default item-count threshold above which hybrid `sortByStrategy(..., { strategy: 'auto' })`
 * upgrades from zero-allocation flat `u21` `diff` sorting to Schwartzian Transform (`DSU`)
 * whenever at least one key extractor is marked `expensive: true`.
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICIFEBiBBAqgGQBUB9VAZV2MIAkAldM6geX1QQF8EAzGKMBAEQABAOYBrAK4BjMCACmMAF4B6CXBAAbAM4CA3MGAYcBEuUo16jFqn1A|▶ Try it live in Instacode}
 */
export const DEFAULT_DSU_THRESHOLD = 32;

const defaultScalarCompare = (a, b) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (is(a, 'number') && is(b, 'number')) return a - b;
  if (is(a, 'boolean') && is(b, 'boolean')) return Number(a) - Number(b);
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
};

function normalizeSortSpecs(specs = []) {
  if (!Array.isArray(specs)) return [];
  return specs
    .filter(Boolean)
    .map((spec) => {
      if (is(spec, 'string')) {
        const prop = spec;
        return {
          extract: (item) => item?.[prop],
          dir: 1,
          compare: defaultScalarCompare,
          expensive: false
        };
      }
      if (is(spec, 'function')) {
        return {
          extract: spec,
          dir: 1,
          compare: defaultScalarCompare,
          expensive: false
        };
      }
      const key = spec.key;
      const extract = is(key, 'function')
        ? key
        : is(key, 'string')
          ? (item) => item?.[key]
          : (item) => item;
      const dir = String(spec.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      const compare = is(spec.compare, 'function') ? spec.compare : defaultScalarCompare;
      const expensive = Boolean(spec.expensive);
      return { extract, dir, compare, expensive };
    });
}

/**
 * Generates an ultra-flat `u21` `diff`-chained comparator `(a, b) => number`
 * with zero intermediate tuple allocations — optimal for precomputed primitive fields
 * and small collections ($N < 32$).
 *
 * @param {Array<string|Function|Object>} specs - Sort keys or spec objects (`{ key, order, compare, expensive }`).
 * @returns {Function} Comparator function `(a, b) => number`.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYwKYEM4YGIA2OAwlJFjDrAgL4IBmMZCARAAIDmA1gK6pggMMAF4B6HnBAEAziwDcwYOmy5CJMhApUYCoA|▶ Try it live in Instacode}
 */
function compileFlatComparator(normalized) {
  const len = normalized.length;
  if (len === 0) return () => 0;

  return (a, b) => {
    for (let i = 0; i < len; i++) {
      const s = normalized[i];
      const diff = s.compare(s.extract(a), s.extract(b)) * s.dir;
      if (diff) return diff;
    }
    return 0;
  };
}

export function createFlatComparator(specs = []) {
  return compileFlatComparator(normalizeSortSpecs(specs));
}

/**
 * Pure non-mutating hybrid sorter switching between ultra-flat `u21` `diff` (`strategy: 'flat'`),
 * batch Schwartzian Transform (`strategy: 'dsu'`), and automatic threshold dispatch (`strategy: 'auto'`).
 *
 * In `'auto'` mode:
 *  - Uses zero-allocation flat `u21` when no spec is marked `expensive: true` or `items.length < dsuThreshold`.
 *  - Uses Schwartzian DSU (computing every key exactly $O(N)$ times) when any spec has `expensive: true`
 *    and `items.length >= dsuThreshold`.
 *
 * @param {Array<*>} items
 * @param {Array<string|Function|Object>} specs - Sort keys or spec objects (`{ key, order, compare, expensive }`).
 * @param {Object} [options={}]
 * @param {string} [options.strategy='auto'] - `'auto'`, `'flat'`, or `'dsu'`.
 * @param {number} [options.dsuThreshold=32]
 * @returns {Array<*>}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM6zgIQJ4GU4wCGcApgObYIC+CAZjFGAgEQACZA1gK4DGYIJGAC8A9FzggANqmYBuYMHTwc+IqQrygA|▶ Try it live in Instacode}
 */
export function sortByStrategy(
  items = [],
  specs = [],
  { strategy = 'auto', dsuThreshold = DEFAULT_DSU_THRESHOLD } = {}
) {
  if (!Array.isArray(items) || items.length <= 1) {
    return Array.isArray(items) ? [...items] : [];
  }
  const normalized = normalizeSortSpecs(specs);
  if (normalized.length === 0) return [...items];

  const hasExpensiveKey = normalized.some((s) => s.expensive);
  const resolvedThreshold =
    is(dsuThreshold, 'number') && Number.isFinite(dsuThreshold) && dsuThreshold >= 2
      ? dsuThreshold
      : DEFAULT_DSU_THRESHOLD;

  const useDsu =
    strategy === 'dsu' ||
    (strategy === 'auto' && hasExpensiveKey && items.length >= resolvedThreshold);

  if (!useDsu) {
    return [...items].sort(compileFlatComparator(normalized));
  }

  const len = normalized.length;
  const decorated = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const keys = new Array(len);
    for (let k = 0; k < len; k++) {
      keys[k] = normalized[k].extract(item);
    }
    decorated[i] = { item, keys };
  }

  decorated.sort((da, db) => {
    for (let k = 0; k < len; k++) {
      const s = normalized[k];
      const diff = s.compare(da.keys[k], db.keys[k]) * s.dir;
      if (diff) return diff;
    }
    return 0;
  });

  const out = new Array(decorated.length);
  for (let i = 0; i < decorated.length; i++) {
    out[i] = decorated[i].item;
  }
  return out;
}

/**
 * Streaming Ingress-Decorated DSU container.
 * Decorates each item **exactly once upon arrival (`push` / `pushMany`)** into a monomorphic
 * `{ item, keys }` tuple so repeated `toSortedArray()` calls, sliding-window trims, or
 * live WebSocket merges pay **zero** additional key-extraction cost.
 *
 * @param {Array<string|Function|Object>} specs - Sort keys or spec objects (`{ key, order, compare, expensive }`).
 * @param {Object} [options={}]
 * @param {number} [options.maxSize=0] - Optional sliding-window cap (0 = unbounded).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYwKYEM4YCIaqw4YAmAynJlmAgL4IBmMUtARAAIDmA1gK6owIDDABeAej5wQAGwDObANzBg6bLgJEYJClWxhlQA|▶ Try it live in Instacode}
 */
export function createDecoratedStream(specs = [], { maxSize = 0 } = {}) {
  const normalized = normalizeSortSpecs(specs);
  const len = normalized.length;
  const cap = is(maxSize, 'number') && Number.isFinite(maxSize) && maxSize > 0 ? Math.floor(maxSize) : 0;
  let buffer = [];

  const decorateOne = (item) => {
    const keys = new Array(len);
    for (let k = 0; k < len; k++) {
      keys[k] = normalized[k].extract(item);
    }
    return { item, keys };
  };

  const compareTuples = (da, db) => {
    for (let k = 0; k < len; k++) {
      const s = normalized[k];
      const diff = s.compare(da.keys[k], db.keys[k]) * s.dir;
      if (diff) return diff;
    }
    return 0;
  };

  return {
    get size() {
      return buffer.length;
    },
    push(item) {
      buffer.push(decorateOne(item));
      if (cap > 0 && buffer.length > cap) {
        buffer.splice(0, buffer.length - cap);
      }
      return buffer.length;
    },
    pushMany(items = []) {
      if (!Array.isArray(items)) return buffer.length;
      for (let i = 0; i < items.length; i++) {
        buffer.push(decorateOne(items[i]));
      }
      if (cap > 0 && buffer.length > cap) {
        buffer.splice(0, buffer.length - cap);
      }
      return buffer.length;
    },
    toSortedArray() {
      if (buffer.length <= 1) return buffer.map((d) => d.item);
      const copy = [...buffer];
      copy.sort(compareTuples);
      const out = new Array(copy.length);
      for (let i = 0; i < copy.length; i++) {
        out[i] = copy[i].item;
      }
      return out;
    },
    clear() {
      buffer = [];
    }
  };
}
