/**
 * Creates a Trie (prefix tree) data structure.
 * Implemented as a proper ES6 Class to fix prototyping documentation and encapsulate nodes.
 */
export class Trie {
  static #HAS = 0;
  static #MAP = 1;

  #data = [false, new Map()];
  #strict;

  /**
   * Initializes the Trie class object.
   * @param {string[]} [words=[]] - Initial words to add to the Trie.
   * @param {boolean} [strict=true] - If true, removing a word cleans up unused nodes.
   *                                  If false, removal is faster but may leave unused nodes.
   */
  constructor(words = [], strict = true) {
    this.#strict = strict;
    words.forEach(word => this.add(word));
  }
  
  /**
   * Adds a word to the Trie.
   * @param {string} word - The word to add.
   * @returns {boolean} True if the word was added (didn't exist before), false otherwise.
   */
  add(word) {
    let node = this.#data;
    for (let i = 0; i < word.length; ++i) {
      const char = word[i];
      if (!node[Trie.#MAP]) node[Trie.#MAP] = new Map();
      const child = node[Trie.#MAP].get(char) ?? [false];
      node[Trie.#MAP].set(char, child);
      node = child;
    }
    if (node[Trie.#HAS]) return false;
    node[Trie.#HAS] = true;
    return true;
  }

  #listNodes(word) {
    const nodes = [this.#data];
    for (let i = 0; i < word.length; ++i) {
      const node = nodes.at(-1);
      const char = word[i];
      if (!node[Trie.#MAP]?.has(char)) {
        nodes.push([false]);
        break;
      }
      nodes.push(node[Trie.#MAP].get(char));
    }
    return nodes;
  }

  #findNode(word) {
    return this.#listNodes(word).at(-1);
  }
  
  /**
   * Removes a word from the Trie.
   * @param {string} word - The word to remove.
   * @returns {boolean} True if the word was removed, false if it didn't exist.
   */
  remove(word) {
    const nodes = this.#listNodes(word);
    const rev = nodes.reverse();
    const removed = rev.at(0)[Trie.#HAS];
    rev.at(0)[Trie.#HAS] = false;
    if (!this.#strict) return removed;
    for (let i = 0; i < rev.length; ++i) {
      const node = rev[i];
      const first = i === 0;
      if (first) {
        if (node[Trie.#MAP]) break;
      } else {
        if (node[Trie.#MAP]?.size <= 1) {
          delete node[Trie.#MAP];
        } else {
          break;
        }
      }
      if (node[Trie.#HAS]) break;
    }
    return removed;
  }
  
  /**
   * Checks if a word exists in the Trie.
   * @param {string} word - The word to check.
   * @returns {boolean} True if the word exists, false otherwise.
   */
  has(word) {
    return this.#findNode(word)[Trie.#HAS];
  }
  
  /**
   * Returns all words in the Trie that start with the given prefix.
   * @param {string} begin - The prefix to search for.
   * @returns {string[]} An array of words starting with the prefix.
   */
  get(begin) {
    const res = [];
    const loop = (node, str = '') => {
      if (!node) return;
      if (node[Trie.#HAS]) res.push(begin + str);
      const map = node[Trie.#MAP] || new Map();
      [...map].forEach(([char, n]) => loop(n, str + char));
    };
    loop(this.#findNode(begin));
    return res;
  }
  
  /**
   * Returns the internal data structure of the Trie.
   * @returns {Array} The root node of the Trie.
   */
  getData() {
    return this.#data;
  }
}
