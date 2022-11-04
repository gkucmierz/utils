
import {
  phi,
  phiBI,
} from '../src/phi.mjs';

describe('phi', () => {
  it('Number x1', () => {
    expect(phi(1)).toBe(1);
    expect(phi(11)).toBe(10);
    expect(phi(21)).toBe(12);
    expect(phi(31)).toBe(30);
    expect(phi(41)).toBe(40);
    expect(phi(51)).toBe(32);
    expect(phi(61)).toBe(60);
    expect(phi(71)).toBe(70);
    expect(phi(81)).toBe(54);
    expect(phi(91)).toBe(72);
  });

  it('Number x5', () => {
    expect(phi(5)).toBe(4);
    expect(phi(15)).toBe(8);
    expect(phi(25)).toBe(20);
    expect(phi(35)).toBe(24);
    expect(phi(45)).toBe(24);
    expect(phi(55)).toBe(40);
    expect(phi(65)).toBe(48);
    expect(phi(75)).toBe(40);
    expect(phi(85)).toBe(64);
    expect(phi(95)).toBe(72);
  });

  it('BigInt x1', () => {
    expect(phiBI(1n)).toBe(1n);
    expect(phiBI(11n)).toBe(10n);
    expect(phiBI(21n)).toBe(12n);
    expect(phiBI(31n)).toBe(30n);
    expect(phiBI(41n)).toBe(40n);
    expect(phiBI(51n)).toBe(32n);
    expect(phiBI(61n)).toBe(60n);
    expect(phiBI(71n)).toBe(70n);
    expect(phiBI(81n)).toBe(54n);
    expect(phiBI(91n)).toBe(72n);
  });

  it('BigInt x5', () => {
    expect(phiBI(5n)).toBe(4n);
    expect(phiBI(15n)).toBe(8n);
    expect(phiBI(25n)).toBe(20n);
    expect(phiBI(35n)).toBe(24n);
    expect(phiBI(45n)).toBe(24n);
    expect(phiBI(55n)).toBe(40n);
    expect(phiBI(65n)).toBe(48n);
    expect(phiBI(75n)).toBe(40n);
    expect(phiBI(85n)).toBe(64n);
    expect(phiBI(95n)).toBe(72n);
  });
});

