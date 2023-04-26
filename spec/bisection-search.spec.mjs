
import {
  bisectionSearchArr,
} from '../src/bisection-search.mjs';

describe('bisectionSearchArr', () => {
  it('few cases', () => {
    expect(bisectionSearchArr([1, 2, 3, 4], 1)).toBe(0);
    expect(bisectionSearchArr([1, 2, 3, 4], 2)).toBe(1);
    expect(bisectionSearchArr([1, 2, 3, 4], 3)).toBe(2);
    expect(bisectionSearchArr([1, 2, 3, 4], 4)).toBe(3);
    expect(bisectionSearchArr([1, 2, 3, 4], 0)).toBe(-1);
    expect(bisectionSearchArr([1, 2, 3, 4], 5)).toBe(-1);
  });
});
