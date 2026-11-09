/**
 * @module developer-utils
 */

/**
 * Builds a 2D occupancy matrix `rows[r][c] = itemIndex` (or `-1` for empty gap)
 * when `spanLastRow` or `colSpans` is enabled.
 *
 * @param {number} totalItems
 * @param {number} cols
 * @param {Object} opts
 * @returns {{ matrix: number[][], itemPos: Array<{ row: number, cols: number[] }> }}
 */
const buildSpannedGridMatrix = (totalItems, cols, opts = {}) => {
  const spanLastRow = Boolean(opts.spanLastRow);
  const colSpans = opts.colSpans || null;
  const matrix = [];
  const itemPos = Array.from({ length: totalItems }, () => ({ row: 0, cols: [] }));

  let curRow = new Array(cols).fill(-1);
  let c = 0;

  for (let i = 0; i < totalItems; i += 1) {
    let span = 1;
    if (colSpans) {
      const rawSpan = Array.isArray(colSpans) ? colSpans[i] : colSpans[i];
      if (Number.isFinite(Number(rawSpan)) && Number(rawSpan) >= 1) {
        span = Math.min(cols, Math.floor(Number(rawSpan)));
      }
    }
    if (c + span > cols) {
      matrix.push(curRow);
      curRow = new Array(cols).fill(-1);
      c = 0;
    }
    if (spanLastRow && i === totalItems - 1 && c < cols) {
      span = cols - c;
    }
    const rowIdx = matrix.length;
    itemPos[i].row = rowIdx;
    for (let k = 0; k < span && c < cols; k += 1) {
      curRow[c] = i;
      itemPos[i].cols.push(c);
      c += 1;
    }
    if (c >= cols) {
      matrix.push(curRow);
      curRow = new Array(cols).fill(-1);
      c = 0;
    }
  }

  if (c > 0) {
    matrix.push(curRow);
  }

  return { matrix, itemPos };
};

/**
 * Resolves the next 0-based index when navigating a 2D grid (matrix) that may contain
 * trailing gaps in its last row (`totalItems` not divisible by `columns`) or spanned cells
 * (`spanLastRow: true` / `colSpans` / `preferredCol`).
 *
 * Pure mathematical/index function — completely independent of the DOM.
 *
 * Wrapping configuration hierarchy:
 * - `wrap` (boolean, default `true`): master default for both axes.
 * - `wrapHoriz` / `wrapHorizontal` (boolean, optional): overrides `wrap` for horizontal movement (`left` / `right`).
 * - `wrapVert` / `wrapVertical` (boolean, optional): overrides `wrap` for vertical movement (`up` / `down`).
 * - `rowStrict` (boolean, default `false`): when `true`, horizontal movement wraps/clamps strictly within the current row instead of reading order.
 * - `spanLastRow` (boolean, default `false`): when `true`, the final item (`totalItems - 1`) spans all remaining columns in the last row (e.g. a 2x3 grid where row 2 has a full-width card `[4, 4]`).
 * - `colSpans` (number[]|Object, optional): explicit column span per item index (`>= 1`).
 * - `preferredCol` (number, optional): preferred column index (`0 <= preferredCol < columns`) preserved when stepping vertically out of a multi-column spanned item.
 *
 * When `columns === 1` (single-column layout), `right` behaves identically to `down`
 * and `left` behaves identically to `up`.
 *
 * @param {number} currentIndex - Current active 0-based index (`0 <= currentIndex < totalItems`).
 * @param {number} totalItems - Total number of items in the grid ($N \ge 0$).
 * @param {'left'|'right'|'up'|'down'|'ArrowLeft'|'ArrowRight'|'ArrowUp'|'ArrowDown'} direction - Movement direction.
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
  const hasSpans = Boolean(opts.spanLastRow || opts.colSpans);

  const row = Math.floor(cur / cols);
  const col = cur % cols;

  let deltaH = 0;
  let deltaV = 0;

  switch (direction) {
  case 'right':
  case 'ArrowRight':
    deltaH = 1;
    break;
  case 'left':
  case 'ArrowLeft':
    deltaH = -1;
    break;
  case 'down':
  case 'ArrowDown':
    deltaV = 1;
    break;
  case 'up':
  case 'ArrowUp':
    deltaV = -1;
    break;
  default:
    return cur;
  }

  // Horizontal movement (left / right)
  if (deltaH !== 0) {
    if (rowStrict) {
      if (hasSpans && cols > 1) {
        const { matrix, itemPos } = buildSpannedGridMatrix(totalItems, cols, opts);
        const curRowIdx = itemPos[cur]?.row ?? 0;
        const rowItems = [];
        for (const cellItem of matrix[curRowIdx] || []) {
          if (cellItem >= 0 && !rowItems.includes(cellItem)) {
            rowItems.push(cellItem);
          }
        }
        const posInRow = rowItems.indexOf(cur);
        if (posInRow < 0 || rowItems.length <= 0) return cur;
        const nextPos = posInRow + deltaH;
        if (nextPos >= 0 && nextPos < rowItems.length) {
          return rowItems[nextPos];
        }
        if (wrapHoriz) {
          return rowItems[((nextPos % rowItems.length) + rowItems.length) % rowItems.length];
        }
        return cur;
      }
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

  // Vertical movement (up / down) when spanned cells are configured
  if (hasSpans && cols > 1) {
    const { matrix, itemPos } = buildSpannedGridMatrix(totalItems, cols, opts);
    const curInfo = itemPos[cur] || { row: 0, cols: [0] };
    const occupiedCols = curInfo.cols.length > 0 ? curInfo.cols : [0];
    let targetCol = occupiedCols[0];
    if (occupiedCols.length > 1 && Number.isFinite(Number(opts.preferredCol))) {
      const pref = Math.max(0, Math.min(cols - 1, Math.floor(Number(opts.preferredCol))));
      if (occupiedCols.includes(pref)) {
        targetCol = pref;
      }
    }

    const validRowsForCol = [];
    for (let r = 0; r < matrix.length; r += 1) {
      if (matrix[r][targetCol] >= 0) {
        validRowsForCol.push(r);
      }
    }
    if (validRowsForCol.length === 0) return cur;

    const curRowPos = validRowsForCol.indexOf(curInfo.row);
    const baseRowPos = curRowPos >= 0 ? curRowPos : 0;
    const nextRowPos = baseRowPos + deltaV;
    if (nextRowPos >= 0 && nextRowPos < validRowsForCol.length) {
      return matrix[validRowsForCol[nextRowPos]][targetCol];
    }
    if (wrapVert) {
      const wrappedPos =
        ((nextRowPos % validRowsForCol.length) + validRowsForCol.length) %
        validRowsForCol.length;
      return matrix[validRowsForCol[wrappedPos]][targetCol];
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
 * Pure higher-order geometric utility that detects the number of columns in the first row
 * of a 2D layout from an iterable of items and a row-offset projector function.
 *
 * Counts how many consecutive leading items share the same row coordinate (`y` / `top`)
 * within the given `tolerance`. Completely independent of the DOM.
 *
 * @param {Iterable<*>} items - Iterable of numbers (row offsets) or arbitrary items.
 * @param {Function|number} [getRowOffset=(x) => x] - Pure projector `(item, index) => number` (or numeric tolerance if 2nd arg is a number).
 * @param {number} [tolerance=0] - Maximum allowed absolute difference between an item's row offset and the first item's offset.
 * @returns {number} Detected number of columns in the first row ($\ge 1$).
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4ICYFM7oMZwOIwioDCUANgK5gB2AzggL4IBmMUYCARAAIDmA1hWxgQ6GAC8A9BTggytTgG5gwDFlwEipSjVrKgA|▶ Try it live in Instacode}
 */
export const detectGridColumns = (items, getRowOffset = (x) => x, tolerance = 0) => {
  if (!items || typeof items[Symbol.iterator] !== 'function') {
    return 1;
  }

  const isFn = typeof getRowOffset === 'function';
  const projector = isFn ? getRowOffset : (x) => x;
  const tol = Math.max(0, Number(isFn ? tolerance : getRowOffset) || 0);

  let firstOffset = null;
  let firstRowCount = 0;
  let idx = 0;

  for (const item of items) {
    const raw = projector(item, idx++);
    const offset = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(offset)) {
      continue;
    }
    if (firstOffset === null) {
      firstOffset = offset;
      firstRowCount = 1;
    } else if (Math.abs(offset - firstOffset) <= tol) {
      firstRowCount += 1;
    } else {
      break;
    }
  }

  return Math.max(1, firstRowCount);
};
