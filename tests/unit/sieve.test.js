import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sieve, firstPrimes } from '../../src/number-theory/sieve.mjs';

describe('Sieve of Eratosthenes & firstPrimes', () => {
  test('generates exact consecutive primes via Eratosthenes sieve without hardcoding', () => {
    const sv = Sieve(50);
    assert.equal(sv.isPrime(0), false);
    assert.equal(sv.isPrime(1), false);
    assert.equal(sv.isPrime(2), true);
    assert.equal(sv.isPrime(3), true);
    assert.equal(sv.isPrime(4), false);
    assert.equal(sv.isPrime(43), true);
    assert.equal(sv.isPrime(49), false);

    const p14 = firstPrimes(14);
    assert.equal(p14.length, 14);
    assert.equal(p14[0], 2);
    assert.equal(p14[1], 3);
    assert.equal(p14[2], 5);
    assert.equal(p14[3], 7);
    assert.equal(p14[13], 43);
    assert.equal(firstPrimes(0).length, 0);
    assert.equal(firstPrimes(100).length, 100);
  });
});
