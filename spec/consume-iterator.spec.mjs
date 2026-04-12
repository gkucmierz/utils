import { consumeIteratorNonBlocking } from '../src/consume-iterator.mjs';

describe('consumeIteratorNonBlocking', () => {
  it('should consume all values from a generator', async () => {
    const gen = (function*() {
      for (let i = 0; i < 5; ++i) {
        yield i;
      }
    })();
    
    const results = [];
    await consumeIteratorNonBlocking(gen, val => results.push(val));
    
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  it('should handle an empty iterator', async () => {
    const emptyGen = (function*() {})();
    const results = [];
    await consumeIteratorNonBlocking(emptyGen, val => results.push(val));
    expect(results).toEqual([]);
  });

  it('should reject if the iterator throws an error', async () => {
    const throwGen = (function*() {
      yield 1;
      throw new Error('Iterator failed');
    })();
    
    const results = [];
    let errorCaught = false;
    try {
      await consumeIteratorNonBlocking(throwGen, val => results.push(val));
    } catch (err) {
      errorCaught = true;
      expect(err.message).toBe('Iterator failed');
    }
    
    expect(results).toEqual([1]);
    expect(errorCaught).toBeTrue();
  });

  it('should reject if progressFn throws an error', async () => {
    const gen = (function*() {
      yield 10;
      yield 20;
    })();
    
    let errorCaught = false;
    try {
      await consumeIteratorNonBlocking(gen, val => {
        if (val === 20) throw new Error('Progress failed');
      });
    } catch (err) {
      errorCaught = true;
      expect(err.message).toBe('Progress failed');
    }
    
    expect(errorCaught).toBeTrue();
  });
});
