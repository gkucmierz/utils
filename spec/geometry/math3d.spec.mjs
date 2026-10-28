import {
  crossProduct,
  dotProduct,
  normalize,
  projectToTrackball,
  axisAngleToMatrix4,
  multiplyMatrix4,
  getRotationMatrixFromVectors,
  normalizeQuat,
  axisAngleToQuat,
  multiplyQuat,
  rotateVecByQuat,
  matToQuat,
  quatToMat,
  slerp,
  matToEulerYXZ,
  eulerYXZToQuat,
  applyScreenDragQuat,
} from '../../main.mjs';

describe('math3d', () => {
  it('computes crossProduct, dotProduct and normalize accurately', () => {
    expect(crossProduct([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(dotProduct([1, 2, 3], [4, -5, 6])).toBe(12);
    const n = normalize([3, 4, 0]);
    expect(n[0]).toBeCloseTo(0.6, 8);
    expect(n[1]).toBeCloseTo(0.8, 8);
    expect(n[2]).toBeCloseTo(0, 8);
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('projects 2D points onto an arcball trackball', () => {
    const inside = projectToTrackball(0.2, 0.2, 1);
    expect(Math.hypot(inside[0], inside[1], inside[2])).toBeCloseTo(1, 8);
    const outside = projectToTrackball(2.0, 2.0, 1);
    expect(Math.hypot(outside[0], outside[1], outside[2])).toBeCloseTo(1, 8);
  });

  it('builds and multiplies 4x4 rotation matrices', () => {
    const rZ90 = axisAngleToMatrix4([0, 0, 1], Math.PI / 2);
    const rZNeg90 = axisAngleToMatrix4([0, 0, 1], -Math.PI / 2);
    const id = multiplyMatrix4(rZ90, rZNeg90);
    expect(id[0]).toBeCloseTo(1, 8);
    expect(id[5]).toBeCloseTo(1, 8);
    expect(id[10]).toBeCloseTo(1, 8);

    const rotVec = getRotationMatrixFromVectors([1, 0, 0], [0, 1, 0]);
    expect(rotVec[0]).toBeCloseTo(0, 8);
    expect(rotVec[1]).toBeCloseTo(1, 8);
  });

  it('rotates 3D vectors with axisAngleToQuat and rotateVecByQuat', () => {
    const qZ90 = axisAngleToQuat([0, 0, 1], Math.PI / 2);
    const rotated = rotateVecByQuat([1, 0, 0], qZ90);
    expect(rotated[0]).toBeCloseTo(0, 8);
    expect(rotated[1]).toBeCloseTo(1, 8);
    expect(rotated[2]).toBeCloseTo(0, 8);

    // 5-fold symmetry around dodecahedron face normal (72 deg * 5 = 360 deg = identity)
    const phi = (1 + Math.sqrt(5)) / 2;
    const q72 = axisAngleToQuat([0, phi, 1], (2 * Math.PI) / 5);
    let qAcc = { w: 1, x: 0, y: 0, z: 0 };
    for (let i = 0; i < 5; i++) {
      qAcc = normalizeQuat(multiplyQuat(q72, qAcc));
    }
    const vOrig = [1.2, -0.7, 2.3];
    const vAfter5 = rotateVecByQuat(vOrig, qAcc);
    expect(vAfter5[0]).toBeCloseTo(vOrig[0], 7);
    expect(vAfter5[1]).toBeCloseTo(vOrig[1], 7);
    expect(vAfter5[2]).toBeCloseTo(vOrig[2], 7);
  });

  it('converts round-trip between quaternion and 4x4 matrix (quatToMat / matToQuat)', () => {
    const q = axisAngleToQuat([1, 2, -1], 1.15);
    const m = quatToMat(q);
    const qBack = matToQuat(m);
    const sign = (q.w * qBack.w + q.x * qBack.x + q.y * qBack.y + q.z * qBack.z) >= 0 ? 1 : -1;
    expect(qBack.w * sign).toBeCloseTo(q.w, 7);
    expect(qBack.x * sign).toBeCloseTo(q.x, 7);
    expect(qBack.y * sign).toBeCloseTo(q.y, 7);
    expect(qBack.z * sign).toBeCloseTo(q.z, 7);
  });

  it('interpolates smoothly along shortest arc with slerp', () => {
    const q0 = axisAngleToQuat([0, 1, 0], 0);
    const q1 = axisAngleToQuat([0, 1, 0], Math.PI / 2);
    const qMid = slerp(q0, q1, 0.5);
    const vMid = rotateVecByQuat([1, 0, 0], qMid);
    expect(vMid[0]).toBeCloseTo(Math.SQRT1_2, 7);
    expect(vMid[2]).toBeCloseTo(-Math.SQRT1_2, 7);
  });

  it('converts Euler YXZ angles to quaternion and back via matrix', () => {
    const q = eulerYXZToQuat(-24, 38, 12);
    const m = quatToMat(q);
    const euler = matToEulerYXZ(m);
    expect(euler.pitch).toBeCloseTo(-24, 5);
    expect(euler.yaw).toBeCloseTo(38, 5);
    expect(euler.roll).toBeCloseTo(12, 5);
  });

  it('applies screen-space drag rotation without gimbal lock (applyScreenDragQuat)', () => {
    // Start rotated 90 degrees around Y
    const qStart = axisAngleToQuat([0, 1, 0], Math.PI / 2);
    // Drag vertically (dy > 0, dx = 0) -> should tilt around screen X axis [1, 0, 0]
    const qAfter = applyScreenDragQuat(qStart, 0, 100, 0.01);
    const topPointBefore = rotateVecByQuat([0, 1, 0], qStart);
    const topPointAfter = rotateVecByQuat([0, 1, 0], qAfter);
    expect(topPointBefore[1]).toBeCloseTo(1, 7);
    // Pulling down tilts top toward viewer (+Z in screen space)
    expect(topPointAfter[2]).toBeGreaterThan(0.5);
    expect(topPointAfter[0]).toBeCloseTo(0, 7);
  });
});
