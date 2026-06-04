
/**
 * Copies the case pattern from one string to another.
 * Handles lower case, upper case, and capitalized strings.
 * @param {string} word - The string to change the case of.
 * @param {string} from - The source string providing the case pattern.
 * @returns {string} The converted string.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZQgTwMIEMDOApggL4IBmMUYCARAAIDmA1gK6pgiEwBeA9KzggANvloBuYMHRY8RSUA|▶ Try it live in Instacode}
 */
export const copyCase = (word, from) => {
  const isLower = w => w.toLowerCase() === w;
  const isUpper = w => w.toUpperCase() === w;
  if (isLower(from)) return word.toLowerCase();
  if (isUpper(from)) return word.toUpperCase();
  if (isUpper(from[0]) && isLower(from.slice(1))) {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }
  return word;
};
