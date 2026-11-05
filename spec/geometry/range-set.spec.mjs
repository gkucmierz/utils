import {
  range,
  parseRange,
  formatRange,
  mutualRange,
  sumRange,
  diffRange,
  xorRange,
  containsPoint1D,
  measureRange,
  mutualBox,
  sumBox,
  diffBox,
  xorBox,
  containsPointNd,
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

  it('distinguishes closed <a, b>, half-open <a, b) / (a, b>, and open (a, b) boundaries via optional booleans and tuples', () => {
    // 1. Default is closed <a, b> (leftClosed = true, rightClosed = true):
    // <0, 4> AND <4, 6> shares the boundary point {4} -> [[4, 4]] (with 1D measure 0)
    const closedTouchAnd = mutualRange([0, 4], [4, 6]);
    expect(closedTouchAnd).toEqual([[4, 4]]);
    expect(closedTouchAnd[0].leftClosed).toBe(true);
    expect(closedTouchAnd[0].rightClosed).toBe(true);
    expect(measureRange(closedTouchAnd)).toBe(0);

    // 2. Half-open <0, 4) AND <4, 6) via (leftClosed = true, rightClosed = false):
    // Point 4 is excluded from <0, 4), so intersection is strictly empty []!
    expect(mutualRange([0, 4], [4, 6], true, false)).toEqual([]);
    expect(mutualRange([0, 4], [4, 6], false, true)).toEqual([]);
    expect(mutualRange([0, 4], [4, 6], false, false)).toEqual([]);

    // 3. Union (OR) at boundary point 4:
    // <0, 4) U <4, 6) merges into <0, 6) because 4 is included in <4, 6)
    const halfOpenUnion = sumRange([0, 4], [4, 6], true, false);
    expect(halfOpenUnion).toEqual([[0, 6]]);
    expect(halfOpenUnion[0].leftClosed).toBe(true);
    expect(halfOpenUnion[0].rightClosed).toBe(false);
    expect(formatRange(halfOpenUnion[0], 'angle')).toBe('<0, 6)');

    // (0, 4) U (4, 6) does NOT merge because point 4 is missing from BOTH intervals!
    const openTouchUnion = sumRange([0, 4], [4, 6], false, false);
    expect(openTouchUnion).toEqual([[0, 4], [4, 6]]);
    expect(containsPoint1D(openTouchUnion, 4)).toBe(false);
    expect(containsPoint1D(halfOpenUnion, 4)).toBe(true);
    expect(containsPoint1D(halfOpenUnion, 6)).toBe(false);

    // <0, 4) U (4, 6> via 4-tuples or parseRange also does NOT merge at 4:
    const splitAt4 = sumRange([0, 4, true, false], [4, 6, false, true]);
    expect(splitAt4).toEqual([[0, 4], [4, 6]]);
    expect(containsPoint1D(splitAt4, 4)).toBe(false);
    // Healing the missing point {4} fuses them into <0, 6>:
    const healed = sumRange(splitAt4, [4, 4, true, true]);
    expect(healed).toEqual([[0, 6]]);
    expect(containsPoint1D(healed, 4)).toBe(true);
  });

  it('flips boundary inclusivity accurately during diffRange (SUB) and xorRange (XOR)', () => {
    // <0, 6> \ <4, 6> = <0, 4) (right boundary becomes open because 4 was removed!)
    const rem = diffRange([0, 6], [4, 6], true, true);
    expect(rem).toEqual([[0, 4]]);
    expect(rem[0].leftClosed).toBe(true);
    expect(rem[0].rightClosed).toBe(false);
    expect(formatRange(rem[0], 'angle')).toBe('<0, 4)');

    // Fundamental Boolean identity: (A \ B) AND B === []
    expect(mutualRange(rem, [4, 6])).toEqual([]);
    // And (A \ B) OR B === A (<0, 4) U <4, 6> = <0, 6>)
    const restored = sumRange(rem, [4, 6]);
    expect(restored).toEqual([[0, 6]]);
    expect(restored[0].leftClosed).toBe(true);
    expect(restored[0].rightClosed).toBe(true);

    // Subtracting a single point <4, 4> from <0, 6> punches a hole at 4: <0, 4) U (4, 6>
    const punctured = diffRange([0, 6], [4, 4]);
    expect(punctured).toEqual([[0, 4], [4, 6]]);
    expect(formatRange(punctured[0], 'angle')).toBe('<0, 4)');
    expect(formatRange(punctured[1], 'angle')).toBe('(4, 6>');
    expect(containsPoint1D(punctured, 4)).toBe(false);

    // XOR on touching closed intervals <1, 4> XOR <4, 7> drops shared point 4 -> <1, 4) U (4, 7>
    const xorClosed = xorRange([1, 4], [4, 7], true, true);
    expect(xorClosed).toEqual([[1, 4], [4, 7]]);
    expect(containsPoint1D(xorClosed, 4)).toBe(false);

    // XOR on touching half-open intervals <1, 4) XOR <4, 7) keeps point 4 -> single <1, 7)!
    const xorHalfOpen = xorRange([1, 4], [4, 7], true, false);
    expect(xorHalfOpen).toEqual([[1, 7]]);
    expect(formatRange(xorHalfOpen[0], 'angle')).toBe('<1, 7)');
    expect(containsPoint1D(xorHalfOpen, 4)).toBe(true);
    expect(containsPoint1D(xorHalfOpen, 7)).toBe(false);
  });

  it('supports string notation parseRange / formatRange and handles degenerate, reversed, and invalid inputs', () => {
    const r1 = parseRange('<4, 6)');
    expect(r1).toEqual([4, 6]);
    expect(r1.leftClosed).toBe(true);
    expect(r1.rightClosed).toBe(false);
    expect(formatRange(r1, 'bracket')).toBe('[4, 6)');
    expect(formatRange(r1, 'angle')).toBe('<4, 6)');

    // Degenerate half-open or open interval at a single point <4, 4) or (4, 4) is empty (null)
    expect(parseRange('<4, 4)')).toBeNull();
    expect(parseRange('(4, 4>')).toBeNull();
    expect(parseRange('(4, 4)')).toBeNull();
    // Closed singleton <4, 4> is valid!
    expect(parseRange('<4, 4>')).toEqual([4, 4]);

    // Reversed interval [6, 4, true, false] normalizes to [4, 6] and swaps endpoint flags
    const rev = range(6, 4, true, false);
    expect(rev).toEqual([4, 6]);
    expect(rev.leftClosed).toBe(false);
    expect(rev.rightClosed).toBe(true);

    // Invalid / empty inputs
    expect(mutualRange([], [1, 5])).toEqual([]);
    expect(mutualRange(null, [1, 5])).toEqual([]);
    expect(sumRange([])).toEqual([]);
    expect(measureRange([])).toBe(0);
  });

  it('computes 2D rectangle shared surface area, union, difference, XOR, and boundary-disjoint point membership', () => {
    const rectA = [[0, 10], [0, 10]]; // area = 100
    const rectB = [[6, 16], [4, 14]]; // area = 100, overlap = [6,10]x[4,10] = 4*6 = 24

    expect(sharedMeasureNd(rectA, rectB)).toBe(24);
    expect(mutualBox(rectA, rectB)).toEqual([[[6, 10], [4, 10]]]);
    expect(measureBox(mutualBox(rectA, rectB))).toBe(24);
    expect(measureBox(sumBox(rectA, rectB))).toBe(176); // 100 + 100 - 24
    expect(measureBox(diffBox(rectA, rectB))).toBe(76); // 100 - 24
    expect(measureBox(xorBox(rectA, rectB))).toBe(152); // 100 + 100 - 2*24

    // Verify point-exact complement on boundary lines: (rectA \ rectB) does not contain (6, 5), while rectB does
    const diffA = diffBox(rectA, rectB);
    expect(containsPointNd(diffA, [6, 5])).toBe(false);
    expect(containsPointNd(diffA, [5.999, 5])).toBe(true);
    expect(mutualBox(diffA, rectB)).toEqual([]);
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
    expect(set5A.sub(set5B).and(set5B).isEmpty()).toBe(true);
  });
});
