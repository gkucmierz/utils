/**
 * @module geometry
 */

import { is } from '../developer-utils/type.mjs';

/**
 * Represents a 2D matrix as a flat 1D array using a Proxy.
 * Allows accessing elements using a single index (row-major order).
 * @param {Array<Array<*>>} matrix - The 2D matrix to wrap.
 * @returns {Proxy} A proxy that behaves like a flat array.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAQzjEAPAggZ1xhjQE8EBfBAMxijAQCIABAcwGsBXAYzBAFMYALwD0nOCAA2+RgG5gwdJhwEiJUvKA|▶ Try it live in Instacode}
 */
export const matrixAsArray = (matrix) => {
  const [h, w] = [matrix.length, matrix[0].length];
  return new Proxy([], {
    get(target, prop) {
      if (prop === 'length') return h * w;
      const idx = +prop;
      const col = idx % w;
      const row = (idx - col) / w;
      return matrix[row][col];
    },
    set(target, prop, value) {
      const idx = +prop;
      if (!Number.isInteger(idx) || idx < 0 || idx >= h * w) return false;
      const col = idx % w;
      const row = (idx - col) / w;
      matrix[row][col] = value;
      return true;
    },
  });
};

/**
 * Transposes a 2D rectangular matrix `M` (`H x W` -> `W x H`) without mutating the input.
 * @param {Array<Array<*>>} matrix - Input 2D matrix
 * @returns {Array<Array<*>>} Transposed 2D matrix `M^T`
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LjAhgOwM7WwUwQF8EAzGKMBAIgAEBzAawFcBjMEfGALwHpm4IADbZqAbmDA0WXFAISgA|▶ Try it live in Instacode}
 */
export const transpose = (matrix) => {
  if (!Array.isArray(matrix) || matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = Array.isArray(matrix[0]) ? matrix[0].length : 0;
  const out = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      out[c][r] = matrix[r][c];
    }
  }
  return out;
};

/**
 * Rotates a 2D matrix in 90-degree clockwise increments (`steps = 1` -> 90° CW,
 * `steps = -1` -> 90° CCW, `steps = 2` -> 180°) without mutating the input.
 * @param {Array<Array<*>>} matrix - Input 2D matrix
 * @param {number} [steps=1] - Number of 90° clockwise quarter-turns (any integer)
 * @returns {Array<Array<*>>} Rotated 2D matrix
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JlOBDOBTBBfBAMzTAQCIABAcwGsBXAYzBGxgC8B6OuEAGwGcyAbmDA0mHCKA|▶ Try it live in Instacode}
 */
export const rotate = (matrix, steps = 1) => {
  if (!Array.isArray(matrix) || matrix.length === 0) return [];
  const turns = (((Math.trunc(Number(steps) || 0)) % 4) + 4) % 4;
  let cur = matrix.map((row) => row.slice());
  if (turns === 0) return cur;
  if (turns === 2) {
    return cur.reverse().map((row) => row.reverse());
  }
  if (turns === 1) {
    const rows = cur.length;
    const cols = cur[0].length;
    const out = Array.from({ length: cols }, () => new Array(rows));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        out[c][rows - 1 - r] = cur[r][c];
      }
    }
    return out;
  }
  // turns === 3 (90° counter-clockwise)
  const rows = cur.length;
  const cols = cur[0].length;
  const out = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      out[cols - 1 - c][r] = cur[r][c];
    }
  }
  return out;
};

/**
 * Multiplies a 2D matrix `a` (`M x K`) by a 2D matrix `b` (`K x N`), a 1D column vector (`K`),
 * or a numeric scalar.
 * @param {Array<Array<number>>} a - Left 2D matrix (`M x K`)
 * @param {Array<Array<number>>|Array<number>|number} b - Right 2D matrix (`K x N`), 1D vector (`K`), or scalar
 * @returns {Array<Array<number>>|Array<number>} Matrix product `a * b`
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAVwDYIL4IGYxRgIBEAAgOYDWaAxmCAKYwBeA9GnCBgM4kDcwYOgyCgA|▶ Try it live in Instacode}
 */
export const mul = (a, b) => {
  if (!Array.isArray(a) || a.length === 0 || !Array.isArray(a[0])) {
    throw new TypeError('mul expects a non-empty 2D matrix as first argument');
  }
  const m = a.length;
  const k = a[0].length;

  if (is(b, 'number')) {
    return a.map((row) => row.map((v) => v * b));
  }
  if (!Array.isArray(b) || b.length === 0) {
    throw new TypeError('mul expects a 2D matrix, 1D vector, or number as second argument');
  }

  // Matrix * 1D vector
  if (!Array.isArray(b[0])) {
    if (b.length !== k) {
      throw new RangeError(`Incompatible matrix-vector dimensions: (${m}x${k}) * (${b.length})`);
    }
    const vecOut = new Array(m).fill(0);
    for (let r = 0; r < m; r += 1) {
      let acc = 0;
      for (let i = 0; i < k; i += 1) {
        acc += a[r][i] * b[i];
      }
      vecOut[r] = acc;
    }
    return vecOut;
  }

  // Matrix * 2D Matrix
  if (b.length !== k) {
    throw new RangeError(`Incompatible matrix dimensions: (${m}x${k}) * (${b.length}x${b[0].length})`);
  }
  const n = b[0].length;
  const out = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let r = 0; r < m; r += 1) {
    for (let i = 0; i < k; i += 1) {
      const ari = a[r][i];
      if (ari === 0) continue;
      for (let c = 0; c < n; c += 1) {
        out[r][c] += ari * b[i][c];
      }
    }
  }
  return out;
};
