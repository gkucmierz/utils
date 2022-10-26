
import {
  num2bijective,
  bijective2num,
} from '../src/bijective-numeration.mjs';

describe('bijective-numeration', () => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';

  const map = [
    [0,    ''],
    [1,   '1'],
    [2,   '2'],
    [3,  '11'],
    [4,  '12'],
    [5,  '21'],
    [6,  '22'],
    [7, '111'],
  ];

  const mapAlpha = [
    [0, ''],
    [1, 'a'],
    [26, 'z'],
    [26 + 1, 'aa'],
    [26 * 26 + 26, 'zz'],
    [26 * 26 + 26 + 1, 'aaa'],
  ];

  it('num2bijective', function() {
    map.map(([num, bij]) => {
      expect(num2bijective(num)).toEqual(bij);
    });
  });

  it('num2bijective alpha', function() {
    mapAlpha.map(([num, bij]) => {
      expect(num2bijective(num, alpha)).toEqual(bij);
    });
  });

  it('bijective2num', function() {
    map.map(([num, bij]) => {
      expect(bijective2num(bij)).toEqual(num);
    });
  });

  it('bijective2num alpha', function() {
    mapAlpha.map(([num, bij]) => {
      expect(bijective2num(bij, alpha)).toEqual(num);
    });
  });

});
