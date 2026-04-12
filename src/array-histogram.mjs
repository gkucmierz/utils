/**
 * Generates a Map with unique elements and their occurring frequencies.
 * Transforms an array into a Map of (key -> quantity) using an optional mapping callback.
 * 
 * @param {Array} arr Target array
 * @param {function} pick Projection callback (defaults to identity function)
 * @returns {Map} Histogram mapping
 */
export const arrayHistogram = (iter, pick = el => el) => {
  const quant = new Map();
  for (const obj of iter) {
    const el = pick(obj);
    const cnt = quant.get(el) ?? 0;
    quant.set(el, cnt + 1);
  }
  return quant;
};
