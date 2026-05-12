/**
 * Creates an unlimited, dynamically expanding 2D grid using nested Maps.
 * Ideal for sparse matrices or algorithms operating on an infinite plane (e.g., Langton's Ant, Game of Life).
 * 
 * @returns {Object} An object containing `get(x, y)` and `set(x, y, val)` methods.
 */
export const createUnlimitedGrid = () => {
  const grid = new Map();

  const getRow = y => {
    let row;
    if (!(row = grid.get(y))) {
      row = new Map();
      grid.set(y, row);
    }
    return row;
  };
  
  const set = (x, y, val) => {
    const row = getRow(y);
    row.set(x, val);
  };
  
  const get = (x, y) => {
    const row = getRow(y);
    return row.get(x) || 0;
  };
  
  return { set, get };
};

/**
 * Initializes a Langton's Ant automaton on a given grid.
 * The ant follows standard rules: turns right on 0, turns left on 1, and flips the cell state.
 * 
 * @param {Object} grid - The grid interface containing `get(x, y)` and `set(x, y, val)` methods.
 * @param {number} startX - The initial X coordinate of the ant.
 * @param {number} startY - The initial Y coordinate of the ant.
 * @param {number} [initialDir=-1] - The initial direction (0: TOP, 1: RIGHT, 2: BOTTOM, 3: LEFT). If -1, a random direction is chosen.
 * @returns {Object} An object containing a `step()` method which advances the simulation by one tick and returns `{x, y, state}` of the modified cell.
 */
export const createLangtonsAnt = (grid, startX, startY, initialDir = -1) => {
  const [X, Y] = [0, 1];
  const [TOP, RIGHT, BOT, LEFT] = [0, 1, 2, 3];
  const coordMap = new Map([
    [TOP,   [ 0,-1]],
    [RIGHT, [ 1, 0]],
    [BOT,   [ 0, 1]],
    [LEFT,  [-1, 0]],
  ]);
  
  let dir = initialDir !== -1 ? initialDir : Math.floor(Math.random() * 4);
  const pos = [startX, startY];
  
  const step = () => {
    const currentState = grid.get(pos[X], pos[Y]);
    const nextState = currentState === 0 ? 1 : 0;
    
    grid.set(pos[X], pos[Y], nextState);
    
    if (currentState === 0) {
      dir = (dir + 1) % 4; // Turn Right
    } else {
      dir = (dir + 3) % 4; // Turn Left
    }
    
    const move = coordMap.get(dir);
    pos[X] += move[X];
    pos[Y] += move[Y];
    
    return {
      x: pos[X] - move[X],
      y: pos[Y] - move[Y],
      state: nextState
    };
  };
  
  return { step };
};
