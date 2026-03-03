
const getGCD = ZERO => {
  return (a, b) => {
    if (a < ZERO) a = -a;
    if (b < ZERO) b = -b;
    if (b > a) {
      [a, b] = [b, a];
    }
    while (true) {
      if (b === ZERO) return a;
      a %= b;
      if (a === ZERO) return b;
      b %= a;
    }
  };
};

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The GCD of a and b.
 */
export const gcd = getGCD(0);

/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInts.
 * @param {bigint} a - The first BigInt.
 * @param {bigint} b - The second BigInt.
 * @returns {bigint} The GCD of a and b.
 */
export const gcdBI = getGCD(0n);
