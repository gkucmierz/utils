/**
 * Measures the execution time of a given function by running it multiple times.
 * Useful for micro-benchmarking and performance comparison.
 * 
 * @param {Function} fn - The function to benchmark.
 * @param {number} [times=1e8] - The number of iterations to run the function.
 * @param {string} [memo='noop'] - A descriptive label for the benchmark result.
 * @returns {Object} An object containing the `memo` and the `duration` (in milliseconds).
 */
export const measurePerformance = (fn, times = 1e8, memo = 'noop') => {
  const t1 = Date.now();
  while (times--) {
    fn();
  }
  const t2 = Date.now();
  
  return {
    memo,
    duration: t2 - t1
  };
};
