import { goldenRatio, goldenRatioBI, goldenRatioStr } from '../src/golden-ratio.mjs';

describe('golden-ratio', () => {
  it('goldenRatio float is approximately 1.618033988749895', () => {
    expect(goldenRatio).toBeCloseTo(1.618033988749895, 15);
  });

  it('goldenRatioBI calculates to 30 decimal places correctly', () => {
    const phi = goldenRatioBI(30);
    expect(phi).toEqual(1618033988749894848204586834365n);
  });

  it('goldenRatioBI throws on negative precision', () => {
    expect(() => goldenRatioBI(-1)).toThrowError('Precision cannot be negative');
  });

  it('goldenRatioBI works with 0 precision', () => {
    const phi = goldenRatioBI(0);
    expect(phi).toEqual(1n); // sqrt(5*1) = 2. (2+1)/2 = 1.
  });

  it('goldenRatioBI valueOf returns the scaled BigInt', () => {
    const phi = goldenRatioBI(2);
    // precision 2 => exp = 100, exp*exp = 10000. 5*10000 = 50000. sqrt(50000) = 223.
    // (223 + 100) / 2 = 161n.
    expect(phi.valueOf()).toEqual(161n);
  });

  it('goldenRatioStr calculates to 30 decimal places and formats correctly', () => {
    const phiStr = goldenRatioStr(30);
    expect(phiStr).toEqual('1.618033988749894848204586834365');
  });

  it('goldenRatioStr works with 0 precision', () => {
    const phiStr = goldenRatioStr(0);
    expect(phiStr).toEqual('1'); 
  });
});
