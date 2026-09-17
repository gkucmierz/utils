
import {
  SetCnt,
} from '../../main.mjs';

const set = new Set([1,2,3,5])
const map = new Map([[1,2],[3,5]])
// console.log([...sc.entries()]);

describe('SetCnt', () => {
  it('constructor handles various iterables', () => {
    const fromArray = new SetCnt(['a', 'b', 'a']);
    expect(fromArray.cnt('a')).toBe(2);
    expect(fromArray.cnt('b')).toBe(1);

    const fromSet = new SetCnt(new Set([10, 20, 30]));
    expect(fromSet.cnt(10)).toBe(1);
    expect(fromSet.cnt(20)).toBe(1);

    const fromString = new SetCnt('hello');
    expect(fromString.cnt('l')).toBe(2);
    expect(fromString.cnt('h')).toBe(1);

    const fromEmpty = new SetCnt();
    expect(fromEmpty.cnt('x')).toBe(0);

    const fromNull = new SetCnt(null);
    expect(fromNull.cnt('x')).toBe(0);
  });

  it('has', () => {
    const sc = new SetCnt([1, 2, 5, 6, 1, 1]);
    expect(sc.has(1)).toBe(true);
    expect(sc.has(2)).toBe(true);
    expect(sc.has(5)).toBe(true);
    expect(sc.has(999)).toBe(false);
  });

  it('handles falsy values, NaN, and object references', () => {
    const obj = { id: 1 };
    const sc = new SetCnt([0, false, '', null, undefined, NaN, obj]);

    expect(sc.has(0)).toBe(true);
    expect(sc.cnt(0)).toBe(1);

    expect(sc.has(false)).toBe(true);
    expect(sc.cnt(false)).toBe(1);

    expect(sc.has('')).toBe(true);
    expect(sc.cnt('')).toBe(1);

    expect(sc.has(null)).toBe(true);
    expect(sc.cnt(null)).toBe(1);

    expect(sc.has(undefined)).toBe(true);
    expect(sc.cnt(undefined)).toBe(1);

    expect(sc.has(NaN)).toBe(true);
    expect(sc.cnt(NaN)).toBe(1);

    expect(sc.has(obj)).toBe(true);
    expect(sc.has({ id: 1 })).toBe(false);
  });

  it('add', () => {
    const sc = new SetCnt([1, 2, 5, 6, 1, 1]);
    expect(sc.add(123)).toBe(sc);
    expect(sc.has(123)).toBe(true);
    expect(sc.cnt(123)).toBe(1);
    sc.add(123);
    expect(sc.cnt(123)).toBe(2);
  });

  it('delete', () => {
    const sc = new SetCnt();
    expect(sc.add(123)).toBe(sc);
    expect(sc.add(123)).toBe(sc);

    expect(sc.delete(123)).toBe(true);
    expect(sc.has(123)).toBe(true);
    expect(sc.cnt(123)).toBe(1);

    expect(sc.delete(123)).toBe(true);
    expect(sc.has(123)).toBe(false);
    expect(sc.cnt(123)).toBe(0);

    expect(sc.delete(123)).toBe(false);
  });

  it('deleteAll', () => {
    const sc = new SetCnt();
    expect(sc.add(123)).toBe(sc);
    expect(sc.add(123)).toBe(sc);

    expect(sc.deleteAll(123)).toBe(true);
    expect(sc.has(123)).toBe(false);
    expect(sc.cnt(123)).toBe(0);
  });

  it('cnt', () => {
    const sc = new SetCnt();
    expect(sc.cnt(123)).toBe(0);

    expect(sc.add(123)).toBe(sc);
    expect(sc.add(123)).toBe(sc);

    expect(sc.cnt(123)).toBe(2);
    expect(sc.deleteAll(123)).toBe(true);
    expect(sc.cnt(123)).toBe(0);
  });

  it('iterators: Symbol.iterator, values, keys, entries', () => {
    const sc = new SetCnt(['apple', 'banana', 'apple']);

    const entries = [...sc];
    expect(entries).toEqual([
      ['apple', 2],
      ['banana', 1]
    ]);

    const vals = [...sc.values()];
    expect(vals).toEqual(['apple', 'banana']);

    const k = [...sc.keys()];
    expect(k).toEqual([2, 1]);

    expect(sc.entries()).toBe(sc);
  });
});
