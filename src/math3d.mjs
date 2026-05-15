/**
 * Pure 3D Math Engine for Arcball/Trackball raw matrix transformations
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMYygZ0wBQwEwFdVEBfBAMwzAQCIABAcwGtiwQBTGALwHpC4IADaZaAbmDB0WXAWJwJQA|▶ Try it live in Instacode}
 */

export const crossProduct = (u, v) => [
  u[1]*v[2] - u[2]*v[1],
  u[2]*v[0] - u[0]*v[2],
  u[0]*v[1] - u[1]*v[0]
];

export const dotProduct = (u, v) => u[0]*v[0] + u[1]*v[1] + u[2]*v[2];

export const normalize = (v) => {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0]/len, v[1]/len, v[2]/len];
};

export const projectToTrackball = (x, y, radius = 1) => {
  const d2 = x*x + y*y;
  const r2 = radius * radius;
  if (d2 <= r2 * 0.5) {
    return normalize([x, y, Math.sqrt(r2 - d2)]);
  } else {
    return normalize([x, y, (r2 * 0.5) / Math.sqrt(d2)]);
  }
};

export const axisAngleToMatrix4 = (axis, angle) => {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  // Column-major array mapping (standard for WebGL and Three.js matrices)
  return [
    c + x*x*t,     y*x*t + z*s,   z*x*t - y*s,   0,
    x*y*t - z*s,   c + y*y*t,     z*y*t + x*s,   0,
    x*z*t + y*s,   y*z*t - x*s,   c + z*z*t,     0,
    0,             0,             0,             1
  ];
};

export const multiplyMatrix4 = (a, b) => {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += a[i*4 + r] * b[c*4 + i]; // Note: column-major alignment
      }
      out[c*4 + r] = sum;
    }
  }
  return out;
};

export const getRotationMatrixFromVectors = (u, v) => {
  const axis = crossProduct(u, v);
  if (axis[0] === 0 && axis[1] === 0 && axis[2] === 0) {
    return [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]; // Identity
  }
  const dot = dotProduct(u, v);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  return axisAngleToMatrix4(axis, angle);
};
