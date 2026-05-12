import {
  createUnlimitedGrid,
  createLangtonsAnt,
} from '../src/langtons-ant.mjs';

describe('Langtons Ant', () => {
  describe('createUnlimitedGrid', () => {
    it('should set and get values with infinite/negative coordinates', () => {
      const grid = createUnlimitedGrid();
      
      expect(grid.get(0, 0)).toEqual(0); // Default is 0
      
      grid.set(0, 0, 1);
      expect(grid.get(0, 0)).toEqual(1);
      
      grid.set(-100, -200, 1);
      expect(grid.get(-100, -200)).toEqual(1);
      expect(grid.get(-100, -201)).toEqual(0);
      
      grid.set(1000000, 5000000, 1);
      expect(grid.get(1000000, 5000000)).toEqual(1);
    });
  });

  describe('createLangtonsAnt', () => {
    it('should follow basic Langton rules starting from an empty grid', () => {
      const grid = createUnlimitedGrid();
      // Start at 0,0 facing TOP (0)
      const ant = createLangtonsAnt(grid, 0, 0, 0);
      
      // Step 1: at (0,0) color is 0. 
      // Turns Right to 1 (RIGHT), flips color to 1, moves to (1,0).
      let res = ant.step();
      expect(res).toEqual({ x: 0, y: 0, state: 1 });
      expect(grid.get(0, 0)).toEqual(1);
      
      // Step 2: at (1,0) color is 0.
      // Turns Right to 2 (BOT), flips color to 1, moves to (1,1).
      res = ant.step();
      expect(res).toEqual({ x: 1, y: 0, state: 1 });
      expect(grid.get(1, 0)).toEqual(1);
      
      // Step 3: at (1,1) color is 0.
      // Turns Right to 3 (LEFT), flips color to 1, moves to (0,1).
      res = ant.step();
      expect(res).toEqual({ x: 1, y: 1, state: 1 });
      expect(grid.get(1, 1)).toEqual(1);
      
      // Step 4: at (0,1) color is 0.
      // Turns Right to 0 (TOP), flips color to 1, moves to (0,0).
      res = ant.step();
      expect(res).toEqual({ x: 0, y: 1, state: 1 });
      expect(grid.get(0, 1)).toEqual(1);
      
      // Step 5: at (0,0) color is 1 (flipped in step 1).
      // Turns Left to 3 (LEFT), flips color to 0, moves to (-1,0).
      res = ant.step();
      expect(res).toEqual({ x: 0, y: 0, state: 0 });
      expect(grid.get(0, 0)).toEqual(0);
      expect(grid.get(-1, 0)).toEqual(0); // Check that it actually moved to (-1, 0) next
    });
  });
});
