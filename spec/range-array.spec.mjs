
import {
  range2array,
  array2range,
} from '../src/range-array.mjs';

describe('range-array', () => {
  it('array2range', () => {
    expect(array2range([])).toEqual([]);
    expect(array2range([1,3,4,5,7,9,10])).toEqual([[1,1],[3,5],[7,7],[9,10]]);
    expect(array2range([10,12,13,14,15,16,17,20,22,23,27])).toEqual([[10,10],[12,17],[20,20],[22,23],[27,27]]);
  });

  it('range2array', () => {
    expect(range2array([])).toEqual([]);
    expect(range2array([[1],[3,5],[7],[9,10]])).toEqual([1,3,4,5,7,9,10]);
    expect(range2array([[10],[12,17],[20],[22,23],[27]])).toEqual([10,12,13,14,15,16,17,20,22,23,27]);
  });
});
