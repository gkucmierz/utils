export const chunks = (input, size = 1) => {
  if (size < 1) size = 1;
  
  if (typeof input === 'string' || Array.isArray(input)) {
    const numChunks = Math.ceil(input.length / size);
    const result = new Array(numChunks);
    for (let i = 0, offset = 0; i < numChunks; ++i, offset += size) {
      result[i] = input.slice(offset, offset + size);
    }
    return result;
  }

  // Fallback for other synchronous iterables (Sets, Maps, custom iterators)
  const result = [];
  let currentChunk = [];
  for (const item of input) {
    currentChunk.push(item);
    if (currentChunk.length === size) {
      result.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }
  return result;
};

export function* chunksIterator(iterable, size = 1) {
  if (size < 1) size = 1;
  
  const isString = typeof iterable === 'string';
  let currentChunk = [];
  
  for (const item of iterable) {
    currentChunk.push(item);
    if (currentChunk.length === size) {
      yield isString ? currentChunk.join('') : currentChunk;
      currentChunk = [];
    }
  }
  
  if (currentChunk.length > 0) {
    yield isString ? currentChunk.join('') : currentChunk;
  }
}

export async function* chunksAsyncIterator(asyncIterable, size = 1) {
  if (size < 1) size = 1;
  
  let currentChunk = [];
  
  for await (const item of asyncIterable) {
    currentChunk.push(item);
    if (currentChunk.length === size) {
      yield currentChunk;
      currentChunk = [];
    }
  }
  
  if (currentChunk.length > 0) {
    yield currentChunk;
  }
}
