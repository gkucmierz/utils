

// represent matrix as array using Proxy
// todo: iterator can be added

export const matrixAsArray = matrix => {
  const [h, w] = [matrix.length, matrix[0].length];
  return new Proxy([], {
    get(target, prop, receiver) {
      if (prop === 'length') return h * w;
      const idx = +prop;
      const col = idx % w;
      const row = (idx - col) / w;
      return matrix[row][col];
    }
  });
};
