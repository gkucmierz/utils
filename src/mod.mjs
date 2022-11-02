
// python like mod implementation

const getMod = ZERO => {
  return (dividend, divisor) => {
    if ((dividend < ZERO) ^ (divisor < ZERO)) {
      return divisor - (-dividend % divisor);
    }
    return dividend % divisor;
  };
};

export const mod = getMod(0);
export const modBI = getMod(0n);
