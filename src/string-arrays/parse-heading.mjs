/**
 * @module string-arrays
 */

/**
 * Parses a heading text to safely extract section numbering prefix and clean title.
 * Unlike naive regexes, never truncates words that begin with ASCII or Unicode letters.
 *
 * @param {string} text - The raw heading string to parse.
 * @returns {{ number: string, title: string }} An object with the extracted numbering prefix and clean title.
 * @example
 * parseHeading('1. Introduction');
 * // returns { number: '1.', title: 'Introduction' }
 *
 * parseHeading('3.2.1. Network Configuration');
 * // returns { number: '3.2.1.', title: 'Network Configuration' }
 *
 * parseHeading('Obsługiwane typy danych');
 * // returns { number: '', title: 'Obsługiwane typy danych' }
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IgQxgZwKYAltoAmIAdgOYIC+CAZjFGAgEQACZA1gK4DGYI2MAF4B6TnBAAbTEwDcwYOix4CxcnKA|▶ Try it live in Instacode}
 */
export const parseHeading = (text) => {
  if (!text || typeof text !== 'string') {
    return { number: '', title: '' };
  }
  const trimmed = text.trim();
  const match = trimmed.match(/^(\d+(?:[.-]\d+)*(?:[.:)]|\s+-)?)\s+(.+)$/u);
  if (match) {
    return {
      number: match[1].trim(),
      title: match[2].trim(),
    };
  }
  return {
    number: '',
    title: trimmed,
  };
};
