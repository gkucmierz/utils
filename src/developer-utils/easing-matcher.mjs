import { is } from './type.mjs';

const normalizeEasingSamples = samples => {
  if (!is(samples, Array) || samples.length < 2) return null;
  const first = samples[0];
  if (!first) return null;

  // Cumulative { t, y } mode when neither dt/diffT nor dy/diff are present
  const isCumulative =
    first.t !== undefined &&
    first.y !== undefined &&
    first.dt === undefined &&
    first.diffT === undefined &&
    first.dy === undefined &&
    first.diff === undefined;

  if (isCumulative) {
    const t0 = samples[0].t < 0 ? samples[0].t : 0;
    const y0 = samples[0].y < 0 ? samples[0].y : 0;
    const spanT = samples[samples.length - 1].t - t0;
    const spanY = samples[samples.length - 1].y - y0;
    if (!spanT || !spanY) return null;
    return samples.map(s => ({
      t: (s.t - t0) / spanT,
      y: (s.y - y0) / spanY
    }));
  }

  let sumT = 0;
  let sumY = 0;
  const pts = samples.map(s => {
    const dt = s.dt !== undefined ? s.dt : (s.diffT || 0);
    const dy = s.dy !== undefined ? s.dy : (s.diff || 0);
    sumT += dt;
    sumY += dy;
    return { t: sumT, y: sumY };
  });
  if (!sumT || !sumY) return null;
  return pts.map(p => ({ t: p.t / sumT, y: p.y / sumY }));
};

/**
 * Solves Cubic Bezier curve for given control points using Newton-Raphson iteration
 * with bisection fallback for steep/flat segments.
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @returns {(t: number) => number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM5QDYDcCmAhHALxBxgQF8EAzGKMBAIgAEBzAawFcBjMEmQgPQc4IDKgYBuYMHTZ8RPlKA|▶ Try it live in Instacode}
 */
export const solveBezier = (p1x, p1y, p2x, p2y) => t => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (p1x === p1y && p2x === p2y) return t;

  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = u => ((ax * u + bx) * u + cx) * u;
  const sampleDerivX = u => (3 * ax * u + 2 * bx) * u + cx;
  const sampleY = u => ((ay * u + by) * u + cy) * u;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const xErr = sampleX(u) - t;
    if (Math.abs(xErr) < 1e-6) return sampleY(u);
    const d = sampleDerivX(u);
    if (Math.abs(d) < 1e-6) break;
    u -= xErr / d;
  }

  // Bisection fallback when derivative is near zero or Newton steps out of [0, 1]
  let lo = 0;
  let hi = 1;
  u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < 12; i++) {
    const x = sampleX(u);
    if (Math.abs(x - t) < 1e-6) break;
    if (t > x) lo = u;
    else hi = u;
    u = 0.5 * (lo + hi);
  }
  return sampleY(u);
};

/**
 * Standard CSS easing presets and Chromium quintic deceleration curve.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKIEEDKBJAcgcQH0AFAJVU1QBVMEBfBAMxijAQCIABAcwGsBXAMZgQAUxgAvAPT84IADYBndgG5gwDDgIlylGmqA|▶ Try it live in Instacode}
 */
export const EASING_PRESETS = Object.freeze({
  'ease-in-out': solveBezier(0.42, 0, 0.58, 1.0),
  'ease-out': solveBezier(0, 0, 0.58, 1.0),
  'ease': solveBezier(0.25, 0.1, 0.25, 1.0),
  'linear': t => t,
  'ease-in': solveBezier(0.42, 0, 1.0, 1.0),
  'quint-out': t => 1 - Math.pow(1 - t, 5),
});

/**
 * Matches telemetry samples against standard CSS easing presets.
 * Supports both frame delta samples ({ dy, dt } / { diff, diffT }) and cumulative points ({ t, y }).
 * Returns sorted list of preset matches with RMSE and percentage score.
 * @param {Array<{ diff?: number, dy?: number, diffT?: number, dt?: number, t?: number, y?: number }>} samples
 * @returns {Array<{ name: string, match: number, rmse: number }>}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IGYjgUQIYGcQB2A5ggL5oxRgIBEAAkQNYCuAxmCAKYwBeA9MzggANrhoBuYMHRY8hIpKA|▶ Try it live in Instacode}
 */
export function fitEasing(samples) {
  const norm = normalizeEasingSamples(samples);
  if (!norm) return [];

  return Object.entries(EASING_PRESETS).map(([name, fn]) => {
    const err = norm.reduce((acc, p) => acc + Math.pow(p.y - fn(p.t), 2), 0);
    const rmse = Math.sqrt(err / norm.length);
    const match = Math.max(0, Math.min(100, Math.round((1 - rmse * 2) * 1000) / 10));
    return { name, match, rmse: Math.round(rmse * 1000) / 1000 };
  }).sort((a, b) => b.match - a.match || a.rmse - b.rmse);
}

/**
 * Estimates optimal cubic-bezier control points and asymmetry metrics for raw telemetry samples.
 * Uses a 2-stage coarse-to-fine search over (x1, y1, x2, y2) in [0, 1]^4.
 * @param {Array<{ diff?: number, dy?: number, diffT?: number, dt?: number, t?: number, y?: number }>} samples
 * @returns {{ asymmetryRatio: number, midpointT: number, cssBezier: string, controlPoints: [number, number, number, number], matchPercentage: number, evaluate: (t: number) => number } | null}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKYGc7gIZ1QUW3RADsBzABWxmzHQQF8EAzGKMBAIgAEyBrAK4BjMCFQwAXgHoBWADbpOAbmDAMWMLgJFSlarXQqgA|▶ Try it live in Instacode}
 */
export function estimateEasingParams(samples) {
  if (!is(samples, Array) || samples.length < 3) return null;
  const norm = normalizeEasingSamples(samples);
  if (!norm) return null;

  const midPoint = norm.find(p => p.y >= 0.5) || { t: 0.5 };
  const asymmetry = Math.round(((1 - midPoint.t) / (midPoint.t || 1e-4)) * 10) / 10;

  const evalRmse = (x1, y1, x2, y2) => {
    const fn = solveBezier(x1, y1, x2, y2);
    let err = 0;
    for (let i = 0; i < norm.length; i++) {
      const d = norm[i].y - fn(norm[i].t);
      err += d * d;
    }
    return Math.sqrt(err / norm.length);
  };

  let best = { rmse: evalRmse(0.25, 0.1, 0.25, 1.0), x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 };

  // Seed with known CSS presets first
  const presetSeeds = [
    [0.25, 0.1, 0.25, 1.0],
    [0.42, 0.0, 0.58, 1.0],
    [0.0, 0.0, 0.58, 1.0],
    [0.42, 0.0, 1.0, 1.0],
    [0.25, 0.25, 0.75, 0.75],
    [0.22, 1.0, 0.36, 1.0]
  ];
  for (const [x1, y1, x2, y2] of presetSeeds) {
    const rmse = evalRmse(x1, y1, x2, y2);
    if (rmse < best.rmse) best = { rmse, x1, y1, x2, y2 };
  }

  // Stage 1: Coarse grid over (x1, y1, x2, y2)
  for (let x1 = 0.05; x1 <= 0.65; x1 += 0.15) {
    for (let y1 = 0.0; y1 <= 1.0; y1 += 0.2) {
      for (let x2 = 0.15; x2 <= 0.95; x2 += 0.2) {
        for (let y2 = 0.6; y2 <= 1.0; y2 += 0.2) {
          const rmse = evalRmse(x1, y1, x2, y2);
          if (rmse < best.rmse) best = { rmse, x1, y1, x2, y2 };
        }
      }
    }
  }

  // Stage 2: Local coordinate refinement around best candidate
  for (const step of [0.05, 0.02]) {
    let improved = true;
    while (improved) {
      improved = false;
      const coords = ['x1', 'y1', 'x2', 'y2'];
      for (const key of coords) {
        for (const dir of [-step, step]) {
          const cand = { ...best, [key]: Math.max(0, Math.min(1, best[key] + dir)) };
          const rmse = evalRmse(cand.x1, cand.y1, cand.x2, cand.y2);
          if (rmse + 1e-6 < best.rmse) {
            best = { rmse, x1: cand.x1, y1: cand.y1, x2: cand.x2, y2: cand.y2 };
            improved = true;
          }
        }
      }
    }
  }

  const rx1 = Number(best.x1.toFixed(2));
  const ry1 = Number(best.y1.toFixed(2));
  const rx2 = Number(best.x2.toFixed(2));
  const ry2 = Number(best.y2.toFixed(2));
  const match = Math.max(0, Math.min(100, Math.round((1 - best.rmse * 2) * 1000) / 10));
  const cssBezier = `cubic-bezier(${rx1.toFixed(2)}, ${ry1.toFixed(2)}, ${rx2.toFixed(2)}, ${ry2.toFixed(2)})`;

  return {
    asymmetryRatio: asymmetry,
    midpointT: Math.round(midPoint.t * 100) / 100,
    cssBezier,
    controlPoints: [rx1, ry1, rx2, ry2],
    matchPercentage: match,
    evaluate: solveBezier(rx1, ry1, rx2, ry2)
  };
}

/**
 * Creates interruptible easing curve preserving kinetic momentum (C1 continuous).
 * @param {number} vCurr Current velocity in pixels/second
 * @param {number} targetDist Remaining distance to target in pixels
 * @param {number} duration Total duration in milliseconds
 * @returns {(t: number) => number}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYwKYEM4YJIB2uMMArhHCAEYA2GAolgM4YIC+CAZjFGAgEQABAOYBrUqjAgMMAF4B6UpRpN+AbmDB02XIWJkK1OoxYagA|▶ Try it live in Instacode}
 */
export function createInterruptibleEase(vCurr, targetDist, duration) {
  if (!targetDist || duration <= 0) return t => t;
  const slope = (vCurr * (duration / 1000)) / targetDist;
  const p1x = 0.25;
  const p1y = Math.min(1.0, Math.max(0, slope * p1x));
  return solveBezier(p1x, p1y, 0.25, 1.0);
}
