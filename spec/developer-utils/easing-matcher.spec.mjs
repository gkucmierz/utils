import {
  solveBezier,
  EASING_PRESETS,
  fitEasing,
  estimateEasingParams,
  createInterruptibleEase
} from '../../src/developer-utils/easing-matcher.mjs';
import { is } from '../../src/developer-utils/type.mjs';

describe('easing-matcher', () => {
  it('solves cubic bezier accurately at boundaries, midpoints, and steep segments', () => {
    const ease = solveBezier(0.25, 0.1, 0.25, 1.0);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(0.5);

    const steep = solveBezier(0.95, 0.0, 0.05, 1.0);
    expect(steep(0)).toBe(0);
    expect(steep(0.5)).toBeCloseTo(0.5, 2);
    expect(steep(1)).toBe(1);
  });

  it('matches linear and cumulative samples to presets with high score', () => {
    const linearSamples = [
      { diff: 10, diffT: 16 },
      { diff: 10, diffT: 16 },
      { diff: 10, diffT: 16 },
      { diff: 10, diffT: 16 },
    ];
    const matches = fitEasing(linearSamples);
    expect(matches.length).toBe(Object.keys(EASING_PRESETS).length);
    expect(matches[0].name).toBe('linear');
    expect(matches[0].match).toBeGreaterThan(95);

    const cumulativeEaseIn = [0.2, 0.4, 0.6, 0.8, 1.0].map(t => ({
      t,
      y: EASING_PRESETS['ease-in'](t)
    }));
    const cumMatches = fitEasing(cumulativeEaseIn);
    expect(cumMatches[0].name).toBe('ease-in');
    expect(cumMatches[0].match).toBeGreaterThan(98);
  });

  it('estimates easing parameters with asymmetry ratio, 4D controlPoints, and cubic-bezier', () => {
    const samples = [
      { dy: 20, dt: 16 }, { dy: 80, dt: 16 }, { dy: 190, dt: 16 },
      { dy: 340, dt: 16 }, { dy: 380, dt: 16 }, { dy: 310, dt: 16 },
      { dy: 190, dt: 16 }, { dy: 90, dt: 16 }, { dy: 35, dt: 16 },
      { dy: 10, dt: 16 }, { dy: 2, dt: 16 }
    ];
    const res = estimateEasingParams(samples);
    expect(res).not.toBeNull();
    expect(res.cssBezier).toContain('cubic-bezier');
    expect(res.controlPoints.length).toBe(4);
    expect(res.matchPercentage).toBeGreaterThan(85);
    expect(is(res.evaluate, Function)).toBe(true);
  });

  it('creates interruptible ease with continuous slope', () => {
    const ease = createInterruptibleEase(400, 1000, 500);
    expect(is(ease, Function)).toBe(true);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });
});
