
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

export const powMod = getPowMod(0, 1, 2, n => Math.floor(n));

export const powModBI = getPowMod(0n, 1n, 2n, n => n);
