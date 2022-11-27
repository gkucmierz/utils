
import {
  squareRoot,
  squareRootBI,
} from '../src/square-root.mjs';

describe('square-root', () => {
  it('squareRootBI small', () => {
    expect(squareRootBI(0n)).toEqual(0n);
    expect(squareRootBI(1n)).toEqual(1n);
    expect(squareRootBI(2n)).toEqual(1n);
    expect(squareRootBI(3n)).toEqual(1n);
    expect(squareRootBI(4n)).toEqual(2n);
  });

  it('squareRootBI 0-1e3', () => {
    for (let i = 0; i < 1e3; ++i) {
      const sqf = BigInt(Math.floor(i ** 0.5));
      expect(squareRootBI(BigInt(i))).toEqual(sqf);
    }
  });
});
