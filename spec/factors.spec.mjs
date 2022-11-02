
import {
  factors,
  factorsBI,
} from '../src/factors.mjs';

describe('factors', () => {
  it('Number', () => {
    expect(factors(0)).toEqual([]);
    expect(factors(1)).toEqual([]);
    expect(factors(2)).toEqual([2]);
    expect(factors(3)).toEqual([3]);
    expect(factors(4)).toEqual([2, 2]);
    expect(factors(5)).toEqual([5]);
    expect(factors(6)).toEqual([2, 3]);
    expect(factors(7)).toEqual([7]);
    expect(factors(8)).toEqual([2, 2, 2]);
    expect(factors(9)).toEqual([3, 3]);
    expect(factors(10)).toEqual([2, 5]);
  });

  it('BigInt', () => {
    expect(factorsBI(0n)).toEqual([]);
    expect(factorsBI(1n)).toEqual([]);
    expect(factorsBI(2n)).toEqual([2n]);
    expect(factorsBI(3n)).toEqual([3n]);
    expect(factorsBI(4n)).toEqual([2n, 2n]);
    expect(factorsBI(5n)).toEqual([5n]);
    expect(factorsBI(6n)).toEqual([2n, 3n]);
    expect(factorsBI(7n)).toEqual([7n]);
    expect(factorsBI(8n)).toEqual([2n, 2n, 2n]);
    expect(factorsBI(9n)).toEqual([3n, 3n]);
    expect(factorsBI(10n)).toEqual([2n, 5n]);
  });
});
