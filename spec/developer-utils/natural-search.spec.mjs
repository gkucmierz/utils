import {
  naturalSearch,
  naturalSearchBI,
} from '../../main.mjs';

describe('natural-search', () => {
  it('finds correct integer when condition triggers at 10', () => {
    const checkFn = (val) => val >= 10;

    const resultTrue = naturalSearch(checkFn, true);
    expect(resultTrue).toEqual(10);

    const resultFalse = naturalSearch(checkFn, false);
    expect(resultFalse).toEqual(9);
  });

  it('handles condition triggering immediately at 1', () => {
    const checkFn = (val) => val >= 1;
    expect(naturalSearch(checkFn, true)).toEqual(1);
    expect(naturalSearch(checkFn, false)).toEqual(1);
  });

  it('finds large boundary properly efficiently', () => {
    const target = 50000;
    const checkFn = (val) => val > target;

    expect(naturalSearch(checkFn, true)).toEqual(50001);
    expect(naturalSearch(checkFn, false)).toEqual(50000);
  });

  it('correctly scales a mock Canvas boundary limit', () => {
    const widthConstraint = 230;
    const charCount = 3;
    const isTooBig = (testSize) => (testSize * charCount) > widthConstraint;

    const optimalSize = naturalSearch(isTooBig, false);
    expect(optimalSize).toEqual(76);
  });

  it('terminates safely and returns -1 when predicate never turns true (finite maxCap & MAX_SAFE_INTEGER guard)', () => {
    let calls = 0;
    const neverTrue = () => {
      calls += 1;
      return false;
    };

    const cappedResult = naturalSearch(neverTrue, true, 1024);
    expect(cappedResult).toEqual(-1);
    expect(calls).toBeLessThanOrEqual(12);

    calls = 0;
    const defaultCapResult = naturalSearch(neverTrue, true);
    expect(defaultCapResult).toEqual(-1);
    expect(calls).toBeLessThanOrEqual(56);
  });

  it('finds exact boundary when predicate turns true right at maxCap (including MAX_SAFE_INTEGER without float overflow)', () => {
    expect(naturalSearch((v) => v >= 900, true, 900)).toEqual(900);
    expect(naturalSearch((v) => v >= 900, false, 900)).toEqual(899);
    expect(naturalSearch((v) => v >= 901, true, 900)).toEqual(-1);
    expect(naturalSearch((v) => v >= 1, true, 1)).toEqual(1);
    expect(naturalSearch(() => false, true, 1)).toEqual(-1);

    const maxSafe = Number.MAX_SAFE_INTEGER;
    expect(naturalSearch((v) => v >= maxSafe, true)).toEqual(maxSafe);
    expect(naturalSearch((v) => v >= maxSafe, false)).toEqual(maxSafe - 1);
  });

  describe('naturalSearchBI (BigInt monadic twin)', () => {
    it('matches naturalSearch semantics for small and immediate boundaries', () => {
      expect(naturalSearchBI((v) => v >= 1n, true)).toEqual(1n);
      expect(naturalSearchBI((v) => v >= 1n, false)).toEqual(1n);
      expect(naturalSearchBI((v) => v >= 10n, true)).toEqual(10n);
      expect(naturalSearchBI((v) => v >= 10n, false)).toEqual(9n);
    });

    it('solves arbitrary-precision thresholds far beyond Number.MAX_SAFE_INTEGER (10^100 and 2^256)', () => {
      const googol = 10n ** 100n;
      const rootGoogol = 10n ** 50n;
      expect(naturalSearchBI((n) => n * n > googol, true)).toEqual(rootGoogol + 1n);
      expect(naturalSearchBI((n) => n * n > googol, false)).toEqual(rootGoogol);

      const target256 = (1n << 256n) + 1337n;
      expect(naturalSearchBI((n) => n >= target256, true)).toEqual(target256);
      expect(naturalSearchBI((n) => n >= target256, false)).toEqual(target256 - 1n);
    });

    it('terminates rapidly and returns -1n on unsatisfiable predicates (custom & default 16384-bit maxCap)', () => {
      let calls = 0;
      const capped = naturalSearchBI(() => {
        calls += 1;
        return false;
      }, true, 1024n);
      expect(capped).toEqual(-1n);
      expect(calls).toBeLessThanOrEqual(12);

      expect(naturalSearchBI((v) => v >= 900n, true, 900n)).toEqual(900n);
      expect(naturalSearchBI((v) => v >= 900n, false, 900n)).toEqual(899n);
      expect(naturalSearchBI((v) => v >= 901n, true, 900n)).toEqual(-1n);

      let defaultCalls = 0;
      const defaultRes = naturalSearchBI(() => {
        defaultCalls += 1;
        return false;
      });
      expect(defaultRes).toEqual(-1n);
      expect(defaultCalls).toEqual(16385);
    });

    it('supports custom maxCap beyond 16384 bits without allocating any extra bit above maxCap', () => {
      const highTarget = (1n << 20000n) + 42n;
      const customCap = (1n << 24000n) - 1n;
      expect(naturalSearchBI((n) => n >= highTarget, true, customCap)).toEqual(highTarget);
      expect(naturalSearchBI((n) => n >= highTarget, false, customCap)).toEqual(highTarget - 1n);
    });
  });
});
