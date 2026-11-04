/**
 * @module geometry
 */

const normalizeInterval1D = (r) => {
  if (!Array.isArray(r) || r.length < 2) return null;
  const a = Number(r[0]);
  const b = Number(r[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a <= b ? [a, b] : [b, a];
};

const toIntervalList1D = (input) => {
  if (!Array.isArray(input) || input.length === 0) return [];
  if (typeof input[0] === 'number') {
    const single = normalizeInterval1D(input);
    return single && single[0] < single[1] ? [single] : [];
  }
  const list = [];
  for (let i = 0; i < input.length; i += 1) {
    const norm = normalizeInterval1D(input[i]);
    if (norm && norm[0] < norm[1]) {
      list.push(norm);
    }
  }
  return mergeIntervals1D(list);
};

const mergeIntervals1D = (intervals) => {
  if (!Array.isArray(intervals) || intervals.length === 0) return [];
  const sorted = intervals
    .filter((iv) => Array.isArray(iv) && iv[0] < iv[1])
    .map((iv) => [iv[0], iv[1]])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  if (sorted.length === 0) return [];

  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr[0] <= prev[1]) {
      if (curr[1] > prev[1]) prev[1] = curr[1];
    } else {
      merged.push(curr);
    }
  }
  return merged;
};

/**
 * Computes the intersection (AND / mutual part) of two 1D ranges or range sets.
 * Accepts a single range `[min, max]` or an array of ranges `[[min1, max1], ...]`.
 * @param {Array} rangeA - First 1D range or array of 1D ranges
 * @param {Array} rangeB - Second 1D range or array of 1D ranges
 * @returns {Array<Array<number>>} Disjoint sorted array of intersecting `[min, max]` ranges
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAVzmghgGwEpYB2A5gKYIC+CAZjFGAgEQACxA1mgMZgikwBeAegwgcAZ0YBuYMHSZcBEqWlA|▶ Try it live in Instacode}
 */
export const mutualRange = (rangeA, rangeB) => {
  const listA = toIntervalList1D(rangeA);
  const listB = toIntervalList1D(rangeB);
  if (listA.length === 0 || listB.length === 0) return [];

  const result = [];
  let i = 0;
  let j = 0;
  while (i < listA.length && j < listB.length) {
    const lo = Math.max(listA[i][0], listB[j][0]);
    const hi = Math.min(listA[i][1], listB[j][1]);
    if (lo < hi) {
      result.push([lo, hi]);
    }
    if (listA[i][1] < listB[j][1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return result;
};

/**
 * Computes the union (OR / sum) of two 1D ranges or range sets.
 * Touching or overlapping intervals are coalesced into minimal disjoint `[min, max]` segments.
 * @param {Array} rangeA - First 1D range or array of 1D ranges
 * @param {Array} rangeB - Second 1D range or array of 1D ranges
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcwCUCGA7AcwFMEBfBAMxijAQCIABAga3QGMwQiYAvAenRwQAG1R0A3MGAZs+YpKA|▶ Try it live in Instacode}
 */
export const sumRange = (rangeA, rangeB) => {
  const listA = toIntervalList1D(rangeA);
  const listB = toIntervalList1D(rangeB);
  return mergeIntervals1D([...listA, ...listB]);
};

/**
 * Computes the set difference (A \ B) of two 1D ranges or range sets.
 * @param {Array} rangeA - Base 1D range or array of 1D ranges
 * @param {Array} rangeB - Subtracted 1D range or array of 1D ranges
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges in A but not in B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYgGYYEoEMB2A5gKYIC+CGMUYCARAAKEDWArgMZgjEwBeA9KzggANgGc6AbmDB0WPEWLSgA|▶ Try it live in Instacode}
 */
export const diffRange = (rangeA, rangeB) => {
  let current = toIntervalList1D(rangeA);
  const subList = toIntervalList1D(rangeB);
  if (current.length === 0 || subList.length === 0) return current;

  for (let s = 0; s < subList.length; s += 1) {
    const [cutLo, cutHi] = subList[s];
    const next = [];
    for (let i = 0; i < current.length; i += 1) {
      const [lo, hi] = current[i];
      if (cutHi <= lo || cutLo >= hi) {
        next.push([lo, hi]);
      } else {
        if (lo < cutLo) next.push([lo, cutLo]);
        if (cutHi < hi) next.push([cutHi, hi]);
      }
    }
    current = next;
    if (current.length === 0) break;
  }
  return current;
};

/**
 * Computes the symmetric difference (XOR / A Δ B) of two 1D ranges or range sets.
 * @param {Array} rangeA - First 1D range or array of 1D ranges
 * @param {Array} rangeB - Second 1D range or array of 1D ranges
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges in exactly one of A or B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IB6wEoEMB2BzAUwQF8EAzGKMBAIgAE8BrAVwGMwQCYAvAembggANgGcaAbmDB0MbPgKSgA|▶ Try it live in Instacode}
 */
export const xorRange = (rangeA, rangeB) => {
  const onlyA = diffRange(rangeA, rangeB);
  const onlyB = diffRange(rangeB, rangeA);
  return mergeIntervals1D([...onlyA, ...onlyB]);
};

/**
 * Computes the total 1D length of a single range `[min, max]` or array of ranges `[[min, max], ...]`.
 * @param {Array} rangeOrRanges - 1D range or array of 1D ranges
 * @returns {number} Total 1D measure (length)
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAUwIYGcCuM0BKGAdgOZoIC+CAZjFGAgEQACpA1jgMZghowAvAPQ44IADZYmAbmDB02PIRLlZQA|▶ Try it live in Instacode}
 */
export const measureRange = (rangeOrRanges) => {
  const list = toIntervalList1D(rangeOrRanges);
  let total = 0;
  for (let i = 0; i < list.length; i += 1) {
    total += list[i][1] - list[i][0];
  }
  return total;
};

const normalizeBoxNd = (box) => {
  if (!Array.isArray(box) || box.length === 0) return null;
  const axes = [];
  for (let d = 0; d < box.length; d += 1) {
    const iv = normalizeInterval1D(box[d]);
    if (!iv || iv[0] >= iv[1]) return null;
    axes.push(iv);
  }
  return axes;
};

const isSingleBoxNd = (input) =>
  Array.isArray(input) &&
  input.length > 0 &&
  Array.isArray(input[0]) &&
  typeof input[0][0] === 'number';

const toBoxListNd = (input) => {
  if (!Array.isArray(input) || input.length === 0) return [];
  if (isSingleBoxNd(input)) {
    const b = normalizeBoxNd(input);
    return b ? [b] : [];
  }
  const boxes = [];
  for (let i = 0; i < input.length; i += 1) {
    const b = normalizeBoxNd(input[i]);
    if (b) boxes.push(b);
  }
  return boxes;
};

const intersectTwoBoxesNd = (boxA, boxB) => {
  if (!boxA || !boxB || boxA.length !== boxB.length) return null;
  const dim = boxA.length;
  const out = new Array(dim);
  for (let d = 0; d < dim; d += 1) {
    const lo = Math.max(boxA[d][0], boxB[d][0]);
    const hi = Math.min(boxA[d][1], boxB[d][1]);
    if (lo >= hi) return null;
    out[d] = [lo, hi];
  }
  return out;
};

const subtractSingleBoxNd = (boxA, boxB) => {
  const inter = intersectTwoBoxesNd(boxA, boxB);
  if (!inter) return [boxA];

  const dim = boxA.length;
  const shards = [];
  const core = boxA.map((iv) => [iv[0], iv[1]]);

  for (let d = 0; d < dim; d += 1) {
    const [aLo, aHi] = core[d];
    const [iLo, iHi] = inter[d];

    if (aLo < iLo) {
      const leftShard = core.map((iv, idx) => (idx === d ? [aLo, iLo] : [iv[0], iv[1]]));
      shards.push(leftShard);
    }
    if (iHi < aHi) {
      const rightShard = core.map((iv, idx) => (idx === d ? [iHi, aHi] : [iv[0], iv[1]]));
      shards.push(rightShard);
    }
    core[d] = [iLo, iHi];
  }

  return shards;
};

const disjointizeBoxesNd = (boxes) => {
  let disjoint = [];
  for (let i = 0; i < boxes.length; i += 1) {
    let candidates = [boxes[i]];
    for (let j = 0; j < disjoint.length && candidates.length > 0; j += 1) {
      const existing = disjoint[j];
      const nextCandidates = [];
      for (let c = 0; c < candidates.length; c += 1) {
        nextCandidates.push(...subtractSingleBoxNd(candidates[c], existing));
      }
      candidates = nextCandidates;
    }
    disjoint.push(...candidates);
  }
  return disjoint;
};

/**
 * Computes the N-dimensional intersection (AND) of two N-orthotopes (hyperrectangles) or sets of N-orthotopes.
 * Each N-box is represented as `[[min_1, max_1], [min_2, max_2], ..., [min_N, max_N]]`.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} boxB - Second N-box or array of N-boxes
 * @returns {Array<Array<Array<number>>>} Array of disjoint intersecting N-boxes
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAVzmghgGwEJQAeCAvggGYxRgIBEAAgOYDWaAxmCAKYwBeA9BhA4AzrQDcwYOky4ChSUA|▶ Try it live in Instacode}
 */
export const mutualBox = (boxA, boxB) => {
  const listA = disjointizeBoxesNd(toBoxListNd(boxA));
  const listB = disjointizeBoxesNd(toBoxListNd(boxB));
  if (listA.length === 0 || listB.length === 0) return [];

  const out = [];
  for (let i = 0; i < listA.length; i += 1) {
    for (let j = 0; j < listB.length; j += 1) {
      const inter = intersectTwoBoxesNd(listA[i], listB[j]);
      if (inter) out.push(inter);
    }
  }
  return out;
};

/**
 * Computes the N-dimensional set difference (A \ B) decomposed into pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - Base N-box or array of N-boxes
 * @param {Array} boxB - Subtracted N-box or array of N-boxes
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A \ B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYgGYYEJQB4IC+CGMUYCARAAIDmA1gK4DGYIApjAF4D0jcIADYBnSgG5gwdFlx4JQA|▶ Try it live in Instacode}
 */
export const diffBox = (boxA, boxB) => {
  let current = disjointizeBoxesNd(toBoxListNd(boxA));
  const subList = toBoxListNd(boxB);
  if (current.length === 0 || subList.length === 0) return current;

  for (let s = 0; s < subList.length; s += 1) {
    const cut = subList[s];
    const next = [];
    for (let i = 0; i < current.length; i += 1) {
      next.push(...subtractSingleBoxNd(current[i], cut));
    }
    current = next;
    if (current.length === 0) break;
  }
  return current;
};

/**
 * Computes the N-dimensional union (OR) decomposed into pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} boxB - Second N-box or array of N-boxes
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A U B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcwCEoA8EC+CAZjFGAgEQACA5gNboDGYIApjAF4D06cIAG1SUA3MGAZseMUA|▶ Try it live in Instacode}
 */
export const sumBox = (boxA, boxB) => {
  const listA = disjointizeBoxesNd(toBoxListNd(boxA));
  const onlyB = diffBox(boxB, listA);
  return [...listA, ...onlyB];
};

/**
 * Computes the N-dimensional symmetric difference (XOR / A Δ B) as pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} boxB - Second N-box or array of N-boxes
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A Δ B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IB6wEJVQgvggMxijAQCIABAcwGsBXAYzBAFMYAvAejrhABsAzmQDcwYOhhZUooA|▶ Try it live in Instacode}
 */
export const xorBox = (boxA, boxB) => {
  const onlyA = diffBox(boxA, boxB);
  const onlyB = diffBox(boxB, boxA);
  return [...onlyA, ...onlyB];
};

/**
 * Computes the Lebesgue measure (1D length, 2D area, 3D volume, 4D hypervolume, N-D measure)
 * of a single N-box `[[min_1, max_1], ..., [min_N, max_N]]` or an array of N-boxes.
 * Automatically decomposes overlapping N-boxes into disjoint shards so overlapping regions are never double-counted.
 * @param {Array} boxOrBoxes - Single N-box or array of N-boxes
 * @returns {number} Exact N-dimensional measure
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAUwIYGcCuM0BCUAHggL4IBmMUYCARAAIDmA1jgMZghowBeAehxwQAGyz0A3MGDpseQiWlA|▶ Try it live in Instacode}
 */
export const measureBox = (boxOrBoxes) => {
  const disjoint = disjointizeBoxesNd(toBoxListNd(boxOrBoxes));
  let total = 0;
  for (let i = 0; i < disjoint.length; i += 1) {
    const b = disjoint[i];
    let prod = 1;
    for (let d = 0; d < b.length; d += 1) {
      prod *= b[d][1] - b[d][0];
    }
    total += prod;
  }
  return total;
};

/**
 * Fast O(N) calculation of the shared N-dimensional measure (intersection length/area/volume/hypervolume)
 * of two single N-orthotopes without allocating shard arrays.
 * @param {Array<Array<number>>} boxA - First N-box `[[a1, b1], ..., [aN, bN]]`
 * @param {Array<Array<number>>} boxB - Second N-box `[[c1, d1], ..., [cN, dN]]`
 * @returns {number} Shared N-dimensional measure (>= 0)
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4AsCGMCmATAWR01QFdcA5PBAXwQDMYowEAiAAQHMBrUgYzAgcMAF4B6UnBAAbVKwDcwYBmz4iJcjiqKgA|▶ Try it live in Instacode}
 */
export const sharedMeasureNd = (boxA, boxB) => {
  if (!Array.isArray(boxA) || !Array.isArray(boxB) || boxA.length === 0 || boxA.length !== boxB.length) {
    return 0;
  }
  let measure = 1;
  for (let d = 0; d < boxA.length; d += 1) {
    const a0 = Math.min(boxA[d][0], boxA[d][1]);
    const a1 = Math.max(boxA[d][0], boxA[d][1]);
    const b0 = Math.min(boxB[d][0], boxB[d][1]);
    const b1 = Math.max(boxB[d][0], boxB[d][1]);
    const overlap = Math.min(a1, b1) - Math.max(a0, b0);
    if (overlap <= 0) return 0;
    measure *= overlap;
  }
  return measure;
};

/**
 * Chainable N-dimensional Orthotope (Hyperrectangle) Set supporting Boolean algebra
 * (`and`, `or`, `sub`, `xor`) and Lebesgue measure (`measure`) in any dimension N >= 1.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IPLwBZQMoFNEC+CAZjFGAgEQACA5gNYCuAxmCLjAF4D0jcIAGwDOlANzBg6OFjxxxQA|▶ Try it live in Instacode}
 */
export class OrthoSet {
  /**
   * @param {Array} [boxes=[]] - Single N-box or array of N-boxes (or 1D intervals)
   */
  constructor(boxes = []) {
    if (
      Array.isArray(boxes) &&
      boxes.length > 0 &&
      (typeof boxes[0] === 'number' ||
        (Array.isArray(boxes[0]) && typeof boxes[0][0] === 'number' && !Array.isArray(boxes[0][0])))
    ) {
      // Check if 1D interval `[a, b]`
      if (typeof boxes[0] === 'number') {
        const iv = normalizeInterval1D(boxes);
        this.boxes = iv && iv[0] < iv[1] ? [[iv]] : [];
        return;
      }
    }
    this.boxes = disjointizeBoxesNd(toBoxListNd(boxes));
  }

  static fromRect2D(rect) {
    if (!rect || typeof rect !== 'object') return new OrthoSet([]);
    const left = Number(rect.left ?? rect.x ?? 0);
    const top = Number(rect.top ?? rect.y ?? 0);
    const right = left + Number(rect.width ?? 0);
    const bottom = top + Number(rect.height ?? 0);
    return new OrthoSet([
      [left, right],
      [top, bottom],
    ]);
  }

  and(other) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(mutualBox(this.boxes, rhs));
  }

  or(other) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(sumBox(this.boxes, rhs));
  }

  sub(other) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(diffBox(this.boxes, rhs));
  }

  xor(other) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(xorBox(this.boxes, rhs));
  }

  measure() {
    return measureBox(this.boxes);
  }

  isEmpty() {
    return this.boxes.length === 0;
  }

  toArray() {
    return this.boxes.map((b) => b.map((iv) => [iv[0], iv[1]]));
  }
}
