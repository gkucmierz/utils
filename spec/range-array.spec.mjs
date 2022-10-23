
import {
  range2array,
  array2range,
} from '../src/range-array.mjs';

describe('range-array', () => {
  it('should work', function() {
    expect(array2range([1,3,4,5,7,9,10])).toEqual([[1,1],[3,5],[7,7],[9,10]]);
    expect(array2range([10,12,13,14,15,16,17,20,22,23,27])).toEqual([[10,10],[12,17],[20,20],[22,23],[27,27]]);
  });
});
