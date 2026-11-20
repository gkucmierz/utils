import {
  range,
  ORTHOTOPE_TAXONOMY,
  orthotopeFaceVector,
  unitBallVolume,
  hypercubeCornerConcentration,
  explodeBoxesNd,
  projectBox3D,
  sliceBox4DAtW,
  projectBox4DSchlegel,
  evaluateParallelAxesNd,
} from '../../main.mjs';

describe('orthotope-projections', () => {
  it('computes Boolean k-face vectors summing to 3^n', () => {
    expect(ORTHOTOPE_TAXONOMY.length).toBe(13);
    expect(orthotopeFaceVector(3)).toEqual([8, 12, 6, 1]);
    expect(orthotopeFaceVector(4)).toEqual([16, 32, 24, 8, 1]);
  });

  it('peaks unit n-ball volume at n = 5 and measures corner concentration', () => {
    expect(unitBallVolume(5)).toBeGreaterThan(unitBallVolume(4));
    expect(unitBallVolume(5)).toBeGreaterThan(unitBallVolume(6));
    expect(hypercubeCornerConcentration(10).cornerFraction).toBeGreaterThan(0.997);
  });

  it('projects 3D exploded cuboids and 4D Schlegel tesseracts finitely', () => {
    const b3 = [range(0, 2), range(0, 2), range(0, 2)];
    expect(explodeBoxesNd([b3], 0.5).length).toBe(1);
    expect(projectBox3D(b3).edges.length).toBe(12);

    const b4 = [range(0, 2), range(0, 2), range(0, 2), range(0, 2)];
    expect(sliceBox4DAtW(b4, 1).length).toBe(3);
    expect(projectBox4DSchlegel(b4).vertices.length).toBe(16);
    expect(evaluateParallelAxesNd(b4, b4).intersectionMeasure).toBe(16);
  });
});
