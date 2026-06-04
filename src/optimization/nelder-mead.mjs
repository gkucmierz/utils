/**
 * Nelder-Mead Simplex Algorithm (Direct Search Gradient-Free Optimization)
 * Maximizes continuous N-dimensional spaces through contraction and expansion.
 * 
 * @param {Function} evaluate - function(paramsArray) => Number (score to maximize)
 * @param {Array<Array<Number>>} bounds - [[min1, max1], ... ] bounds per dimension
 * @param {Object} options - { steps: 30, onProgress: async (state) => {} }
 * @returns {Promise<{bestParams: Array<Number>, bestScore: Number}>}
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYFMA2ATdMCy6AhtggL4IBmMUYCARAAIDmA1gK4DGYIeAXgHp2cEJgDO9ANzBgGHHkIlpQA|▶ Try it live in Instacode}
 */
export const nelderMead = async (evaluate, bounds, options = {}) => {
  const steps = options.steps || 30;
  const onProgress = options.onProgress || (async () => {});
  const dim = bounds.length;

  let simplex = [];
  let baseCoords = bounds.map(b => b[0] + (b[1] - b[0]) * 0.5); // Start directly centered

  // To build an initial N-dimensional simplex, we require N+1 vertices
  for (let i = 0; i <= dim; i++) {
    let p = [...baseCoords];
    if (i > 0) {
      // Offset each dimension successively to form the simplex
      let range = bounds[i-1][1] - bounds[i-1][0];
      p[i-1] += range * 0.2; // 20% span stretch
    }
    for(let d=0; d<dim; d++) p[d] = Math.max(bounds[d][0], Math.min(bounds[d][1], p[d]));
    
    simplex.push({ position: p, score: evaluate(p) });
  }

  const alpha = 1.0; // Reflection
  const gamma = 2.0; // Expansion
  const rho = 0.5;   // Contraction
  const sigma = 0.5; // Shrink

  for (let step = 0; step < steps; step++) {
    // Sort descending layout (Simplex optimization seeks maximization)
    simplex.sort((a, b) => b.score - a.score);
    
    let best = simplex[0];
    let worst = simplex[dim];
    let secondWorst = simplex[dim - 1];

    // Compute the spatial centroid of all nodes excluding the worst
    let centroid = new Array(dim).fill(0);
    for (let i = 0; i < dim; i++) {
      for (let d = 0; d < dim; d++) centroid[d] += simplex[i].position[d];
    }
    for (let d = 0; d < dim; d++) centroid[d] /= dim;

    // Reflection Hook
    let xr = centroid.map((c, d) => c + alpha * (c - worst.position[d]));
    xr = xr.map((v, d) => Math.max(bounds[d][0], Math.min(bounds[d][1], v)));
    let rScore = evaluate(xr);

    if (rScore > best.score) {
      // Expansion Hook
      let xe = centroid.map((c, d) => c + gamma * (xr[d] - c));
      xe = xe.map((v, d) => Math.max(bounds[d][0], Math.min(bounds[d][1], v)));
      let eScore = evaluate(xe);
      simplex[dim] = eScore > rScore ? { position: xe, score: eScore } : { position: xr, score: rScore };
    } else if (rScore > secondWorst.score) {
      // Reflected vertex outperforms second-worst node
      simplex[dim] = { position: xr, score: rScore };
    } else {
      // Contraction Hook (if reflection completely failed)
      let xc = centroid.map((c, d) => c + rho * (worst.position[d] - c));
      xc = xc.map((v, d) => Math.max(bounds[d][0], Math.min(bounds[d][1], v)));
      let cScore = evaluate(xc);
      if (cScore > worst.score) {
        simplex[dim] = { position: xc, score: cScore };
      } else {
        // Complete Simplex Shrinkage towards the primary maximum best point
        for (let i = 1; i <= dim; i++) {
          simplex[i].position = simplex[i].position.map((v, d) => best.position[d] + sigma * (v - best.position[d]));
          simplex[i].position = simplex[i].position.map((v, d) => Math.max(bounds[d][0], Math.min(bounds[d][1], v)));
          simplex[i].score = evaluate(simplex[i].position);
        }
      }
    }
    
    simplex.sort((a, b) => b.score - a.score);
    
    await onProgress({
      step,
      totalSteps: steps,
      bestScore: simplex[0].score,
      bestParams: simplex[0].position,
      simplexVisNodes: simplex.map(s => s.position)
    });
  }

  simplex.sort((a, b) => b.score - a.score);
  return { bestParams: simplex[0].position, bestScore: simplex[0].score };
};
