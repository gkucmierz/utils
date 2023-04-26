
import {
  matrixAsArray,
} from '../src/matrix.mjs';

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
  });
});
