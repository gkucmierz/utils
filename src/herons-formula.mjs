
import {
  squareRootBI,
} from './square-root.mjs';

// calculate triangle area given 3 sides

const getHeronsFormula = (four, sq) => (a, b, c) => {
  return sq((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c)) / four;
};

export const heronsFormula = getHeronsFormula(4, n => n ** 0.5);
export const heronsFormulaBI = getHeronsFormula(4n, squareRootBI);
