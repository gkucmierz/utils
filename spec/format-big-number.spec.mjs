import {
  formatBigNumber,
  formatBigNumberBI,
  wrapFn,
} from '../src/format-big-number.mjs';

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

  it('formats floats', () => {
    expect(formatBigNumber('1234567.89', ' ')).toBe('1 234 567 .89');
    expect(formatBigNumber('-1234567.89', ' ')).toBe('-1 234 567 .89');
    expect(formatBigNumber('0.123', ' ')).toBe('0 .123');
    expect(formatBigNumber('-0.123', ' ')).toBe('-0 .123');
    expect(formatBigNumber('.5', ' ')).toBe('.5');
    expect(formatBigNumber('-.5', ' ')).toBe('-.5');
  });

  it('handles edge cases', () => {
    expect(formatBigNumber('NaN', ' ')).toBe('NaN');
    expect(formatBigNumber('Infinity', ' ')).toBe('Infinity');
    expect(formatBigNumber('-Infinity', ' ')).toBe('-Infinity');
    expect(formatBigNumber('', ' ')).toBe('');
    expect(formatBigNumber('0', ' ')).toBe('0');
    expect(formatBigNumber('-0', ' ')).toBe('-0');
    expect(formatBigNumber('-1', ' ')).toBe('-1');
  });

  it('formats BigInts and numbers', () => {
    expect(formatBigNumber(12345678901234567890n, ' ')).toBe('12 345 678 901 234 567 890');
    expect(formatBigNumber(1234, ' ')).toBe('1 234');
    expect(formatBigNumber(-1234, ' ')).toBe('-1 234');
  });

  it('works with wrapFn', () => {
    const wrap = wrapFn();
    expect(formatBigNumber('1234', ' ', wrap)).toBe('<span class="odd">1</span> <span class="even">234</span>');
  });
});

describe('formatBigNumberBI', () => {
  it('behaves identically to formatBigNumber', () => {
    expect(formatBigNumberBI('1234567', ' ')).toBe('1 234 567');
  });
});
