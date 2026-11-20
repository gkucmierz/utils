/**
 * @module geometry
 */

import { is } from '../developer-utils/type.mjs';
import { nChooseK } from '../combinatorics/n-choose-k.mjs';
import {
  range,
  containsPoint1D,
  mutualRange,
  measureRange,
  mutualBox,
  sumBox,
  diffBox,
  measureBox,
} from './range-set.mjs';

/**
 * Systematic Coxeter-Johnson-Olshevsky-Bowers polytope and orthotope taxonomy
 * across dimensions 0D (Monon) through 12D (Polydodekon / Dodekeract).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IPICUAqAJVnUAKAogPqYCCAGqgHKoCyAmggL4IBmMUYCARAAIBzANYBXAMZgQAUxgAvAPSi4IADYBnXgG5gwDDjyFSFanSY6gA|▶ Try it live in Instacode}
 */
export const ORTHOTOPE_TAXONOMY = Object.freeze([
  Object.freeze({
    dim: 0,
    polytope: 'Monon',
    polytopePl: 'Monon (Punkt)',
    orthotopeEn: '0-orthotope (Point)',
    orthotopePl: '0-ortotop (Punkt)',
    hypercubeEn: 'Point',
    hypercubePl: 'Punkt',
    measureSymbol: 'λ₀',
    measureEn: 'Cardinality (λ₀ = 1)',
    measurePl: 'Liczebność (λ₀ = 1)',
    facetEn: '—',
    facetPl: '—',
  }),
  Object.freeze({
    dim: 1,
    polytope: 'Dion',
    polytopePl: 'Dion (Odcinek)',
    orthotopeEn: '1-orthotope (Interval)',
    orthotopePl: '1-ortotop (Przedział)',
    hypercubeEn: 'Line segment',
    hypercubePl: 'Odcinek',
    measureSymbol: 'λ₁',
    measureEn: 'Length (λ₁)',
    measurePl: 'Długość (λ₁)',
    facetEn: 'Vertex (0-face)',
    facetPl: 'Punkt / Wierzchołek (0-face)',
  }),
  Object.freeze({
    dim: 2,
    polytope: 'Polygon',
    polytopePl: 'Polygon (Wielokąt)',
    orthotopeEn: '2-orthotope (Rectangle)',
    orthotopePl: '2-ortotop (Prostokąt)',
    hypercubeEn: 'Square',
    hypercubePl: 'Kwadrat',
    measureSymbol: 'λ₂',
    measureEn: 'Area (λ₂)',
    measurePl: 'Pole powierzchni (λ₂)',
    facetEn: 'Edge (1-face)',
    facetPl: 'Krawędź / Bok (1-face)',
  }),
  Object.freeze({
    dim: 3,
    polytope: 'Polyhedron',
    polytopePl: 'Polyhedron (Wielościan)',
    orthotopeEn: '3-orthotop (Cuboid)',
    orthotopePl: '3-ortotop (Prostopadłościan)',
    hypercubeEn: 'Cube',
    hypercubePl: 'Sześcian',
    measureSymbol: 'λ₃',
    measureEn: 'Volume (λ₃)',
    measurePl: 'Objętość (λ₃)',
    facetEn: 'Face (2-face)',
    facetPl: 'Ściana (2-face)',
  }),
  Object.freeze({
    dim: 4,
    polytope: 'Polychoron',
    polytopePl: 'Polychoron (Wielokomórkowiec)',
    orthotopeEn: '4-orthotope (Hyperrectangle)',
    orthotopePl: '4-ortotop (Hiperprostokąt)',
    hypercubeEn: 'Tesseract (8-cell)',
    hypercubePl: 'Teserakt (8-komórkowiec)',
    measureSymbol: 'λ₄',
    measureEn: '4D Hypervolume / Bulk / Surcell (λ₄)',
    measurePl: 'Hiperobjętość 4D / Bulk / Surcell (λ₄)',
    facetEn: 'Cell (3-face)',
    facetPl: 'Komórka 3D (3-face)',
  }),
  Object.freeze({
    dim: 5,
    polytope: 'Polyteron',
    polytopePl: 'Polyteron',
    orthotopeEn: '5-orthotope',
    orthotopePl: '5-ortotop',
    hypercubeEn: 'Penteract (10-teron)',
    hypercubePl: 'Penterakt (10-teron)',
    measureSymbol: 'λ₅',
    measureEn: 'Pentavolume / Teron content (λ₅)',
    measurePl: '5-objętość / Terobjętość (λ₅)',
    facetEn: 'Teron (4-face)',
    facetPl: 'Teron (4-face, komórka 4D)',
  }),
  Object.freeze({
    dim: 6,
    polytope: 'Polypeton',
    polytopePl: 'Polypeton',
    orthotopeEn: '6-orthotope',
    orthotopePl: '6-ortotop',
    hypercubeEn: 'Hexeract (12-peton)',
    hypercubePl: 'Hekserakt (12-peton)',
    measureSymbol: 'λ₆',
    measureEn: 'Hexavolume / Peton content (λ₆)',
    measurePl: '6-objętość / Petobjętość (λ₆)',
    facetEn: 'Peton (5-face)',
    facetPl: 'Peton (5-face)',
  }),
  Object.freeze({
    dim: 7,
    polytope: 'Polyexon',
    polytopePl: 'Polyexon',
    orthotopeEn: '7-orthotope',
    orthotopePl: '7-ortotop',
    hypercubeEn: 'Hepteract (14-exon)',
    hypercubePl: 'Hepterakt (14-exon)',
    measureSymbol: 'λ₇',
    measureEn: 'Heptavolume / Exon content (λ₇)',
    measurePl: '7-objętość / Eksoobjętość (λ₇)',
    facetEn: 'Exon (6-face)',
    facetPl: 'Exon (6-face)',
  }),
  Object.freeze({
    dim: 8,
    polytope: 'Polyzetton',
    polytopePl: 'Polyzetton',
    orthotopeEn: '8-orthotope',
    orthotopePl: '8-ortotop',
    hypercubeEn: 'Octeract (16-zetton)',
    hypercubePl: 'Okterakt (16-zetton)',
    measureSymbol: 'λ₈',
    measureEn: 'Octavolume / Zetton content (λ₈)',
    measurePl: '8-objętość / Zettoobjętość (λ₈)',
    facetEn: 'Zetton (7-face)',
    facetPl: 'Zetton (7-face)',
  }),
  Object.freeze({
    dim: 9,
    polytope: 'Polyyotton',
    polytopePl: 'Polyyotton',
    orthotopeEn: '9-orthotope',
    orthotopePl: '9-ortotop',
    hypercubeEn: 'Enneract (18-yotton)',
    hypercubePl: 'Ennerakt (18-yotton)',
    measureSymbol: 'λ₉',
    measureEn: 'Enneavolume / Yotton content (λ₉)',
    measurePl: '9-objętość / Jottoobjętość (λ₉)',
    facetEn: 'Yotton (8-face)',
    facetPl: 'Yotton (8-face)',
  }),
  Object.freeze({
    dim: 10,
    polytope: 'Polyxenon',
    polytopePl: 'Polyxenon',
    orthotopeEn: '10-orthotope',
    orthotopePl: '10-ortotop',
    hypercubeEn: 'Dekeract (20-xenon)',
    hypercubePl: 'Dekerakt (20-xenon)',
    measureSymbol: 'λ₁₀',
    measureEn: 'Decavolume / Xenon content (λ₁₀)',
    measurePl: '10-objętość / Ksenoobjętość (λ₁₀)',
    facetEn: 'Xenon (9-face)',
    facetPl: 'Xenon (9-face)',
  }),
  Object.freeze({
    dim: 11,
    polytope: 'Polyhendekon',
    polytopePl: 'Polyhendekon',
    orthotopeEn: '11-orthotope',
    orthotopePl: '11-ortotop',
    hypercubeEn: 'Hendekeract (22-hendekon)',
    hypercubePl: 'Hendekerakt (22-hendekon)',
    measureSymbol: 'λ₁₁',
    measureEn: '11-volume (λ₁₁)',
    measurePl: '11-objętość (λ₁₁)',
    facetEn: '10-face',
    facetPl: '10-ściana (10-face)',
  }),
  Object.freeze({
    dim: 12,
    polytope: 'Polydodekon',
    polytopePl: 'Polydodekon',
    orthotopeEn: '12-orthotope',
    orthotopePl: '12-ortotop',
    hypercubeEn: 'Dodekeract (24-dodekon)',
    hypercubePl: 'Dodekerakt (24-dodekon)',
    measureSymbol: 'λ₁₂',
    measureEn: '12-volume (λ₁₂)',
    measurePl: '12-objętość (λ₁₂)',
    facetEn: '11-face',
    facetPl: '11-ściana (11-face)',
  }),
]);

/**
 * Retrieves polytope taxonomy metadata for dimension `n`, falling back to systematic `n`-orthotope labels when `n > 12`.
 * @param {number} n - Non-negative integer dimension
 * @returns {Object} Taxonomy descriptor
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IOYFM4Hl4AspxQToAqAhgB5QB2UYAnggL4IBmMdCARAAKoDWAVwDGYEOhgAvAPSC4IADYBnLgG5gwDNjwEipSjTr11QA|▶ Try it live in Instacode}
 */
export const getOrthotopeTaxonomy = (n) => {
  const dim = Math.max(0, Math.floor(Number(n) || 0));
  if (dim < ORTHOTOPE_TAXONOMY.length) {
    return ORTHOTOPE_TAXONOMY[dim];
  }
  return {
    dim,
    polytope: `${dim}-polytope`,
    polytopePl: `${dim}-politop`,
    orthotopeEn: `${dim}-orthotope`,
    orthotopePl: `${dim}-ortotop`,
    hypercubeEn: `${dim}-hypercube`,
    hypercubePl: `${dim}-hipersześcian`,
    measureSymbol: `λ_${dim}`,
    measureEn: `${dim}-volume (λ_${dim})`,
    measurePl: `${dim}-objętość (λ_${dim})`,
    facetEn: `${dim - 1}-face`,
    facetPl: `${dim - 1}-ściana`,
  };
};

/**
 * Arbitrary-precision BigInt count of k-dimensional boundary elements (k-faces) of an n-orthotope:
 * N_k(n) = 2^(n - k) * C(n, k).
 * Satisfies sum_{k=0..n} N_k(n) = 3^n.
 * @param {number|bigint} n - Ambient orthotope dimension (n >= 0)
 * @param {number|bigint} k - Boundary element dimension (0 <= k <= n)
 * @returns {bigint} Exact BigInt count of k-faces
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4NnAFlOUIFMBiAhgMa4DCUArgHZwBCAkggL4IBmMUYCARAAIBzANaViYELhgAvAPSU4IADYBnHgG5gwNJmx4ipCjXoMNQA|▶ Try it live in Instacode}
 */
export const orthotopeFaceCountBI = (n, k) => {
  const bigN = is(n, 'bigint') ? n : BigInt(Math.trunc(Number(n)));
  const bigK = is(k, 'bigint') ? k : BigInt(Math.trunc(Number(k)));
  if (bigN < 0n || bigK < 0n || bigK > bigN) return 0n;
  return (2n ** (bigN - bigK)) * nChooseK(bigN, bigK);
};

/**
 * Computes the number of k-dimensional boundary elements (k-faces) of an n-orthotope:
 * N_k(n) = 2^(n - k) * C(n, k).
 * Vertices (k = 0): 2^n; Edges (k = 1): n * 2^(n - 1); Facets (k = n - 1): 2n.
 * @param {number} n - Ambient orthotope dimension (n >= 0)
 * @param {number} k - Boundary element dimension (0 <= k <= n)
 * @returns {number} Count of k-faces
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4NnAFlOUIFMBiAhgMa4DCUArgHaIC+CAZjFGAgEQACA5gNaXEwIXDABeAekpwQAGwDO7ANzBgaTNjxFSFGnGVA|▶ Try it live in Instacode}
 */
export const orthotopeFaceCount = (n, k) => {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
    return 0;
  }
  return Number(orthotopeFaceCountBI(n, k));
};

/**
 * Returns the full f-vector `[N_0(n), N_1(n), ..., N_n(n)]` of an n-orthotope,
 * whose entries sum to `3^n`.
 * @param {number} n - Ambient orthotope dimension (n >= 0)
 * @returns {Array<number>} Array of k-face counts for k = 0..n
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4NnAFlOUIFMBiAhgMa4Bqux2MCAvggGYxRgIBEAAgOYDWArsTAhcMAF4B6PnBAAbAM5sA3MGBpM2PEVIUqsZUA|▶ Try it live in Instacode}
 */
export const orthotopeFaceVector = (n) => {
  if (!Number.isInteger(n) || n < 0) return [];
  const vec = new Array(n + 1);
  for (let k = 0; k <= n; k += 1) {
    vec[k] = orthotopeFaceCount(n, k);
  }
  return vec;
};

/**
 * Computes the exact n-dimensional Lebesgue measure (volume) of an n-ball of radius R:
 * V_n(R) = (pi^(n/2) / Gamma(n/2 + 1)) * R^n.
 * Uses the exact overflow-free recurrence V_0(1) = 1, V_1(1) = 2, V_n(1) = (2 * pi / n) * V_{n-2}(1),
 * which peaks at n = 5 (V_5(1) = 8 * pi^2 / 15 ≈ 5.2637890139) and decays to 0 as n -> infinity.
 * @param {number} n - Non-negative integer dimension (n >= 0)
 * @param {number} [radius=1] - Sphere radius (R >= 0)
 * @returns {number} Exact n-ball volume
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IK4DsRwEIEMA2+AalPqmAKYIC+CAZjFGAgEQACA5gNaoDGYICjABeAelRwQ+AM4sA3MGAYseQiTKUFQA|▶ Try it live in Instacode}
 */
export const unitBallVolume = (n, radius = 1) => {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('unitBallVolume requires a non-negative integer dimension n');
  }
  const r = Number(radius);
  if (!Number.isFinite(r) || r < 0) {
    throw new RangeError('unitBallVolume requires a finite non-negative radius');
  }
  if (n === 0) return 1;
  if (r === 0) return 0;

  let v = n % 2 === 0 ? 1 : 2;
  const start = n % 2 === 0 ? 2 : 3;
  for (let k = start; k <= n; k += 2) {
    v *= (2 * Math.PI) / k;
  }
  return r === 1 ? v : v * (r ** n);
};

/**
 * Quantifies the high-dimensional paradox comparing the inscribed unit n-ball B_n(1)
 * against its circumscribed n-hypercube [-1, 1]^n (volume 2^n, main diagonal 2 * sqrt(n)).
 * @param {number} n - Non-negative integer dimension
 * @returns {Object} Volume comparison and corner-concentration metrics
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IBYE8IFMYGMCuARlgMKwB2OZ5uW5cMAhnCFOQgL4IBmMUYCAEQABAOYBrfLjAgcALwD0+FgBsAzoIDcwYBmx4ipClTa16TFm21A|▶ Try it live in Instacode}
 */
export const hypercubeCornerConcentration = (n) => {
  const ballVolume = unitBallVolume(n, 1);
  const cubeVolume = 2 ** n;
  const ballToCubeRatio = cubeVolume > 0 ? ballVolume / cubeVolume : 0;
  const cornerFraction = Math.max(0, Math.min(1, 1 - ballToCubeRatio));
  const diagonalLength = 2 * Math.sqrt(n);
  return {
    n,
    ballVolume,
    cubeVolume,
    ballToCubeRatio,
    cornerFraction,
    diagonalLength,
  };
};

/**
 * Computes the geometric centroid `[c_1, c_2, ..., c_N]` of a single N-orthotope.
 * @param {Array<Array<number>>} box - N-dimensional box `[[a_1, b_1], ..., [a_N, b_N]]`
 * @returns {Array<number>} Midpoint coordinate vector
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IEZQB4GECmA7OGKEAEwDkSEBfBAMyLAQCIABAcwGsBXAYzBBwwAXgHoucEABsAzkwDcwYOmz5CxciQVA|▶ Try it live in Instacode}
 */
export const boxCentroidNd = (box) => {
  if (!Array.isArray(box) || box.length === 0) return [];
  return box.map((iv) => 0.5 * (Number(iv[0]) + Number(iv[1])));
};

/**
 * Radially translates an array of N-orthotopes outward from their shared centroid (or explicit `origin`)
 * by `factor >= 0` ("Exploded View") while strictly preserving each sub-orthotope's side lengths,
 * Lebesgue measure, and open/closed endpoint flags.
 * @param {Array<Array<Array<number>>>} boxes - Array of N-boxes (e.g. from `diffBox` or `xorBox`)
 * @param {number} [factor=0] - Radial displacement multiplier (`0` = unshifted)
 * @param {Array<number>|null} [origin=null] - Optional custom explosion center
 * @returns {Array<Array<Array<number>>>} Shifted N-boxes with preserved closures
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKYA8IBsoBNUBCU6qAzgHK4IC+CAZjFGAgEQACA5gNYCuAxmBCoYALwD0POCCykWAbmDAM2PIWJlKCoA|▶ Try it live in Instacode}
 */
export const explodeBoxesNd = (boxes, factor = 0, origin = null) => {
  if (!Array.isArray(boxes) || boxes.length === 0) return [];
  const k = Number(factor) || 0;
  const dim = boxes[0].length;

  let center = Array.isArray(origin) && origin.length === dim ? origin.map(Number) : null;
  if (!center) {
    center = new Array(dim).fill(0);
    let totalWeight = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      const b = boxes[i];
      const w = Math.max(1e-9, measureBox([b]));
      const c = boxCentroidNd(b);
      for (let d = 0; d < dim; d += 1) {
        center[d] += c[d] * w;
      }
      totalWeight += w;
    }
    if (totalWeight > 0) {
      for (let d = 0; d < dim; d += 1) {
        center[d] /= totalWeight;
      }
    }
  }

  return boxes.map((b) => {
    const c = boxCentroidNd(b);
    return b.map((iv, d) => {
      const shift = k * (c[d] - center[d]);
      const lc = is(iv.leftClosed, 'boolean') ? iv.leftClosed : true;
      const rc = is(iv.rightClosed, 'boolean') ? iv.rightClosed : true;
      return range(iv[0] + shift, iv[1] + shift, lc, rc);
    });
  });
};

/**
 * Projects a 3D point `[x, y, z]` onto 2D screen space `{ x, y, depth }` via an orbital camera
 * parameterized by `azimuth` (yaw around Y) and `elevation` (pitch around X).
 * @param {Array<number>} point3 - `[x, y, z]` world point
 * @param {Object} [options={}] - Camera configuration
 * @returns {{ x: number, y: number, depth: number }} Projected 2D coordinates and camera depth
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKArApgYzgBShADs4BmAEQQF8EAzdMBAIgAEBzAawFccwQsMAF4B6bnBAAbAM7MA3MGBpMuAkVKUFQA|▶ Try it live in Instacode}
 */
export const projectPoint3D = (
  point3,
  {
    azimuth = -0.65,
    elevation = 0.5,
    distance = 0,
    scale = 1,
    center = [0, 0, 0],
  } = {}
) => {
  const dx = Number(point3[0]) - Number(center[0] || 0);
  const dy = Number(point3[1]) - Number(center[1] || 0);
  const dz = Number(point3[2]) - Number(center[2] || 0);

  const cosA = Math.cos(azimuth);
  const sinA = Math.sin(azimuth);
  const cosE = Math.cos(elevation);
  const sinE = Math.sin(elevation);

  // Yaw around vertical Y axis, then pitch around horizontal X axis
  const x1 = dx * cosA + dz * sinA;
  const z1 = -dx * sinA + dz * cosA;
  const y2 = dy * cosE - z1 * sinE;
  const z2 = dy * sinE + z1 * cosE;

  const persp = distance > 0 ? distance / Math.max(0.25, distance - z2) : 1;
  return {
    x: x1 * persp * scale,
    y: -y2 * persp * scale,
    depth: z2,
  };
};

const BOX3_FACE_DEFS = Object.freeze([
  Object.freeze({ axis: 0, side: 'min', bitVal: 0, verts: [0, 2, 6, 4] }),
  Object.freeze({ axis: 0, side: 'max', bitVal: 1, verts: [1, 3, 7, 5] }),
  Object.freeze({ axis: 1, side: 'min', bitVal: 0, verts: [0, 1, 5, 4] }),
  Object.freeze({ axis: 1, side: 'max', bitVal: 1, verts: [2, 3, 7, 6] }),
  Object.freeze({ axis: 2, side: 'min', bitVal: 0, verts: [0, 1, 3, 2] }),
  Object.freeze({ axis: 2, side: 'max', bitVal: 1, verts: [4, 5, 7, 6] }),
]);

/**
 * Projects a 3-orthotope `[[x0, x1], [y0, y1], [z0, z1]]` into 8 projected vertices,
 * 12 boundary-annotated edges (marking open cut boundaries as `closed: false`), and
 * 6 depth-sorted quad faces for painter's algorithm rendering.
 * @param {Array<Array<number>>} box3 - 3D orthotope
 * @param {Object} [cameraOpts={}] - Orbital projection options passed to `projectPoint3D`
 * @returns {{ vertices: Array, edges: Array, faces: Array }} Projected 3D geometry
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKArApgYzgISgA8BmAEQQF8EAzdMBAIgAEBzAawFccwQsYAXgHpOcEABsAzowDcwYGky4CxcnKA|▶ Try it live in Instacode}
 */
export const projectBox3D = (box3, cameraOpts = {}) => {
  if (!Array.isArray(box3) || box3.length < 3) {
    return { vertices: [], edges: [], faces: [] };
  }
  const closures = [0, 1, 2].map((d) => ({
    min: is(box3[d].leftClosed, 'boolean') ? box3[d].leftClosed : true,
    max: is(box3[d].rightClosed, 'boolean') ? box3[d].rightClosed : true,
  }));

  // Vertex index mask: bit 0 = x, bit 1 = y, bit 2 = z
  const vertices = new Array(8);
  for (let mask = 0; mask < 8; mask += 1) {
    const raw = [
      box3[0][mask & 1 ? 1 : 0],
      box3[1][mask & 2 ? 1 : 0],
      box3[2][mask & 4 ? 1 : 0],
    ];
    const proj = projectPoint3D(raw, cameraOpts);
    vertices[mask] = { ...proj, raw, mask };
  }

  const edges = [];
  for (let a = 0; a < 8; a += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const bit = 1 << axis;
      if ((a & bit) !== 0) continue;
      const b = a | bit;
      let closed = true;
      for (let other = 0; other < 3; other += 1) {
        if (other === axis) continue;
        const isMax = (a & (1 << other)) !== 0;
        closed = closed && (isMax ? closures[other].max : closures[other].min);
      }
      edges.push({
        from: a,
        to: b,
        axis,
        closed,
        p1: vertices[a],
        p2: vertices[b],
        depth: 0.5 * (vertices[a].depth + vertices[b].depth),
      });
    }
  }

  const faces = BOX3_FACE_DEFS.map((def) => {
    const pts = def.verts.map((idx) => vertices[idx]);
    const depth = 0.25 * (pts[0].depth + pts[1].depth + pts[2].depth + pts[3].depth);
    const closed = def.side === 'min' ? closures[def.axis].min : closures[def.axis].max;
    return {
      axis: def.axis,
      side: def.side,
      closed,
      indices: def.verts,
      points: pts,
      depth,
    };
  }).sort((fA, fB) => fA.depth - fB.depth);

  return { vertices, edges, faces };
};

/**
 * Computes the 3D hyperplane cross-section (x, y, z) of a 4-orthotope at 4th-dimension coordinate `w`,
 * respecting open vs closed endpoint flags on the 4th axis.
 * @param {Array<Array<number>>} box4 - 4D orthotope `[[x0, x1], [y0, y1], [z0, z1], [w0, w1]]`
 * @param {number} w - Scrubber coordinate along the 4th dimension
 * @returns {Array<Array<number>>|null} 3D orthotope cross-section, or `null` if `w` is outside `box4[3]`
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4BsQGMCmAhKADwBYARAQTgHUEBfBAMxijAQCIABAcwGsBXLGBA4YALwD0fOCHSo2AbmDAM2fETKUqioA|▶ Try it live in Instacode}
 */
export const sliceBox4DAtW = (box4, w) => {
  if (!Array.isArray(box4) || box4.length < 4) return null;
  const wIv = box4[3];
  const lcW = is(wIv.leftClosed, 'boolean') ? wIv.leftClosed : true;
  const rcW = is(wIv.rightClosed, 'boolean') ? wIv.rightClosed : true;
  if (!containsPoint1D(range(wIv[0], wIv[1], lcW, rcW), w)) {
    return null;
  }
  return [0, 1, 2].map((d) => {
    const iv = box4[d];
    const lc = is(iv.leftClosed, 'boolean') ? iv.leftClosed : true;
    const rc = is(iv.rightClosed, 'boolean') ? iv.rightClosed : true;
    return range(iv[0], iv[1], lc, rc);
  });
};

/**
 * Slices an array of 4-orthotopes at hyperplane `w`, returning all non-empty 3D cross-sections.
 * @param {Array<Array<Array<number>>>} boxes4 - Array of 4D orthotopes
 * @param {number} w - Scrubber coordinate along the 4th dimension
 * @returns {Array<Array<Array<number>>>} Active 3D orthotope slices at `w`
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4BsQGMCmAhKADx1QBYARAQTgHUEBfBAMxijAQCIABAcwGsArljAgcMAF4B6AXBDpUHANzBgGbPiIkK1GsqA|▶ Try it live in Instacode}
 */
export const sliceBoxes4DAtW = (boxes4, w) => {
  if (!Array.isArray(boxes4) || boxes4.length === 0) return [];
  const out = [];
  for (let i = 0; i < boxes4.length; i += 1) {
    const sliced = sliceBox4DAtW(boxes4[i], w);
    if (sliced) out.push(sliced);
  }
  return out;
};

/**
 * Projects a 4D point `[x, y, z, w]` via double perspective (Schlegel 4D -> 3D -> 2D projection)
 * with optional 4D XW/ZW plane rotation and guaranteed finite coordinates.
 * @param {Array<number>} point4 - `[x, y, z, w]` coordinate vector
 * @param {Object} [options={}] - 4D and 3D camera parameters
 * @returns {{ x: number, y: number, depth: number, p3: Array<number>, wPersp: number }} Projected 2D point and intermediate 3D coordinates
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKArApgYzgBShADs4AWAEQGUcALAGywHMt6EBfBAM3TAQCIAAkwDWAVxxgQWGAC8A9GLgh6AZ34BuYMDSZcBIqUo0GzVlqA|▶ Try it live in Instacode}
 */
export const projectPoint4DSchlegel = (
  point4,
  {
    center4 = [5, 5, 5, 5],
    halfSpan = 5,
    wCamera = 2.6,
    xwAngle = 0,
    zwAngle = 0,
    azimuth = -0.62,
    elevation = 0.48,
    scale = 1,
  } = {}
) => {
  const norm = Math.max(1e-6, Number(halfSpan) || 1);
  let nx = (Number(point4[0]) - Number(center4[0] || 0)) / norm;
  const ny = (Number(point4[1]) - Number(center4[1] || 0)) / norm;
  let nz = (Number(point4[2]) - Number(center4[2] || 0)) / norm;
  let nw = (Number(point4[3]) - Number(center4[3] || 0)) / norm;

  if (xwAngle !== 0) {
    const c = Math.cos(xwAngle);
    const s = Math.sin(xwAngle);
    const rx = nx * c - nw * s;
    const rw = nx * s + nw * c;
    nx = rx;
    nw = rw;
  }
  if (zwAngle !== 0) {
    const c = Math.cos(zwAngle);
    const s = Math.sin(zwAngle);
    const rz = nz * c - nw * s;
    const rw = nz * s + nw * c;
    nz = rz;
    nw = rw;
  }

  const camW = Math.max(1.35, Number(wCamera) || 2.6);
  const denom = Math.max(0.25, camW - nw);
  const wPersp = camW / denom;
  const p3 = [nx * wPersp, ny * wPersp, nz * wPersp];
  const p2 = projectPoint3D(p3, {
    azimuth,
    elevation,
    distance: 0,
    scale,
    center: [0, 0, 0],
  });

  return {
    x: p2.x,
    y: p2.y,
    depth: p2.depth,
    p3,
    wPersp,
  };
};

/**
 * Projects a 4-orthotope (tesseract / hyperrectangle) into its 16 Schlegel vertices and 32 edges
 * (12 `w_min` cuboid edges, 12 `w_max` cuboid edges, and 8 diagonal 4th-dimension `bridge` edges).
 * @param {Array<Array<number>>} box4 - 4D orthotope `[[x0, x1], [y0, y1], [z0, z1], [w0, w1]]`
 * @param {Object} [options={}] - Schlegel camera options passed to `projectPoint4DSchlegel`
 * @returns {{ vertices: Array, edges: Array }} Projected 4D wireframe geometry
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IjKArApgYzgISgA8AWAEQGUcALAGywHMtaEBfBAM3TAQCIABBgGsArjjAgsMAF4B6EXBC0AzrwDcwYGky4CxclTqNmGoA|▶ Try it live in Instacode}
 */
export const projectBox4DSchlegel = (box4, options = {}) => {
  if (!Array.isArray(box4) || box4.length < 4) {
    return { vertices: [], edges: [] };
  }
  const closures = [0, 1, 2, 3].map((d) => ({
    min: is(box4[d].leftClosed, 'boolean') ? box4[d].leftClosed : true,
    max: is(box4[d].rightClosed, 'boolean') ? box4[d].rightClosed : true,
  }));

  const vertices = new Array(16);
  for (let mask = 0; mask < 16; mask += 1) {
    const raw = [
      box4[0][mask & 1 ? 1 : 0],
      box4[1][mask & 2 ? 1 : 0],
      box4[2][mask & 4 ? 1 : 0],
      box4[3][mask & 8 ? 1 : 0],
    ];
    const proj = projectPoint4DSchlegel(raw, options);
    vertices[mask] = { ...proj, raw, mask };
  }

  const edges = [];
  for (let a = 0; a < 16; a += 1) {
    for (let axis = 0; axis < 4; axis += 1) {
      const bit = 1 << axis;
      if ((a & bit) !== 0) continue;
      const b = a | bit;
      let closed = true;
      for (let other = 0; other < 4; other += 1) {
        if (other === axis) continue;
        const isMax = (a & (1 << other)) !== 0;
        closed = closed && (isMax ? closures[other].max : closures[other].min);
      }
      const wSide = axis === 3 ? 'bridge' : ((a & 8) !== 0 ? 'max' : 'min');
      edges.push({
        from: a,
        to: b,
        axis,
        wSide,
        closed,
        p1: vertices[a],
        p2: vertices[b],
        depth: 0.5 * (vertices[a].depth + vertices[b].depth),
      });
    }
  }

  return { vertices, edges };
};

/**
 * Generates a Small Multiples strip of `frameCount` evenly spaced 3D cross-sections of 4D orthotopes
 * across `wDomain = [wMin, wMax]`.
 * @param {Array<Array<Array<number>>>} boxes4 - Array of 4D orthotopes
 * @param {Array<number>} [wDomain=[0, 10]] - `[wMin, wMax]` sampling interval
 * @param {number} [frameCount=6] - Number of cross-section frames (`>= 1`)
 * @returns {Array<{ index: number, w: number, boxes3D: Array, measure3D: number }>} Sampled 4D strip frames
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IM4ENIBsCmBlMdLLAWQFcs4QJdUAWAEQQF8EAzGKMBAIgAEA5gGsyAYzAgcMAF4B6MlSyoeAbmDAM2fIWLlK1WozVA|▶ Try it live in Instacode}
 */
export const sampleSmallMultiples4D = (boxes4, wDomain = [0, 10], frameCount = 6) => {
  const count = Math.max(1, Math.floor(Number(frameCount) || 6));
  const wMin = Number(wDomain[0] ?? 0);
  const wMax = Number(wDomain[1] ?? 10);
  const frames = [];

  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const w = Number((wMin + t * (wMax - wMin)).toFixed(4));
    const boxes3D = sliceBoxes4DAtW(boxes4, w);
    frames.push({
      index: i,
      w,
      boxes3D,
      measure3D: boxes3D.length > 0 ? measureBox(boxes3D) : 0,
    });
  }
  return frames;
};

/**
 * Evaluates per-axis 1D intervals, overlaps, zero-collapse blocking axes, and full N-dimensional
 * measures for Parallel Interval Coordinates in arbitrary dimension N >= 1.
 * Demonstrates `measure(A ∩ B) = prod_{i=1..N} Δx_i > 0 <=> forall i, Δx_i > 0`.
 * @param {Array<Array<number>>} boxA - First N-orthotope
 * @param {Array<Array<number>>} boxB - Second N-orthotope
 * @returns {Object} Axis-by-axis breakdown and global N-dimensional Boolean invariants
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IKYDcCGAbArpuVABUxh21WwEEAPVAZwDkATBAXwQDMYowEAiAAIBzANa4AxmBCoYALwD0uOCGz1+AbmDAMOfIRJlsFanSbMtQA|▶ Try it live in Instacode}
 */
export const evaluateParallelAxesNd = (boxA, boxB) => {
  if (!Array.isArray(boxA) || !Array.isArray(boxB) || boxA.length === 0 || boxA.length !== boxB.length) {
    return {
      dim: 0,
      axes: [],
      blockingAxes: [],
      measureA: 0,
      measureB: 0,
      intersectionMeasure: 0,
      unionMeasure: 0,
      diffMeasure: 0,
      diffShardCount: 0,
    };
  }

  const dim = boxA.length;
  const axes = [];
  const blockingAxes = [];

  for (let d = 0; d < dim; d += 1) {
    const lcA = is(boxA[d].leftClosed, 'boolean') ? boxA[d].leftClosed : true;
    const rcA = is(boxA[d].rightClosed, 'boolean') ? boxA[d].rightClosed : true;
    const lcB = is(boxB[d].leftClosed, 'boolean') ? boxB[d].leftClosed : true;
    const rcB = is(boxB[d].rightClosed, 'boolean') ? boxB[d].rightClosed : true;
    const ivA = range(boxA[d][0], boxA[d][1], lcA, rcA);
    const ivB = range(boxB[d][0], boxB[d][1], lcB, rcB);
    const inter = mutualRange(ivA, ivB);
    const overlapLength = measureRange(inter);
    const hasPointOverlap = inter.length > 0;
    if (overlapLength <= 0) {
      blockingAxes.push(d);
    }
    axes.push({
      axisIndex: d,
      axisLabel: `x${d + 1}`,
      ivA,
      ivB,
      lengthA: measureRange(ivA),
      lengthB: measureRange(ivB),
      intersection: inter,
      overlapLength,
      hasPointOverlap,
    });
  }

  const interBoxes = mutualBox(boxA, boxB);
  const diffBoxes = diffBox(boxA, boxB);
  const unionBoxes = sumBox(boxA, boxB);

  return {
    dim,
    axes,
    blockingAxes,
    measureA: measureBox([boxA]),
    measureB: measureBox([boxB]),
    intersectionMeasure: measureBox(interBoxes),
    unionMeasure: measureBox(unionBoxes),
    diffMeasure: measureBox(diffBoxes),
    diffShardCount: diffBoxes.length,
    maxTheoreticalDiffShards: 2 * dim,
  };
};

/**
 * Builds the C(M, 2) pairwise 2D axis projections `(axisX, axisY)` (`0 <= axisX < axisY < M`)
 * of an array of N-orthotopes for high-dimensional Corner Plot rendering.
 * @param {Array<Array<Array<number>>>} boxesNd - Array of N-orthotopes
 * @param {Object} [options={}] - Options (`maxAxes` cap, defaulting to `8`)
 * @returns {Array<{ axisX: number, axisY: number, boxes2D: Array, projectedArea: number }>} Pairwise 2D cells
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IEYFcQBsAmAFAQxBgHcQBnAUzxigCtKBjOEKAO3IDkcEBfBAGa0wCAEQABAOYBrdIzAhKMAF4B6dCyzlRAbmDAM2fEVIVqtBs1YdueoA|▶ Try it live in Instacode}
 */
export const buildPairwiseProjectionsNd = (boxesNd, { maxAxes = 8 } = {}) => {
  if (!Array.isArray(boxesNd) || boxesNd.length === 0 || !Array.isArray(boxesNd[0])) {
    return [];
  }
  const dim = Math.min(boxesNd[0].length, Math.max(2, Math.floor(Number(maxAxes) || 8)));
  const cells = [];

  for (let r = 1; r < dim; r += 1) {
    for (let c = 0; c < r; c += 1) {
      const boxes2D = boxesNd.map((b) => {
        const ivX = b[c];
        const ivY = b[r];
        const lcX = is(ivX.leftClosed, 'boolean') ? ivX.leftClosed : true;
        const rcX = is(ivX.rightClosed, 'boolean') ? ivX.rightClosed : true;
        const lcY = is(ivY.leftClosed, 'boolean') ? ivY.leftClosed : true;
        const rcY = is(ivY.rightClosed, 'boolean') ? ivY.rightClosed : true;
        return [range(ivX[0], ivX[1], lcX, rcX), range(ivY[0], ivY[1], lcY, rcY)];
      });
      cells.push({
        axisX: c,
        axisY: r,
        boxes2D,
        projectedArea: measureBox(boxes2D),
      });
    }
  }
  return cells;
};
