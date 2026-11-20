/**
 * @module statistics
 */

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

const toFiniteNumbers = (values) => {
  if (!values || !values[Symbol.iterator]) return [];
  const arr = [];
  for (const v of values) {
    const n = Number(v);
    if (Number.isFinite(n)) arr.push(n);
  }
  return arr;
};

/**
 * Evaluates the exact Gaussian (Normal) probability density function at `x`:
 * f(x) = (1 / (sigma * sqrt(2 * pi))) * exp(-0.5 * ((x - mean) / sigma)^2).
 * @param {number} x - Evaluation coordinate
 * @param {number} [meanVal=0] - Distribution mean (mu)
 * @param {number} [sigma=1] - Standard deviation (sigma > 0)
 * @returns {number} Probability density f(x)
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOYEMCuBnbCC+CAZjFGAgEQACqA1pgMZggCmMAXgPSZwgA22CgG5gwDDmwigA|▶ Try it live in Instacode}
 */
export const gauss = (x, meanVal = 0, sigma = 1) => {
  const s = Number(sigma);
  if (!Number.isFinite(s) || s <= 0) {
    throw new RangeError('gauss requires a positive finite sigma');
  }
  const z = (Number(x) - Number(meanVal)) / s;
  return Math.exp(-0.5 * z * z) / (s * SQRT_TWO_PI);
};

/**
 * Computes the arithmetic mean of all finite numbers in an Iterable.
 * @param {Iterable<number>} values - Numeric sequence
 * @returns {number} Arithmetic mean, or `NaN` if empty
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAUwIYDsEF8EBmMUYCARAAIDmA1gK4DGYIaMAXgPR1wgA2AzmQDcwYOmwigA|▶ Try it live in Instacode}
 */
export const mean = (values) => {
  const nums = toFiniteNumbers(values);
  if (nums.length === 0) return NaN;
  let sum = 0;
  for (let i = 0; i < nums.length; i += 1) {
    sum += nums[i];
  }
  return sum / nums.length;
};

/**
 * Computes the exact median of all finite numbers in an Iterable without mutating the input.
 * @param {Iterable<number>} values - Numeric sequence
 * @returns {number} Median value, or `NaN` if empty
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LAUwCYgIYDsEC+CAZjFGAgEQACA5gNYCuAxmCGjAF4D0jcIAGwDOlANzBg6LHnFA|▶ Try it live in Instacode}
 */
export const median = (values) => {
  const nums = toFiniteNumbers(values);
  if (nums.length === 0) return NaN;
  nums.sort((a, b) => a - b);
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 1 ? nums[mid] : 0.5 * (nums[mid - 1] + nums[mid]);
};

/**
 * Computes the variance (population sigma^2 by default, or Bessel-corrected sample s^2 when `sample = true`).
 * @param {Iterable<number>} values - Numeric sequence
 * @param {boolean} [sample=false] - Whether to divide by `n - 1` instead of `n`
 * @returns {number} Variance, or `NaN` if insufficient elements
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IG4EMYnQOwMYCmCAvggGYxRgIBEAAgOYDWArnmCATAF4D0LcEABsAzjQDcwYBiy5CkoA|▶ Try it live in Instacode}
 */
export const variance = (values, sample = false) => {
  const nums = toFiniteNumbers(values);
  const denom = sample ? nums.length - 1 : nums.length;
  if (denom <= 0) return NaN;
  const mu = mean(nums);
  let sumSq = 0;
  for (let i = 0; i < nums.length; i += 1) {
    const diff = nums[i] - mu;
    sumSq += diff * diff;
  }
  return sumSq / denom;
};

/**
 * Computes the standard deviation (population sigma by default, or sample s when `sample = true`).
 * @param {Iterable<number>} values - Numeric sequence
 * @param {boolean} [sample=false] - Whether to use Bessel's `n - 1` sample correction
 * @returns {number} Standard deviation, or `NaN` if insufficient elements
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM5wCYIL4IGYxRgIBEAAgOYDWArgMZggCmMAXgPQ1wgA2qJAbmDB0GIUA|▶ Try it live in Instacode}
 */
export const std = (values, sample = false) => {
  const v = variance(values, sample);
  return Number.isNaN(v) ? NaN : Math.sqrt(v);
};

/**
 * Computes the Mean Absolute Deviation (MAD = (1 / n) * sum |x_i - mean|) of a numeric sequence.
 * @param {Iterable<number>} values - Numeric sequence
 * @returns {number} Mean absolute deviation from the arithmetic mean, or `NaN` if empty
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYFMBuCC+CBmMUYCARAAIDmA1gK4DGYI6MAXgPS1wgA2AzqQDcwYBkzCgA|▶ Try it live in Instacode}
 */
export const dev = (values) => {
  const nums = toFiniteNumbers(values);
  if (nums.length === 0) return NaN;
  const mu = mean(nums);
  let sumAbs = 0;
  for (let i = 0; i < nums.length; i += 1) {
    sumAbs += Math.abs(nums[i] - mu);
  }
  return sumAbs / nums.length;
};
