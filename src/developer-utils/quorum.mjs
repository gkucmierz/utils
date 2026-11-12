/**
 * @module developer-utils
 */

import { is } from './type.mjs';

/**
 * Default required agreeing datapoints ($K = 4$) in a standard $4\text{-of-}5$ quorum check.
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfQBEBRAMQEF0AZAFQIGkEBfBAMxijAQCIABAOYBrAK4BjMCACmMAF4B6EXBAAbAM48A3MGAYc+YuSp1G2oA|▶ Try it live in Instacode}
 */
export const QUORUM_DEFAULT_K = 4;

/**
 * Default total independent sources ($N = 5$) in a standard $4\text{-of-}5$ quorum check.
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfQBEBRAMQEF0AZAFQIDkEBfBAMxijAQCIABAOYBrAK4BjMCACmMAF4B6EXBAAbAM48A3MGAYc+YuSp1G2oA|▶ Try it live in Instacode}
 */
export const QUORUM_DEFAULT_N = 5;

/**
 * Default maximum relative error threshold ($0.01\% = 0.0001 = 1\text{ bp}$) for two datapoints
 * to be considered equal in a quorum evaluation.
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfTwEEANA7AUQBliAVASQDVKDLtscEBfBAMxhQwCAEQABAOYBrAK4BjMCACmMAF4B6GXBAAbAM4iA3MGAYc+ImQo16zVu07ZjQA|▶ Try it live in Instacode}
 */
export const QUORUM_MAX_RELATIVE_ERROR = 0.0001;

/**
 * Default maximum relative error expressed in percent ($0.01\%$).
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfTwEEANA7AUQBliAVASQDVKDLtscCAFAYToQBfBADMYUMAgBEAAQDmAawCuAYzAgApjABeAeiVwQAGwDOUgNzBgGHPiJkKNes1btO2Hv0tA|▶ Try it live in Instacode}
 */
export const QUORUM_MAX_RELATIVE_ERROR_PCT = 0.01;

/**
 * Safe denominator floor near zero to avoid division by zero when comparing $0$ vs $0$.
 * @type {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfQC0BRbTAgMQBlMcCSAFAZQElaA5BAXwQDMYUMAgBEAAQDmAawCuAYzAgApjABeAehlwQAGwDOIgNzBgGHPmJkKNOtgYt2mDsaA|▶ Try it live in Instacode}
 */
export const QUORUM_ZERO_FLOOR_EPSILON = 1e-9;

/**
 * Frozen SSoT configuration object for $K\text{-of-}N$ quorum evaluation.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IIoFUDyAldBZAfQGFMA5AMQEkBxBAXwQDMYowEAiAAQHMBrAVwDGYEAFMYALwD0-OCAA2AZ3YBuYMAw58xMlWpqgA|▶ Try it live in Instacode}
 */
export const QUORUM_CONFIG = Object.freeze({
  DEFAULT_K: QUORUM_DEFAULT_K,
  DEFAULT_N: QUORUM_DEFAULT_N,
  MAX_RELATIVE_ERROR: QUORUM_MAX_RELATIVE_ERROR,
  MAX_RELATIVE_ERROR_PCT: QUORUM_MAX_RELATIVE_ERROR_PCT,
  ZERO_FLOOR_EPSILON: QUORUM_ZERO_FLOOR_EPSILON
});

const isFiniteScalar = (v) => is(v, Number) && Number.isFinite(v);

const isNumericVector = (v) =>
  is(v, Array) && v.length > 0 && v.every((item) => isFiniteScalar(item));

const cleanFloat = (val) => Number(Number(val).toFixed(10));

/**
 * Computes the symmetric relative error between two numbers or two equal-length numeric vectors:
 * $$\delta_{\text{rel}}(a, b) = \frac{|a - b|}{\max(|a|, |b|, \varepsilon_{\text{floor}})}$$
 *
 * For vectors $\mathbf{a}, \mathbf{b} \in \mathbb{R}^D$, returns the worst-case component-wise
 * relative error $\max_{d} \delta_{\text{rel}}(a_d, b_d)$.
 *
 * @param {number|number[]} a - First value or numeric vector.
 * @param {number|number[]} b - Second value or numeric vector.
 * @param {Object} [options={}] - Options object.
 * @param {number} [options.zeroFloor=1e-9] - Denominator floor when both values are near zero.
 * @returns {number} Relative error in $[0, \infty)$ (`0.0001` corresponds to `0.01%`).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZUgVzgUwEo4A2AhnCAG44CiMMsCAvggGZ1gIBEAAgOYDWmVGBA4YALwD02EIQDOHANzBg6LLgIkylGnRhKgA|▶ Try it live in Instacode}
 */
export const computeRelativeError = (
  a,
  b,
  { zeroFloor = QUORUM_ZERO_FLOOR_EPSILON } = {}
) => {
  const safeFloor = isFiniteScalar(zeroFloor) && zeroFloor > 0 ? zeroFloor : QUORUM_ZERO_FLOOR_EPSILON;

  if (isFiniteScalar(a) && isFiniteScalar(b)) {
    if (a === b) return 0;
    const denom = Math.max(Math.abs(a), Math.abs(b), safeFloor);
    return Math.abs(a - b) / denom;
  }

  if (isNumericVector(a) && isNumericVector(b) && a.length === b.length) {
    let maxErr = 0;
    for (let i = 0; i < a.length; i++) {
      const err = computeRelativeError(a[i], b[i], { zeroFloor: safeFloor });
      if (err > maxErr) maxErr = err;
    }
    return maxErr;
  }

  return Infinity;
};

/**
 * Checks whether two datapoints (`a` and `b`) are equal within the maximum relative error
 * threshold (default `0.01%`, i.e. `maxRelativeError = 0.0001`).
 *
 * @param {number|number[]} a - First datapoint.
 * @param {number|number[]} b - Second datapoint.
 * @param {Object} [options={}] - Options object.
 * @param {number} [options.maxRelativeError=0.0001] - Maximum allowed relative error (`0.0001` = `0.01%`).
 * @param {number} [options.zeroFloor=1e-9] - Denominator floor near zero.
 * @returns {boolean} True if and only if relative error $\le \text{maxRelativeError}$.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JAZwIoFdZbAUQEcsBDAGwQF8EAzGKMBAIgAEBzAaywGMwQBTGAC8A9FjggyaJgG5goTDhh4ipMnKA|▶ Try it live in Instacode}
 */
export const isQuorumEqual = (
  a,
  b,
  {
    maxRelativeError = QUORUM_MAX_RELATIVE_ERROR,
    zeroFloor = QUORUM_ZERO_FLOOR_EPSILON
  } = {}
) => {
  const safeMax = isFiniteScalar(maxRelativeError) && maxRelativeError >= 0
    ? maxRelativeError
    : QUORUM_MAX_RELATIVE_ERROR;
  return computeRelativeError(a, b, { zeroFloor }) <= safeMax + 1e-15;
};

const computeClusterMedianScalar = (values) => {
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return cleanFloat((sorted[mid - 1] + sorted[mid]) / 2);
};

const computeClusterConsensusValue = (values) => {
  if (values.length === 0) return null;
  if (isFiniteScalar(values[0])) {
    return computeClusterMedianScalar(values);
  }
  if (isNumericVector(values[0])) {
    const dim = values[0].length;
    const out = new Array(dim);
    for (let d = 0; d < dim; d++) {
      out[d] = computeClusterMedianScalar(values.map((v) => v[d]));
    }
    return out;
  }
  return null;
};

/**
 * Evaluates a $K\text{-of-}N$ (default $4\text{-of-}5$) quorum across a set of datapoints.
 *
 * **Strict Equality-Clique Specification:**
 * - Two datapoints $v_i, v_j$ are considered equal iff $\delta_{\text{rel}}(v_i, v_j) \le \text{maxRelativeError}$ (default `0.01%` = `0.0001`).
 * - A subset of datapoints forms an agreeing cluster (clique) $C$ iff **every pair** $i, j \in C$
 *   is mutually equal within `maxRelativeError` ($\max_{i,j \in C} \delta_{\text{rel}}(v_i, v_j) \le \text{maxRelativeError}$).
 * - `success: true` is returned **if and only if** the largest mutually-equal clique $C^*$ has size $|C^*| \ge K$
 *   (e.g., at least $4$ out of $5$ datapoints are mutually equal within $0.01\%$).
 *
 * @param {Array<(number|Array<number>|Object)>} datapoints - Input datapoints.
 * @param {Object} [options={}] - Quorum configuration options.
 * @param {number} [options.k=4] - Minimum number of mutually-equal datapoints required for success ($K$).
 * @param {number} [options.n=5] - Expected total number of independent sources ($N$).
 * @param {number} [options.maxRelativeError=0.0001] - Maximum relative error tolerance (`0.0001` = `0.01%`).
 * @param {number} [options.zeroFloor=1e-9] - Denominator floor near zero.
 * @param {boolean} [options.strictN=false] - When `true`, requires `datapoints.length === n` in addition to $|C^*| \ge k$.
 * @returns {Object} Quorum evaluation result with `success`, `consensusValue`, `maxRelativeError`, `agreeingSources`, and `outliers`.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKYDcCGAbArpuVARV1lzAQF8EAzGKCgIgAEBzAa1wGMwRUYAXgHpccENgDOjANzBgGHPkIkyYWUA|▶ Try it live in Instacode}
 */
export const evaluateQuorum = (
  datapoints = [],
  {
    k = QUORUM_DEFAULT_K,
    n = QUORUM_DEFAULT_N,
    maxRelativeError = QUORUM_MAX_RELATIVE_ERROR,
    zeroFloor = QUORUM_ZERO_FLOOR_EPSILON,
    strictN = false
  } = {}
) => {
  const requiredK = Math.max(1, Math.floor(Number(k) || QUORUM_DEFAULT_K));
  const expectedN = Math.max(requiredK, Math.floor(Number(n) || QUORUM_DEFAULT_N));
  const safeMaxRelErr =
    isFiniteScalar(maxRelativeError) && maxRelativeError >= 0
      ? maxRelativeError
      : QUORUM_MAX_RELATIVE_ERROR;

  const list = is(datapoints, Array) ? datapoints : [];
  const valid = [];

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const isEntryObj = is(item, Object) && !is(item, Array) && item !== null && 'value' in item;
    const rawVal = isEntryObj ? item.value : item;
    const source = isEntryObj && is(item.source || item.id, String)
      ? String(item.source || item.id)
      : `source-${idx + 1}`;

    if (isFiniteScalar(rawVal) || isNumericVector(rawVal)) {
      valid.push({
        index: idx,
        source,
        value: isNumericVector(rawVal) ? [...rawVal] : rawVal
      });
    }
  }

  const m = valid.length;
  const distMatrix = Array.from({ length: m }, () => new Array(m).fill(0));
  const adjMatrix = Array.from({ length: m }, () => new Array(m).fill(false));

  for (let i = 0; i < m; i++) {
    adjMatrix[i][i] = true;
    for (let j = i + 1; j < m; j++) {
      const d = computeRelativeError(valid[i].value, valid[j].value, { zeroFloor });
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
      const eq = d <= safeMaxRelErr + 1e-15;
      adjMatrix[i][j] = eq;
      adjMatrix[j][i] = eq;
    }
  }

  // Exact maximum clique search (with min internal spread tie-breaker)
  let bestClique = [];
  let bestSpread = Infinity;

  const computeCliqueSpread = (clique) => {
    let maxD = 0;
    for (let a = 0; a < clique.length; a++) {
      for (let b = a + 1; b < clique.length; b++) {
        const d = distMatrix[clique[a]][clique[b]];
        if (d > maxD) maxD = d;
      }
    }
    return maxD;
  };

  const searchClique = (startIdx, currentClique) => {
    if (currentClique.length + (m - startIdx) < bestClique.length) {
      return;
    }

    if (currentClique.length > 0) {
      const spread = computeCliqueSpread(currentClique);
      if (
        currentClique.length > bestClique.length ||
        (currentClique.length === bestClique.length && spread < bestSpread - 1e-15)
      ) {
        bestClique = [...currentClique];
        bestSpread = spread;
      }
    }

    for (let next = startIdx; next < m; next++) {
      let compatible = true;
      for (let c = 0; c < currentClique.length; c++) {
        if (!adjMatrix[currentClique[c]][next]) {
          compatible = false;
          break;
        }
      }
      if (compatible) {
        currentClique.push(next);
        searchClique(next + 1, currentClique);
        currentClique.pop();
      }
    }
  };

  if (m > 0) {
    searchClique(0, []);
  } else {
    bestSpread = 0;
  }

  const agreeingEntries = bestClique.map((idx) => valid[idx]);
  const agreeingValues = agreeingEntries.map((e) => e.value);
  const agreeingCount = agreeingEntries.length;
  const nConditionMet = strictN ? list.length === expectedN && m === expectedN : true;
  const success = Boolean(nConditionMet && agreeingCount >= requiredK);
  const consensusValue = success ? computeClusterConsensusValue(agreeingValues) : null;
  const referenceValue = consensusValue !== null
    ? consensusValue
    : computeClusterConsensusValue(agreeingValues);

  const bestSet = new Set(bestClique);
  const outliers = [];
  for (let i = 0; i < m; i++) {
    if (!bestSet.has(i)) {
      const relErr = referenceValue !== null
        ? computeRelativeError(valid[i].value, referenceValue, { zeroFloor })
        : Infinity;
      outliers.push({
        index: valid[i].index,
        source: valid[i].source,
        value: valid[i].value,
        relativeError: Number.isFinite(relErr) ? cleanFloat(relErr) : Infinity,
        relativeErrorPct: Number.isFinite(relErr) ? Number((relErr * 100).toFixed(6)) : Infinity
      });
    }
  }

  const safeSpread = Number.isFinite(bestSpread) ? cleanFloat(bestSpread) : 0;

  return {
    success,
    quorumReached: success,
    status: success
      ? agreeingCount >= expectedN
        ? 'OK_UNANIMOUS'
        : 'OK_QUORUM'
      : 'REJECTED_NO_QUORUM',
    consensusValue,
    agreeingCount,
    requiredK,
    expectedN,
    sampleCount: m,
    maxRelativeError: safeSpread,
    maxRelativeErrorPct: Number((safeSpread * 100).toFixed(6)),
    thresholdRelativeError: safeMaxRelErr,
    thresholdRelativeErrorPct: Number((safeMaxRelErr * 100).toFixed(4)),
    agreeingIndices: agreeingEntries.map((e) => e.index),
    agreeingSources: agreeingEntries.map((e) => e.source),
    agreeingValues,
    outliers
  };
};

/**
 * Convenience helper for the standard $4\text{-of-}5$ quorum check with $0.01\%$ (`0.0001`)
 * maximum relative error tolerance.
 *
 * @param {Array<(number|Array<number>|Object)>} datapoints - 5 source datapoints.
 * @param {Object} [options={}] - Optional overrides (`maxRelativeError`, `strictN`, `zeroFloor`).
 * @returns {Object} Quorum evaluation result.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKYDcCGAbArpuVARV1lzABYoAzAVgQF8FqYowEAiAAQHMBrXAGMwIVDABeAelxwQ2AM4cA3MGAYc+QiTKUatFUA|▶ Try it live in Instacode}
 */
export const evaluateQuorum4of5 = (datapoints = [], options = {}) =>
  evaluateQuorum(datapoints, {
    ...options,
    k: QUORUM_DEFAULT_K,
    n: QUORUM_DEFAULT_N
  });
