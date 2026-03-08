import {
  naturalSearch,
} from '../src/natural-search.mjs';

describe('natural-search', () => {
  it('finds correct integer when condition triggers at 10', () => {
    // Condition is true when size >= 10
    const checkFn = (val) => val >= 10;
    
    // Default retFirstTrue = true -> Returns 10 (the first value that made condition true)
    const resultTrue = naturalSearch(checkFn, true);
    expect(resultTrue).toEqual(10);
    
    // retFirstTrue = false -> Returns 9 (the last value BEFORE condition became true)
    const resultFalse = naturalSearch(checkFn, false);
    expect(resultFalse).toEqual(9);
  });

  it('handles condition triggering immediately at 1', () => {
    const checkFn = (val) => val >= 1;
    // With max hitting instantly at 1
    const resultTrue = naturalSearch(checkFn, true);
    expect(resultTrue).toEqual(1);
    
    // The loop min is capped at 1 natively in the provided algo
    const resultFalse = naturalSearch(checkFn, false);
    expect(resultFalse).toEqual(1);
  });

  it('finds large boundary properly efficiently', () => {
    // Large integer limit search, e.g. 50000 
    const target = 50000;
    const checkFn = (val) => val > target; // Condition true at 50001
    
    const maxBound = naturalSearch(checkFn, true);
    expect(maxBound).toEqual(50001);

    const minBound = naturalSearch(checkFn, false);
    expect(minBound).toEqual(50000);
  });
  
  it('correctly scales a mock Canvas boundary limit', () => {
    // Simulating canvas bounding box search
    const widthConstraint = 230;
    
    // Test constraint that evaluates Font Size width scaling linearly
    // Font testSize rendering width (e.g. 10px font * 5 chars = 50px)
    const charCount = 3;
    const isTooBig = (testSize) => (testSize * charCount) > widthConstraint;
    
    // We want the maximum font size BEFORE it breaks the widthConstraint
    // 230 / 3 = 76.666, so size 76 works (228px width), but size 77 fails (231px width).
    const optimalSize = naturalSearch(isTooBig, false);
    
    expect(optimalSize).toEqual(76);
  });
});
