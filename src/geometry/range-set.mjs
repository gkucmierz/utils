/**
 * @module geometry
 */

const attachBounds = (tuple, leftClosed = true, rightClosed = true) => {
  const lc = Boolean(leftClosed);
  const rc = Boolean(rightClosed);
  Object.defineProperties(tuple, {
    leftClosed: { value: lc, enumerable: false, writable: false, configurable: true },
    rightClosed: { value: rc, enumerable: false, writable: false, configurable: true },
  });
  return tuple;
};

/**
 * Creates a 1D range tuple `[min, max]` annotated with endpoint inclusivity flags
 * (`leftClosed`, `rightClosed`, both defaulting to `true` for closed `<min, max>`).
 * @param {number} min - Lower bound
 * @param {number} max - Upper bound
 * @param {boolean} [leftClosed=true] - Whether `min` is included (`<min` / `[min` vs `(min`)
 * @param {boolean} [rightClosed=true] - Whether `max` is included (`max>` / `max]` vs `max)`)
 * @returns {Array<number>} Annotated `[min, max]` interval tuple
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JgQwHYHMCmCC+CAZjFGAgEQACWA1gK4DGYIOMAXgPT1wgA2AZwoBuYMHTYcooA|▶ Try it live in Instacode}
 */
export const range = (min, max, leftClosed = true, rightClosed = true) => {
  const a = Number(min);
  const b = Number(max);
  if (a <= b) {
    return attachBounds([a, b], leftClosed, rightClosed);
  }
  return attachBounds([b, a], rightClosed, leftClosed);
};

/**
 * Parses mathematical or Polish interval notation (`"[4, 6)"`, `"<4, 6)"`, `"(4, 6]"`, `"(4, 6>"`, `"[4, 6]"`, `"(4, 6)"`)
 * into an annotated `[min, max]` interval tuple with `.leftClosed` and `.rightClosed`.
 * @param {string|Array} input - Interval string or tuple
 * @param {boolean} [defaultLeftClosed=true] - Fallback left closure when `input` is a 2-tuple
 * @param {boolean} [defaultRightClosed=true] - Fallback right closure when `input` is a 2-tuple
 * @returns {Array<number>|null} Annotated `[min, max]` tuple or `null` if invalid/empty
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IgQxgZwKYCU0B2A5tggL4IBmMUYCARAAJEDWArgMZgjYwBeAejZwQAG0z0A3MGDoseQiWlA|▶ Try it live in Instacode}
 */
export const parseRange = (input, defaultLeftClosed = true, defaultRightClosed = true) => {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = /^([([<])\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([)\]>])$/i.exec(
      trimmed
    );
    if (!match) return null;
    const leftChar = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    const rightChar = match[4];
    const lc = leftChar === '[' || leftChar === '<';
    const rc = rightChar === ']' || rightChar === '>';
    return normalizeInterval1D(attachBounds([a, b], lc, rc), lc, rc);
  }
  return normalizeInterval1D(input, defaultLeftClosed, defaultRightClosed);
};

/**
 * Formats an interval tuple into mathematical (`"[4, 6)"`) or angle (`"<4, 6)"`) notation.
 * @param {Array<number>} r - Interval tuple
 * @param {'bracket'|'angle'} [style='bracket'] - Notation style for closed endpoints
 * @returns {string} Formatted interval string
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IGazAQzgJUwOwHMBTBAXzRijAQCIABQgawFcBjMEYmALwHoWcEABsAzrQDcwYOhhZcBElKA|▶ Try it live in Instacode}
 */
export const formatRange = (r, style = 'bracket') => {
  const iv = normalizeInterval1D(r);
  if (!iv) return '∅';
  const lc = iv.leftClosed ?? true;
  const rc = iv.rightClosed ?? true;
  const openL = lc ? (style === 'angle' ? '<' : '[') : '(';
  const closeR = rc ? (style === 'angle' ? '>' : ']') : ')';
  return `${openL}${iv[0]}, ${iv[1]}${closeR}`;
};

const isNonEmptyInterval = (a, b, lc, rc) => a < b || (a === b && lc && rc);

const normalizeInterval1D = (r, defaultLeftClosed = true, defaultRightClosed = true) => {
  if (typeof r === 'string') {
    return parseRange(r, defaultLeftClosed, defaultRightClosed);
  }
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    const a = Number(r.min ?? r.from ?? r[0]);
    const b = Number(r.max ?? r.to ?? r[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const lc = typeof r.leftClosed === 'boolean' ? r.leftClosed : Boolean(defaultLeftClosed);
    const rc = typeof r.rightClosed === 'boolean' ? r.rightClosed : Boolean(defaultRightClosed);
    const [lo, hi, fLo, fHi] = a <= b ? [a, b, lc, rc] : [b, a, rc, lc];
    return isNonEmptyInterval(lo, hi, fLo, fHi) ? attachBounds([lo, hi], fLo, fHi) : null;
  }
  if (!Array.isArray(r) || r.length < 2) return null;
  const a = Number(r[0]);
  const b = Number(r[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  const rawLc =
    typeof r[2] === 'boolean'
      ? r[2]
      : typeof r.leftClosed === 'boolean'
        ? r.leftClosed
        : Boolean(defaultLeftClosed);
  const rawRc =
    typeof r[3] === 'boolean'
      ? r[3]
      : typeof r.rightClosed === 'boolean'
        ? r.rightClosed
        : Boolean(defaultRightClosed);

  const [lo, hi, lc, rc] = a <= b ? [a, b, rawLc, rawRc] : [b, a, rawRc, rawLc];
  if (!isNonEmptyInterval(lo, hi, lc, rc)) return null;
  return attachBounds([lo, hi], lc, rc);
};

const isSingleIntervalInput1D = (input) =>
  typeof input === 'string' ||
  (Array.isArray(input) && input.length >= 2 && typeof input[0] === 'number' && typeof input[1] === 'number');

const mergeIntervals1D = (intervals) => {
  if (!Array.isArray(intervals) || intervals.length === 0) return [];
  const valid = [];
  for (let i = 0; i < intervals.length; i += 1) {
    const iv = intervals[i];
    if (Array.isArray(iv) && isNonEmptyInterval(iv[0], iv[1], iv.leftClosed ?? true, iv.rightClosed ?? true)) {
      valid.push(attachBounds([iv[0], iv[1]], iv.leftClosed ?? true, iv.rightClosed ?? true));
    }
  }
  if (valid.length === 0) return [];

  valid.sort((x, y) => {
    if (x[0] !== y[0]) return x[0] - y[0];
    // At identical start point, closed left endpoint `[a` comes before open `(a`
    if (x.leftClosed !== y.leftClosed) return x.leftClosed ? -1 : 1;
    if (x[1] !== y[1]) return x[1] - y[1];
    return (y.rightClosed ? 1 : 0) - (x.rightClosed ? 1 : 0);
  });

  const merged = [valid[0]];
  for (let i = 1; i < valid.length; i += 1) {
    const prev = merged[merged.length - 1];
    const curr = valid[i];

    const canMerge =
      curr[0] < prev[1] || (curr[0] === prev[1] && (prev.rightClosed || curr.leftClosed));

    if (canMerge) {
      const nextLo = prev[0];
      const nextLc = prev[0] === curr[0] ? prev.leftClosed || curr.leftClosed : prev.leftClosed;
      let nextHi = prev[1];
      let nextRc = prev.rightClosed;
      if (curr[1] > prev[1]) {
        nextHi = curr[1];
        nextRc = curr.rightClosed;
      } else if (curr[1] === prev[1]) {
        nextRc = prev.rightClosed || curr.rightClosed;
      }
      merged[merged.length - 1] = attachBounds([nextLo, nextHi], nextLc, nextRc);
    } else {
      merged.push(curr);
    }
  }
  return merged;
};

const toIntervalList1D = (input, defaultLeftClosed = true, defaultRightClosed = true) => {
  if (input === null || input === undefined) return [];
  if (isSingleIntervalInput1D(input)) {
    const single = normalizeInterval1D(input, defaultLeftClosed, defaultRightClosed);
    return single ? [single] : [];
  }
  if (!Array.isArray(input) || input.length === 0) return [];
  const list = [];
  for (let i = 0; i < input.length; i += 1) {
    const norm = normalizeInterval1D(input[i], defaultLeftClosed, defaultRightClosed);
    if (norm) list.push(norm);
  }
  return mergeIntervals1D(list);
};

const intersectTwoIntervals1D = (a, b) => {
  let lo;
  let lc;
  if (a[0] > b[0]) {
    lo = a[0];
    lc = a.leftClosed;
  } else if (b[0] > a[0]) {
    lo = b[0];
    lc = b.leftClosed;
  } else {
    lo = a[0];
    lc = a.leftClosed && b.leftClosed;
  }

  let hi;
  let rc;
  if (a[1] < b[1]) {
    hi = a[1];
    rc = a.rightClosed;
  } else if (b[1] < a[1]) {
    hi = b[1];
    rc = b.rightClosed;
  } else {
    hi = a[1];
    rc = a.rightClosed && b.rightClosed;
  }

  if (!isNonEmptyInterval(lo, hi, lc, rc)) return null;
  return attachBounds([lo, hi], lc, rc);
};

const subtractTwoIntervals1D = (iv, cut) => {
  const inter = intersectTwoIntervals1D(iv, cut);
  if (!inter) return [iv];

  const out = [];
  // Left remainder: [iv[0], inter[0]] with right closure = !inter.leftClosed
  const leftLo = iv[0];
  const leftHi = inter[0];
  const leftLc = iv.leftClosed;
  const leftRc = !inter.leftClosed;
  if (isNonEmptyInterval(leftLo, leftHi, leftLc, leftRc)) {
    out.push(attachBounds([leftLo, leftHi], leftLc, leftRc));
  }

  // Right remainder: [inter[1], iv[1]] with left closure = !inter.rightClosed
  const rightLo = inter[1];
  const rightHi = iv[1];
  const rightLc = !inter.rightClosed;
  const rightRc = iv.rightClosed;
  if (isNonEmptyInterval(rightLo, rightHi, rightLc, rightRc)) {
    out.push(attachBounds([rightLo, rightHi], rightLc, rightRc));
  }

  return out;
};

/**
 * Computes the intersection (AND / mutual part) of two 1D ranges or range sets.
 * Supports closed `<a, b>`, half-open `<a, b)` / `(a, b>`, and open `(a, b)` intervals via
 * optional `leftClosed` and `rightClosed` booleans (both defaulting to `true`).
 * @param {Array|string} rangeA - First 1D range (`[min, max]` or `[min, max, leftClosed, rightClosed]`) or array of ranges
 * @param {Array|string} rangeB - Second 1D range or array of ranges
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity (`true` = `<a`, `false` = `(a`)
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity (`true` = `b>`, `false` = `b)`)
 * @returns {Array<Array<number>>} Disjoint sorted array of intersecting `[min, max]` ranges
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAVzmghgGwEpYB2A5gKYIC+CAZjFGAgEQACxA1mgMZgikwBeAegwgcAZ0YBuYMHSZcBEqWlA|▶ Try it live in Instacode}
 */
export const mutualRange = (rangeA, rangeB, leftClosed = true, rightClosed = true) => {
  const listA = toIntervalList1D(rangeA, leftClosed, rightClosed);
  const listB = toIntervalList1D(rangeB, leftClosed, rightClosed);
  if (listA.length === 0 || listB.length === 0) return [];

  const result = [];
  let i = 0;
  let j = 0;
  while (i < listA.length && j < listB.length) {
    const inter = intersectTwoIntervals1D(listA[i], listB[j]);
    if (inter) {
      result.push(inter);
    }
    if (listA[i][1] < listB[j][1] || (listA[i][1] === listB[j][1] && !listA[i].rightClosed && listB[j].rightClosed)) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return mergeIntervals1D(result);
};

/**
 * Computes the union (OR / sum) of 1D ranges or range sets.
 * Touching intervals at boundary `p` coalesce if and only if at least one interval includes `p` (`rightClosed || leftClosed`).
 * Can be called as `sumRange(listOfRanges, leftClosed, rightClosed)` or `sumRange(rangeA, rangeB, leftClosed, rightClosed)`.
 * @param {Array|string} rangeA - First 1D range or array of 1D ranges
 * @param {Array|string|boolean} [rangeB] - Second 1D range / array of ranges, or `leftClosed` boolean when 1st arg is a list
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcwCUCGA7AcwFMEBfBAMxijAQCIABAga3QGMwQiYAvAenRwQAG1R0A3MGAZs+YpKA|▶ Try it live in Instacode}
 */
export const sumRange = (rangeA, rangeB = undefined, leftClosed = true, rightClosed = true) => {
  if (typeof rangeB === 'boolean' || rangeB === undefined) {
    const lc = typeof rangeB === 'boolean' ? rangeB : leftClosed;
    const rc = typeof rangeB === 'boolean' ? Boolean(leftClosed) : rightClosed;
    return toIntervalList1D(rangeA, lc, rc);
  }
  const listA = toIntervalList1D(rangeA, leftClosed, rightClosed);
  const listB = toIntervalList1D(rangeB, leftClosed, rightClosed);
  return mergeIntervals1D([...listA, ...listB]);
};

/**
 * Computes the set difference (A \ B) of two 1D ranges or range sets, flipping boundary closures accurately.
 * @param {Array|string} rangeA - Base 1D range or array of 1D ranges
 * @param {Array|string} rangeB - Subtracted 1D range or array of 1D ranges
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges in A but not in B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYgGYYEoEMB2A5gKYIC+CGMUYCARAAKEDWArgMZgjEwBeA9KzggANgGc6AbmDB0WPEWLSgA|▶ Try it live in Instacode}
 */
export const diffRange = (rangeA, rangeB, leftClosed = true, rightClosed = true) => {
  let current = toIntervalList1D(rangeA, leftClosed, rightClosed);
  const subList = toIntervalList1D(rangeB, leftClosed, rightClosed);
  if (current.length === 0 || subList.length === 0) return current;

  for (let s = 0; s < subList.length; s += 1) {
    const cut = subList[s];
    const next = [];
    for (let i = 0; i < current.length; i += 1) {
      next.push(...subtractTwoIntervals1D(current[i], cut));
    }
    current = next;
    if (current.length === 0) break;
  }
  return current;
};

/**
 * Computes the symmetric difference (XOR / A Δ B) of two 1D ranges or range sets.
 * @param {Array|string} rangeA - First 1D range or array of 1D ranges
 * @param {Array|string} rangeB - Second 1D range or array of 1D ranges
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
 * @returns {Array<Array<number>>} Disjoint sorted array of `[min, max]` ranges in exactly one of A or B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IB6wEoEMB2BzAUwQF8EAzGKMBAIgAE8BrAVwGMwQCYAvAembggANgGcaAbmDB0MbPgKSgA|▶ Try it live in Instacode}
 */
export const xorRange = (rangeA, rangeB, leftClosed = true, rightClosed = true) => {
  const onlyA = diffRange(rangeA, rangeB, leftClosed, rightClosed);
  const onlyB = diffRange(rangeB, rangeA, leftClosed, rightClosed);
  return mergeIntervals1D([...onlyA, ...onlyB]);
};

/**
 * Checks whether a 1D point `x` is contained in `rangeOrRanges`, respecting open vs closed endpoints.
 * @param {Array|string} rangeOrRanges - 1D range or array of 1D ranges
 * @param {number} x - Point coordinate to test
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
 * @returns {boolean} `true` if `x` belongs to the range set
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZQHZwIYgwZwAUo84BGAEQQF8EAzGKMBAIgAEBzAawFdUwQAUxgAvAPQ84IADb4WAbmDB0WXAWKlKioA|▶ Try it live in Instacode}
 */
export const containsPoint1D = (rangeOrRanges, x, leftClosed = true, rightClosed = true) => {
  const val = Number(x);
  if (!Number.isFinite(val)) return false;
  const list = toIntervalList1D(rangeOrRanges, leftClosed, rightClosed);
  for (let i = 0; i < list.length; i += 1) {
    const iv = list[i];
    const aboveMin = iv.leftClosed ? val >= iv[0] : val > iv[0];
    const belowMax = iv.rightClosed ? val <= iv[1] : val < iv[1];
    if (aboveMin && belowMax) return true;
  }
  return false;
};

/**
 * Computes the total 1D Lebesgue measure (length) of a single range `[min, max]` or array of ranges.
 * Single points `[a, a]` have length `0`.
 * @param {Array|string} rangeOrRanges - 1D range or array of 1D ranges
 * @returns {number} Total 1D measure (length >= 0)
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAUwIYGcCuM0BKGAdgOZoIC+CAZjFGAgEQACpA1jgMZghowAvAPQ44IADZYmAbmDB02PIRLlZQA|▶ Try it live in Instacode}
 */
export const measureRange = (rangeOrRanges) => {
  const list = toIntervalList1D(rangeOrRanges, true, true);
  let total = 0;
  for (let i = 0; i < list.length; i += 1) {
    total += list[i][1] - list[i][0];
  }
  return total;
};

const normalizeBoxNd = (box, defaultLeftClosed = true, defaultRightClosed = true) => {
  if (!Array.isArray(box) || box.length === 0) return null;
  const axes = [];
  for (let d = 0; d < box.length; d += 1) {
    const iv = normalizeInterval1D(box[d], defaultLeftClosed, defaultRightClosed);
    if (!iv) return null;
    axes.push(iv);
  }
  return axes;
};

const isSingleBoxNd = (input) =>
  Array.isArray(input) &&
  input.length > 0 &&
  (typeof input[0] === 'string' ||
    (Array.isArray(input[0]) && typeof input[0][0] === 'number' && typeof input[0][1] === 'number'));

const toBoxListNd = (input, defaultLeftClosed = true, defaultRightClosed = true) => {
  if (!Array.isArray(input) || input.length === 0) return [];
  if (isSingleBoxNd(input)) {
    const b = normalizeBoxNd(input, defaultLeftClosed, defaultRightClosed);
    return b ? [b] : [];
  }
  const boxes = [];
  for (let i = 0; i < input.length; i += 1) {
    const b = normalizeBoxNd(input[i], defaultLeftClosed, defaultRightClosed);
    if (b) boxes.push(b);
  }
  return boxes;
};

const cloneBoxNd = (box) =>
  box.map((iv) => attachBounds([iv[0], iv[1]], iv.leftClosed ?? true, iv.rightClosed ?? true));

const intersectTwoBoxesNd = (boxA, boxB) => {
  if (!boxA || !boxB || boxA.length !== boxB.length) return null;
  const dim = boxA.length;
  const out = new Array(dim);
  for (let d = 0; d < dim; d += 1) {
    const inter1D = intersectTwoIntervals1D(boxA[d], boxB[d]);
    if (!inter1D) return null;
    out[d] = inter1D;
  }
  return out;
};

const subtractSingleBoxNd = (boxA, boxB) => {
  const inter = intersectTwoBoxesNd(boxA, boxB);
  if (!inter) return [cloneBoxNd(boxA)];

  const dim = boxA.length;
  const shards = [];
  const core = cloneBoxNd(boxA);

  for (let d = 0; d < dim; d += 1) {
    const remainders = subtractTwoIntervals1D(core[d], inter[d]);
    for (let r = 0; r < remainders.length; r += 1) {
      const remIv = remainders[r];
      const shard = core.map((iv, idx) =>
        idx === d
          ? attachBounds([remIv[0], remIv[1]], remIv.leftClosed, remIv.rightClosed)
          : attachBounds([iv[0], iv[1]], iv.leftClosed, iv.rightClosed)
      );
      shards.push(shard);
    }
    core[d] = attachBounds([inter[d][0], inter[d][1]], inter[d].leftClosed, inter[d].rightClosed);
  }

  return shards;
};

const tryMergeTwoBoxesNd = (boxA, boxB) => {
  if (!boxA || !boxB || boxA.length !== boxB.length) return null;
  const dim = boxA.length;
  let diffAxis = -1;

  for (let d = 0; d < dim; d += 1) {
    const sameAxis =
      boxA[d][0] === boxB[d][0] &&
      boxA[d][1] === boxB[d][1] &&
      boxA[d].leftClosed === boxB[d].leftClosed &&
      boxA[d].rightClosed === boxB[d].rightClosed;
    if (!sameAxis) {
      if (diffAxis !== -1) return null;
      diffAxis = d;
    }
  }

  if (diffAxis === -1) return cloneBoxNd(boxA);
  const mergedAxis = mergeIntervals1D([boxA[diffAxis], boxB[diffAxis]]);
  if (mergedAxis.length !== 1) return null;

  return boxA.map((iv, idx) =>
    idx === diffAxis
      ? mergedAxis[0]
      : attachBounds([iv[0], iv[1]], iv.leftClosed, iv.rightClosed)
  );
};

const coalesceDisjointBoxesNd = (boxes) => {
  if (boxes.length <= 1) return boxes;
  const result = boxes.map(cloneBoxNd);
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < result.length; i += 1) {
      for (let j = i + 1; j < result.length; j += 1) {
        const merged = tryMergeTwoBoxesNd(result[i], result[j]);
        if (merged) {
          result[i] = merged;
          result.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return result;
};

const disjointizeBoxesNd = (boxes) => {
  const disjoint = [];
  for (let i = 0; i < boxes.length; i += 1) {
    let candidates = [cloneBoxNd(boxes[i])];
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
  return coalesceDisjointBoxesNd(disjoint);
};

/**
 * Computes the N-dimensional intersection (AND) of two N-orthotopes (hyperrectangles) or sets of N-orthotopes.
 * Each N-box is represented as `[[min_1, max_1], [min_2, max_2], ..., [min_N, max_N]]`.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} boxB - Second N-box or array of N-boxes
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity on each axis
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity on each axis
 * @returns {Array<Array<Array<number>>>} Array of disjoint intersecting N-boxes
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAVzmghgGwEJQAeCAvggGYxRgIBEAAgOYDWaAxmCAKYwBeA9BhA4AzrQDcwYOky4ChSUA|▶ Try it live in Instacode}
 */
export const mutualBox = (boxA, boxB, leftClosed = true, rightClosed = true) => {
  const listA = disjointizeBoxesNd(toBoxListNd(boxA, leftClosed, rightClosed));
  const listB = disjointizeBoxesNd(toBoxListNd(boxB, leftClosed, rightClosed));
  if (listA.length === 0 || listB.length === 0) return [];

  const out = [];
  for (let i = 0; i < listA.length; i += 1) {
    for (let j = 0; j < listB.length; j += 1) {
      const inter = intersectTwoBoxesNd(listA[i], listB[j]);
      if (inter) out.push(inter);
    }
  }
  return coalesceDisjointBoxesNd(out);
};

/**
 * Computes the N-dimensional set difference (A \ B) decomposed into pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - Base N-box or array of N-boxes
 * @param {Array} boxB - Subtracted N-box or array of N-boxes
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity on each axis
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity on each axis
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A \ B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYgGYYEJQB4IC+CGMUYCARAAIDmA1gK4DGYIApjAF4D0jcIADYBnSgG5gwdFlx4JQA|▶ Try it live in Instacode}
 */
export const diffBox = (boxA, boxB, leftClosed = true, rightClosed = true) => {
  let current = disjointizeBoxesNd(toBoxListNd(boxA, leftClosed, rightClosed));
  const subList = toBoxListNd(boxB, leftClosed, rightClosed);
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
  return coalesceDisjointBoxesNd(current);
};

/**
 * Computes the N-dimensional union (OR) decomposed into pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} [boxB] - Second N-box or array of N-boxes
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity on each axis
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity on each axis
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A U B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4FcwCEoA8EC+CAZjFGAgEQACA5gNboDGYIApjAF4D06cIAG1SUA3MGAZseMUA|▶ Try it live in Instacode}
 */
export const sumBox = (boxA, boxB = undefined, leftClosed = true, rightClosed = true) => {
  if (typeof boxB === 'boolean' || boxB === undefined) {
    const lc = typeof boxB === 'boolean' ? boxB : leftClosed;
    const rc = typeof boxB === 'boolean' ? Boolean(leftClosed) : rightClosed;
    return disjointizeBoxesNd(toBoxListNd(boxA, lc, rc));
  }
  const listA = disjointizeBoxesNd(toBoxListNd(boxA, leftClosed, rightClosed));
  const listB = toBoxListNd(boxB, leftClosed, rightClosed);
  return disjointizeBoxesNd([...listA, ...listB]);
};

/**
 * Computes the N-dimensional symmetric difference (XOR / A Δ B) as pairwise-disjoint N-orthotopes.
 * @param {Array} boxA - First N-box or array of N-boxes
 * @param {Array} boxB - Second N-box or array of N-boxes
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity on each axis
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity on each axis
 * @returns {Array<Array<Array<number>>>} Pairwise-disjoint N-boxes covering A Δ B
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IB6wEJVQgvggMxijAQCIABAcwGsBXAYzBAFMYAvAejrhABsAzmQDcwYOhhZUooA|▶ Try it live in Instacode}
 */
export const xorBox = (boxA, boxB, leftClosed = true, rightClosed = true) => {
  const onlyA = diffBox(boxA, boxB, leftClosed, rightClosed);
  const onlyB = diffBox(boxB, boxA, leftClosed, rightClosed);
  return coalesceDisjointBoxesNd([...onlyA, ...onlyB]);
};

/**
 * Checks whether an N-dimensional point `[x_1, x_2, ..., x_N]` belongs to `boxOrBoxes`,
 * respecting open vs closed boundaries on every axis.
 * @param {Array} boxOrBoxes - Single N-box or array of N-boxes
 * @param {Array<number>} point - N-dimensional coordinate vector
 * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
 * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
 * @returns {boolean} `true` if `point` lies inside the N-orthotope set
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZQHZwIYgwZwAUo84A5AEwQF8EAzGKMBAIgAEBzAawFdUwQAUxgAvAPQ84IADb4WAbmDB0WXAWKlKioA|▶ Try it live in Instacode}
 */
export const containsPointNd = (boxOrBoxes, point, leftClosed = true, rightClosed = true) => {
  if (!Array.isArray(point) || point.length === 0) return false;
  const boxes = toBoxListNd(boxOrBoxes, leftClosed, rightClosed);
  for (let i = 0; i < boxes.length; i += 1) {
    const b = boxes[i];
    if (b.length !== point.length) continue;
    let insideAllAxes = true;
    for (let d = 0; d < b.length; d += 1) {
      const val = Number(point[d]);
      const iv = b[d];
      const aboveMin = iv.leftClosed ? val >= iv[0] : val > iv[0];
      const belowMax = iv.rightClosed ? val <= iv[1] : val < iv[1];
      if (!aboveMin || !belowMax) {
        insideAllAxes = false;
        break;
      }
    }
    if (insideAllAxes) return true;
  }
  return false;
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
  const disjoint = disjointizeBoxesNd(toBoxListNd(boxOrBoxes, true, true));
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
 * (`and`, `or`, `sub`, `xor`), point membership (`contains`), and Lebesgue measure (`measure`)
 * in any dimension N >= 1, with full open/closed boundary awareness.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IPLwBZQMoFNEC+CAZjFGAgEQACA5gNYCuAxmCLjAF4D0jcIAGwDOlANzBg6OFjxxxQA|▶ Try it live in Instacode}
 */
export class OrthoSet {
  /**
   * @param {Array} [boxes=[]] - Single N-box or array of N-boxes (or 1D interval)
   * @param {boolean} [leftClosed=true] - Default left-endpoint inclusivity
   * @param {boolean} [rightClosed=true] - Default right-endpoint inclusivity
   */
  constructor(boxes = [], leftClosed = true, rightClosed = true) {
    this.leftClosed = Boolean(leftClosed);
    this.rightClosed = Boolean(rightClosed);
    if (Array.isArray(boxes) && boxes.length >= 2 && typeof boxes[0] === 'number' && typeof boxes[1] === 'number') {
      const iv = normalizeInterval1D(boxes, this.leftClosed, this.rightClosed);
      this.boxes = iv ? [[iv]] : [];
      return;
    }
    this.boxes = disjointizeBoxesNd(toBoxListNd(boxes, this.leftClosed, this.rightClosed));
  }

  static fromRect2D(rect, leftClosed = true, rightClosed = true) {
    if (!rect || typeof rect !== 'object') return new OrthoSet([], leftClosed, rightClosed);
    const left = Number(rect.left ?? rect.x ?? 0);
    const top = Number(rect.top ?? rect.y ?? 0);
    const right = left + Number(rect.width ?? 0);
    const bottom = top + Number(rect.height ?? 0);
    return new OrthoSet(
      [
        [left, right],
        [top, bottom],
      ],
      leftClosed,
      rightClosed
    );
  }

  and(other, leftClosed = this.leftClosed, rightClosed = this.rightClosed) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(mutualBox(this.boxes, rhs, leftClosed, rightClosed), leftClosed, rightClosed);
  }

  or(other, leftClosed = this.leftClosed, rightClosed = this.rightClosed) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(sumBox(this.boxes, rhs, leftClosed, rightClosed), leftClosed, rightClosed);
  }

  sub(other, leftClosed = this.leftClosed, rightClosed = this.rightClosed) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(diffBox(this.boxes, rhs, leftClosed, rightClosed), leftClosed, rightClosed);
  }

  xor(other, leftClosed = this.leftClosed, rightClosed = this.rightClosed) {
    const rhs = other instanceof OrthoSet ? other.boxes : other;
    return new OrthoSet(xorBox(this.boxes, rhs, leftClosed, rightClosed), leftClosed, rightClosed);
  }

  contains(point) {
    return containsPointNd(this.boxes, point, this.leftClosed, this.rightClosed);
  }

  measure() {
    return measureBox(this.boxes);
  }

  isEmpty() {
    return this.boxes.length === 0;
  }

  toArray() {
    return this.boxes.map((b) => b.map((iv) => attachBounds([iv[0], iv[1]], iv.leftClosed, iv.rightClosed)));
  }
}
