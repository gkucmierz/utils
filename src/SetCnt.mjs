/**
 * Set-like data structure built using Map with elements counter.
 * Allows adding multiple occurrences of the same element.
 */
export class SetCnt {
  #map = new Map();
  
  /**
   * Creates a new SetCnt instance.
   * @param {Iterable} [iter] - An iterable object to initialize the set with.
   */
  constructor(iter) {
    for (const el of iter ?? []) {
      this.add(el);
    }
  }

  /**
   * Adds an element to the set.
   * Increments the counter for the element.
   * @param {*} el - The element to add.
   * @returns {SetCnt} The SetCnt instance.
   */
  add(el) {
    const cnt = this.cnt(el);
    this.#map.set(el, cnt + 1);
    return this;
  }

  /**
   * Checks if an element exists in the set.
   * @param {*} el - The element to check.
   * @returns {boolean} True if the element exists, false otherwise.
   */
  has(el) {
    return this.#map.has(el);
  }

  /**
   * Removes one occurrence of an element from the set.
   * If the count reaches 0, the element is removed completely.
   * @param {*} el - The element to remove.
   * @returns {boolean} True if the element was removed (or count decremented), false if it didn't exist.
   */
  delete(el) {
    if (!this.#map.has(el)) return false;
    const cnt = this.cnt(el);
    if (cnt === 1) return this.deleteAll(el);
    this.#map.set(el, cnt - 1);
    return true;
  }
  
  /**
   * Removes all occurrences of an element from the set.
   * @param {*} el - The element to remove.
   * @returns {boolean} True if the element was removed, false otherwise.
   */
  deleteAll(el) {
    this.#map.delete(el);
    return true;
  }

  /**
   * Gets the number of occurrences of an element.
   * @param {*} el - The element to check.
   * @returns {number} The count of the element.
   */
  cnt(el) {
    return this.#map.get(el) ?? 0;
  }
  
  /**
   * Returns an iterator over the elements in the set.
   * Each element is yielded as many times as its count.
   * @returns {Iterator} An iterator over the elements.
   */
  *[Symbol.iterator]() {
    for (const el of this.#map) {
      yield el;
    }
  }

  /**
   * Returns the SetCnt instance itself (for compatibility with Map-like interfaces).
   * @returns {SetCnt} The SetCnt instance.
   */
  entries() {
    return this;
  }

  /**
   * Returns an iterator over the unique elements in the set.
   * @returns {Iterator} An iterator over the unique elements.
   */
  *values() {
    for (const [el, cnt] of this.#map) {
      yield el;
    }
  }

  /**
   * Returns an iterator over the counts of the elements.
   * @returns {Iterator} An iterator over the counts.
   */
  *keys() {
    for (const [el, cnt] of this.#map) {
      yield cnt;
    }
  }
}
