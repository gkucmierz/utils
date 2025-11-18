
import {
  memoize,
} from '../src/memoize.mjs';

describe('memoize', () => {
  it('called once', () => {
    let cnt = 0;
    const add = memoize((a, b) => {
      ++cnt;
      return a + b;
    });

    expect(add(1, 2)).toBe(3);
    expect(cnt).toBe(1);
    expect(add(1, 2)).toBe(3);
    expect(cnt).toBe(1);

    expect(add(2, 1)).toBe(3);
    expect(cnt).toBe(2);
  });

  it('variable args length', () => {
    const fn = memoize((...args) => args.length);

    expect(fn()).toBe(0);
    expect(fn(1)).toBe(1);
    expect(fn(1, 2)).toBe(2);
    expect(fn(1, 2, 3)).toBe(3);
  });

  it('different empty object arrays', () => {
    let cnt = 0;
    const fn = memoize(() => ++cnt);
    const emptyArr = [];
    fn(emptyArr);
    expect(cnt).toBe(1);
    fn(emptyArr);
    expect(cnt).toBe(1);
    fn([]);
    expect(cnt).toBe(2);
    fn([]);
    expect(cnt).toBe(3);
  });
});

