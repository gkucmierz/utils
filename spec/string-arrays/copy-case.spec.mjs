
import {
  copyCase,
} from '../../main.mjs';

describe('copy-case', () => {
  it('few tests', () => {
    expect(copyCase('styczeń', 'january')).toBe('styczeń');
    expect(copyCase('styczeń', 'January')).toBe('Styczeń');
    expect(copyCase('styczeń', 'JANUARY')).toBe('STYCZEŃ');
  });
});
