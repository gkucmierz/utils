import {
  formatBigNumber,
  formatBigNumberBI,
  wrapFn,
} from '../../main.mjs';

describe('formatBigNumber', () => {
  it('formats positive integers', () => {
    expect(formatBigNumber('123', ' ')).toBe('123');
    expect(formatBigNumber('1234', ' ')).toBe('1 234');
    expect(formatBigNumber('1234567', ' ')).toBe('1 234 567');
  });

  it('formats negative integers', () => {
    expect(formatBigNumber('-123', ' ')).toBe('-123');
    expect(formatBigNumber('-1234', ' ')).toBe('-1 234');
    expect(formatBigNumber('-1234567', ' ')).toBe('-1 234 567');
  });

  it('formats positive integers with explicit plus sign', () => {
    expect(formatBigNumber('+123', ' ')).toBe('+123');
    expect(formatBigNumber('+1234', ' ')).toBe('+1 234');
    expect(formatBigNumber('+1234567', ' ')).toBe('+1 234 567');
    expect(formatBigNumber('+1234.56', ' ')).toBe('+1 234 .56');
    expect(formatBigNumber('+.5', ' ')).toBe('+.5');
  });

  it('formats floats', () => {
    expect(formatBigNumber('1234567.89', ' ')).toBe('1 234 567 .89');
    expect(formatBigNumber('-1234567.89', ' ')).toBe('-1 234 567 .89');
    expect(formatBigNumber('0.123', ' ')).toBe('0 .123');
    expect(formatBigNumber('-0.123', ' ')).toBe('-0 .123');
    expect(formatBigNumber('.5', ' ')).toBe('.5');
    expect(formatBigNumber('-.5', ' ')).toBe('-.5');
  });

  it('supports custom separators', () => {
    expect(formatBigNumber('1234567')).toBe('1234567');
    expect(formatBigNumber('1234567', ',')).toBe('1,234,567');
    expect(formatBigNumber('1234567', '_')).toBe('1_234_567');
    expect(formatBigNumber('-1234567.89', '_')).toBe('-1_234_567_.89');
  });

  it('supports custom wrap functions', () => {
    expect(formatBigNumber('1234567', ' ', p => `[${p}]`)).toBe('[1] [234] [567]');
    expect(formatBigNumber('-1234', '', p => `(${p})`)).toBe('(-1)(234)');
  });

  it('handles edge cases and non-numeric fallbacks', () => {
    expect(formatBigNumber('NaN', ' ')).toBe('NaN');
    expect(formatBigNumber('Infinity', ' ')).toBe('Infinity');
    expect(formatBigNumber('-Infinity', ' ')).toBe('-Infinity');
    expect(formatBigNumber('', ' ')).toBe('');
    expect(formatBigNumber('0', ' ')).toBe('0');
    expect(formatBigNumber('-0', ' ')).toBe('-0');
    expect(formatBigNumber('-1', ' ')).toBe('-1');
    expect(formatBigNumber('abc', ' ')).toBe('abc');
  });

  it('formats BigInts and numbers', () => {
    expect(formatBigNumber(12345678901234567890n, ' ')).toBe('12 345 678 901 234 567 890');
    expect(formatBigNumber(-9007199254740991n, ' ')).toBe('-9 007 199 254 740 991');
    expect(formatBigNumber(1234, ' ')).toBe('1 234');
    expect(formatBigNumber(-1234, ' ')).toBe('-1 234');
  });

  it('works with wrapFn across different group counts', () => {
    expect(formatBigNumber('123', '', wrapFn())).toBe('<span class="even">123</span>');
    expect(formatBigNumber('1234', ' ', wrapFn())).toBe('<span class="odd">1</span> <span class="even">234</span>');
    expect(formatBigNumber('1234567', '', wrapFn())).toBe('<span class="even">1</span><span class="odd">234</span><span class="even">567</span>');
    expect(formatBigNumber('1234.56', '', wrapFn())).toBe('<span class="even">1</span><span class="odd">234</span><span class="even">.56</span>');
  });
});

describe('formatBigNumberBI', () => {
  it('behaves identically to formatBigNumber', () => {
    expect(formatBigNumberBI('1234567', ' ')).toBe('1 234 567');
    expect(formatBigNumberBI(-1234567n, ',')).toBe('-1,234,567');
  });
});
