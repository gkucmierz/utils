
// python like mod implementation

const getMod = ZERO => {
  return (dividend, divisor) => {
    if ((dividend < ZERO) ^ (divisor < ZERO)) {
      const res = -dividend % divisor;
      return res === ZERO ? ZERO : divisor - res;
    }
    return dividend % divisor;
  };
};

export const mod = getMod(0);
export const modBI = getMod(0n);
