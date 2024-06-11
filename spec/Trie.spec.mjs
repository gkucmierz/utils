
import {
  Trie,
} from '../src/Trie.mjs';

describe('Trie', () => {
  it('check empty', () => {
    const trie = Trie();
    expect(trie.has('')).toBe(false);
    expect(trie.has('abc')).toBe(false);
  });

  it('init data', () => {
    const trie = Trie(['abc', '']);
    expect(trie.has('')).toBe(true);
    expect(trie.has('abc')).toBe(true);
  });

  it('add/readd data', () => {
    const trie = Trie();
    expect(trie.has('')).toBe(false);
    expect(trie.add('')).toBe(true);
    expect(trie.has('')).toBe(true);
    expect(trie.add('')).toBe(false);
  });

  it('list data', () => {
    const trie = Trie(['abc', '', 'abcdef', 'xyz']);
    const abc = ['abc', 'abcdef'];
    expect(trie.get('a')).toEqual(abc);
    expect(trie.get('ab')).toEqual(abc);
    expect(trie.get('abc')).toEqual(abc);
    expect(trie.get('aa')).toEqual([]);
    expect(trie.get('')).toEqual(['', 'abc', 'abcdef', 'xyz']);
  });
});
