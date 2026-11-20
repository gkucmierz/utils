import {
  matrixAsArray,
  transpose,
  rotate,
  mul,
} from '../../main.mjs';

describe('matrix', () => {
  it('matrixAsArray', () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    const arr = matrixAsArray(m);
    expect(arr.length).toBe(4);
    expect(arr[0]).toBe(1);
    expect(arr[1]).toBe(2);
    expect(arr[2]).toBe(3);
    expect(arr[3]).toBe(4);
    arr[2] = 9;
    expect(m[1][0]).toBe(9);
  });

  it('transpose, rotate, and mul', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(transpose(a)).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
    expect(rotate([[1, 2], [3, 4]], 1)).toEqual([[3, 1], [4, 2]]);
    expect(mul([[1, 2], [3, 4]], [[2, 0], [1, 2]])).toEqual([[4, 4], [10, 8]]);
    expect(mul([[1, 2], [3, 4]], [5, 6])).toEqual([17, 39]);
  });
});
