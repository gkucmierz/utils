
export const num2bijective = (num, alpha = '12') => {
  const len = alpha.length;
  let c = 0;
  let x = 1;
  while (num >= x) {
    c++;
    num -= x;
    x *= len;
  }
  const res = [];
  for (let i = 0; i < c; i++) {
    const rem = num % len;
    res.unshift(alpha.charAt(num % len));
    num = (num - rem) / len;
  }
  return res.join('');
};

export const bijective2num = (str, alpha = '12') => {
  const map = new Map([...alpha].map((c, i) => [c, i]));
  let res = 0;
  const len = alpha.length;
  return [...str].reduce((res, c) => {
    return res * len + map.get(c) + 1;
  }, 0);
};
