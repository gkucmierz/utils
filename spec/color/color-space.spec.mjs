import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  interpolateColor,
  colorStops,
} from '../../main.mjs';

describe('color/color-space', () => {
  it('converts and interpolates across sRGB, linear RGB, and HSL', () => {
    expect(hexToRgb('#0f8')).toEqual({ r: 0, g: 255, b: 136 });
    expect(rgbToHex(hslToRgb(180, 100, 50))).toBe('#00ffff');
    expect(rgbToHsl('#00ffff')).toEqual({ h: 180, s: 100, l: 50 });
    expect(interpolateColor('#000000', '#ffffff', 0.5, 'rgb')).toBe('#808080');
    expect(colorStops('#000000', '#ffffff', 4, 'linear').length).toBe(4);
  });
});
