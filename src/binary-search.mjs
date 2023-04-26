
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
