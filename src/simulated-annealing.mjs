/**
 * Simulated Annealing (Derivative-Free Stochastic Optimization)
 * Maximizes the evaluate function payload.
 * 
 * @param {Function} evaluate - function(paramsArray) => Number (score to maximize)
 * @param {Array<Array<Number>>} bounds - [[min1, max1], [min2, max2], ...] bounds per dimension
 * @param {Object} options - { steps: 100, initialTemp: 100, finalTemp: 0.1, onProgress: async (state) => {} }
 * @returns {Promise<{bestParams: Array<Number>, bestScore: Number}>}
 */
export const simulatedAnnealing = async (evaluate, bounds, options = {}) => {
  const steps = options.steps || 100;
  const initialTemp = options.initialTemp || 100.0;
  const finalTemp = options.finalTemp || 0.1;
  const onProgress = options.onProgress || (async () => {});

  let currentParams = bounds.map(b => (b[0] + b[1]) / 2);
  let currentScore = evaluate(currentParams);
  
  let bestParams = [...currentParams];
  let bestScore = currentScore;

  for (let i = 0; i < steps; i++) {
    let temp = initialTemp * Math.pow((finalTemp / initialTemp), (i / steps));
    let noiseScale = temp / initialTemp; // Gradually reduce the noise field radius
    
    let candidateParams = currentParams.map((p, idx) => {
      let b = bounds[idx];
      let range = b[1] - b[0];
      let nv = p + (Math.random() * 2 - 1) * (range * 0.2) * noiseScale;
      return Math.max(b[0], Math.min(b[1], nv)); // enforce bounds constraint
    });
    
    let candidateScore = evaluate(candidateParams);
    
    // Acceptance criteria (accept worse scores with diminishing probability to escape local maxima)
    if (candidateScore > currentScore || Math.random() < Math.exp((candidateScore - currentScore) / temp)) {
      currentParams = candidateParams;
      currentScore = candidateScore;
      
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestParams = [...currentParams];
      }
    }
    
    await onProgress({
      step: i,
      totalSteps: steps,
      score: currentScore,
      bestScore: bestScore,
      params: currentParams,
      bestParams: bestParams
    });
  }
  
  return { bestParams, bestScore };
};
