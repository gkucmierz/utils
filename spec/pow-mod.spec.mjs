
import {
  powMod,
  powModBI,
} from '../src/pow-mod.mjs';

describe('pow-mod', () => {
  it('powMod', () => {
    expect(powMod(2, 1)).toEqual(2);
    expect(powMod(2, 1, 10)).toEqual(2);
    expect(powMod(2, 1, 2)).toEqual(0);
    expect(powMod(2, 0, 2)).toEqual(1);
  });

  it('powModBI', () => {
    expect(powModBI(2n, 1n)).toEqual(2n);
    expect(powModBI(2n, 1n, 10n)).toEqual(2n);
    expect(powModBI(2n, 1n, 2n)).toEqual(0n);
    expect(powModBI(2n, 0n, 2n)).toEqual(1n);
  });
});
