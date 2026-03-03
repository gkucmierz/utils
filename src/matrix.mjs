

/**
 * Represents a 2D matrix as a flat 1D array using a Proxy.
 * Allows accessing elements using a single index (row-major order).
 * @param {Array<Array<*>>} matrix - The 2D matrix to wrap.
 * @returns {Proxy} A proxy that behaves like a flat array.
 */
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
