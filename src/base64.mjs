
export const toBase64 = string => {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
};

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
export const toBase64Url = string => {
  return toBase64(string).replace(/[\+\/]/g, c => toUrl[c]);
};

const fromUrl = {
  '-': '+',
  '_': '/',
};
export const fromBase64Url = encoded => {
  return fromBase64(encoded.replace(/[\-\_]/g, c => fromUrl[c]));
};
