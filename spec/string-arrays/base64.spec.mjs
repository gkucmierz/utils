
import {
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
} from '../../main.mjs';

describe('base64', () => {
  it('toBase64', () => {
    expect(toBase64('🥚')).toBe('Ptha3Q==');
    expect(toBase64('🐔')).toBe('PdgU3A==');
    expect(toBase64('')).toBe('++8=');
  });

  it('fromBase64', () => {
    expect(fromBase64('Ptha3Q==')).toBe('🥚');
    expect(fromBase64('PdgU3A==')).toBe('🐔');
    expect(fromBase64('++8=')).toBe('');
  });

  it('toBase64Url', () => {
    expect(toBase64Url('')).toBe('--8=');
  });

  it('fromBase64', () => {
    expect(fromBase64Url('--8=')).toBe('');
  });
});
