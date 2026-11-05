import {
  QUORUM_DEFAULT_K,
  QUORUM_DEFAULT_N,
  QUORUM_MAX_RELATIVE_ERROR,
  QUORUM_MAX_RELATIVE_ERROR_PCT,
  QUORUM_CONFIG,
  computeRelativeError,
  isQuorumEqual,
  evaluateQuorum,
  evaluateQuorum4of5
} from '../../main.mjs';

describe('quorum (K-of-N consensus with 0.01% max relative error)', () => {
  it('exposes canonical 4-of-5 and 0.01% (0.0001) constants', () => {
    expect(QUORUM_DEFAULT_K).toBe(4);
    expect(QUORUM_DEFAULT_N).toBe(5);
    expect(QUORUM_MAX_RELATIVE_ERROR).toBe(0.0001);
    expect(QUORUM_MAX_RELATIVE_ERROR_PCT).toBe(0.01);
    expect(QUORUM_CONFIG.DEFAULT_K).toBe(4);
    expect(QUORUM_CONFIG.DEFAULT_N).toBe(5);
    expect(QUORUM_CONFIG.MAX_RELATIVE_ERROR).toBe(0.0001);
  });

  it('computes symmetric relative error and enforces 0.01% equality boundary', () => {
    expect(computeRelativeError(100, 100)).toBe(0);
    expect(computeRelativeError(0, 0)).toBe(0);
    expect(isQuorumEqual(100, 100.009)).toBe(true);
    expect(isQuorumEqual(100, 100.01)).toBe(true);
    expect(isQuorumEqual(100, 100.015)).toBe(false);
    expect(isQuorumEqual([-6.8, 43.0], [-6.8004, 43.002])).toBe(true);
    expect(isQuorumEqual([-6.8, 43.0], [-7.5, 43.0])).toBe(false);
  });

  it('returns success=true iff at least 4 of 5 datapoints are mutually equal within 0.01%', () => {
    // 4 sources agree on -6.8000 deg (within 0.01%), 1 outlier has -7.5000 deg
    const samples = [
      { source: 'IANA_TZDB', value: -6.8000 },
      { source: 'SIROKY_OSM', value: -6.8004 },
      { source: 'NATURAL_EARTH', value: -6.7998 },
      { source: 'USNO_CIA', value: -6.8002 },
      { source: 'LEGACY_OUTLIER', value: -7.5000 }
    ];

    const res = evaluateQuorum4of5(samples);
    expect(res.success).toBe(true);
    expect(res.quorumReached).toBe(true);
    expect(res.status).toBe('OK_QUORUM');
    expect(res.agreeingCount).toBe(4);
    expect(res.requiredK).toBe(4);
    expect(res.expectedN).toBe(5);
    expect(res.consensusValue).toBeCloseTo(-6.8001, 5);
    expect(res.maxRelativeError).toBeLessThanOrEqual(0.0001);
    expect(res.outliers.length).toBe(1);
    expect(res.outliers[0].source).toBe('LEGACY_OUTLIER');
  });

  it('returns success=true with OK_UNANIMOUS when all 5 of 5 datapoints agree within 0.01%', () => {
    const res = evaluateQuorum4of5([-18.0000, -18.0005, -17.9995, -18.0002, -17.9998]);
    expect(res.success).toBe(true);
    expect(res.status).toBe('OK_UNANIMOUS');
    expect(res.agreeingCount).toBe(5);
    expect(res.outliers.length).toBe(0);
    expect(res.consensusValue).toBeCloseTo(-18.0, 4);
  });

  it('returns success=false when only 3 of 5 datapoints agree within 0.01%', () => {
    const res = evaluateQuorum4of5([10.0000, 10.0005, 10.0002, 12.5000, 14.2000]);
    expect(res.success).toBe(false);
    expect(res.quorumReached).toBe(false);
    expect(res.status).toBe('REJECTED_NO_QUORUM');
    expect(res.agreeingCount).toBe(3);
    expect(res.consensusValue).toBeNull();
  });

  it('prevents transitive chain drift: rejects 4 points if outer pair exceeds 0.01%', () => {
    // Adjacent step is 0.006% (< 0.01%), but span from first to fourth is 0.018% (> 0.01%)
    const chain = [100.000, 100.006, 100.012, 100.018, 200.000];
    const res = evaluateQuorum4of5(chain);
    expect(res.success).toBe(false);
    expect(res.agreeingCount).toBe(2);
  });
});
