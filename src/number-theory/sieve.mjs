/**
 * @module number-theory
 */

/**
 * Sieve of Eratosthenes backed by a compact Int8Array buffer.
 * Generates primes strictly below `max` in O(max log log max) time.
 *
 * @param {number} [max=100000] - Exclusive upper bound for the sieve.
 * @returns {{ isPrime: (n: number) => boolean, getPrimes: (limit?: number) => number[] }}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMogKYDcMIL4IBmMUYCARAAIDmA1gK4DGYmMAXgPT1wgA2AzuQDcwYOmwYRQA|▶ Try it live in Instacode}
 */
export const Sieve = (max = 100e3) => {
  const bound = Math.max(3, Math.trunc(Number(max) || 100e3));
  const root = Math.floor(Math.sqrt(bound));
  const notPrime = new Int8Array(bound);
  notPrime[0] = 1;
  notPrime[1] = 1;

  for (let i = 2; i <= root; i += 1) {
    if (notPrime[i] === 0) {
      for (let j = i * i; j < bound; j += i) {
        notPrime[j] = 1;
      }
    }
  }

  return {
    isPrime: (n) => {
      const k = Math.trunc(Number(n));
      return k >= 2 && k < bound && notPrime[k] === 0;
    },
    getPrimes: (limit = bound) => {
      const cap = Math.min(bound, Math.max(0, Math.trunc(Number(limit) || 0)));
      const res = [];
      for (let i = 2; i < cap; i += 1) {
        if (notPrime[i] === 0) {
          res.push(i);
        }
      }
      return res;
    },
  };
};

/**
 * Generates the first `count` consecutive prime numbers [2, 3, 5, 7, 11, ...]
 * dynamically using Rosser's upper bound and the Sieve of Eratosthenes.
 *
 * @param {number} count - Number of consecutive primes to return.
 * @returns {number[]} Array of the first `count` prime numbers.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IGYhgZzgBRuAU0wQF80YowEAiAAQHMBrAVwGMwQCYAvAembggANpmoBuYMHRZc+MEQlA|▶ Try it live in Instacode}
 */
export const firstPrimes = (count) => {
  const k = Math.max(0, Math.trunc(Number(count) || 0));
  if (k === 0) return [];
  const upperBound =
    k < 6
      ? 16
      : Math.ceil(k * (Math.log(k) + Math.log(Math.log(k)))) + 16;
  return Sieve(upperBound).getPrimes(upperBound).slice(0, k);
};
