
import {
  powModBI,
} from './pow-mod.mjs';

/* Takes as input an odd prime p and n < p and returns r
 * such that r * r = n [mod p]. */
export const tonelliShanksBI = (n, p) => {
  let s = 0n;
  let q = p - 1n;
  while ((q & 1n) === 0n) {
    q /= 2n;
    ++s;
  }
  if (s === 1n) {
    const r = powModBI(n, (p+1n) / 4n, p);
    if ((r * r) % p === n) return r;
    return 0n;
  }
  // Find the first quadratic non-residue z by brute-force search
  let z = 1n;
  while (powModBI(++z, (p-1n)/2n, p) !== p - 1n);
  let c = powModBI(z, q, p);
  let r = powModBI(n, (q+1n)/2n, p);
  let t = powModBI(n, q, p);
  let m = s;
  while (t !== 1n) {
    let tt = t;
    let i = 0n;
    while (tt !== 1n) {
      tt = (tt * tt) % p;
      ++i;
      if (i === m) return 0n;
    }
    let b = powModBI(c, powModBI(2n, m-i-1n, p-1n), p);
    let b2 = (b * b) % p;
    r = (r * b) % p;
    t = (t * b2) % p;
    c = b2;
    m = i;
  }
  if ((r * r) % p === n) return r;
  return 0n;
};
