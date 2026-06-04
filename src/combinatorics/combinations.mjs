/**
 * Generates all possible combinations of size n from a set of size k without repetition.
 * Yields arrays of indices representing the current combination.
 * 
 * Optimized with lexicographic progression to skip invalid states, 
 * running in O(1) amortized time per sequence instead of O(k^n).
 *
 * @param {number} n Size of the combination
 * @param {number} k Size of the set to choose from (indices 0 to k-1)
 * @yields {number[]} Array of indices
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZTAIxAOwIZwhQ4DOAknAKYwGwIC+CAZjBggEQACA5gNYCuqMCGoAvAPT9CAGxLsA3MGDosuAkVIVqtGIqA|▶ Try it live in Instacode}
 */
export const combinationsIterator = function* (n, k) {
  if (n > k || n < 0) return;
  const arr = new Array(n).fill(0).map((_, i) => i);
  yield arr.slice();
  
  while (true) {
    let i = n - 1;
    while (i >= 0 && arr[i] === k - n + i) {
      i--;
    }
    if (i < 0) break;
    arr[i]++;
    for (let j = i + 1; j < n; j++) {
      arr[j] = arr[j - 1] + 1;
    }
    yield arr.slice();
  }
};

/**
 * Returns all combinations synchronously.
 * WARNING: Calling this with mathematically large sets will overflow local RAM.
 * 
 * @param {number} n Size of the combination
 * @param {number} k Size of the set
 * @returns {Array<number[]>} Array containing all combinations
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZTAIxAOwIZwhQ4DOCAvggGYwYIBEAAgOYDWArqmCAKYwBeAenaEANiXoBuYMHRZcBIqWlA|▶ Try it live in Instacode}
 */
export const combinations = (n, k) => {
  return [...combinationsIterator(n, k)];
};
