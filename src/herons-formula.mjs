
// calculat triangle area given 3 sides

export const heronsFormula = (a, b, c) => {
  return Math.sqrt((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c)) / 4;
};
