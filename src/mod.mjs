
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
 * Calculates the modulo of two numbers (Python-like behavior for negative numbers).
 * @param {number} dividend - The dividend.
 * @param {number} divisor - The divisor.
 * @returns {number} The result of the modulo operation.
 */
export const mod = getMod(0);

/**
 * Calculates the modulo of two BigInts (Python-like behavior for negative numbers).
 * @param {bigint} dividend - The dividend.
 * @param {bigint} divisor - The divisor.
 * @returns {bigint} The result of the modulo operation.
 */
export const modBI = getMod(0n);
