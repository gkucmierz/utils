
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

export const gcd = getGCD(0);
export const gcdBI = getGCD(0n);
