
// Generalized pentagonal numbers
// https://oeis.org/A001318

const getGpn = (zero, one, two, three) => {
  const gk = k => k * (three * k - one) / two;
  return n => {
    const m = (n + one) / two | zero;
    return n % two === zero ? gk(-m) : gk(m);
  };
};

/**
 * Generalized Pentagonal Numbers (GPN).
 * Formula: P_k = k(3k - 1) / 2
 * The sequence includes k = 0, 1, -1, 2, -2, 3, -3...
 * https://oeis.org/A001318
 * @param {number} n - The index of the sequence (0-based).
 * @returns {number} The n-th generalized pentagonal number.
 */
export const gpn = getGpn(0, 1, 2, 3);

/**
 * Generalized Pentagonal Numbers (GPN) - BigInt version.
 * @param {bigint} n - The index of the sequence (0-based).
 * @returns {bigint} The n-th generalized pentagonal number.
 */
export const gpnBI = getGpn(0n, 1n, 2n, 3n);
