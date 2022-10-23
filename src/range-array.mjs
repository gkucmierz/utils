
// https://www.codewars.com/kata/57d83dfc950d842dcb00005b/train/javascript

export const range2array = ranges => {
  return ranges.reduce((arr, range) => {
    const min = range[0];
    const max = range[1] ?? min;
    return arr.push(
      ...new Array(max - min + 1).fill(0).map((n ,i) => min + i)
    ), arr;
  }, []);
};

export const array2range = arr => {
  const ranges = [];
  let last = arr[0];
  let begin = last;
  for (let i = 1; i <= arr.length; ++i) {
    const n = arr[i];
    if (n !== last + 1) {
      ranges.push([begin, last]);
      begin = n;
    }
    last = n;
  }
  return ranges;
};
