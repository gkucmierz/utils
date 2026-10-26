import { navigateGrid, detectGridColumns } from '../../main.mjs';

describe('grid-navigation', () => {
  describe('navigateGrid — 2D matrix with trailing gaps (3 columns, 4 items)', () => {
    /**
     * Grid layout (3 columns, 4 items):
     * Row 0: [0 (pos 1)] [1 (pos 2)] [2 (pos 3)]
     * Row 1: [3 (pos 4)] [   gap   ] [   gap   ]
     */
    const total = 4;
    const cols = 3;

    it('wraps vertically within column 0: position 4 (index 3) + down -> position 1 (index 0)', () => {
      expect(navigateGrid(3, total, 'down', cols)).toBe(0);
      expect(navigateGrid(3, total, 'ArrowDown', cols)).toBe(0);
    });

    it('moves vertically within column 0: position 1 (index 0) + down -> position 4 (index 3)', () => {
      expect(navigateGrid(0, total, 'down', cols)).toBe(3);
      expect(navigateGrid(0, total, 'up', cols)).toBe(3);
      expect(navigateGrid(3, total, 'up', cols)).toBe(0);
    });

    it('wraps single-item columns (col 1 and col 2) back to themselves on vertical movement', () => {
      expect(navigateGrid(1, total, 'down', cols)).toBe(1);
      expect(navigateGrid(1, total, 'up', cols)).toBe(1);
      expect(navigateGrid(2, total, 'down', cols)).toBe(2);
      expect(navigateGrid(2, total, 'up', cols)).toBe(2);
    });

    it('wraps horizontally in reading order by default', () => {
      expect(navigateGrid(0, total, 'right', cols)).toBe(1);
      expect(navigateGrid(2, total, 'right', cols)).toBe(3);
      expect(navigateGrid(3, total, 'right', cols)).toBe(0);
      expect(navigateGrid(0, total, 'left', cols)).toBe(3);
    });
  });

  describe('navigateGrid — wrap, wrapHoriz/wrapHorizontal, wrapVert/wrapVertical options', () => {
    // 3x2 + 2 items = 8 items in 3 columns:
    // Row 0: 0, 1, 2
    // Row 1: 3, 4, 5
    // Row 2: 6, 7, _
    const total = 8;
    const cols = 3;

    it('wraps both axes when wrap: true (default)', () => {
      expect(navigateGrid(7, total, 'right', cols)).toBe(0);
      expect(navigateGrid(0, total, 'left', cols)).toBe(7);
      expect(navigateGrid(6, total, 'down', cols)).toBe(0);
      expect(navigateGrid(5, total, 'down', cols)).toBe(2);
      expect(navigateGrid(2, total, 'up', cols)).toBe(5);
    });

    it('disables wrapping on both axes when wrap: false', () => {
      expect(navigateGrid(7, total, 'right', cols, { wrap: false })).toBe(7);
      expect(navigateGrid(0, total, 'left', cols, { wrap: false })).toBe(0);
      expect(navigateGrid(6, total, 'down', cols, { wrap: false })).toBe(6);
      expect(navigateGrid(5, total, 'down', cols, { wrap: false })).toBe(5);
      expect(navigateGrid(2, total, 'up', cols, { wrap: false })).toBe(2);
      expect(navigateGrid(2, total, 'down', cols, { wrap: false })).toBe(5);
    });

    it('supports wrap: true with wrapHoriz: false (wraps vertically only)', () => {
      const opts = { wrap: true, wrapHoriz: false };
      expect(navigateGrid(6, total, 'down', cols, opts)).toBe(0);
      expect(navigateGrid(5, total, 'down', cols, opts)).toBe(2);
      expect(navigateGrid(7, total, 'right', cols, opts)).toBe(7);
      expect(navigateGrid(0, total, 'left', cols, opts)).toBe(0);
    });

    it('supports wrapHorizontal / wrapVertical long option names and options object as 4th arg', () => {
      expect(
        navigateGrid(3, 4, 'down', {
          columns: 3,
          wrapHorizontal: false,
          wrapVertical: true
        })
      ).toBe(0);

      expect(
        navigateGrid(3, 4, 'down', {
          columns: 3,
          wrap: true,
          wrapVertical: false
        })
      ).toBe(3);
    });

    it('supports rowStrict mode for horizontal movement', () => {
      expect(navigateGrid(2, total, 'right', cols, { rowStrict: true, wrap: true })).toBe(0);
      expect(navigateGrid(0, total, 'left', cols, { rowStrict: true, wrap: true })).toBe(2);
      expect(navigateGrid(7, total, 'right', cols, { rowStrict: true, wrap: true })).toBe(6);
      expect(navigateGrid(7, total, 'right', cols, { rowStrict: true, wrap: false })).toBe(7);
    });

    it('treats right as down and left as up on a 1-column layout', () => {
      expect(navigateGrid(0, 4, 'right', 1)).toBe(1);
      expect(navigateGrid(0, 4, 'down', 1)).toBe(1);
      expect(navigateGrid(0, 4, 'left', 1)).toBe(3);
      expect(navigateGrid(0, 4, 'up', 1)).toBe(3);
    });

    it('handles empty grids and out-of-range currentIndex safely', () => {
      expect(navigateGrid(0, 0, 'down', 3)).toBe(-1);
      expect(navigateGrid(-1, 4, 'right', 3)).toBe(1);
      expect(navigateGrid(1, 4, 'UnknownKey', 3)).toBe(1);
    });
  });

  describe('detectGridColumns — pure higher-order row-offset clustering', () => {
    it('detects column count from a flat array of numeric row offsets', () => {
      expect(detectGridColumns([100, 100, 100, 240, 240])).toBe(3);
      expect(detectGridColumns([50, 50, 180, 180])).toBe(2);
      expect(detectGridColumns([10, 120, 230])).toBe(1);
    });

    it('accepts a pure projector function (item, index) => number and tolerance', () => {
      const points = [
        { id: 'a', y: 100.0 },
        { id: 'b', y: 100.4 },
        { id: 'c', y: 99.7 },
        { id: 'd', y: 220.0 }
      ];
      expect(detectGridColumns(points, (p) => p.y, 1)).toBe(3);
      expect(detectGridColumns(points, (p) => p.y, 0)).toBe(1);
    });

    it('supports numeric tolerance as 2nd argument when items are already numbers', () => {
      expect(detectGridColumns([100, 104, 98, 250], 6)).toBe(3);
    });

    it('works with arbitrary ES Iterables (generators / Sets) and handles empty inputs', () => {
      function* genOffsets() {
        yield 20;
        yield 20;
        yield 20;
        yield 20;
        yield 90;
      }
      expect(detectGridColumns(genOffsets())).toBe(4);
      expect(detectGridColumns([])).toBe(1);
      expect(detectGridColumns(null)).toBe(1);
    });
  });
});
