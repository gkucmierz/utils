/**
 * @module number-theory
 */

import { factors, factorsBI } from './factors.mjs';

/**
 * Calculates the Mobius function μ(n) of a number.
 * @param {number} n - A positive integer.
 * @returns {number} The Mobius function value (1, -1, or 0).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LFARiArgZwQXwQDMYowEAiAAQHMBrLAYzBAFMYAvAeizhABscFANzBgaTLlFA|▶ Try it live in Instacode}
 */
export const mobius = n => {
  if (n < 1) return 0;
  if (n === 1) return 1;
  const f = factors(n);
  const unique = new Set(f);
  if (unique.size !== f.length) return 0;
  return f.length % 2 === 0 ? 1 : -1;
};

/**
 * Calculates the Mobius function μ(n) of a BigInt.
 * @param {bigint} n - A positive BigInt.
 * @returns {number} The Mobius function value (1, -1, or 0).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4LFARiArgZwEICSCAvggGYxRgIBEAAgOYDWWAxmCAKYwBeA9FjggANjhoBuYMDSZchSUA|▶ Try it live in Instacode}
 */
export const mobiusBI = n => {
  if (n < 1n) return 0;
  if (n === 1n) return 1;
  const f = factorsBI(n);
  const unique = new Set(f);
  if (unique.size !== f.length) return 0;
  return f.length % 2 === 0 ? 1 : -1;
};
