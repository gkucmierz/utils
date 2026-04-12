/**
 * Consume iterator values asynchronously utilizing macro-task queue
 * to prevent Event Loop blocking.
 *
 * @param {Iterator} iter - Iterator object with .next() method returning {value, done}
 * @param {function} progressFn - Callback function executed for each iteration Step
 * @returns {Promise} - Resolves when the iterator is fully consumed
 */
export const consumeIteratorNonBlocking = (iter, progressFn) => {
  return new Promise((resolve, reject) => {
    const loop = () => {
      try {
        const { value, done } = iter.next();
        if (done) {
          resolve();
        } else {
          progressFn(value);
          setTimeout(loop, 0);
        }
      } catch (err) {
        reject(err);
      }
    };
    loop();
  });
};
