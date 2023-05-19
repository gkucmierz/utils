
import {
  binarySearchArr,
  binarySearchLE,
  binarySearchGE,
  binarySearchRangeIncl,
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

describe('binarySearchLE', () => {
  it('mid group', () => {
    const arr = [0,1,2,2,3];
    expect(binarySearchLE(arr, -100)).toBe(-1);
    expect(binarySearchLE(arr, 0)).toBe(0);
    expect(binarySearchLE(arr, 1)).toBe(1);
    expect(binarySearchLE(arr, 2)).toBe(3);
    expect(binarySearchLE(arr, 3)).toBe(4);
    expect(binarySearchLE(arr, 100)).toBe(4);
  });

  it('begin group', () => {
    const arr = [2,2,3];
    expect(binarySearchLE(arr, -100)).toBe(-1);
    expect(binarySearchLE(arr, 2)).toBe(1);
    expect(binarySearchLE(arr, 3)).toBe(2);
    expect(binarySearchLE(arr, 100)).toBe(2);
  });

  it('end group', () => {
    const arr = [1,2,2];
    expect(binarySearchLE(arr, -100)).toBe(-1);
    expect(binarySearchLE(arr, 1)).toBe(0);
    expect(binarySearchLE(arr, 2)).toBe(2);
    expect(binarySearchLE(arr, 100)).toBe(2);
  });
});

describe('binarySearchGE', () => {
  it('mid group', () => {
    const arr = [0,1,2,2,3];
    expect(binarySearchGE(arr, -100)).toBe(0);
    expect(binarySearchGE(arr, 0)).toBe(0);
    expect(binarySearchGE(arr, 1)).toBe(1);
    expect(binarySearchGE(arr, 2)).toBe(2);
    expect(binarySearchGE(arr, 3)).toBe(4);
    expect(binarySearchGE(arr, 100)).toBe(5);
  });

  it('begin group', () => {
    const arr = [2,2,3];
    expect(binarySearchGE(arr, -100)).toBe(0);
    expect(binarySearchGE(arr, 2)).toBe(0);
    expect(binarySearchGE(arr, 3)).toBe(2);
    expect(binarySearchGE(arr, 100)).toBe(3);
  });

  it('end group', () => {
    const arr = [1,2,2];
    expect(binarySearchGE(arr, -100)).toBe(0);
    expect(binarySearchGE(arr, 1)).toBe(0);
    expect(binarySearchGE(arr, 2)).toBe(1);
    expect(binarySearchGE(arr, 100)).toBe(3);
  });
});

describe('binarySearchRangeIncl', () => {
  it('basic', () => {
    const arr = [0,1,1,3];
    const check = [-10, ...arr, 10];
    const expected = [
      [0, -1],
      [0, 0], [1, 2], [1, 2], [3, 3],
      [4, 3],
    ];

    for (let i = 0; i < check.length; ++i) {
      expect(binarySearchRangeIncl(arr, check[i])).toEqual(expected[i]);
    }
  });
});

