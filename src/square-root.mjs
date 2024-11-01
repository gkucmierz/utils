

/**
 * Native square root
 * @function
 * @param {Number} number - js double number
 * @return {Number} result
 */
export const squareRoot = n => n ** 0.5;

/**
 * Calculate square root using Newton's formula
 * @function
 * @param {BigInt} number - big integer number
 * @return {BigInt} result
 */
export const squareRootBI = n => {
  if (n === 0n) return 0n;
  if (n < 4n) return 1n;
  if (n < 9n) return 2n;
  if (n < 16n) return 3n;
  let res = BigInt(n.toString().substr(0, n.toString().length / 2));
  let last;
  while (true) {
    last = res;
    res = (res + n / res) / 2n;
    const p = res * res;
    if (p === n) return res;
    if (last === res) return res;
    const next = p + res * 2n - 1n;
    if (n > next) return res;
  }
  return res;
};
