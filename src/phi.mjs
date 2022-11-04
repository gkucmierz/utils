
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

export const phi = getPhiEuler(factors);
export const phiBI = getPhiEuler(factorsBI);

// export const phi = getPhi(1, 2, gcd);
// export const phiBI = getPhi(1n, 2n, gcdBI);
