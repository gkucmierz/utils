
export const Heap = (valFn = n => n) => {
  const arr = [-1];

  const up = idx => {
    while (idx > 1) {
      const ni = idx / 2 | 0;
      if (valFn(arr[idx]) < valFn(arr[ni])) {
        [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
      }
      idx = ni;
    }
    return idx;
  };
  
  return {
    add: el => up(arr.push(el) - 1),
    take: () => {
      const len = arr.length;
      if (len <= 1) return [][0];
      let idx = 1;
      const res = arr[idx];
      while (idx < len) {
        const ia = idx * 2;
        const ib = idx * 2 + 1;
        if (ia >= len) break;
        if (ib >= len || valFn(arr[ia]) < valFn(arr[ib])) {
          arr[idx] = arr[ia];
          idx = ia;
        } else {
          arr[idx] = arr[ib];
          idx = ib;
        }
      }
      if (idx === arr.length - 1) {
        arr.pop();
      } else {
        arr[idx] = arr.pop();
        up(idx);
      }
      return res;
    },
    size: () => arr.length - 1,
    data: () => arr.slice(1),
  };
};
