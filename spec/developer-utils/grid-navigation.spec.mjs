import {
  navigateGrid,
  computeCyclicGridIndex,
  detectRenderedGridColumns
} from '../../src/developer-utils/grid-navigation.mjs';

describe('grid-navigation (navigateGrid & detectRenderedGridColumns)', () => {
  it('navigates a 4-item, 3-column jagged grid so Down from item 4 (idx 3) wraps to item 1 (idx 0)', () => {
    // Grid layout (N=4, C=3):
    // Row 0: [ 0 (pos 1), 1 (pos 2), 2 (pos 3) ]
    // Row 1: [ 3 (pos 4),   gap   ,   gap    ]
    expect(navigateGrid(0, 4, 'ArrowDown', 3)).toBe(3); // pos 1 -> pos 4
    expect(navigateGrid(3, 4, 'ArrowDown', 3)).toBe(0); // pos 4 -> pos 1 (vertical wrap in col 0!)
    expect(navigateGrid(3, 4, 'ArrowUp', 3)).toBe(0);   // pos 4 -> pos 1
    expect(navigateGrid(0, 4, 'ArrowUp', 3)).toBe(3);   // pos 1 -> pos 4 (vertical wrap in col 0!)

    // Columns 1 and 2 have only 1 row (gap in row 1)
    expect(navigateGrid(1, 4, 'ArrowDown', 3)).toBe(1);
    expect(navigateGrid(2, 4, 'ArrowDown', 3)).toBe(2);

    // Horizontal stream navigation with default wrap=true
    expect(navigateGrid(0, 4, 'ArrowRight', 3)).toBe(1);
    expect(navigateGrid(2, 4, 'ArrowRight', 3)).toBe(3);
    expect(navigateGrid(3, 4, 'ArrowRight', 3)).toBe(0);
    expect(navigateGrid(0, 4, 'ArrowLeft', 3)).toBe(3);
  });

  it('handles multi-row jagged grids with gaps in the last row (N=8, C=3)', () => {
    // Row 0: [ 0, 1, 2 ]
    // Row 1: [ 3, 4, 5 ]
    // Row 2: [ 6, 7, - ] (gap at row 2, col 2)
    // Column 0: 0 -> 3 -> 6 -> 0
    expect(navigateGrid(0, 8, 'down', 3)).toBe(3);
    expect(navigateGrid(3, 8, 'down', 3)).toBe(6);
    expect(navigateGrid(6, 8, 'down', 3)).toBe(0);
    expect(navigateGrid(0, 8, 'up', 3)).toBe(6);

    // Column 1: 1 -> 4 -> 7 -> 1
    expect(navigateGrid(1, 8, 'down', 3)).toBe(4);
    expect(navigateGrid(4, 8, 'down', 3)).toBe(7);
    expect(navigateGrid(7, 8, 'down', 3)).toBe(1);

    // Column 2 (only 2 rows: 2 and 5): 2 -> 5 -> 2
    expect(navigateGrid(2, 8, 'down', 3)).toBe(5);
    expect(navigateGrid(5, 8, 'down', 3)).toBe(2);
    expect(navigateGrid(2, 8, 'up', 3)).toBe(5);
  });

  it('supports wrap: false to disable wrapping on both axes', () => {
    const opts = { columns: 3, wrap: false };
    expect(navigateGrid(0, 4, 'left', opts)).toBe(0);
    expect(navigateGrid(3, 4, 'right', opts)).toBe(3);
    expect(navigateGrid(0, 4, 'up', opts)).toBe(0);
    expect(navigateGrid(0, 4, 'down', opts)).toBe(3);
    expect(navigateGrid(3, 4, 'down', opts)).toBe(3); // clamped at bottom of col 0
    expect(navigateGrid(5, 8, 'down', opts)).toBe(5); // clamped above gap at (2, 2)
  });

  it('supports granular wrapHoriz/wrapHorizontal and wrapVert/wrapVertical overrides', () => {
    // Default wrap=true, but disable horizontal wrapping (wrapHoriz: false)
    const vertOnly = { columns: 3, wrapHoriz: false };
    expect(navigateGrid(3, 4, 'down', vertOnly)).toBe(0);  // vertical still wraps!
    expect(navigateGrid(0, 4, 'up', vertOnly)).toBe(3);    // vertical still wraps!
    expect(navigateGrid(3, 4, 'right', vertOnly)).toBe(3); // horizontal clamped!
    expect(navigateGrid(0, 4, 'left', vertOnly)).toBe(0);  // horizontal clamped!

    // Default wrap=true, but disable vertical wrapping (wrapVertical: false)
    const horizOnly = { columns: 3, wrapVertical: false };
    expect(navigateGrid(3, 4, 'right', horizOnly)).toBe(0); // horizontal still wraps!
    expect(navigateGrid(0, 4, 'left', horizOnly)).toBe(3);  // horizontal still wraps!
    expect(navigateGrid(3, 4, 'down', horizOnly)).toBe(3);  // vertical clamped!
    expect(navigateGrid(0, 4, 'up', horizOnly)).toBe(0);    // vertical clamped!

    // Master wrap=false, but explicitly enable wrapVert: true
    const explicitVert = { columns: 3, wrap: false, wrapVert: true };
    expect(navigateGrid(3, 4, 'down', explicitVert)).toBe(0);
    expect(navigateGrid(3, 4, 'right', explicitVert)).toBe(3);
  });

  it('supports rowStrict mode for within-row horizontal wrapping and clamping', () => {
    expect(navigateGrid(2, 4, 'right', { columns: 3, rowStrict: true, wrap: true })).toBe(0);
    expect(navigateGrid(0, 4, 'left', { columns: 3, rowStrict: true, wrap: true })).toBe(2);
    expect(navigateGrid(2, 4, 'right', { columns: 3, rowStrict: true, wrapHoriz: false })).toBe(2);
  });

  it('makes right === down and left === up when columns === 1 (mobile single-column)', () => {
    for (let i = 0; i < 4; i++) {
      expect(navigateGrid(i, 4, 'ArrowDown', 1)).toBe(navigateGrid(i, 4, 'ArrowRight', 1));
      expect(navigateGrid(i, 4, 'ArrowUp', 1)).toBe(navigateGrid(i, 4, 'ArrowLeft', 1));
      expect(navigateGrid(i, 4, 'ArrowDown', { columns: 1, wrap: false })).toBe(
        navigateGrid(i, 4, 'ArrowRight', { columns: 1, wrap: false })
      );
    }
    expect(computeCyclicGridIndex(3, 4, 'ArrowDown', 3)).toBe(0);
  });

  it('detects rendered grid column count from bounding rectangles', () => {
    const desktopGrid = {
      querySelectorAll: () => [
        { getBoundingClientRect: () => ({ top: 100 }) },
        { getBoundingClientRect: () => ({ top: 100 }) },
        { getBoundingClientRect: () => ({ top: 100 }) },
        { getBoundingClientRect: () => ({ top: 320 }) }
      ]
    };
    expect(detectRenderedGridColumns(desktopGrid)).toBe(3);

    const mobileGrid = {
      querySelectorAll: () => [
        { getBoundingClientRect: () => ({ top: 100 }) },
        { getBoundingClientRect: () => ({ top: 280 }) },
        { getBoundingClientRect: () => ({ top: 460 }) }
      ]
    };
    expect(detectRenderedGridColumns(mobileGrid)).toBe(1);
  });
});
