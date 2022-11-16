

export const squareRoot = n => n ** 0.5;

// Newrton's formula
export const squareRootBI = n => {
  let res = BigInt(n.toString().substr(0, n.toString().length / 2));
  let last;
  while (res * res - n !== 0n) {
    last = res;
    res = (res + n / res) / 2n;
    if (res === last) return res;
  }
  return res;
};
