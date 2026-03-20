/**
 * Particle Swarm Optimization (PSO)
 * A stochastic, population-based metaheuristic for maximizing complex multidimensional bounds.
 * 
 * @param {Function} evaluate - function(paramsArray) => Number (score to maximize)
 * @param {Array<Array<Number>>} bounds - [[min1, max1], [min2, max2], ...] bounds per dimension
 * @param {Object} options - { particles: 10, steps: 30, w: 0.5, c1: 1.5, c2: 1.5, onProgress: async (state) => {} }
 * @returns {Promise<{bestParams: Array<Number>, bestScore: Number}>}
 */
export const particleSwarmOptimization = async (evaluate, bounds, options = {}) => {
  const numParticles = options.particles || 12;
  const steps = options.steps || 30;
  const w = options.w || 0.5; // Inertia weight
  const c1 = options.c1 || 1.5; // Cognitive (local) best weight
  const c2 = options.c2 || 1.5; // Social (global) best weight
  const onProgress = options.onProgress || (async () => {});

  let swarm = [];
  let globalBestParams = null;
  let globalBestScore = -Infinity;

  // Initialize swarm
  for (let i = 0; i < numParticles; i++) {
    let position = bounds.map(b => b[0] + Math.random() * (b[1] - b[0]));
    let velocity = bounds.map(b => (Math.random() * 2 - 1) * (b[1] - b[0]) * 0.1); // Small initial velocity
    let score = evaluate(position);
    
    let particle = {
      position,
      velocity,
      bestPosition: [...position],
      bestScore: score
    };
    swarm.push(particle);
    
    if (score > globalBestScore) {
      globalBestScore = score;
      globalBestParams = [...position];
    }
  }

  for (let i = 0; i < steps; i++) {
    for (let p of swarm) {
      for (let d = 0; d < bounds.length; d++) {
        let r1 = Math.random();
        let r2 = Math.random();
        
        // Velocity update matrix
        p.velocity[d] = w * p.velocity[d] + 
                        c1 * r1 * (p.bestPosition[d] - p.position[d]) + 
                        c2 * r2 * (globalBestParams[d] - p.position[d]);
        
        // Position update
        p.position[d] = p.position[d] + p.velocity[d];
        
        // Enforce physical parameter bounds
        p.position[d] = Math.max(bounds[d][0], Math.min(bounds[d][1], p.position[d]));
      }
      
      let score = evaluate(p.position);
      
      // Update local cognitive best
      if (score > p.bestScore) {
        p.bestScore = score;
        p.bestPosition = [...p.position];
      }
      // Update social swarm global best
      if (score > globalBestScore) {
        globalBestScore = score;
        globalBestParams = [...p.position];
      }
    }
    
    await onProgress({
      step: i,
      totalSteps: steps,
      bestScore: globalBestScore,
      bestParams: globalBestParams,
      swarm: swarm // Expose for 3D visualizers (Radar scatter generation)
    });
  }

  return { bestParams: globalBestParams, bestScore: globalBestScore };
};
