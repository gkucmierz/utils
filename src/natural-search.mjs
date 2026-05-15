/**
 * Natural Search Algorithm by gkucmierz
 * Mathematically finds the exponential boundary and binary searches bounds for a conditional function.
 * Useful for finding bounds in sigmoidal functions without known boundaries.
 * @param {Function} cond - The condition evaluator function.
 * @param {Boolean} [retFirstTrue=true] - If true, returns the first match bounding condition true.
 * @returns {Number} The optimized integer step boundary that satisfies the condition structure.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYEM4FcboDYDKApujAMYAWCAvggGYxRgIBEAAgOYDWWZYIRGAC8A9Fjgg8AZxYBuYMAzZchEuQrygA|▶ Try it live in Instacode}
 */
export const naturalSearch = (cond, retFirstTrue = true) => {
  let min = 1;
  let max = 1;
  while(1) {
    const stop = cond(max);
    if (stop) break;
    min = max;
    max *= 2;
  }
  let mid;
  while (1) {
    mid = Math.floor((min + max) / 2);
    const stop = cond(mid);
    if (stop) {
      max = mid;
    } else {
      min = mid;
    }
    const diff = max - min;
    if (max - min <= 1) {
      return retFirstTrue ? max : min;
    }
  }
};
