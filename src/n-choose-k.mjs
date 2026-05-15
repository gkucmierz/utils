/**
 * Newton's formula (Binomial Coefficient) n choose k.
 * Evaluates the number of possible combinations.
 * Built strictly on BigInt and optimized iterative fraction reduction 
 * to prevent RAM and precision loss during massive factorial expansions.
 * 
 * @param {number|bigint|string} n Total elements
 * @param {number|bigint|string} k Elements to pick
 * @returns {bigint} Total possible subset combinations
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYGEAWUoGcCmA0ggL4IBmMUYCARAAIDmA1gK4DGYI+MAXgPSs4IADa5aAbmDAM2PESlA|▶ Try it live in Instacode}
 */
export const nChooseK = (n, k) => {
  const bigN = BigInt(n);
  const bigK = BigInt(k);
  
  if (bigK < 0n || bigK > bigN) return 0n;
  if (bigK === 0n || bigK === bigN) return 1n;

  // Optimization: dynamically reduce the factorial expansion
  // equivalent to (n! / (k! * (n-k)!)), shrinking the multiplication loops.
  const kMin = bigK > (bigN - bigK) ? (bigN - bigK) : bigK;

  let numerator = 1n;
  let denominator = 1n;

  for (let i = 1n; i <= kMin; ++i) {
    numerator *= (bigN - i + 1n);
    denominator *= i;
  }
  
  return numerator / denominator;
};
