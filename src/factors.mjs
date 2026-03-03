
/**
 * Calculates the prime factorization of a number.
 * @param {number} n - The number to factorize.
 * @returns {number[]} An array of prime factors.
 */
export const factors = n => {
  if (n < 2) return [];
  const res = [];
  let max = Math.floor(Math.sqrt(n));
  for (let i = 2; i <= max; ++i) {
    if (n % i === 0) {
      res.push(i);
      n /= i;
      max = Math.floor(Math.sqrt(n));
      i = (Math.min(...res) || 2) - 1;
    }
  }
  res.push(n);
  return res;
};

/**
 * Calculates the prime factorization of a BigInt.
 * @param {bigint} n - The BigInt to factorize.
 * @returns {bigint[]} An array of prime factors as BigInts.
 */
export const factorsBI = n => {
  if (n < 2n) return [];
  const res = [];
  for (let i = 2n; i * i <= n; ++i) {
    if (n % i === 0n) {
      res.push(i);
      n /= i;
      i = 1n;
    }
  }
  res.push(n);
  return res;
};
