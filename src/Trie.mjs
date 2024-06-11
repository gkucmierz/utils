
export const Trie = (words = []) => {
  const HAS = 0;
  const MAP = 1;
  const data = [false, new Map()];
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
  const findNode = word => {
    let node = data;
    for (let i = 0; i < word.length; ++i) {
      const char = word[i];
      if (!node[MAP]?.has(char)) return [false];
      node = node[MAP].get(char);
    }
    return node;
  };
  const has = word => findNode(word)[HAS];
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
    add, has, get,
    getData: () => data,
  };
};
