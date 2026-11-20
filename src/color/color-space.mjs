/**
 * @module color
 */

import { is } from '../developer-utils/type.mjs';

const clampByte = (v) => Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
const clampUnit = (v) => Math.max(0, Math.min(1, Number(v) || 0));

/**
 * Parses a CSS hex color string (`"#rgb"`, `"#rrggbb"`, `"rgb"`, `"rrggbb"`) or `{ r, g, b }` object
 * into normalized 8-bit channels `{ r, g, b }`.
 * @param {string|Object|Array<number>} input - Hex string, `{ r, g, b }` object, or `[r, g, b]` tuple
 * @returns {{ r: number, g: number, b: number }} Clamped RGB channels in `[0, 255]`
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IBYFMAeAVKAlAcwCMEBfBAMxijAQCIABAgawFcBjMEdGALwHpWcEABsAznQDcwYBhz5i0oA|▶ Try it live in Instacode}
 */
export const hexToRgb = (input) => {
  if (Array.isArray(input) && input.length >= 3) {
    return { r: clampByte(input[0]), g: clampByte(input[1]), b: clampByte(input[2]) };
  }
  if (input && is(input, 'object')) {
    return { r: clampByte(input.r), g: clampByte(input.g), b: clampByte(input.b) };
  }
  if (!is(input, 'string')) {
    throw new TypeError('hexToRgb expects a hex string, [r, g, b] array, or { r, g, b } object');
  }
  const clean = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/i.test(clean)) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  throw new RangeError(`Invalid hex color: ${input}`);
};

/**
 * Formats 8-bit RGB channels `(r, g, b)` (or `{ r, g, b }`) as a lowercase `#rrggbb` hex string.
 * @param {number|Object|Array<number>} r - Red channel `[0, 255]` or RGB object/tuple
 * @param {number} [g=0] - Green channel `[0, 255]`
 * @param {number} [b=0] - Blue channel `[0, 255]`
 * @returns {string} Lowercase `#rrggbb` hex color
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JgcwEYBUoAkCmAHggL4IBmMUYCARAAJoDWArgMZgj4wBeA9CzggANgGdaAbmDB02PESlA|▶ Try it live in Instacode}
 */
export const rgbToHex = (r, g = 0, b = 0) => {
  const rgb = is(r, 'number') ? { r: clampByte(r), g: clampByte(g), b: clampByte(b) } : hexToRgb(r);
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

/**
 * Converts 8-bit RGB channels `(r, g, b)` into cylindrical HSL `{ h, s, l }`
 * with `h` in `[0, 360)` and `s, l` in `[0, 100]`.
 * @param {number|Object|Array<number>} r - Red `[0, 255]` or RGB object/tuple
 * @param {number} [g=0] - Green `[0, 255]`
 * @param {number} [b=0] - Blue `[0, 255]`
 * @returns {{ h: number, s: number, l: number }} HSL color coordinates
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JgcwEYBUoAkDOANggL4IBmMUYCARAAJoDWArgMZggCmMAXgPQs4IQvloBuYMHTY8RSUA|▶ Try it live in Instacode}
 */
export const rgbToHsl = (r, g = 0, b = 0) => {
  const rgb = is(r, 'number') ? { r: clampByte(r), g: clampByte(g), b: clampByte(b) } : hexToRgb(r);
  const rn = rgb.r / 255;
  const gn = rgb.g / 255;
  const bn = rgb.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = 0.5 * (max + min);

  let h = 0;
  let s = 0;
  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }
    if (h < 0) h += 360;
  }

  return {
    h: Number(h.toFixed(2)),
    s: Number((s * 100).toFixed(2)),
    l: Number((l * 100).toFixed(2)),
  };
};

/**
 * Converts cylindrical HSL `(h, s, l)` (`h` in degrees, `s, l` in `[0, 100]`) back into 8-bit `{ r, g, b }`.
 * @param {number} h - Hue angle in degrees
 * @param {number} s - Saturation percentage `[0, 100]`
 * @param {number} l - Lightness percentage `[0, 100]`
 * @returns {{ r: number, g: number, b: number }} Clamped 8-bit RGB object
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IBYGcA2AVKAlAcwCMEBfBAMxijAQCIABAgawFcBjMEAUxgC8A9KzghM6OgG5gwDDnzEpQA|▶ Try it live in Instacode}
 */
export const hslToRgb = (h, s, l) => {
  const hue = (((Number(h) || 0) % 360) + 360) % 360;
  const sat = clampUnit((Number(s) || 0) / 100);
  const lig = clampUnit((Number(l) || 0) / 100);

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - 0.5 * c;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: clampByte((r1 + m) * 255),
    g: clampByte((g1 + m) * 255),
    b: clampByte((b1 + m) * 255),
  };
};

const srgbToLinear = (c255) => {
  const v = c255 / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (lin) => {
  const c = clampUnit(lin);
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * (c ** (1 / 2.4)) - 0.055;
  return clampByte(v * 255);
};

/**
 * Interpolates between two colors at ratio `t` in `[0, 1]` using `'rgb'`, `'linear'` (linear-light sRGB),
 * or `'hsl'` (shortest-arc hue) color space, returning a `#rrggbb` hex string.
 * @param {string|Object|Array<number>} colorA - Start color
 * @param {string|Object|Array<number>} colorB - End color
 * @param {number} [t=0.5] - Interpolation factor `[0, 1]`
 * @param {'rgb'|'linear'|'hsl'} [space='rgb'] - Interpolation space
 * @returns {string} Interpolated `#rrggbb` hex color
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4JAOzgUxtANgQywGEpdYEBfBAMxijAQCIABAcwGsBXAYzBGwBeAek5wQuAM6MA3MFAZseQphJkYsoA|▶ Try it live in Instacode}
 */
export const interpolateColor = (colorA, colorB, t = 0.5, space = 'rgb') => {
  const ratio = clampUnit(t);
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);

  if (space === 'hsl') {
    const ha = rgbToHsl(a);
    const hb = rgbToHsl(b);
    let dh = hb.h - ha.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const h = ha.h + dh * ratio;
    const s = ha.s + (hb.s - ha.s) * ratio;
    const l = ha.l + (hb.l - ha.l) * ratio;
    return rgbToHex(hslToRgb(h, s, l));
  }

  if (space === 'linear') {
    return rgbToHex(
      linearToSrgb(srgbToLinear(a.r) + (srgbToLinear(b.r) - srgbToLinear(a.r)) * ratio),
      linearToSrgb(srgbToLinear(a.g) + (srgbToLinear(b.g) - srgbToLinear(a.g)) * ratio),
      linearToSrgb(srgbToLinear(a.b) + (srgbToLinear(b.b) - srgbToLinear(a.b)) * ratio)
    );
  }

  return rgbToHex(
    a.r + (b.r - a.r) * ratio,
    a.g + (b.g - a.g) * ratio,
    a.b + (b.b - a.b) * ratio
  );
};

/**
 * Generates an evenly spaced palette of `steps` hex colors between `colorA` and `colorB`.
 * @param {string|Object|Array<number>} colorA - Start color
 * @param {string|Object|Array<number>} colorB - End color
 * @param {number} [steps=5] - Number of palette stops (`>= 2`)
 * @param {'rgb'|'linear'|'hsl'} [space='rgb'] - Interpolation space
 * @returns {Array<string>} Array of `#rrggbb` stops
 * @see {@link https://instacode.app/run/FASwtgDg9gTgLgAgN4IMZQDawMpyhAZwQF8EAzGKMBAIgAEBzAawFdUwQBTGALwHoWcEBgI0A3MGDosMXPgISgA|▶ Try it live in Instacode}
 */
export const colorStops = (colorA, colorB, steps = 5, space = 'rgb') => {
  const count = Math.max(2, Math.floor(Number(steps) || 5));
  const out = new Array(count);
  for (let i = 0; i < count; i += 1) {
    out[i] = interpolateColor(colorA, colorB, i / (count - 1), space);
  }
  return out;
};
