
import { ListNode } from '../src/list-node.mjs';

describe('ListNode', () => {
  it('constructor', () => {
    expect(new ListNode().val).toEqual(0);
    expect(new ListNode().next).toEqual(null);
    expect(new ListNode(123).val).toEqual(123);
    expect(new ListNode(123).next).toEqual(null);
    expect(new ListNode(123, 'next').next).toEqual('next');
  });

  it('toArr', () => {
    expect(new ListNode().toArr()).toEqual([0]);
    expect(new ListNode(123).toArr()).toEqual([123]);
    expect(new ListNode(1, new ListNode(2)).toArr()).toEqual([1, 2]);
  });

  it('fromArr', () => {
    expect(ListNode.fromArr([1, 2])).toEqual(new ListNode(1, new ListNode(2)));
  });

  it('both', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(ListNode.fromArr(arr).toArr()).toEqual(arr);
  });
});
