import { arrayHistogram } from '../src/array-histogram.mjs';

describe('arrayHistogram', () => {
  it('should generate quantitative groupings based on exact identity', () => {
    const res = arrayHistogram(['A', 'B', 'A']);
    expect(res.size).toEqual(2);
    expect(res.get('A')).toEqual(2);
    expect(res.get('B')).toEqual(1);
    expect(res.get('C')).toBeUndefined();
  });
  
  it('should support dynamic extraction via custom callback picks', () => {
    const registry = [
      { id: 1, type: 'FIRE' },
      { id: 2, type: 'WATER' },
      { id: 3, type: 'FIRE' }
    ];
    
    // Pick via anonymous function explicitly resolving deep structure
    const histo = arrayHistogram(registry, el => el.type);
    
    expect(histo.get('FIRE')).toEqual(2);
    expect(histo.get('WATER')).toEqual(1);
  });
});
