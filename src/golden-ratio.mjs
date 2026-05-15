import { squareRootBI } from './square-root.mjs';

/**
 * The standard float approximation of the Golden Ratio (phi).
 * @constant {number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOZQDYBMCmA7AJQEM4QoEBfBAMxijAQCIABVAawFcBjMEHGAF4B6DqQwBnRgG5gwdNnzFSUGUA|▶ Try it live in Instacode}
 */
export const goldenRatio = ((5 ** 0.5) + 1) / 2;

/**
 * Calculates the Golden Ratio (phi) to an arbitrary precision using BigInt.
 * 
 * @param {number|bigint} precision - The number of decimal places to calculate.
 * @returns {BigInt} A primitive BigInt representing the Golden Ratio scaled by 10^precision.
 * @throws {Error} If precision is negative.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOZQDYBMCmA7AJQEM4QoAhASQQF8EAzGKMBAIgAFUBrAVwGMwIHDABeAeh6kMAZ1YBuYMHTZ8xUhUoKgA|▶ Try it live in Instacode}
 */
export const goldenRatioBI = precision => {
  if (precision < 0) throw new Error('Precision cannot be negative');
  const p = BigInt(precision);
  const exp = 10n ** p;
  
  // (sqrt(5 * exp^2) + exp) / 2
  const result = (squareRootBI(5n * exp * exp) + exp) / 2n;
  return result;
};

/**
 * Calculates the Golden Ratio (phi) to an arbitrary precision and returns it as a formatted string.
 * @param {number|bigint} precision - The number of decimal places to calculate.
 * @returns {string} The formatted Golden Ratio string (e.g., '1.618...').
 * @throws {Error} If precision is negative.
 */
export const goldenRatioStr = precision => {
  if (precision < 0) throw new Error('Precision cannot be negative');
  const str = goldenRatioBI(precision).toString();
  if (precision === 0 || precision === 0n) return str;
  
  // The Golden Ratio is ~1.618, so the integer part is always '1'.
  // The length of str is exactly precision + 1.
  return str.slice(0, 1) + '.' + str.slice(1);
};
