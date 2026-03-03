

/**
 * Calculates the square root of a number.
 * @param {number} n - The number to calculate the square root of.
 * @returns {number} The square root of n.
 */
export const squareRoot = n => n ** 0.5;

/**
 * Calculates the integer square root of a BigInt using Newton's method.
 * @param {bigint} n - The BigInt to calculate the square root of.
 * @returns {bigint} The integer square root of n.
 */
export const squareRootBI = n => {
  if (n === 0n) return 0n;
  if (n < 4n) return 1n;
  if (n < 9n) return 2n;
  if (n < 16n) return 3n;
  let res = BigInt(n.toString().substr(0, n.toString().length / 2));
  let last;
  while (true) {
    last = res;
    res = (res + n / res) / 2n;
    const p = res * res;
    if (p === n) return res;
    if (last === res) return res;
    const next = p + res * 2n - 1n;
    if (n > next) return res;
  }
  return res;
};
