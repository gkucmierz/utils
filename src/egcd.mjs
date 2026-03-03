
/**
 * Extended Euclidean Algorithm.
 * Computes the greatest common divisor (GCD) of a and b,
 * and the coefficients of Bézout's identity.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number[]} An array [gcd, x, y] such that ax + by = gcd.
 */
export const egcd = (a, b) => {
  let [x, y] = [0, 1];
  let [u, v] = [1, 0];
  while (a !== 0) {
    const [q, r] = [b/a | 0, b%a];
    const [m, n] = [x - u * q, y - v * q];
    [b, a, x, y, u, v] = [a, r, u, v, m, n];
  }
  return [b, x, y];
};
