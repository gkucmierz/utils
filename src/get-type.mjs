
/**
 * Returns the type of the value as a lowercase string.
 * More specific than the typeof operator (e.g., distinguishes 'array', 'null', 'date').
 * @param {*} val - The value to check.
 * @returns {string} The type of the value.
 */
export const getType = val => {
  const str = Object.prototype.toString.call(val);
  return str.slice(8, -1).toLowerCase();
};
