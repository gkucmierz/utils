import {
  gauss,
  mean,
  median,
  variance,
  std,
  dev,
} from '../../main.mjs';

describe('statistics/descriptive', () => {
  it('computes exact Gaussian PDF and descriptive statistics', () => {
    expect(gauss(0, 0, 1)).toBeCloseTo(0.39894228, 6);
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(mean(data)).toBe(5);
    expect(median(data)).toBe(4.5);
    expect(variance(data)).toBe(4);
    expect(std(data)).toBe(2);
    expect(dev(data)).toBe(1.5);
  });
});
