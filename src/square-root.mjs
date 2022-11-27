

export const squareRoot = n => n ** 0.5;

// Newrton's formula
export const squareRootBI = n => {
  if (n === 0n) return 0n;
  if (n < 4n) return 1n;
  let res = n > 10n ? BigInt(n.toString().substr(0, n.toString().length / 2)) : 1n;
  let last;
  while (res * res - n !== 0n) {
    last = res;
    res = (res + n / res) / 2n;
    if (res === last) return res;
  }
  return res;
};
