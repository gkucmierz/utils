
import {
  gcd,
  gcdBI,
} from './gcd.mjs';

// Least common multiple

const getLcm = gcd => {
  return (a, b) => a * b / gcd(a, b);
}

export const lcm = getLcm(gcd);
export const lcmBI = getLcm(gcdBI);
