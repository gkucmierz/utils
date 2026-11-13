import {
  rangeIterator,
  cartesianProductIterator,
  cartesianProduct,
  productIterator,
  product,
  combinationsWithReplacementIterator,
  combinationsWithReplacement,
  prod,
  prodBI
} from '../../main.mjs';

describe('cartesian-product & streaming multiplicative reductions', () => {
  it('streams arithmetic progressions lazily via rangeIterator', () => {
    expect([...rangeIterator(5)]).toEqual([0, 1, 2, 3, 4]);
    expect([...rangeIterator(3, 7)]).toEqual([3, 4, 5, 6]);
    expect([...rangeIterator(10, 1, -3)]).toEqual([10, 7, 4]);
    expect([...rangeIterator(5, 2)]).toEqual([]);
    expect(() => [...rangeIterator(0, 5, 0)]).toThrowError(RangeError);
  });

  it('replaces k nested loops via productIterator(10, 4) and prod() in O(k) memory', () => {
    let count = 0;
    let sumProducts = 0;
    let firstTuple = null;
    let lastTuple = null;

    for (const tuple of productIterator(10, 4)) {
      if (count === 0) firstTuple = tuple;
      lastTuple = tuple;
      sumProducts += prod(tuple);
      ++count;
    }

    expect(count).toEqual(10000);
    expect(firstTuple).toEqual([0, 0, 0, 0]);
    expect(lastTuple).toEqual([9, 9, 9, 9]);
    // Sum over w,x,y,z in 0..9 of w*x*y*z = (0+1+...+9)^4 = 45^4
    expect(sumProducts).toEqual(45 ** 4);
    expect(product(rangeIterator(2), 3).length).toEqual(8);
  });

  it('handles heterogeneous N-ary Cartesian products, empty factors, 0-dim identity, and deep repeat=200 without stack overflow', () => {
    const res = cartesianProduct(2, ['a', 'b'], new Set([true, false]));
    expect(res.length).toEqual(8);
    expect(res[0]).toEqual([0, 'a', true]);
    expect(res[7]).toEqual([1, 'b', false]);

    expect(cartesianProduct()).toEqual([[]]);
    expect(product(10, 0)).toEqual([[]]);
    expect(product(0, 0)).toEqual([[]]);
    expect(product(0, 4)).toEqual([]);
    expect(cartesianProduct([1, 2], [], [3])).toEqual([]);

    const deep = productIterator(2, 200);
    const t0 = deep.next().value;
    const t1 = deep.next().value;
    expect(t0.length).toEqual(200);
    expect(t0[199]).toEqual(0);
    expect(t1[199]).toEqual(1);
    expect(t0).not.toBe(t1);
  });

  it('generates multiset combinationsWithReplacement and exact BigInt prodBI', () => {
    expect(combinationsWithReplacement(2, 3)).toEqual([
      [0, 0], [0, 1], [0, 2],
      [1, 1], [1, 2],
      [2, 2]
    ]);
    expect([...combinationsWithReplacementIterator(2, ['A', 'B'])]).toEqual([
      ['A', 'A'], ['A', 'B'], ['B', 'B']
    ]);
    expect(combinationsWithReplacement(0, 5)).toEqual([[]]);
    expect(combinationsWithReplacement(3, 0)).toEqual([]);

    expect(prod([])).toEqual(1);
    expect(prod(rangeIterator(1, 6))).toEqual(120);
    expect(prod([2, 3, 4], 5)).toEqual(120);
    expect(prodBI([])).toEqual(1n);
    expect(prodBI(rangeIterator(1, 22))).toEqual(51090942171709440000n);
  });
});
