/**
 * @module string-arrays
 */

/**
 * Generates a clean, URL-safe slug from any string, with full Unicode support
 * (preserving international characters like Polish diacritics) and optional collision deduplication.
 *
 * @param {string} text - The input string to convert into a slug.
 * @param {object} [options={}] - Optional configuration options.
 * @param {Set<string>|Array<string>} [options.existing] - Collection of existing slugs for automatic -1, -2 deduplication.
 * @param {string} [options.fallback='item'] - Fallback slug if the sanitized result is empty.
 * @param {string} [options.separator='-'] - Separator string between words.
 * @param {boolean} [options.lowercase=true] - Whether to lowercase the slug.
 * @returns {string} The formatted URL-safe slug.
 * @example
 * slugify('Obsługiwane typy danych');
 * // returns 'obsługiwane-typy-danych'
 *
 * slugify('Zażółć gęślą jaźń!');
 * // returns 'zażółć-gęślą-jaźń'
 *
 * slugify('Introduction', { existing: new Set(['introduction']) });
 * // returns 'introduction-1'
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4BsCuBzEAzATwQF8E8YowEAiAAWwGtMBjMEAUxgC8B6TOEOlTUA3MGAYc+AmKA|▶ Try it live in Instacode}
 */
export const slugify = (text, options = {}) => {
  const {
    existing = null,
    fallback = 'item',
    separator = '-',
    lowercase = true,
  } = options;

  let str = (text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

  if (lowercase) {
    str = str.toLowerCase();
  }

  // Collapse whitespace and underscores to separator
  str = str.replace(/[\s_]+/g, separator);

  // Preserve all Unicode letters (\p{L}), numbers (\p{N}), and the separator
  const escapedSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  str = str.replace(new RegExp(`[^\\p{L}\\p{N}${escapedSep}]`, 'gu'), '');

  // Collapse multiple consecutive separators
  str = str.replace(new RegExp(`${escapedSep}+`, 'g'), separator);

  // Trim leading/trailing separators
  str = str.replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g'), '');

  const baseSlug = str || fallback;
  let slug = baseSlug;

  if (existing) {
    const hasSlug = (s) => (existing instanceof Set ? existing.has(s) : existing.includes(s));
    let counter = 1;
    while (hasSlug(slug)) {
      slug = `${baseSlug}${separator}${counter++}`;
    }
    if (existing instanceof Set) {
      existing.add(slug);
    } else if (Array.isArray(existing)) {
      existing.push(slug);
    }
  }

  return slug;
};
