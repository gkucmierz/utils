
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

export const num2bijectiveBI = (num, alpha = '12') => {
  const len = BigInt(alpha.length);
  let c = 0n;
  let x = 1n;
  while (num >= x) {
    c++;
    num -= x;
    x *= len;
  }
  const res = [];
  for (let i = 0n; i < c; i++) {
    const rem = num % len;
    res.unshift(alpha.charAt(Number(num % len)));
    num = (num - rem) / len;
  }
  return res.join('');
};

export const bijective2numBI = (str, alpha = '12') => {
  const map = new Map([...alpha].map((c, i) => [c, BigInt(i)]));
  let res = 0n;
  const len = BigInt(alpha.length);
  return [...str].reduce((res, c) => {
    return res * len + map.get(c) + 1n;
  }, 0n);
};
