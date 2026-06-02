import {
  mobius,
  mobiusBI,
} from '../src/mobius.mjs';

describe('mobius', () => {
  it('Number', () => {
    expect(mobius(0)).toEqual(0);
    expect(mobius(1)).toEqual(1);
    expect(mobius(2)).toEqual(-1);
    expect(mobius(3)).toEqual(-1);
    expect(mobius(4)).toEqual(0);
    expect(mobius(5)).toEqual(-1);
    expect(mobius(6)).toEqual(1);
    expect(mobius(7)).toEqual(-1);
    expect(mobius(8)).toEqual(0);
    expect(mobius(9)).toEqual(0);
    expect(mobius(10)).toEqual(1);
    expect(mobius(30)).toEqual(-1);
  });

  it('BigInt', () => {
    expect(mobiusBI(0n)).toEqual(0);
    expect(mobiusBI(1n)).toEqual(1);
    expect(mobiusBI(2n)).toEqual(-1);
    expect(mobiusBI(3n)).toEqual(-1);
    expect(mobiusBI(4n)).toEqual(0);
    expect(mobiusBI(5n)).toEqual(-1);
    expect(mobiusBI(6n)).toEqual(1);
    expect(mobiusBI(7n)).toEqual(-1);
    expect(mobiusBI(8n)).toEqual(0);
    expect(mobiusBI(9n)).toEqual(0);
    expect(mobiusBI(10n)).toEqual(1);
    expect(mobiusBI(30n)).toEqual(-1);
  });
});
