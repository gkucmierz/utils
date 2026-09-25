import { Stack } from '../../main.mjs';

describe('Stack', () => {
  it('initializes as empty by default', () => {
    const stack = new Stack();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.size).toBe(0);
    expect(stack.length).toBe(0);
    expect(stack.peek()).toBeUndefined();
    expect(stack.pop()).toBeUndefined();
  });

  it('initializes from iterable collections', () => {
    const fromArray = new Stack([10, 20, 30]);
    expect(fromArray.size).toBe(3);
    expect(fromArray.peek()).toBe(30);

    const fromSet = new Stack(new Set(['x', 'y']));
    expect(fromSet.size).toBe(2);
    expect(fromSet.pop()).toBe('y');
    expect(fromSet.pop()).toBe('x');

    const fromString = new Stack('abc');
    expect(fromString.size).toBe(3);
    expect(fromString.peek()).toBe('c');

    const fromNull = new Stack(null);
    expect(fromNull.size).toBe(0);
    expect(fromNull.isEmpty()).toBe(true);

    const fromUndefined = new Stack(undefined);
    expect(fromUndefined.size).toBe(0);
  });

  it('supports single and multiple pushes with fluent chaining', () => {
    const stack = new Stack();
    const ret = stack.push(1);
    expect(ret).toBe(stack);

    stack.push(2).push(3, 4);
    expect(stack.size).toBe(4);
    expect(stack.peek()).toBe(4);
  });

  it('pops items in strict LIFO order', () => {
    const stack = new Stack(['first', 'second', 'third']);
    expect(stack.pop()).toBe('third');
    expect(stack.pop()).toBe('second');
    expect(stack.pop()).toBe('first');
    expect(stack.pop()).toBeUndefined();
    expect(stack.isEmpty()).toBe(true);
  });

  it('handles falsy values, null, NaN, and object references properly', () => {
    const obj = { id: 42 };
    const stack = new Stack();
    stack.push(0, false, '', null, undefined, NaN, obj);

    expect(stack.size).toBe(7);
    expect(stack.pop()).toBe(obj);
    expect(Number.isNaN(stack.pop())).toBe(true);
    expect(stack.pop()).toBeUndefined();
    expect(stack.pop()).toBeNull();
    expect(stack.pop()).toBe('');
    expect(stack.pop()).toBe(false);
    expect(stack.pop()).toBe(0);
    expect(stack.isEmpty()).toBe(true);
  });

  it('peeks top item without removing it', () => {
    const stack = new Stack([100, 200]);
    expect(stack.peek()).toBe(200);
    expect(stack.size).toBe(2);
    expect(stack.peek()).toBe(200);
    expect(stack.size).toBe(2);
  });

  it('clears all items and returns this', () => {
    const stack = new Stack([1, 2, 3]);
    const ret = stack.clear();
    expect(ret).toBe(stack);
    expect(stack.size).toBe(0);
    expect(stack.isEmpty()).toBe(true);
    expect(stack.peek()).toBeUndefined();
  });

  it('exports shallow array copy without exposing internal storage', () => {
    const stack = new Stack(['bottom', 'middle', 'top']);
    const arr = stack.toArray();
    expect(arr).toEqual(['bottom', 'middle', 'top']);

    arr.push('extra');
    expect(stack.size).toBe(3);
    expect(stack.peek()).toBe('top');
  });

  it('iterates elements in LIFO order (top to bottom)', () => {
    const stack = new Stack([1, 2, 3]);
    const iterated = [...stack];
    expect(iterated).toEqual([3, 2, 1]);

    const items = [];
    for (const item of stack) {
      items.push(item);
    }
    expect(items).toEqual([3, 2, 1]);
  });
});
