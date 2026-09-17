/**
 * @module data-structures
 */

/**
 * ConflatingQueue (Coalescing Keyed Work Queue).
 *
 * A specialized asynchronous task queue that executes tasks with controllable concurrency
 * (default 1 = sequential mutex) while automatically conflating (superseding/deduplicating)
 * pending tasks with matching keys.
 *
 * When multiple tasks with the same key are enqueued before the previous task has started,
 * the older pending task is superseded (resolved with `{ superseded: true }`), and only the
 * freshest task is executed.
 *
 * Ideal for hardware control (DDC/CI, I2C, Serial), UI sliders, telemetry, and rate-limited APIs.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMJQHYDMA2BDOEDAcwEUBXAUyoQF8EsYowEAiAAWIGtyBjMEJRgAvAPTlCOAM6sA3MGDps+QiQrVK8oA|▶ Try it live in Instacode}
 */
export class ConflatingQueue {
  #concurrency;
  #maxPending;
  #pendingTasks = new Map();
  #runningCount = 0;
  #idleResolvers = [];

  /**
   * Initializes the ConflatingQueue.
   *
   * @param {object} [options={}]
   * @param {number} [options.concurrency=1] - Maximum concurrent tasks executing simultaneously.
   * @param {number} [options.maxPending=Infinity] - Maximum allowed distinct pending keys in queue.
   */
  constructor({ concurrency = 1, maxPending = Infinity } = {}) {
    this.#concurrency = Math.max(1, concurrency || 1);
    this.#maxPending = maxPending > 0 ? maxPending : Infinity;
  }

  /**
   * Enqueues an asynchronous task associated with a specific key.
   * If a pending task with the same key already exists, it is superseded by the new task.
   *
   * @param {string|number|symbol} key - Unique identifier for task coalescing.
   * @param {Function} taskFn - The async or sync function to execute.
   * @returns {Promise<*|{ superseded: boolean }>} Resolves with task result or `{ superseded: true }`.
   */
  enqueue(key, taskFn) {
    if (typeof taskFn !== 'function') {
      return Promise.reject(new TypeError('taskFn must be a function'));
    }

    if (this.#pendingTasks.has(key)) {
      const prev = this.#pendingTasks.get(key);
      prev.resolve({ superseded: true });
    } else if (this.#pendingTasks.size >= this.#maxPending) {
      return Promise.reject(new Error(`ConflatingQueue maxPending limit (${this.#maxPending}) exceeded`));
    }

    return new Promise((resolve, reject) => {
      this.#pendingTasks.set(key, { taskFn, resolve, reject });
      this.#drain();
    });
  }

  /**
   * Cancels a pending unstarted task by key.
   *
   * @param {string|number|symbol} key - Key of the pending task to cancel.
   * @returns {boolean} True if task was cancelled, false if not found in pending queue.
   */
  cancel(key) {
    if (!this.#pendingTasks.has(key)) return false;
    const item = this.#pendingTasks.get(key);
    this.#pendingTasks.delete(key);
    item.resolve({ cancelled: true });
    return true;
  }

  /**
   * Clears and cancels all currently pending unstarted tasks.
   */
  clear() {
    for (const item of this.#pendingTasks.values()) {
      item.resolve({ cancelled: true });
    }
    this.#pendingTasks.clear();
  }

  /**
   * Checks if the queue is completely idle (no running or pending tasks).
   *
   * @type {boolean}
   */
  get isIdle() {
    return this.#runningCount === 0 && this.#pendingTasks.size === 0;
  }

  /**
   * Returns current task count metrics.
   *
   * @type {{ running: number, pending: number, total: number }}
   */
  get size() {
    return {
      running: this.#runningCount,
      pending: this.#pendingTasks.size,
      total: this.#runningCount + this.#pendingTasks.size
    };
  }

  /**
   * Returns complete diagnostic statistics of the queue.
   *
   * @returns {{ running: number, pending: number, total: number, concurrency: number, maxPending: number, isIdle: boolean, pendingKeys: Array<string|number|symbol> }}
   */
  getStats() {
    return {
      running: this.#runningCount,
      pending: this.#pendingTasks.size,
      total: this.#runningCount + this.#pendingTasks.size,
      concurrency: this.#concurrency,
      maxPending: this.#maxPending,
      isIdle: this.isIdle,
      pendingKeys: Array.from(this.#pendingTasks.keys())
    };
  }

  /**
   * Returns a promise that resolves when the queue becomes completely idle.
   *
   * @returns {Promise<void>}
   */
  onIdle() {
    if (this.isIdle) return Promise.resolve();
    return new Promise(resolve => {
      this.#idleResolvers.push(resolve);
    });
  }

  async #drain() {
    while (this.#runningCount < this.#concurrency && this.#pendingTasks.size > 0) {
      const [key, item] = this.#pendingTasks.entries().next().value;
      this.#pendingTasks.delete(key);
      this.#runningCount++;

      (async () => {
        try {
          const result = await item.taskFn();
          item.resolve(result);
        } catch (err) {
          item.reject(err);
        } finally {
          this.#runningCount--;
          if (this.isIdle) {
            const resolvers = this.#idleResolvers.splice(0);
            resolvers.forEach(r => r());
          }
          this.#drain();
        }
      })();
    }
  }
}
