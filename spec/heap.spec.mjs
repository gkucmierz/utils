
import { Heap } from '../src/heap.mjs';

describe('Heap', () => {
  it('size', () => {
    const heap = Heap();
    expect(heap.size()).toBe(0);
    heap.add(1);
    expect(heap.size()).toBe(1);
    heap.add(1);
    heap.add(1);
    expect(heap.size()).toBe(3);
  });

  it('take', () => {
    const heap = Heap();
    heap.add(2);
    heap.add(1);
    heap.add(3);
    expect(heap.take()).toBe(1);
    expect(heap.take()).toBe(2);
    expect(heap.take()).toBe(3);
  });

  it('valFn', () => {
    const heap = Heap(obj => obj.value);
    heap.add({ value: 42, other: 'second' });
    heap.add({ value: 23, other: 'first' });
    expect(heap.take().other).toBe('first');
    expect(heap.take().other).toBe('second');
  });
});
