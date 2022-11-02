
import {
  mod,
  modBI,
} from '../src/mod.mjs';

describe('mod', () => {
  it('mod', () => {
    expect(mod(4, 100)).toEqual(4);
    expect(mod(104, 100)).toEqual(4);
    expect(mod(4 - 100, 100)).toEqual(4);
  });

  it('mod sign', () => {
    expect(mod(4, 100)).toEqual(4);
    expect(mod(-4, 100)).toEqual(96);
    expect(mod(4, -100)).toEqual(-96);
    expect(mod(-4, -100)).toEqual(-4);
  });
});

describe('mod BI', () => {
  it('mod', () => {
    expect(modBI(4n, 100n)).toEqual(4n);
    expect(modBI(104n, 100n)).toEqual(4n);
    expect(modBI(4n - 100n, 100n)).toEqual(4n);
  });

  it('mod sign', () => {
    expect(modBI(4n, 100n)).toEqual(4n);
    expect(modBI(-4n, 100n)).toEqual(96n);
    expect(modBI(4n, -100n)).toEqual(-96n);
    expect(modBI(-4n, -100n)).toEqual(-4n);
  });
});
