/**
 * @module developer-utils
 */

/**
 * Robust, highly-optimized type detection, introspection, and comparison system.
 */
export class Type {
  // 1. Bottom values & Primitives
  static UNDEFINED = 'undefined';
  static NULL = 'null';
  static BOOLEAN = 'boolean';
  static NUMBER = 'number';
  static NAN = 'nan';
  static BIGINT = 'bigint';
  static STRING = 'string';
  static SYMBOL = 'symbol';

  // 2. Core Objects & Callables
  static OBJECT = 'object';
  static ARRAY = 'array';
  static FUNCTION = 'function';

  // 3. Standard Built-ins
  static DATE = 'date';
  static REGEXP = 'regexp';
  static ERROR = 'error';
  static PROMISE = 'promise';

  // 4. Collections
  static MAP = 'map';
  static SET = 'set';
  static WEAKMAP = 'weakmap';
  static WEAKSET = 'weakset';
  static WEAKREF = 'weakref';

  /**
   * Returns the canonical runtime type of any value as a lowercase string.
   * Differentiates NaN ('nan') from valid numbers ('number'), distinguishes 'array', 'null', 'date', etc.
   * @param {*} val - Value to check.
   * @returns {string} The canonical type string.
   */
  static of(val) {
    if (Number.isNaN(val)) return Type.NAN;
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  }

  /**
   * Checks if a value matches an expected type (by string constant, Constructor, or union array).
   * @param {*} val - Value to check.
   * @param {string|Function|Array<string|Function>} expected - Expected type, constructor, or union array.
   * @returns {boolean}
   */
  static is(val, expected) {
    if (Array.isArray(expected)) {
      return expected.some(exp => Type.is(val, exp));
    }
    if (typeof expected === 'function') {
      if (expected === Number) return typeof val === 'number' && !Number.isNaN(val);
      if (expected === Boolean) return typeof val === 'boolean' || val instanceof Boolean;
      if (expected === String) return typeof val === 'string' || val instanceof String;
      if (expected === BigInt) return typeof val === 'bigint' || (typeof Object(val) === 'object' && val instanceof BigInt);
      if (expected === Symbol) return typeof val === 'symbol' || (typeof Object(val) === 'object' && val instanceof Symbol);
      if (expected === Array) return Array.isArray(val);
      if (expected === Function) return typeof val === 'function';
      if (expected === Object) return val !== null && (typeof val === 'object' || typeof val === 'function');
      return val instanceof expected;
    }
    return Type.of(val) === expected;
  }

  /**
   * Compares whether two values have the exact same canonical type.
   * Safely prevents JavaScript traps like typeof NaN === typeof 42 or typeof null === typeof {}.
   * @param {*} a - First value.
   * @param {*} b - Second value.
   * @returns {boolean} True if both values share the same type.
   */
  static same(a, b) {
    return Type.of(a) === Type.of(b);
  }
}

/**
 * Alias for the {@link Type} class.
 */
export const Types = Type;

/**
 * Checks if a value matches an expected type.
 * @see {@link Type.is}
 */
export const is = Type.is;

/**
 * Returns the canonical runtime type of any value.
 * @see {@link Type.of}
 */
export const of = Type.of;

/**
 * Compares whether two values have the exact same canonical type.
 * @see {@link Type.same}
 */
export const same = Type.same;

