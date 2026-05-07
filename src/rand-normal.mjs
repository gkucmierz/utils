export const randNormal = (mean = 0, sigma = 1) => {
  const y1 = Math.random();
  const y2 = Math.random();
  return mean + sigma * Math.cos(2 * Math.PI * y2) * Math.sqrt(-2 * Math.log(y1));
};
