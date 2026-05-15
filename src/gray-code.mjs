/**
 * Internal logic for toggling bit state based on MSB progression.
 */
const convertBit = (p, v, i) => {
  p[i] = i && p[i-1] ? 1 - v : v;
  return p;
};

/**
 * Transforms an array of binary bits into Gray Code.
 * 
 * @param {Array<number|boolean>} bits Binary representation (MSB at index 0)
 * @returns {Array<number>} Array of Gray code bits
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IEYgHYCYDmMCGAnggL4IBmMUYCARAAI4DWArgMZggCmMAXgPQs4IADYBnWgG5gwdNjxFpQA|▶ Try it live in Instacode}
 */
export const bin2gray = (bits) => {
  // Cloning array mathematically to prevent pure-function reference mutation
  return [...bits].reduceRight(convertBit, [...bits]);
};

/**
 * Decodes a Gray code array back into standard binary formatting.
 * 
 * @param {Array<number|boolean>} gray Gray Code representation
 * @returns {Array<number>} Decoded original binary bits
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOYwIYE8BMAjEAOwQF8EAzGKMBAIgAFUBrAVwGMwQBTGALwHoWcEABsAzrQDcwYOmz4i0oA|▶ Try it live in Instacode}
 */
export const gray2bin = (gray) => {
  return [...gray].reduce(convertBit, [...gray]);
};
