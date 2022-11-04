
import {
  gcd,
  gcdBI,
} from './gcd.mjs';

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

export const phi = getPhi(1, 2, gcd);
export const phiBI = getPhi(1n, 2n, gcdBI);
