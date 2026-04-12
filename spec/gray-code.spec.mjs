import { bin2gray, gray2bin } from '../src/gray-code.mjs';

describe('grayCode', () => {
  it('should safely encode to Gray code and decode back to source Binary', () => {
    const binary = [1, 0, 1, 0, 1, 1];
    const encoded = bin2gray(binary);
    // Gray is shifted, so it shouldn't mathematically equate the layout
    expect(encoded).not.toEqual(binary);
    
    const decoded = gray2bin(encoded);
    expect(decoded).toEqual(binary);
  });

  it('should not mutate original input arrays natively via reference', () => {
    const binary = [1, 1, 0, 0];
    const enc = bin2gray(binary);
    expect(binary).toEqual([1, 1, 0, 0]); // Should be pristine after Pure invocation!
  });
});
