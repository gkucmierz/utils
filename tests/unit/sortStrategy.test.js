import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DSU_THRESHOLD,
  createFlatComparator,
  sortByStrategy,
  createDecoratedStream
} from '../../src/developer-utils/sort-strategy.mjs';

describe('sort-strategy (Flat u21 diff vs. Hybrid Schwartzian DSU vs. Streaming Ingress Decoration)', () => {
  it('createFlatComparator produces deterministic multi-key u21 diff ordering without mutating input', () => {
    const rows = [
      { name: 'zeta', write: false, read: true, ts: 10 },
      { name: 'alpha', write: true, read: false, ts: 5 },
      { name: 'beta', write: true, read: false, ts: 20 },
      { name: 'gamma', write: false, read: false, ts: 99 }
    ];
    const cmp = createFlatComparator([
      { key: 'write', order: 'desc' },
      { key: 'read', order: 'desc' },
      { key: 'ts', order: 'desc' },
      { key: 'name', order: 'asc' }
    ]);
    const sorted = [...rows].sort(cmp);
    assert.deepEqual(
      sorted.map((r) => r.name),
      ['beta', 'alpha', 'zeta', 'gamma']
    );
  });

  it('sortByStrategy evaluates expensive keys O(N) times in auto/dsu mode vs O(N log N) in flat mode', () => {
    const items = Array.from({ length: 64 }, (_, i) => ({
      id: i,
      raw: `item-${((i * 37 + 13) % 64).toString().padStart(3, '0')}`
    }));

    let flatCalls = 0;
    const flatSorted = sortByStrategy(
      items,
      [
        {
          key: (x) => {
            flatCalls += 1;
            return x.raw;
          },
          expensive: true
        }
      ],
      { strategy: 'flat' }
    );

    let dsuCalls = 0;
    const autoSorted = sortByStrategy(
      items,
      [
        {
          key: (x) => {
            dsuCalls += 1;
            return x.raw;
          },
          expensive: true
        }
      ],
      { strategy: 'auto', dsuThreshold: DEFAULT_DSU_THRESHOLD }
    );

    assert.deepEqual(autoSorted, flatSorted);
    assert.equal(dsuCalls, items.length, 'DSU must invoke expensive key extractor exactly N times');
    assert.ok(flatCalls > items.length * 4, `Flat comparator should invoke extractor > 4N times, got ${flatCalls}`);
    assert.equal(items[0].id, 0, 'Original array must remain unmutated');
  });

  it('createDecoratedStream decorates incoming records once on ingress across repeated re-sorts and respects sliding cap', () => {
    let extractCalls = 0;
    const stream = createDecoratedStream(
      [
        {
          key: (ev) => {
            extractCalls += 1;
            return ev.score * 10;
          },
          order: 'desc',
          expensive: true
        },
        { key: 'id', order: 'asc' }
      ],
      { maxSize: 4 }
    );

    stream.push({ id: 'b', score: 2 });
    stream.pushMany([
      { id: 'a', score: 5 },
      { id: 'c', score: 1 }
    ]);
    assert.equal(extractCalls, 3);

    // Repeated toSortedArray() calls must incur ZERO additional key extractions
    assert.deepEqual(
      stream.toSortedArray().map((x) => x.id),
      ['a', 'b', 'c']
    );
    assert.deepEqual(
      stream.toSortedArray().map((x) => x.id),
      ['a', 'b', 'c']
    );
    assert.equal(extractCalls, 3, 'Repeated stream sorts must reuse ingress-decorated keys with 0 re-extractions');

    // Sliding window cap=4 drops oldest ('b') when 5th element arrives
    stream.push({ id: 'd', score: 9 });
    stream.push({ id: 'e', score: 3 });
    assert.equal(stream.size, 4);
    assert.equal(extractCalls, 5);
    assert.deepEqual(
      stream.toSortedArray().map((x) => x.id),
      ['d', 'a', 'e', 'c']
    );
  });
});
