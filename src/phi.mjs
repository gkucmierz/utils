
import {
  gcd,
  gcdBI,
} from './gcd.mjs';

import {
  factors,
  factorsBI,
} from './factors.mjs';

// Euler's Totient Function

const getPhi = (ONE, TWO, gcd) => {
  return n => {
    let result = ONE;
    for (let i = TWO; i < n; ++i) {
      if (gcd(i, n) === ONE) {
        result++;
      }
    }
    return result;
  };
}

// Eulers formula

const getPhiEuler = factors => {
  return n => {
    return [...new Set(factors(n))].reduce((res, f) => res - res / f, n);
  };
};

/**
 * Euler's Totient Function (Phi).
 * Counts the positive integers less than or equal to n that are relatively prime to n.
 * Uses Euler's product formula based on prime factorization.
 * @param {number} n - The number to calculate phi for.
 * @returns {number} The value of phi(n).
 */
export const phi = getPhiEuler(factors);

/**
 * Euler's Totient Function (Phi) - BigInt version.
 * @param {bigint} n - The BigInt to calculate phi for.
 * @returns {bigint} The value of phi(n).
 */
export const phiBI = getPhiEuler(factorsBI);

// export const phi = getPhi(1, 2, gcd);
// export const phiBI = getPhi(1n, 2n, gcdBI);
