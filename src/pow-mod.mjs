
// implementation of power function with modulus like native python pow

const getPowMod = (ZERO, ONE, TWO, floor) => {
  return (base, exponent, modulus = null) => {
    if (modulus === null) return base ** exponent;
    if (modulus === ONE) return ZERO;
    let result = ONE;
    base = base % modulus;
    while (exponent > ZERO) {
      if (exponent % TWO === ONE) {
        result = (result * base) % modulus;
      }
      exponent = floor(exponent / TWO);
      base = (base * base) % modulus;
    }
    return result;
  };
};

/**
 * Calculates the power of a base to an exponent, optionally modulo a number.
 * Similar to Python's pow(base, exponent, modulus).
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @param {number} [modulus] - The optional modulus.
 * @returns {number} The result of (base ** exponent) % modulus.
 */
export const powMod = getPowMod(0, 1, 2, n => Math.floor(n));

/**
 * Calculates the power of a base to an exponent, optionally modulo a BigInt.
 * Similar to Python's pow(base, exponent, modulus).
 * @param {bigint} base - The base BigInt.
 * @param {bigint} exponent - The exponent BigInt.
 * @param {bigint} [modulus] - The optional modulus BigInt.
 * @returns {bigint} The result of (base ** exponent) % modulus.
 */
export const powModBI = getPowMod(0n, 1n, 2n, n => n);
