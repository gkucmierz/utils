
import {
  gcd,
  gcdBI,
} from '../src/gcd.mjs';

describe('gcd', () => {
  it('Number', () => {
    expect(gcd(42, 56)).toEqual(14);
    expect(gcd(461952, 116298)).toEqual(18);
    expect(gcd(7966496, 314080416)).toEqual(32);
    expect(gcd(24826148, 45296490)).toEqual(526);
    expect(gcd(12, 0)).toEqual(12);
    expect(gcd(0, 0)).toEqual(0);
    expect(gcd(0, 9)).toEqual(9);
  });

  it('BigInt', () => {
    expect(gcdBI(42n, 56n)).toEqual(14n);
    expect(gcdBI(461952n, 116298n)).toEqual(18n);
    expect(gcdBI(7966496n, 314080416n)).toEqual(32n);
    expect(gcdBI(24826148n, 45296490n)).toEqual(526n);
    expect(gcdBI(12n, 0n)).toEqual(12n);
    expect(gcdBI(0n, 0n)).toEqual(0n);
    expect(gcdBI(0n, 9n)).toEqual(9n);
  });
});
