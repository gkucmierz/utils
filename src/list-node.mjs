

export class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
  
  toArr() {
    const ret = [];
    let node = this;
    const set = new Set();
    while (node) {
      if (set.has(node)) throw Error('Cyclic reference detected');
      set.add(node);
      ret.push(node.val);
      node = node.next;
    }
    return ret;
  }
  
  static fromArr(iter) {
    const head = new ListNode;
    let node = head;
    for (let val of iter) {
      node.next = new ListNode(val);
      node = node.next;
    }
    return head.next;
  }
};
