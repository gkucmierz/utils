/**
 * @module data-structures
 */

/**
 * High-performance, LIFO (Last-In-First-Out) Stack data structure.
 * Encapsulates an internal private array (#items) to prevent index tampering
 * and optimize V8 memory locality and fast push/pop operations.
 */
export class Stack {
  #items = [];

  /**
   * Creates a new Stack instance.
   * @param {Iterable} [iter] - An optional iterable object to initialize the stack with.
   */
  constructor(iter) {
    for (const el of iter ?? []) {
      this.push(el);
    }
  }

  /**
   * Pushes one or more items onto the top of the stack.
   * @param {...*} items - Elements to push onto the stack.
   * @returns {Stack} The Stack instance for fluent method chaining.
   */
  push(...items) {
    this.#items.push(...items);
    return this;
  }

  /**
   * Removes and returns the item from the top of the stack.
   * @returns {*|undefined} The top item, or undefined if the stack is empty.
   */
  pop() {
    return this.#items.pop();
  }

  /**
   * Returns the item from the top of the stack without removing it.
   * @returns {*|undefined} The top item, or undefined if the stack is empty.
   */
  peek() {
    return this.#items[this.#items.length - 1];
  }

  /**
   * Checks whether the stack is empty.
   * @returns {boolean} True if the stack contains no items, false otherwise.
   */
  isEmpty() {
    return this.#items.length === 0;
  }

  /**
   * Gets the number of items currently in the stack.
   * @returns {number} The number of items in the stack.
   */
  get size() {
    return this.#items.length;
  }

  /**
   * Gets the number of items currently in the stack (Array length compatibility alias).
   * @returns {number} The number of items in the stack.
   */
  get length() {
    return this.#items.length;
  }

  /**
   * Removes all items from the stack.
   * @returns {Stack} The Stack instance for fluent method chaining.
   */
  clear() {
    this.#items.length = 0;
    return this;
  }

  /**
   * Returns a shallow copy of the stack items as an Array from bottom to top.
   * @returns {Array} Array of items from bottom to top.
   */
  toArray() {
    return [...this.#items];
  }

  /**
   * Iterates through stack items from top to bottom (LIFO order).
   * @returns {Iterator}
   */
  *[Symbol.iterator]() {
    for (let i = this.#items.length - 1; i >= 0; i--) {
      yield this.#items[i];
    }
  }
}
