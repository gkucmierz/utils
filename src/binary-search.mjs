
/**
 * Performs a binary search for an exact element in a sorted array.
 * @param {Array<number>} arr - The sorted array to search in.
 * @param {number} target - The element to search for.
 * @returns {number} The index of the element if found, otherwise -1.
 */
export const binarySearchArr = (arr, target) => {
  let [a, b] = [0, arr.length];
  let lm;
  while (b - a > 0) {
    const mid = (a + b) / 2 | 0;
    const val = arr[mid];
    if (target < val) {
      b = mid;
    } else if (val < target) {
      a = mid;
    } else {
      return mid;
    }
    if (lm === mid) break;
    lm = mid;
  }
  return -1;
};

/**
 * Performs a binary search for the largest element less than or equal to the target.
 * @param {Array<number>} arr - The sorted array to search in.
 * @param {number} target - The target value.
 * @returns {number} The index of the found element.
 */
export const binarySearchLE = (arr, target) => {
  let [a, b] = [0, arr.length];
  let lm;
  while (b - a > 0) {
    const mid = (a + b) / 2 | 0;
    const val = arr[mid];
    if (target < val) {
      b = mid;
    } else if (val <= target) {
      a = mid;
    }
    if (lm === mid) return mid;
    lm = mid;
  }
  return -1;
};

/**
 * Performs a binary search for the smallest element greater than or equal to the target.
 * @param {Array<number>} arr - The sorted array to search in.
 * @param {number} target - The target value.
 * @returns {number} The index of the found element.
 */
export const binarySearchGE = (arr, target) => {
  let [a, b] = [0, arr.length];
  let lm;
  while (b - a > 0) {
    const mid = (a + b) / 2 | 0;
    const val = arr[mid];
    if (target > val) {
      a = mid;
    } else if (val >= target) {
      b = mid;
    }
    if (lm === mid) return mid + 1;
    lm = mid;
  }
  return 0;
};

/**
 * Performs a binary search for a range of elements inclusive of the target.
 * Uses binarySearchGE and binarySearchLE.
 * @param {Array<number>} arr - The sorted array to search in.
 * @param {number} target - The target value.
 * @returns {Array<number>} An array containing the start and end indices of the range [start, end].
 */
export const binarySearchRangeIncl = (arr, target) => {
  return [
    binarySearchGE(arr, target),
    binarySearchLE(arr, target),
  ];
};

// binary search array less element
const binarySearchL = (arr, target) => {
  let [a, b] = [0, arr.length];
  let lm;
  while (b - a > 0) {
    const mid = (a + b) / 2 | 0;
    const val = arr[mid];
    if (target <= val) {
      b = mid;
    } else if (val < target) {
      a = mid;
    }
    if (lm === mid) return mid;
    lm = mid;
  }
  return -1;
};

// binary search array greater element
const binarySearchG = (arr, target) => {
  let [a, b] = [0, arr.length];
  let lm;
  while (b - a > 0) {
    const mid = (a + b) / 2 | 0;
    const val = arr[mid];
    if (target >= val) {
      a = mid;
    } else if (val > target) {
      b = mid;
    }
    if (lm === mid) return mid + 1;
    lm = mid;
  }
  return 0;
};
