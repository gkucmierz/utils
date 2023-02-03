// set-like data structure built using map
// with elements counter.
// .delete - removes one element
// .deleteAll - removes all occurrences
// .cnt - get element occurrences

export class SetCnt {
  #map = new Map();
  
  constructor(iter) {
    for (const el of iter ?? []) {
      this.add(el);
    }
  }

  add(el) {
    const cnt = this.cnt(el);
    this.#map.set(el, cnt + 1);
    return this;
  }

  has(el) {
    return this.#map.has(el);
  }

  delete(el) {
    if (!this.#map.has(el)) return false;
    const cnt = this.cnt(el);
    if (cnt === 1) return this.deleteAll(el);
    this.#map.set(el, cnt - 1);
    return true;
  }
  
  deleteAll(el) {
    this.#map.delete(el);
    return true;
  }

  cnt(el) {
    return this.#map.get(el) ?? 0;
  }
  
  *[Symbol.iterator]() {
    for (const el of this.#map) {
      yield el;
    }
  }

  entries() {
    return this;
  }

  *values() {
    for (const [el, cnt] of this.#map) {
      yield el;
    }
  }

  *keys() {
    for (const [el, cnt] of this.#map) {
      yield cnt;
    }
  }
}
