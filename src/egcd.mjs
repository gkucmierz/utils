
export const egcd = (a, b) => {
  let [x, y] = [0, 1];
  let [u, v] = [1, 0];
  while (a !== 0) {
    const [q, r] = [b/a | 0, b%a];
    const [m, n] = [x - u * q, y - v * q];
    [b, a, x, y, u, v] = [a, r, u, v, m, n];
  }
  return [b, x, y];
};
