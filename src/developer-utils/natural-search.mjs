/**
 * @module developer-utils
 */

import { is, Type } from './type.mjs';

const DEFAULT_BI_MAX_CAP = (1n << 16384n) - 1n;

const getNaturalSearch = (ONE, TWO, MINUS_ONE, DEFAULT_CAP, half, resolveCap) => {
  return (cond, retFirstTrue = true, maxCap = DEFAULT_CAP) => {
    const cap = resolveCap(maxCap);
    const halfCap = half(cap);
    let min = ONE;
    let max = ONE;
    while (1) {
      const stop = cond(max);
      if (stop) break;
      if (max >= cap) {
        return MINUS_ONE;
      }
      min = max;
      max = max > halfCap ? cap : max * TWO;
    }
    if (max <= ONE) {
      return ONE;
    }
    let mid;
    while (1) {
      mid = min + half(max - min);
      const stop = cond(mid);
      if (stop) {
        max = mid;
      } else {
        min = mid;
      }
      if (max - min <= ONE) {
        return retFirstTrue ? max : min;
      }
    }
  };
};

/**
 * Natural Search Algorithm by gkucmierz (IEEE-754 Safe Integer variant).
 * Exponentially gallops (`1, 2, 4, 8, ...`) to bracket a monotonic threshold and binary-searches
 * the exact integer step boundary in `O(log N)` probes without requiring a known upper bound upfront.
 * Returns `-1` when `cond` never turns truthy up to `maxCap`, preventing infinite loops on unsatisfiable predicates.
 * Both galloping (`max > halfCap ? cap : max * 2`) and bisection (`min + Math.floor((max - min) / 2)`)
 * are strictly overflow-safe and never exceed `Number.MAX_SAFE_INTEGER` (`2^53 - 1`).
 *
 * @param {Function} cond - Monotonic predicate `(n: number) => boolean` transitioning from `false` to `true`.
 * @param {boolean} [retFirstTrue=true] - If `true`, returns the first integer where `cond(n)` is truthy; if `false`, returns the last integer before `cond(n)` turns truthy (`1` when `cond(1)` is already truthy).
 * @param {number} [maxCap=Number.MAX_SAFE_INTEGER] - Upper safety bound (`1 .. Number.MAX_SAFE_INTEGER`) guarding against unsatisfiable predicates.
 * @returns {number} Exact integer threshold (`>= 1`), or `-1` if `cond` remains falsy up to `maxCap`.
 * @example
 * naturalSearch((n) => n * 3 > 230, false); // 76 (largest integer before exceeding 230)
 * naturalSearch((n) => n >= 10, true);      // 10 (first integer satisfying n >= 10)
 * naturalSearch(() => false, true, 1024);   // -1 (unsatisfiable predicate safely capped)
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYEM4FcboDYDKApujAMYAWCAvggGYxRgIBEAAgOYDWWZYIRGAC8A9Fjgg8AZxYBuYMAzZchEuQrygA|▶ Try it live in Instacode}
 */
export const naturalSearch = getNaturalSearch(
  1,
  2,
  -1,
  Number.MAX_SAFE_INTEGER,
  n => Math.floor(n / 2),
  n => (is(n, Type.NUMBER) && Number.isFinite(n) && n >= 1
    ? Math.min(Math.floor(n), Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER)
);

/**
 * Arbitrary-precision `BigInt` twin of {@link module:developer-utils.naturalSearch|naturalSearch},
 * generated from the same overflow-free `getNaturalSearch` monadic core.
 * Designed for number theory, RSA-scale cryptography, combinatorics, and fixed-point geometry exceeding `2^53 - 1`.
 *
 * <p><strong>⚠️ Runtime Engine Limits &amp; Quadratic <code>O(B²)</code> Galloping Warning (Read Before Raising <code>maxCap</code>):</strong></p>
 * <p>ECMAScript (TC39) does not standardize <code>BigInt.MAX_VALUE</code>. Each JS engine enforces its own hard bit ceiling;
 * exceeding it throws <code>RangeError: Maximum BigInt size exceeded</code> — most critically when code tested on
 * <strong>V8</strong> (Chrome / Node.js) is deployed to <strong>non-V8 runtimes</strong> (Safari / iOS WebKit / Firefox / Bun),
 * whose hard ceiling is <strong>1024× smaller</strong>:</p>
 * <table>
 *   <thead>
 *     <tr><th>JS Engine</th><th>Runtimes</th><th>Hard Bit Limit</th><th>Max Value</th><th>RAM / Value</th><th>Fail-Safe Time</th></tr>
 *   </thead>
 *   <tbody>
 *     <tr><td><strong>Default <code>maxCap</code></strong></td><td>All engines (safe default)</td><td><code>16,384</code> bits (<code>2^14</code>)</td><td><code>(1n &lt;&lt; 16384n) - 1n</code> (~4,932 digits)</td><td>2 KiB</td><td>~3 ms</td></tr>
 *     <tr><td><strong>SpiderMonkey / JSC</strong></td><td>Firefox, Safari, iOS WebKit, Bun</td><td><strong><code>1,048,576</code> bits (<code>2^20</code>)</strong></td><td><code>(1n &lt;&lt; 1048576n) - 1n</code> (~315,652 digits)</td><td>128 KiB</td><td>~7.3 s</td></tr>
 *     <tr><td><strong>V8 (32-bit)</strong></td><td>32-bit Android / WASM32</td><td><code>536,870,912</code> bits (<code>2^29</code>)</td><td><code>2^(2^29) - 1</code> (~161.6M digits)</td><td>64 MiB</td><td>Unbounded (days)</td></tr>
 *     <tr><td><strong>V8 (64-bit)</strong></td><td>Chrome, Node.js, Edge, Deno</td><td><strong><code>1,073,741,824</code> bits (<code>2^30</code>)</strong></td><td><code>2^(2^30) - 1</code> (~323.2M digits)</td><td>128 MiB</td><td>Unbounded (~88 days)</td></tr>
 *   </tbody>
 * </table>
 * <ul>
 *   <li><strong>Cross-Engine Portability Trap:</strong> Passing <code>maxCap &gt;= (1n &lt;&lt; 1048576n)</code> works on 64-bit V8,
 *       but will immediately crash with <code>RangeError</code> on Safari (macOS/iOS), Firefox, and Bun!</li>
 *   <li><strong>Quadratic <code>O(B²)</code> Memory Copy Cost:</strong> Doubling a <code>b</code>-bit <code>BigInt</code> copies <code>O(b)</code> machine words,
 *       so galloping across <code>B</code> bits costs <code>O(B²)</code> CPU time. Never set <code>maxCap</code> near V8's <code>2^30</code>-bit ceiling
 *       unless the predicate is mathematically guaranteed to turn <code>true</code> early.</li>
 *   <li><strong>Zero-Extra-Bit Invariant:</strong> Internally uses <code>max &gt; (cap &gt;&gt; 1n)</code> and <code>min + ((max - min) &gt;&gt; 1n)</code>,
 *       guaranteeing zero intermediate bit overflow even when <code>maxCap</code> sits at the exact last bit supported by the host engine.</li>
 * </ul>
 *
 * @param {Function} cond - Monotonic predicate `(n: bigint) => boolean` transitioning from `false` to `true`.
 * @param {boolean} [retFirstTrue=true] - If `true`, returns the first `BigInt` where `cond(n)` is truthy; if `false`, returns the last `BigInt` before `cond(n)` turns truthy (`1n` when `cond(1n)` is already truthy).
 * @param {bigint} [maxCap=(1n << 16384n) - 1n] - Upper safety bound (`>= 1n`). Defaults to `2^16384 - 1` (~4,932 decimal digits, ~3 ms worst-case fail-safe across all JS engines).
 * @returns {bigint} Exact `BigInt` threshold (`>= 1n`), or `-1n` if `cond` remains falsy up to `maxCap`.
 * @example
 * // Find smallest n whose square exceeds 10^100 (way beyond Number.MAX_SAFE_INTEGER):
 * const googol = 10n ** 100n;
 * naturalSearchBI((n) => n * n > googol, true); // 100000000000000000000000000000000000000000000000001n
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYEM4FcboDYDKApujAMYAWAQgJIIC+CAZjFGAgEQACA5gNZYyYEERgAvAPRY4IPAGcOAbmDAM2XIRLlqNZUA|▶ Try it live in Instacode}
 */
export const naturalSearchBI = getNaturalSearch(
  1n,
  2n,
  -1n,
  DEFAULT_BI_MAX_CAP,
  n => n >> 1n,
  n => {
    if (is(n, Type.BIGINT) && n >= 1n) return n;
    if (is(n, Type.NUMBER) && Number.isFinite(n) && n >= 1) return BigInt(Math.floor(n));
    return DEFAULT_BI_MAX_CAP;
  }
);
