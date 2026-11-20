import {
  variation,
  subset,
} from '../../main.mjs';

describe('combinatorics/variations-subsets', () => {
  it('generates k-variations without repetition and binary-indexed subsets', () => {
    expect(variation(['a', 'b', 'c'], 2).length).toBe(6);
    expect(variation(2, 4).length).toBe(12);
    expect(subset(['x', 'y', 'z']).length).toBe(8);
    expect(subset(['x', 'y', 'z'], 6)).toEqual(['y', 'z']);
  });
});
