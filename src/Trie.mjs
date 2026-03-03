
/**
 * Creates a Trie (prefix tree) data structure.
 * @param {string[]} [words=[]] - Initial words to add to the Trie.
 * @param {boolean} [strict=true] - If true, removing a word cleans up unused nodes.
 *                                  If false, removal is faster but may leave unused nodes.
 * @returns {object} The Trie instance with methods.
 */
export const Trie = (words = [], strict = true) => {
  const HAS = 0;
  const MAP = 1;
  const data = [false, new Map()];
  
  /**
   * Adds a word to the Trie.
   * @param {string} word - The word to add.
   * @returns {boolean} True if the word was added (didn't exist before), false otherwise.
   */
  const add = word => {
    let node = data;
    for (let i = 0; i < word.length; ++i) {
      const char = word[i];
      if (!node[MAP]) node[MAP] = new Map();
      const child = node[MAP].get(char) ?? [false];
      node[MAP].set(char, child);
      node = child;
    }
    if (node[HAS]) return false;
    node[HAS] = true;
    return true;
  };
  const listNodes = word => {
    const nodes = [data];
    for (let i = 0; i < word.length; ++i) {
      const node = nodes.at(-1);
      const char = word[i];
      if (!node[MAP]?.has(char)) {
        nodes.push([false]);
        break;
      }
      nodes.push(node[MAP].get(char));
    }
    return nodes;
  };
  const findNode = word => {
    return listNodes(word).at(-1);
  };
  
  /**
   * Removes a word from the Trie.
   * @param {string} word - The word to remove.
   * @returns {boolean} True if the word was removed, false if it didn't exist.
   */
  const remove = word => {
    const nodes = listNodes(word);
    const rev = nodes.reverse();
    const removed = rev.at(0)[HAS];
    rev.at(0)[HAS] = false;
    if (!strict) return removed;
    for (let i = 0; i < rev.length; ++i) {
      const node = rev[i];
      const first = i === 0;
      const noMap = !node[MAP];
      const size1 = node[MAP]?.size <= 1;
      if (first) {
        if (node[MAP]) break;
      } else {
        if (node[MAP]?.size <= 1) {
          delete node[MAP];
        } else {
          break;
        }
      }
      if (node[HAS]) break;
    }
    return removed;
  };
  
  /**
   * Checks if a word exists in the Trie.
   * @param {string} word - The word to check.
   * @returns {boolean} True if the word exists, false otherwise.
   */
  const has = word => findNode(word)[HAS];
  
  /**
   * Returns all words in the Trie that start with the given prefix.
   * @param {string} begin - The prefix to search for.
   * @returns {string[]} An array of words starting with the prefix.
   */
  const get = begin => {
    const res = [];
    const loop = (node, str = '') => {
      if (!node) return;
      if (node[HAS]) res.push(begin + str);
      const map = node[MAP] || new Map();
      [...map].map(([char, node]) => loop(node, str + char));
    };
    loop(findNode(begin));
    return res;
  };
  words.map(word => add(word));
  return {
    add, has, get, remove,
    /**
     * Returns the internal data structure of the Trie.
     * @returns {Array} The root node of the Trie.
     */
    getData: () => data,
  };
};
