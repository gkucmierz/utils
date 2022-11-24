
import {
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
} from '../src/base64.mjs';

describe('base64', () => {
  it('toBase64', () => {
    expect(toBase64('🥚')).toBe('Ptha3Q==');
    expect(toBase64('🐔')).toBe('PdgU3A==');
  });

  it('fromBase64', () => {
    expect(fromBase64('Ptha3Q==')).toBe('🥚');
    expect(fromBase64('PdgU3A==')).toBe('🐔');
  });

  // it('toBase64Url', () => {
  // });

  // it('fromBase64', () => {
  // });
});
