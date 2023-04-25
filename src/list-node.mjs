

export class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
  
  toArr() {
    const ret = [];
    let node = this;
    while (node) {
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
