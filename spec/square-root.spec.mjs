
import {
  squareRoot,
  squareRootBI,
} from '../src/square-root.mjs';

describe('square-root', () => {
  it('squareRootBI', () => {
    expect(squareRootBI(0n)).toEqual(0n);
    expect(squareRootBI(1n)).toEqual(1n);
    expect(squareRootBI(2n)).toEqual(1n);
    expect(squareRootBI(3n)).toEqual(1n);
    expect(squareRootBI(4n)).toEqual(2n);
  });
});
