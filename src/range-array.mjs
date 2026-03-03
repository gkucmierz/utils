
// https://www.codewars.com/kata/57d83dfc950d842dcb00005b/train/javascript

/**
 * Converts a list of ranges into a flat array of numbers.
 * @param {Array<Array<number>>} ranges - An array of ranges, where each range is [min, max] or [min].
 * @returns {Array<number>} An array containing all numbers in the specified ranges.
 */
export const range2array = ranges => {
  return ranges.reduce((arr, range) => {
    const min = range[0];
    const max = range[1] ?? min;
    return arr.push(
      ...new Array(max - min + 1).fill(0).map((n ,i) => min + i)
    ), arr;
  }, []);
};

/**
 * Converts a sorted array of numbers into a list of ranges.
 * Consecutive numbers are grouped into a single range [min, max].
 * Isolated numbers are represented as [num, num].
 * @param {Array<number>} arr - The sorted array of numbers.
 * @returns {Array<Array<number>>} An array of ranges.
 */
export const array2range = arr => {
  const ranges = [];
  let last = arr[0];
  let begin = last;
  for (let i = 1; i <= arr.length; ++i) {
    const n = arr[i];
    if (n !== last + 1) {
      ranges.push([begin, last]);
      begin = n;
    }
    last = n;
  }
  return ranges;
};
