
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
 * Calculate GCD - Greatest Common Divisor
 * @method
 * @param {Number} Natural number
 * @return {Number} GCD
 */
export const gcd = getGCD(0);

/**
 * Calculate GCD - Greatest Common Divisor (BigInt version)
 * @method
 * @param {BigInt} Natural BigInt number
 * @return {BigInt} GCD
 */
export const gcdBI = getGCD(0n);
