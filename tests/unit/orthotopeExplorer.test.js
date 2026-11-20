import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  range,
  mutualRange,
  diffRange,
  measureRange,
  mutualBox,
  sumBox,
  diffBox,
  xorBox,
  measureBox,
  OrthoSet,
  ORTHOTOPE_TAXONOMY,
  getOrthotopeTaxonomy,
  orthotopeFaceCount,
  orthotopeFaceCountBI,
  orthotopeFaceVector,
  unitBallVolume,
  hypercubeCornerConcentration,
  explodeBoxesNd,
  projectBox3D,
  sliceBox4DAtW,
  sliceBoxes4DAtW,
  projectBox4DSchlegel,
  sampleSmallMultiples4D,
  evaluateParallelAxesNd,
  buildPairwiseProjectionsNd,
  navigateGrid,
  detectGridColumns,
  gauss,
  mean,
  median,
  variance,
  std,
  dev,
  variation,
  subset,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  interpolateColor,
  colorStops,
  matrixAsArray,
  transpose,
  rotate,
  mul,
} from '../../main.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('1D–10D diffBox & OrthoSet produce pairwise disjoint shards summing to λ(A) - λ(A ∩ B)', () => {
  for (let dim = 1; dim <= 10; dim += 1) {
    const boxA = Array.from({ length: dim }, () => range(0, 4, true, true));
    const boxB = Array.from({ length: dim }, () => range(1, 3, true, true));

    const shards = diffBox(boxA, boxB);
    assert.equal(shards.length, 2 * dim);

    // Every pair of shards must be strictly disjoint in N-D
    for (let i = 0; i < shards.length; i += 1) {
      assert.equal(mutualBox(shards[i], boxB).length, 0);
      for (let j = i + 1; j < shards.length; j += 1) {
        assert.equal(mutualBox(shards[i], shards[j]).length, 0);
      }
    }

    const expectedMeasure = (4 ** dim) - (2 ** dim);
    const sumOfShards = shards.reduce((acc, s) => acc + measureBox([s]), 0);
    assert.equal(sumOfShards, expectedMeasure);
    assert.equal(new OrthoSet(boxA).sub(boxB).measure(), expectedMeasure);

    // Inclusion-exclusion check for OR and XOR in up to 6D
    if (dim <= 6) {
      const boxC = Array.from({ length: dim }, () => range(2, 5, true, true));
      const mA = measureBox([boxA]);
      const mC = measureBox([boxC]);
      const mInter = measureBox(mutualBox(boxA, boxC));
      assert.equal(measureBox(sumBox(boxA, boxC)), mA + mC - mInter);
      assert.equal(measureBox(xorBox(boxA, boxC)), mA + mC - 2 * mInter);
    }
  }
});

test('1D open/closed endpoints and singleton <4, 4> puncture split intervals cleanly', () => {
  const closedA = range(1, 8, true, true);
  const singleton4 = range(4, 4, true, true);
  const punctured = diffRange(closedA, singleton4);

  assert.equal(punctured.length, 2);
  assert.equal(punctured[0].rightClosed, false);
  assert.equal(punctured[1].leftClosed, false);
  assert.equal(measureRange(punctured), 7);
  assert.equal(mutualRange(punctured, singleton4).length, 0);
});

test('Boolean k-face counter N_k(n) = 2^(n-k) * C(n, k) satisfies Σ N_k(n) = 3^n across 0D..15D', () => {
  assert.deepEqual(orthotopeFaceVector(3), [8, 12, 6, 1]);
  assert.deepEqual(orthotopeFaceVector(4), [16, 32, 24, 8, 1]);

  for (let n = 0; n <= 15; n += 1) {
    const vec = orthotopeFaceVector(n);
    assert.equal(vec.length, n + 1);
    let sumBI = 0n;
    for (let k = 0; k <= n; k += 1) {
      sumBI += orthotopeFaceCountBI(n, k);
    }
    assert.equal(sumBI, 3n ** BigInt(n));
    if (n >= 1) {
      assert.equal(orthotopeFaceCount(n, 0), 2 ** n);
      assert.equal(orthotopeFaceCount(n, n - 1), 2 * n);
    }
  }

  assert.equal(ORTHOTOPE_TAXONOMY.length, 13);
  assert.equal(getOrthotopeTaxonomy(0).polytope, 'Monon');
  assert.equal(getOrthotopeTaxonomy(4).hypercubeEn, 'Tesseract (8-cell)');
  assert.equal(getOrthotopeTaxonomy(10).hypercubeEn, 'Dekeract (20-xenon)');
});

test('Unit n-ball volume V_n(1) peaks strictly at integer dimension n = 5 and decays toward 0', () => {
  const volumes = Array.from({ length: 16 }, (_, n) => unitBallVolume(n, 1));
  assert.ok(Math.abs(volumes[2] - Math.PI) < 1e-12);
  assert.ok(Math.abs(volumes[3] - (4 * Math.PI) / 3) < 1e-12);
  assert.ok(Math.abs(volumes[5] - (8 * (Math.PI ** 2)) / 15) < 1e-12);

  let peakDim = 0;
  for (let n = 1; n < volumes.length; n += 1) {
    if (volumes[n] > volumes[peakDim]) peakDim = n;
  }
  assert.equal(peakDim, 5);

  const c10 = hypercubeCornerConcentration(10);
  assert.ok(c10.cornerFraction > 0.9975);
  assert.ok(Math.abs(c10.diagonalLength - 2 * Math.sqrt(10)) < 1e-12);
});

test('3D exploded view & 4D hyperplane / Schlegel projections preserve measure and finiteness', () => {
  const a3 = [range(1, 7), range(1, 7), range(1, 7)];
  const b3 = [range(3, 5), range(3, 5), range(3, 5)];
  const shards3 = diffBox(a3, b3);
  const exploded3 = explodeBoxesNd(shards3, 0.4);
  assert.equal(exploded3.length, 6);
  assert.ok(Math.abs(measureBox(exploded3) - measureBox(shards3)) < 1e-9);

  const proj3 = projectBox3D(exploded3[0], { azimuth: -0.6, elevation: 0.45, scale: 30 });
  assert.equal(proj3.vertices.length, 8);
  assert.equal(proj3.edges.length, 12);
  assert.equal(proj3.faces.length, 6);

  const box4 = [range(1, 8), range(1, 8), range(1, 8), range(2, 6, false, true)];
  assert.equal(sliceBox4DAtW(box4, 2), null);
  assert.ok(Array.isArray(sliceBox4DAtW(box4, 4)));
  assert.equal(sliceBoxes4DAtW([box4], 6).length, 1);

  const schlegel = projectBox4DSchlegel(box4, { xwAngle: 0.35, zwAngle: -0.2, scale: 100 });
  assert.equal(schlegel.vertices.length, 16);
  assert.equal(schlegel.edges.length, 32);
  assert.equal(schlegel.edges.filter((e) => e.wSide === 'bridge').length, 8);
  for (const v of schlegel.vertices) {
    assert.ok(Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.depth));
  }

  const strip = sampleSmallMultiples4D([box4], [0, 10], 6);
  assert.equal(strip.length, 6);
});

test('5D–12D Parallel Interval Coordinates detect single-axis zero collapse & build C(M,2) Corner Plot', () => {
  const a7 = Array.from({ length: 7 }, () => range(1, 6));
  const b7 = Array.from({ length: 7 }, (_, i) => (i === 3 ? range(7, 9) : range(3, 8)));

  const evalBlocked = evaluateParallelAxesNd(a7, b7);
  assert.deepEqual(evalBlocked.blockingAxes, [3]);
  assert.equal(evalBlocked.intersectionMeasure, 0);

  const b7Overlap = Array.from({ length: 7 }, () => range(4, 8));
  const evalOk = evaluateParallelAxesNd(a7, b7Overlap);
  assert.deepEqual(evalOk.blockingAxes, []);
  assert.equal(evalOk.intersectionMeasure, 2 ** 7);

  const cornerCells = buildPairwiseProjectionsNd([a7], { maxAxes: 6 });
  assert.equal(cornerCells.length, (6 * 5) / 2);
});

test('Sandbox operators: grid-nav, statistics, combinatorics, color space & matrix algebra', () => {
  assert.equal(navigateGrid(5, 14, 'down', { columns: 4 }), 9);
  assert.equal(
    detectGridColumns([{ offsetTop: 10 }, { offsetTop: 12 }, { offsetTop: 70 }], (el) => el.offsetTop, 5),
    2
  );

  const seq = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(mean(seq), 5);
  assert.equal(median(seq), 4.5);
  assert.equal(variance(seq), 4);
  assert.equal(std(seq), 2);
  assert.equal(dev(seq), 1.5);
  assert.ok(Math.abs(gauss(0, 0, 1) - 1 / Math.sqrt(2 * Math.PI)) < 1e-12);

  assert.equal(variation(['a', 'b', 'c'], 2).length, 6);
  assert.equal(subset(['x', 'y', 'z']).length, 8);
  assert.deepEqual(subset(['x', 'y', 'z'], 5), ['x', 'z']);

  assert.deepEqual(hexToRgb('#2dd4bf'), { r: 45, g: 212, b: 191 });
  assert.equal(rgbToHex(hslToRgb(...Object.values(rgbToHsl('#ff0000')))), '#ff0000');
  assert.equal(colorStops('#000000', '#ffffff', 5, 'linear').length, 5);
  // Shortest-arc HSL between 350° and 10° passes through 0° red, not 180° cyan
  const midRed = rgbToHsl(interpolateColor('#ff1a40', '#ff401a', 0.5, 'hsl'));
  assert.ok(midRed.h < 20 || midRed.h > 340);

  const m = [[1, 2], [3, 4]];
  assert.deepEqual(transpose(m), [[1, 3], [2, 4]]);
  assert.deepEqual(rotate(m, 1), [[3, 1], [4, 2]]);
  assert.deepEqual(mul(m, [[2, 0], [1, 2]]), [[4, 4], [10, 8]]);
  const flat = matrixAsArray(m);
  flat[3] = 9;
  assert.equal(m[1][1], 9);
});

test('Visual documentation sources and built docs/ artifacts exist without host path leaks', () => {
  const docsSrcIndex = path.join(ROOT_DIR, 'docs-src', 'index.html');
  assert.ok(fs.existsSync(docsSrcIndex));
  const srcHtml = fs.readFileSync(docsSrcIndex, 'utf8');
  assert.ok(srcHtml.includes('closedby="any"'));
  assert.ok(srcHtml.includes('og-image.png'));
  assert.ok(!srcHtml.includes(['/Us', 'ers/'].join('')));

  const docsIndex = path.join(ROOT_DIR, 'docs', 'index.html');
  if (fs.existsSync(docsIndex)) {
    const builtHtml = fs.readFileSync(docsIndex, 'utf8');
    assert.ok(builtHtml.includes('visual-docs.js'));
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'docs', 'og-image.png')));
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'docs', 'esm', 'main.mjs')));
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'docs', 'compendium', 'index.html')));
  }
});
