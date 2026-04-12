import { nChooseK } from '../src/n-choose-k.mjs';

describe('nChooseK', () => {
  it('should efficiently compute massive Lotto-sized combinations', () => {
    // 49 choose 6 -> 13983816
    expect(nChooseK(49, 6)).toEqual(13983816n);
  });
  
  it('should format gracefully using string injections parsing into BigInt', () => {
    expect(nChooseK('10', '2')).toEqual(45n);
  });
  
  it('should gracefully return zero on mathematical violations', () => {
    expect(nChooseK(10, 15)).toEqual(0n);
  });
  
  it('should handle boundaries properly with zero division risks', () => {
    expect(nChooseK(20, 20)).toEqual(1n);
    expect(nChooseK(20, 0)).toEqual(1n);
  });
});
