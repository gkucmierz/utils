/**
 * Creates a permutations generator from a specified size or an array of elements.
 * 
 * @param {number|Array} sizeOrArr Integer size or an array of items
 * @yields {Array} Re-arranged array of items/indices
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IgUxmArnAhnEKAOwGcBJODfWBAXwQDMYowEAiAAQHMBrLAYzAgMALwD0OEABsSbANzBg6TDnyFSFKnFgKgA|▶ Try it live in Instacode}
 */
export const permutationsIterator = function*(sizeOrArr) {
  const arr = Array.isArray(sizeOrArr) ? [...sizeOrArr] : new Array(sizeOrArr).fill(0).map((_, i) => i);
  const size = arr.length;

  const gen = function*(res, used, shift) {
    const len = size - used;
    if (len === 0) {
      yield res;
      return;
    }
    for (let i = 0; i < len; ++i) {
      yield* gen([...res, shift[i]], used + 1, [...shift.slice(0, i), ...shift.slice(i + 1)]);
    }
  };

  yield* gen([], 0, arr);
};

/**
 * Returns all permutations synchronously.
 * WARNING: Generates size! (factorial) elements. Scales in O(N!). 
 * 
 * @param {number|Array} sizeOrArr 
 * @returns {Array<Array>} Array of permutation sets
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IgUxmArnAhnEKAOwGcEBfBAMxijAQCIABAcwGssBjMEDALwD0OEABsSDANzBg6TDnyFSUoA|▶ Try it live in Instacode}
 */
export const permutations = (sizeOrArr) => {
  return [...permutationsIterator(sizeOrArr)];
};
