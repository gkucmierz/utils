/**
 * @module geometry
 */

/**
 * Calculates the barycentric coordinates of a 2D point P relative to a triangle ABC.
 * @param {Array<number>} p - Point [x, y]
 * @param {Array<number>} a - Vertex A [x, y]
 * @param {Array<number>} b - Vertex B [x, y]
 * @param {Array<number>} c - Vertex C [x, y]
 * @returns {Array<number>} [l1, l2, l3] barycentric coordinates summing to 1
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IEYEMYE8DGBTAOzhhBwGEpYATEA9OPAZwQF8EAzGKMBAIgAEA5gGsArjjAg8MAF4B6UXBAAbRrwDcwYBmz4iJcpRg06DRpqA|▶ Try it live in Instacode}
 */
export const barycentricCoordinates = (p, a, b, c) => {
  const det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  if (Math.abs(det) < 1e-9) {
    return [1/3, 1/3, 1/3]; // Fallback for collinear vertices
  }
  const l1 = ((b[1] - c[1]) * (p[0] - c[0]) + (c[0] - b[0]) * (p[1] - c[1])) / det;
  const l2 = ((c[1] - a[1]) * (p[0] - c[0]) + (a[0] - c[0]) * (p[1] - c[1])) / det;
  const l3 = 1 - l1 - l2;
  return [l1, l2, l3];
};
