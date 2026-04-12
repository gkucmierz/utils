import { combinations, combinationsIterator } from '../src/combinations.mjs';

describe('combinations', () => {
  it('should generate accurate counts for subsets', () => {
    // 5 elements (indices 0..4) picking 2
    const res = combinations(2, 5);
    // 5 choose 2 = 10
    expect(res.length).toEqual(10);
    expect(res[0]).toEqual([0, 1]);
    expect(res[res.length - 1]).toEqual([3, 4]);
  });
  
  it('should handle edge cases without loop hangs', () => {
    expect(combinations(0, 5)).toEqual([[]]);
    expect(combinations(5, 5)).toEqual([[0, 1, 2, 3, 4]]);
  });
  
  it('should act as a lazy iterator properly yielding exact sequences', () => {
    const iter = combinationsIterator(3, 4);
    expect(iter.next().value).toEqual([0, 1, 2]);
    expect(iter.next().value).toEqual([0, 1, 3]);
    expect(iter.next().value).toEqual([0, 2, 3]);
    expect(iter.next().value).toEqual([1, 2, 3]);
    expect(iter.next().done).toEqual(true);
  });
});
