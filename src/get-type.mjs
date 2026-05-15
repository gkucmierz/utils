
/**
 * Returns the type of the value as a lowercase string.
 * More specific than the typeof operator (e.g., distinguishes 'array', 'null', 'date').
 * @param {*} val - The value to check.
 * @returns {string} The type of the value.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOYFM4BUCeF0IC+CAZjFGAgEQACqA1gK4DGYI6MAXgPSNwgAbAM5UA3MGAZsedOKA|▶ Try it live in Instacode}
 */
export const getType = val => {
  const str = Object.prototype.toString.call(val);
  return str.slice(8, -1).toLowerCase();
};
