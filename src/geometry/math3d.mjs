/**
 * @module geometry
 */

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

export const normalizeQuat = (q) => {
  const len = Math.hypot(q.w, q.x, q.y, q.z);
  if (len === 0) return { w: 1, x: 0, y: 0, z: 0 };
  return {
    w: q.w / len,
    x: q.x / len,
    y: q.y / len,
    z: q.z / len
  };
};

export const axisAngleToQuat = (axis, angle) => {
  const [x, y, z] = normalize(axis);
  const half = angle * 0.5;
  const s = Math.sin(half);
  return normalizeQuat({
    w: Math.cos(half),
    x: x * s,
    y: y * s,
    z: z * s
  });
};

export const multiplyQuat = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
});

export const rotateVecByQuat = (v, q) => {
  const [vx, vy, vz] = v;
  const { w, x, y, z } = q;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx)
  ];
};

export const matToQuat = (m) => {
  const trace = m[0] + m[5] + m[10];
  let w, x, y, z;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    w = 0.25 / s;
    x = (m[6] - m[9]) * s;
    y = (m[8] - m[2]) * s;
    z = (m[1] - m[4]) * s;
  } else if (m[0] > m[5] && m[0] > m[10]) {
    const s = 2 * Math.sqrt(1 + m[0] - m[5] - m[10]);
    w = (m[6] - m[9]) / s;
    x = 0.25 * s;
    y = (m[4] + m[1]) / s;
    z = (m[8] + m[2]) / s;
  } else if (m[5] > m[10]) {
    const s = 2 * Math.sqrt(1 + m[5] - m[0] - m[10]);
    w = (m[8] - m[2]) / s;
    x = (m[4] + m[1]) / s;
    y = 0.25 * s;
    z = (m[6] + m[9]) / s;
  } else {
    const s = 2 * Math.sqrt(1 + m[10] - m[0] - m[5]);
    w = (m[1] - m[4]) / s;
    x = (m[8] + m[2]) / s;
    y = (m[6] + m[9]) / s;
    z = 0.25 * s;
  }
  return normalizeQuat({ w, x, y, z });
};

export const quatToMat = (q) => {
  const { w, x, y, z } = normalizeQuat(q);
  const xx = x * x, yy = y * y, zz = z * z;
  const xy = x * y, xz = x * z, yz = y * z;
  const wx = w * x, wy = w * y, wz = w * z;
  return [
    1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy), 0,
    2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx), 0,
    2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy), 0,
    0, 0, 0, 1
  ];
};

export const slerp = (q1, q2, t) => {
  let dot = q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
  let q2n = q2;
  if (dot < 0) {
    q2n = { w: -q2.w, x: -q2.x, y: -q2.y, z: -q2.z };
    dot = -dot;
  }
  if (dot > 0.9995) {
    return normalizeQuat({
      w: q1.w + t * (q2n.w - q1.w),
      x: q1.x + t * (q2n.x - q1.x),
      y: q1.y + t * (q2n.y - q1.y),
      z: q1.z + t * (q2n.z - q1.z)
    });
  }
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  const sinTheta = Math.sin(theta);
  const a = Math.sin((1 - t) * theta) / sinTheta;
  const b = Math.sin(t * theta) / sinTheta;
  return {
    w: a * q1.w + b * q2n.w,
    x: a * q1.x + b * q2n.x,
    y: a * q1.y + b * q2n.y,
    z: a * q1.z + b * q2n.z
  };
};

export const matToEulerYXZ = (m) => {
  if (!m || m.length < 16) return { pitch: 0, yaw: 0, roll: 0 };
  const m11 = m[0], m13 = m[8];
  const m21 = m[1], m22 = m[5], m23 = m[9];
  const m31 = m[2], m33 = m[10];

  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const x = Math.asin(-clamp(m23));
  let y, z;
  if (Math.abs(m23) < 0.9999999) {
    y = Math.atan2(m13, m33);
    z = Math.atan2(m21, m22);
  } else {
    y = Math.atan2(-m31, m11);
    z = 0;
  }
  const radToDeg = 180 / Math.PI;
  return {
    pitch: x * radToDeg,
    yaw: y * radToDeg,
    roll: z * radToDeg
  };
};

export const eulerYXZToQuat = (pitchDeg, yawDeg, rollDeg) => {
  const degToRad = Math.PI / 180;
  const hx = (pitchDeg * degToRad) * 0.5;
  const hy = (yawDeg * degToRad) * 0.5;
  const hz = (rollDeg * degToRad) * 0.5;

  const c1 = Math.cos(hx), s1 = Math.sin(hx);
  const c2 = Math.cos(hy), s2 = Math.sin(hy);
  const c3 = Math.cos(hz), s3 = Math.sin(hz);

  return normalizeQuat({
    w: c1 * c2 * c3 + s1 * s2 * s3,
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 - s1 * s2 * c3
  });
};

export const applyScreenDragQuat = (currentQuat, dx, dy, sensitivity = 0.007) => {
  const qY = axisAngleToQuat([0, 1, 0], dx * sensitivity);
  const qX = axisAngleToQuat([1, 0, 0], dy * sensitivity);
  const qDelta = multiplyQuat(qX, qY);
  return normalizeQuat(multiplyQuat(qDelta, currentQuat));
};


