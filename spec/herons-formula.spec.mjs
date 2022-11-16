
import {
  heronsFormula,
  heronsFormulaBI,
} from '../src/herons-formula.mjs';

describe('herons-formula', () => {
  it('Integer', () => {
    expect(heronsFormula(5, 12, 13)).toEqual(30);
    expect(heronsFormula(6, 8, 10)).toEqual(24);
    expect(heronsFormula(7, 15, 20)).toEqual(42);
    expect(heronsFormula(17, 17, 30)).toEqual(120);
    expect(heronsFormula(13, 37, 30)).toEqual(180);
    expect(heronsFormula(6, 25, 29)).toEqual(60);
    expect(heronsFormula(73, 9, 80)).toEqual(216);
    expect(heronsFormula(12, 35, 37)).toEqual(210);
    expect(heronsFormula(120, 109, 13)).toEqual(396);
    expect(heronsFormula(9, 10, 17)).toEqual(36);
  });

  it('Float', () => {
    expect(heronsFormula(2, 3, 4)).toEqual(2.9047375096555625);
    expect(heronsFormula(7, 10, 12)).toEqual(34.977671449083054);
    expect(heronsFormula(6, 11, 12)).toEqual(32.839572165300815);
    expect(heronsFormula(25, 25, 45)).toEqual(245.1880655741629);
    expect(heronsFormula(10, 11, 18)).toEqual(48.59976851796724);
  });

  it('BigInt', () => {
    expect(heronsFormulaBI(5n, 12n, 13n)).toEqual(30n);
    expect(heronsFormulaBI(6n, 8n, 10n)).toEqual(24n);
    expect(heronsFormulaBI(7n, 15n, 20n)).toEqual(42n);
    expect(heronsFormulaBI(17n, 17n, 30n)).toEqual(120n);
    expect(heronsFormulaBI(13n, 37n, 30n)).toEqual(180n);
    expect(heronsFormulaBI(6n, 25n, 29n)).toEqual(60n);
    expect(heronsFormulaBI(73n, 9n, 80n)).toEqual(216n);
    expect(heronsFormulaBI(12n, 35n, 37n)).toEqual(210n);
    expect(heronsFormulaBI(120n, 109n, 13n)).toEqual(396n);
    expect(heronsFormulaBI(9n, 10n, 17n)).toEqual(36n);
  });
});
