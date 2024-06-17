
// binary search array exact element
// in sorted array
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

// binary search array less or equal element
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

// binary search array greater or equal element
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

// binary search for range of elements in array inclusive
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
