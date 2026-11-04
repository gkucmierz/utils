import {
  mutualRange,
  sumRange,
  diffRange,
  xorRange,
  measureRange,
  mutualBox,
  sumBox,
  diffBox,
  xorBox,
  measureBox,
  sharedMeasureNd,
  OrthoSet,
} from '../../main.mjs';

describe('range-set (1D & N-Dimensional Orthotope Boolean Algebra)', () => {
  it('computes 1D mutualRange (AND), sumRange (OR), diffRange (SUB), xorRange (XOR), and measureRange', () => {
    const range1 = [1, 4];
    const range2 = [3, 7];
    const range3 = [5, 9];

    expect(mutualRange(range1, range2)).toEqual([[3, 4]]);
    expect(mutualRange(range1, range3)).toEqual([]);

    expect(sumRange(range1, range2)).toEqual([[1, 7]]);
    expect(sumRange(range1, range3)).toEqual([[1, 4], [5, 9]]);

    expect(diffRange(range2, range1)).toEqual([[4, 7]]);
    expect(xorRange(range1, range2)).toEqual([[1, 3], [4, 7]]);

    expect(measureRange(range1)).toBe(3);
    expect(measureRange(sumRange(range1, range3))).toBe(7);
  });

  it('computes 2D rectangle shared surface area, union, difference, and XOR', () => {
    const rectA = [[0, 10], [0, 10]]; // area = 100
    const rectB = [[6, 16], [4, 14]]; // area = 100, overlap = [6,10]x[4,10] = 4*6 = 24

    expect(sharedMeasureNd(rectA, rectB)).toBe(24);
    expect(mutualBox(rectA, rectB)).toEqual([[[6, 10], [4, 10]]]);
    expect(measureBox(mutualBox(rectA, rectB))).toBe(24);
    expect(measureBox(sumBox(rectA, rectB))).toBe(176); // 100 + 100 - 24
    expect(measureBox(diffBox(rectA, rectB))).toBe(76); // 100 - 24
    expect(measureBox(xorBox(rectA, rectB))).toBe(152); // 100 + 100 - 2*24
  });

  it('generalizes Boolean algebra and Lebesgue measure to 3D (volume), 4D (hypervolume), and 5D+', () => {
    // 3D cubes: [0, 4]^3 (vol 64) and [2, 6]^3 (vol 64), intersection [2, 4]^3 (vol 8)
    const cubeA = [[0, 4], [0, 4], [0, 4]];
    const cubeB = [[2, 6], [2, 6], [2, 6]];
    expect(sharedMeasureNd(cubeA, cubeB)).toBe(8);
    expect(measureBox(sumBox(cubeA, cubeB))).toBe(64 + 64 - 8);
    expect(measureBox(xorBox(cubeA, cubeB))).toBe(64 + 64 - 16);

    // 4D tesseracts: [0, 3]^4 (measure 81) and [1, 4]^4 (measure 81), intersection [1, 3]^4 (measure 16)
    const tessA = [[0, 3], [0, 3], [0, 3], [0, 3]];
    const tessB = [[1, 4], [1, 4], [1, 4], [1, 4]];
    expect(sharedMeasureNd(tessA, tessB)).toBe(16);
    expect(measureBox(sumBox(tessA, tessB))).toBe(81 + 81 - 16);

    // 5D orthotopes: [0, 2]^5 (measure 32) and [1, 3]^5 (measure 32), intersection [1, 2]^5 (measure 1)
    const box5A = [[0, 2], [0, 2], [0, 2], [0, 2], [0, 2]];
    const box5B = [[1, 3], [1, 3], [1, 3], [1, 3], [1, 3]];
    const set5A = new OrthoSet(box5A);
    const set5B = new OrthoSet(box5B);
    expect(set5A.and(set5B).measure()).toBe(1);
    expect(set5A.or(set5B).measure()).toBe(63);
    expect(set5A.xor(set5B).measure()).toBe(62);
  });
});
