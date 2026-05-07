/**
 * Generates a random number from a normal (Gaussian) distribution.
 * Uses the Box-Muller transform.
 * @param {number} [mean=0] - The mean of the normal distribution.
 * @param {number} [sigma=1] - The standard deviation of the normal distribution.
 * @returns {number} A random number from the specified normal distribution.
 */
export const randNormal = (mean = 0, sigma = 1) => {
  const y1 = Math.random();
  const y2 = Math.random();
  return mean + sigma * Math.cos(2 * Math.PI * y2) * Math.sqrt(-2 * Math.log(y1));
};
