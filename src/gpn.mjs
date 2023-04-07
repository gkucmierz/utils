
// Generalized pentagonal numbers
// https://oeis.org/A001318

const getGpn = (zero, one, two, three) => {
  const gk = k => k * (three * k - one) / two;
  return n => {
    const m = (n + one) / two | zero;
    return n % two === zero ? gk(-m) : gk(m);
  };
};

export const gpn = getGpn(0, 1, 2, 3);
export const gpnBI = getGpn(0n, 1n, 2n, 3n);
