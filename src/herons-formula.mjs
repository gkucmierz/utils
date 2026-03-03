
import {
  squareRootBI,
} from './square-root.mjs';

// calculate triangle area given 3 sides

const getHeronsFormula = (four, sq) => (a, b, c) => {
  return sq((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c)) / four;
};

/**
 * Calculates the area of a triangle given the lengths of its three sides.
 * Uses Heron's formula.
 * @param {number} a - Length of side a.
 * @param {number} b - Length of side b.
 * @param {number} c - Length of side c.
 * @returns {number} The area of the triangle.
 */
export const heronsFormula = getHeronsFormula(4, n => n ** 0.5);

/**
 * Calculates the area of a triangle given the lengths of its three sides (BigInt version).
 * Returns the integer part of the area (truncated).
 * @param {bigint} a - Length of side a.
 * @param {bigint} b - Length of side b.
 * @param {bigint} c - Length of side c.
 * @returns {bigint} The area of the triangle.
 */
export const heronsFormulaBI = getHeronsFormula(4n, squareRootBI);
