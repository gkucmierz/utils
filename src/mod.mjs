
const getMod = ZERO => {
  return (dividend, divisor) => {
    if ((dividend < ZERO) ^ (divisor < ZERO)) {
      const res = -dividend % divisor;
      return res === ZERO ? ZERO : divisor - res;
    }
    return dividend % divisor;
  };
};

/**
 * Python like modulo implementation.
 * It behaves different than JavaScript %
 * with negative values
 * @method
 * @param {Number} Dividend
 * @param {Number} Divisor
 * @return {Number} Modulus
 */
export const mod = getMod(0);

/**
 * Python like modulo implementation.
 * It behaves different than JavaScript %
 * with negative values
 * @method
 * @param {BigInt} Dividend
 * @param {BigInt} Divisor
 * @return {BigInt} Modulus
 */
export const modBI = getMod(0n);
