/**
 * A safe alternative to setInterval that uses recursive setTimeout.
 * It waits for the callback (even if it's async) to finish before scheduling the next tick,
 * preventing overlapping executions and event loop blocking.
 *
 * @param {Function} cb - Function to execute (can be async)
 * @param {number} delay - Delay in ms between executions
 * @param {boolean} [immediate=true] - Whether to fire the first execution immediately
 * @param {boolean} [nextTick=false] - If immediate is true, whether to yield to the event loop before the first execution
 * @returns {Function} A function to clear the interval
 */
export const setSafeInterval = (cb, delay, immediate = true, nextTick = false) => {
  let isCleared = false;
  let timerId = null;

  const loop = async () => {
    if (isCleared) return;
    
    try {
      await cb();
    } catch (e) {
      console.error('SafeInterval callback error:', e);
    }
    
    if (!isCleared) {
      timerId = setTimeout(loop, delay);
    }
  };

  if (immediate) {
    if (nextTick) {
      timerId = setTimeout(loop, 0);
    } else {
      loop();
    }
  } else {
    timerId = setTimeout(loop, delay);
  }

  return () => {
    isCleared = true;
    clearTimeout(timerId);
  };
};
