/**
 * Calculates whether a given Mersenne number (2^p - 1) is prime using the Lucas-Lehmer primality test.
 * 
 * @param {number|bigint} exp - The exponent p of the Mersenne number M_p.
 * @param {boolean} [verbose=false] - If true, logs the calculation progress.
 * @returns {boolean} True if the Mersenne number is prime, false otherwise.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IDYFcDGBDAzgGQFMALMQmAIQEkEBfBAMxijAQCIABAcwGsswQ5AF4B6dHBCpcbANzBgGHARJlKVOUA|▶ Try it live in Instacode}
 */
export const lucasLehmerBI = (exp, verbose = false) => {
  const steps = exp - 2;
  const prime = 2n ** BigInt(exp) - 1n;
  verbose && console.log('prime: ', prime);
  let s = 4n;
  for (let i = 0; i < steps; ++i) {
    s = (s ** 2n - 2n) % prime;
    verbose && console.log(i, s);
  }
  return s === 0n;
};
