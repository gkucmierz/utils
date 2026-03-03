
/**
 * Encodes a string to Base64.
 * Handles Unicode characters correctly.
 * @param {string} string - The string to encode.
 * @returns {string} The Base64 encoded string.
 */
export const toBase64 = string => {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
};

/**
 * Decodes a Base64 string.
 * Handles Unicode characters correctly.
 * @param {string} encoded - The Base64 encoded string.
 * @returns {string} The decoded string.
 */
export const fromBase64 = encoded => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
};

const toUrl = {
  '+': '-',
  '/': '_',
};
/**
 * Encodes a string to Base64Url format.
 * Replaces '+' with '-' and '/' with '_'.
 * @param {string} string - The string to encode.
 * @returns {string} The Base64Url encoded string.
 */
export const toBase64Url = string => {
  return toBase64(string).replace(/[\+\/]/g, c => toUrl[c]);
};

const fromUrl = {
  '-': '+',
  '_': '/',
};
/**
 * Decodes a Base64Url string.
 * Replaces '-' with '+' and '_' with '/'.
 * @param {string} encoded - The Base64Url encoded string.
 * @returns {string} The decoded string.
 */
export const fromBase64Url = encoded => {
  return fromBase64(encoded.replace(/[\-\_]/g, c => fromUrl[c]));
};
