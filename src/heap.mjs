/**
 * Creates a Min Heap data structure.
 * Implemented as a ES6 Class to fix prototyping documentation 
 * and properly encapsulate internal mechanics.
 */
export class Heap {
  #arr = [-1];
  #valFn;

  /**
   * Initializes the Heap class object.
   * @param {Function} [valFn] - A function to extract the comparison value from an element. Defaults to identity (n => n).
   */
  constructor(valFn = n => n) {
    this.#valFn = valFn;
  }

  #up(idx) {
    while (idx > 1) {
      const ni = idx / 2 | 0;
      if (this.#valFn(this.#arr[idx]) < this.#valFn(this.#arr[ni])) {
        [this.#arr[idx], this.#arr[ni]] = [this.#arr[ni], this.#arr[idx]];
      }
      idx = ni;
    }
    return idx;
  }

  /**
   * Adds an element to the heap.
   * @param {*} el - The element to add.
   * @returns {number} The new index of the added element.
   */
  add(el) {
    return this.#up(this.#arr.push(el) - 1);
  }

  /**
   * Removes and returns the minimum element (root) from the heap.
   * @returns {*} The minimum element.
   */
  take() {
    const len = this.#arr.length;
    if (len <= 1) return [][0];
    let idx = 1;
    const res = this.#arr[idx];
    while (idx < len) {
      const ia = idx * 2;
      const ib = idx * 2 + 1;
      if (ia >= len) break;
      if (ib >= len || this.#valFn(this.#arr[ia]) < this.#valFn(this.#arr[ib])) {
        this.#arr[idx] = this.#arr[ia];
        idx = ia;
      } else {
        this.#arr[idx] = this.#arr[ib];
        idx = ib;
      }
    }
    if (idx === this.#arr.length - 1) {
      this.#arr.pop();
    } else {
      this.#arr[idx] = this.#arr.pop();
      this.#up(idx);
    }
    return res;
  }

  /**
   * Returns the number of elements in the heap.
   * @returns {number} The size of the heap.
   */
  size() {
    return this.#arr.length - 1;
  }

  /**
   * Returns the internal array representation of the heap (excluding the dummy first element).
   * @returns {Array} The heap elements.
   */
  data() {
    return this.#arr.slice(1);
  }
}
