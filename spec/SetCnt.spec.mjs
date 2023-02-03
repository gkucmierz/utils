
import {
  SetCnt,
} from '../src/SetCnt.mjs';

const set = new Set([1,2,3,5])
const map = new Map([[1,2],[3,5]])
// console.log([...sc.entries()]);

describe('SetCnt', () => {
  it('has', () => {
    const sc = new SetCnt([1,2,5,6,1,1]);
    expect(sc.has(1)).toBe(true);
    expect(sc.has(2)).toBe(true);
    expect(sc.has(5)).toBe(true);
  });

  it('add', () => {
    const sc = new SetCnt([1,2,5,6,1,1]);
    expect(sc.add(123)).toBe(sc);
    expect(sc.has(123)).toBe(true);
  });

  it('delete', () => {
    const sc = new SetCnt();
    expect(sc.add(123)).toBe(sc);
    expect(sc.add(123)).toBe(sc);

    expect(sc.delete(123)).toBe(true);
    expect(sc.has(123)).toBe(true);

    expect(sc.delete(123)).toBe(true);
    expect(sc.has(123)).toBe(false);

    expect(sc.delete(123)).toBe(false);
  });

  it('deleteAll', () => {
    const sc = new SetCnt();
    expect(sc.add(123)).toBe(sc);
    expect(sc.add(123)).toBe(sc);

    expect(sc.deleteAll(123)).toBe(true);
    expect(sc.has(123)).toBe(false);
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
});
