import { describe, expect, it } from 'vitest';

import { getOutcomePresentation, getScenePlate, OUTCOME_PRESENTATIONS } from './presentation';

const ENVIRONMENTS = ['kitchen', 'garage'] as const;
const TIERS = [0, 1, 2, 3, 4] as const;

describe('cinematic scene presentation', () => {
  it('provides photographic idle and chaos plates for both rooms', () => {
    for (const environment of ENVIRONMENTS) {
      expect(getScenePlate(environment, 'idle')).toContain(`/scenes/${environment}-idle.jpg`);
      expect(getScenePlate(environment, 'revealing')).toContain(`/scenes/${environment}-chaos.jpg`);
    }
  });

  it('maps every payout tier to a distinct damaged room plate', () => {
    for (const environment of ENVIRONMENTS) {
      const resultPlates = TIERS.map(tier => getScenePlate(environment, 'result', tier));
      expect(new Set(resultPlates).size).toBe(5);
      for (const [tier, plate] of resultPlates.entries()) {
        expect(plate).toContain(`/scenes/${environment}-result-${tier}.jpg`);
      }
    }
  });

  it('describes five escalating outcome states without depending on risk mode', () => {
    expect(OUTCOME_PRESENTATIONS).toHaveLength(5);
    expect(OUTCOME_PRESENTATIONS.map(item => item.tier)).toEqual(TIERS);
    expect(OUTCOME_PRESENTATIONS.map(item => item.damageLevel)).toEqual([1, 2, 3, 4, 5]);
    expect(getOutcomePresentation(0).title).toBe('TOTAL FAILURE');
    expect(getOutcomePresentation(4).title).toBe('LEGENDARY CHAOS');
  });
});
