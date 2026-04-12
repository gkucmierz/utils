import { permutations, permutationsIterator } from '../src/permutations.mjs';

describe('permutations', () => {
  it('should generate all permutations from array input', () => {
    const arr = ['A', 'B', 'C'];
    const perms = permutations(arr);
    // 3! = 6
    expect(perms.length).toEqual(6);
    expect(perms).toContain(['A', 'B', 'C']);
    expect(perms).toContain(['C', 'B', 'A']);
  });
  
  it('should generate generic index permutations from numeric limit', () => {
    const perms = permutations(3);
    expect(perms.length).toEqual(6);
    expect(perms[0]).toEqual([0, 1, 2]);
  });

  it('should handle single object logic', () => {
    expect(permutations(['LENS']).length).toEqual(1);
    expect(permutations(1).length).toEqual(1);
  });
});
