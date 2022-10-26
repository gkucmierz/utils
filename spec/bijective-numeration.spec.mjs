
import {
  num2bijective,
  bijective2num,
  num2bijectiveBI,
  bijective2numBI,
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

  it('num2bijective', () => {
    map.map(([num, bij]) => {
      expect(num2bijective(num)).toEqual(bij);
    });
  });

  it('num2bijective alpha', () => {
    mapAlpha.map(([num, bij]) => {
      expect(num2bijective(num, alpha)).toEqual(bij);
    });
  });

  it('bijective2num', () => {
    map.map(([num, bij]) => {
      expect(bijective2num(bij)).toEqual(num);
    });
  });

  it('bijective2num alpha', () => {
    mapAlpha.map(([num, bij]) => {
      expect(bijective2num(bij, alpha)).toEqual(num);
    });
  });

  it('random tests', () => {
    for (let i = 0; i < 1e3; ++i) {
      const n = Math.round(Math.random() * 1e6);
      const bj = num2bijective(n, alpha);
      expect(bijective2num(bj, alpha)).toEqual(n);
    }
  });
});

describe('bijective-numeration BigInt', () => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';

  const map = [
    [0n,    ''],
    [1n,   '1'],
    [2n,   '2'],
    [3n,  '11'],
    [4n,  '12'],
    [5n,  '21'],
    [6n,  '22'],
    [7n, '111'],
  ];

  const mapAlpha = [
    [0n, ''],
    [1n, 'a'],
    [26n, 'z'],
    [26n + 1n, 'aa'],
    [26n * 26n + 26n, 'zz'],
    [26n * 26n + 26n + 1n, 'aaa'],
  ];

  it('num2bijectiveBI', () => {
    map.map(([num, bij]) => {
      expect(num2bijectiveBI(num)).toEqual(bij);
    });
  });

  it('num2bijectiveBI alpha', () => {
    mapAlpha.map(([num, bij]) => {
      expect(num2bijectiveBI(num, alpha)).toEqual(bij);
    });
  });

  it('bijective2numBI', () => {
    map.map(([num, bij]) => {
      expect(bijective2numBI(bij)).toEqual(num);
    });
  });

  it('bijective2numBI alpha', () => {
    mapAlpha.map(([num, bij]) => {
      expect(bijective2numBI(bij, alpha)).toEqual(num);
    });
  });

  it('random tests', () => {
    for (let i = 0; i < 1e3; ++i) {
      const b = BigInt(Math.round(Math.random() * 1000));
      const n = BigInt(Math.round(Math.random() * 100));
      const bi = b ** n;

      const bj = num2bijectiveBI(bi, alpha);
      expect(bijective2numBI(bj, alpha)).toEqual(bi);
    }
  });

});
