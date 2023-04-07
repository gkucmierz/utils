
import {
  gpn,
  gpnBI,
} from '../src/gpn.mjs';

describe('gpn', () => {
  it('first terms', () => {
    expect(gpn(0)).toBe(0);
    expect(gpn(1)).toBe(1);
    expect(gpn(2)).toBe(2);
    expect(gpn(3)).toBe(5);
    expect(gpn(4)).toBe(7);
    expect(gpn(5)).toBe(12);
    expect(gpn(6)).toBe(15);
    expect(gpn(7)).toBe(22);
    expect(gpn(8)).toBe(26);
    expect(gpn(9)).toBe(35);
  });
});

describe('gpn BI', () => {
  it('first terms', () => {
    expect(gpnBI(0n)).toBe(0n);
    expect(gpnBI(1n)).toBe(1n);
    expect(gpnBI(2n)).toBe(2n);
    expect(gpnBI(3n)).toBe(5n);
    expect(gpnBI(4n)).toBe(7n);
    expect(gpnBI(5n)).toBe(12n);
    expect(gpnBI(6n)).toBe(15n);
    expect(gpnBI(7n)).toBe(22n);
    expect(gpnBI(8n)).toBe(26n);
    expect(gpnBI(9n)).toBe(35n);
  });
});
