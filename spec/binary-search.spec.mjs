
import {
  binarySearchArr,
} from '../src/binary-search.mjs';

describe('binarySearchArr', () => {
  it('few cases', () => {
    expect(binarySearchArr([1, 2, 3, 4], 1)).toBe(0);
    expect(binarySearchArr([1, 2, 3, 4], 2)).toBe(1);
    expect(binarySearchArr([1, 2, 3, 4], 3)).toBe(2);
    expect(binarySearchArr([1, 2, 3, 4], 4)).toBe(3);
    expect(binarySearchArr([1, 2, 3, 4], 0)).toBe(-1);
    expect(binarySearchArr([1, 2, 3, 4], 5)).toBe(-1);
  });
});
