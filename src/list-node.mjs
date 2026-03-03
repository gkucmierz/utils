

/**
 * Represents a node in a singly linked list.
 */
export class ListNode {
  /**
   * Creates a new ListNode.
   * @param {*} [val=0] - The value of the node.
   * @param {ListNode} [next=null] - The next node in the list.
   */
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
  
  /**
   * Converts the linked list to an array.
   * Detects cycles and throws an error if one is found.
   * @returns {Array} An array containing the values of the list nodes.
   * @throws {Error} If a cyclic reference is detected.
   */
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
  
  /**
   * Creates a linked list from an iterable.
   * @param {Iterable} iter - The iterable to create the list from.
   * @returns {ListNode|null} The head of the created linked list, or null if empty.
   */
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
