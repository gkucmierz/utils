
/**
 * Formats a BigNumber, Number or string representation of a number
 * by separating thousands with a provided separator.
 *
 * @param {number|string|bigint} num - The number to format.
 * @param {string} [separator=''] - The string to use as a thousand separator.
 * @param {function(string): string} [wrapFn=_=>_] - Optional function to wrap each part of the number.
 * @returns {string} The formatted number.
 */
const formatBigNumberBoth = (num, separator = '', wrapFn = _ => _) => {
  const str = String(num);
  const rev = [...str].reverse().join('');
  const match = rev.match(/(\d*\.\-?)|(\d{3}\-?)|(\d{1,3}\-?)|(\-)/g);
  const revInside = (match && match.join('') === rev)
    ? match.map(part => [...part].reverse().join(''))
    : [str];
  const wrap = revInside.map(wrapFn);
  return wrap.reverse().join(separator);
};

/**
 * @type {typeof formatBigNumberBoth}
 */
export const formatBigNumber = formatBigNumberBoth;

/**
 * @type {typeof formatBigNumberBoth}
 */
export const formatBigNumberBI = formatBigNumberBoth;

export const wrapFn = () => {
  let even = true;
  return part => {
    const cls = even ? 'even' : 'odd';
    even = !even;
    return `<span class="${cls}">${part}</span>`;
  };
};
