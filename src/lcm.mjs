
import {
  gcd,
  gcdBI,
} from './gcd.mjs';

// Least common multiple

const getLcm = gcd => {
  return (a, b) => a * b / gcd(a, b);
}

/**
 * Calculates the Least Common Multiple (LCM) of two numbers.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The LCM of a and b.
 */
export const lcm = getLcm(gcd);

/**
 * Calculates the Least Common Multiple (LCM) of two BigInts.
 * @param {bigint} a - The first BigInt.
 * @param {bigint} b - The second BigInt.
 * @returns {bigint} The LCM of a and b.
 */
export const lcmBI = getLcm(gcdBI);
