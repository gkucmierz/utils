
/**
 * Creates a Min Heap data structure.
 * @param {Function} [valFn] - A function to extract the comparison value from an element.
 *                             Defaults to identity (n => n).
 * @returns {object} The Heap instance with methods.
 */
export const Heap = (valFn = n => n) => {
  const arr = [-1];

  const up = idx => {
    while (idx > 1) {
      const ni = idx / 2 | 0;
      if (valFn(arr[idx]) < valFn(arr[ni])) {
        [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
      }
      idx = ni;
    }
    return idx;
  };
  
  return {
    /**
     * Adds an element to the heap.
     * @param {*} el - The element to add.
     * @returns {number} The new index of the added element.
     */
    add: el => up(arr.push(el) - 1),

    /**
     * Removes and returns the minimum element (root) from the heap.
     * @returns {*} The minimum element.
     */
    take: () => {
      const len = arr.length;
      if (len <= 1) return [][0];
      let idx = 1;
      const res = arr[idx];
      while (idx < len) {
        const ia = idx * 2;
        const ib = idx * 2 + 1;
        if (ia >= len) break;
        if (ib >= len || valFn(arr[ia]) < valFn(arr[ib])) {
          arr[idx] = arr[ia];
          idx = ia;
        } else {
          arr[idx] = arr[ib];
          idx = ib;
        }
      }
      if (idx === arr.length - 1) {
        arr.pop();
      } else {
        arr[idx] = arr.pop();
        up(idx);
      }
      return res;
    },
    
    /**
     * Returns the number of elements in the heap.
     * @returns {number} The size of the heap.
     */
    size: () => arr.length - 1,

    /**
     * Returns the internal array representation of the heap (excluding the dummy first element).
     * @returns {Array} The heap elements.
     */
    data: () => arr.slice(1),
  };
};
