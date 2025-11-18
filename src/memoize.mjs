
/**
 * Memoize function, that builds tree structure for arguments
 * and compares arguments by reference
 * @method
 * @param {Function} Function to memoize
 * @return {Function} Memoized function
 */
export const memoize = fn => {
  const maps = [];

  const getLeafMap = args => {
    if (!maps[args.length]) maps[args.length] = new Map();
    const map = maps[args.length];

    const leaf = args.reduce((map, arg) => {
      if (map.has(arg)) return map.get(arg);
      const tmp = new Map();
      map.set(arg, tmp);
      return tmp;
    }, map);

    return leaf;
  };

  const zero = {
    called: false,
    ret: null,
  };
  
  return function() {
    const args = [...arguments];
    if (args.length === 0) {
      if (zero.called) return zero.ret;
      zero.called = true;
      return zero.ret = fn();
    }
    const [firstArg, ...restArgs] = args;
    const map = getLeafMap(restArgs);
    if (map.has(firstArg)) return map.get(firstArg);
    const ret = fn(...args);
    map.set(firstArg, ret);
    return ret;
  };
};
