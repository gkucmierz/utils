
/**
 * Copy the case of a string into another.
 * @method
 * @param {string} target String to change the case.
 * @param {string} source Source of case pattern.
 * @return {string} Converted string.
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
