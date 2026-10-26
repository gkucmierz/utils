/**
 * @module developer-utils
 */

/**
 * Resolves the next 0-based index when navigating a 2D grid (matrix) that may contain
 * trailing gaps in its last row (`totalItems` not divisible by `columns`).
 *
 * Wrapping configuration hierarchy:
 * - `wrap` (boolean, default `true`): master default for both axes.
 * - `wrapHoriz` / `wrapHorizontal` (boolean, optional): overrides `wrap` for horizontal movement (`left` / `right`).
 * - `wrapVert` / `wrapVertical` (boolean, optional): overrides `wrap` for vertical movement (`up` / `down`).
 * - `rowStrict` (boolean, default `false`): when `true`, horizontal movement wraps/clamps strictly within the current row instead of reading order.
 *
 * When `columns === 1` (single-column mobile layout), `right` behaves identically to `down`
 * and `left` behaves identically to `up`.
 *
 * @param {number} currentIndex - Current active 0-based index (`0 <= currentIndex < totalItems`).
 * @param {number} totalItems - Total number of items in the grid ($N \ge 0$).
 * @param {'ArrowLeft'|'ArrowRight'|'ArrowUp'|'ArrowDown'|'left'|'right'|'up'|'down'} direction - Movement direction.
 * @param {number|Object} [columnsOrOptions=1] - Column count ($C \ge 1$) or options object.
 * @param {Object} [maybeOptions={}] - Optional configuration when 4th argument is a column count.
 * @returns {number} Next 0-based index, or `-1` if `totalItems <= 0`.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IHYEMBuIDm64CmA4jCACYIC+CAZjFGAgEQACOA1gK4DGYIBMAF4B6TnBAAbAM5MA3MGAZseQiXLygA|▶ Try it live in Instacode}
 */
export const navigateGrid = (
  currentIndex,
  totalItems,
  direction,
  columnsOrOptions = 1,
  maybeOptions = {}
) => {
  if (!Number.isFinite(totalItems) || totalItems <= 0) {
    return -1;
  }

  const isObj = columnsOrOptions !== null && typeof columnsOrOptions === 'object';
  const opts = isObj ? columnsOrOptions : (maybeOptions || {});
  const rawCols = isObj ? opts.columns : columnsOrOptions;
  const cols = Math.max(1, Math.floor(Number(rawCols) || 1));

  const cur =
    Number.isFinite(currentIndex) && currentIndex >= 0 && currentIndex < totalItems
      ? Math.floor(currentIndex)
      : 0;

  const baseWrap = typeof opts.wrap === 'boolean' ? opts.wrap : true;
  const wrapHoriz =
    typeof opts.wrapHorizontal === 'boolean'
      ? opts.wrapHorizontal
      : typeof opts.wrapHoriz === 'boolean'
        ? opts.wrapHoriz
        : baseWrap;
  const wrapVert =
    typeof opts.wrapVertical === 'boolean'
      ? opts.wrapVertical
      : typeof opts.wrapVert === 'boolean'
        ? opts.wrapVert
        : baseWrap;
  const rowStrict = Boolean(opts.rowStrict);

  const row = Math.floor(cur / cols);
  const col = cur % cols;

  let deltaH = 0;
  let deltaV = 0;

  switch (direction) {
  case 'ArrowRight':
  case 'right':
    deltaH = 1;
    break;
  case 'ArrowLeft':
  case 'left':
    deltaH = -1;
    break;
  case 'ArrowDown':
  case 'down':
    deltaV = 1;
    break;
  case 'ArrowUp':
  case 'up':
    deltaV = -1;
    break;
  default:
    return cur;
  }

  // Horizontal movement (left / right)
  if (deltaH !== 0) {
    if (rowStrict) {
      const rowStart = row * cols;
      const rowLen = Math.min(cols, totalItems - rowStart);
      if (rowLen <= 0) return cur;
      const nextCol = col + deltaH;
      if (nextCol >= 0 && nextCol < rowLen) {
        return rowStart + nextCol;
      }
      if (wrapHoriz) {
        return rowStart + (((nextCol % rowLen) + rowLen) % rowLen);
      }
      return cur;
    }

    const nextIdx = cur + deltaH;
    if (nextIdx >= 0 && nextIdx < totalItems) {
      return nextIdx;
    }
    if (wrapHoriz) {
      return ((nextIdx % totalItems) + totalItems) % totalItems;
    }
    return cur;
  }

  // Vertical movement (up / down) along column `col` (handling incomplete last row gaps)
  const colRows = col < totalItems ? Math.floor((totalItems - 1 - col) / cols) + 1 : 0;
  if (colRows <= 0) return cur;

  const nextRow = row + deltaV;
  if (nextRow >= 0 && nextRow < colRows) {
    return nextRow * cols + col;
  }
  if (wrapVert) {
    const wrappedRow = ((nextRow % colRows) + colRows) % colRows;
    return wrappedRow * cols + col;
  }
  return cur;
};

/**
 * Alias for `navigateGrid` for backwards compatibility.
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZUgVzgUwMICeqANiKgOIwgAmAkgHbU4AeCAvggGYwYIBEAAQDmAa0yowIHDABeAemwhiAZz4BuYMHRZchEmUo0GTZhqA|▶ Try it live in Instacode}
 */
export const computeCyclicGridIndex = navigateGrid;

/**
 * Detects the live number of rendered columns in a CSS Grid / Flex container
 * by inspecting the bounding rectangles (`getBoundingClientRect()`) of its visible children,
 * falling back to `getComputedStyle(gridEl).gridTemplateColumns`.
 *
 * @param {HTMLElement|null} gridEl - Grid container element.
 * @param {string} [itemSelector='.ext-card'] - Selector for grid items (falls back to direct `children`).
 * @returns {number} Detected column count ($\ge 1$).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYFM7oMZwEroB2GM6qA4jCKgMJQA2ArmIQM4IC+CAZjFGAgBEAAQDmAa0bYwIdDABeAekZwQ9VoIDcwYBiy4CxOWUrU6TFq21A|▶ Try it live in Instacode}
 */
export const detectRenderedGridColumns = (gridEl, itemSelector = '.ext-card') => {
  if (!gridEl) {
    return 1;
  }

  let items = [];
  if (typeof gridEl.querySelectorAll === 'function' && itemSelector) {
    items = Array.from(gridEl.querySelectorAll(itemSelector));
  }
  if (items.length === 0 && gridEl.children) {
    items = Array.from(gridEl.children);
  }

  items = items.filter((el) =>
    typeof el.checkVisibility === 'function' ? el.checkVisibility() : true
  );

  if (items.length >= 2 && typeof items[0].getBoundingClientRect === 'function') {
    const firstTop = items[0].getBoundingClientRect().top;
    let firstRowCount = 0;
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (Math.abs(rect.top - firstTop) <= 10) {
        firstRowCount += 1;
      } else {
        break;
      }
    }
    if (firstRowCount >= 1) {
      return firstRowCount;
    }
  }

  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const template = window.getComputedStyle(gridEl).gridTemplateColumns || '';
    const tracks = template
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (tracks.length >= 1) {
      return tracks.length;
    }
  }

  return 1;
};
