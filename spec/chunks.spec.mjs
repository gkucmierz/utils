import { chunks, chunksIterator, chunksAsyncIterator } from '../src/chunks.mjs';

describe('chunks', () => {
  it('should chunk a string', () => {
    expect(chunks('abcdefg', 3)).toEqual(['abc', 'def', 'g']);
    expect(chunks('abcdef', 3)).toEqual(['abc', 'def']);
    expect(chunks('', 3)).toEqual([]);
  });

  it('should chunk an array', () => {
    expect(chunks([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(chunks([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    expect(chunks([], 3)).toEqual([]);
  });

  it('should handle invalid sizes gracefully', () => {
    expect(chunks('abc', 0)).toEqual(['a', 'b', 'c']);
    expect(chunks('abc', -5)).toEqual(['a', 'b', 'c']);
  });

  it('should chunk a Set (iterable)', () => {
    const set = new Set([1, 2, 3, 4, 5]);
    expect(chunks(set, 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('chunksIterator', () => {
  it('should yield string chunks', () => {
    const it = chunksIterator('abcdefg', 3);
    expect(Array.from(it)).toEqual(['abc', 'def', 'g']);
  });

  it('should yield array chunks for iterables', () => {
    const arr = [1, 2, 3, 4, 5];
    const it = chunksIterator(arr, 2);
    expect(Array.from(it)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('chunksAsyncIterator', () => {
  it('should yield array chunks for async iterables', async () => {
    async function* gen() {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    }

    const result = [];
    for await (const chunk of chunksAsyncIterator(gen(), 2)) {
      result.push(chunk);
    }
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });
});
