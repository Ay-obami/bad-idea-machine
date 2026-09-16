import { describe, expect, it } from 'vitest';

import { getEnvironmentArt } from '../environments';
import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import { aftermathKeyForTier, outcomeCardsForMode, outcomeLabelForTier } from './visual-state';

const TIERS: readonly OutcomeTier[] = [0, 1, 2, 3, 4];
const MODES: readonly RiskMode[] = [0, 1, 2];

describe('authored aftermath states', () => {
  it('maps every payout tier to the approved aftermath ladder', () => {
    expect(TIERS.map(aftermathKeyForTier)).toEqual([
      'failure',
      'minor',
      'moderate',
      'severe',
      'legendary',
    ]);
  });

  it('resolves five distinct authored plates in each environment', () => {
    for (const environment of ['kitchen', 'garage'] as const) {
      const art = getEnvironmentArt(environment);
      const paths = TIERS.map(tier => art.aftermaths[aftermathKeyForTier(tier)]);
      expect(new Set(paths).size).toBe(5);
      expect(paths.every(path => path.startsWith(`/rooms/${environment}/aftermath/`))).toBe(true);
    }
  });
});

describe('possible outcome metadata', () => {
  it('uses the real multiplier for each risk mode and tier', () => {
    for (const mode of MODES) {
      const cards = outcomeCardsForMode(mode);
      expect(cards).toHaveLength(5);
      cards.forEach((card, tier) => {
        expect(card.tier).toBe(tier);
        expect(card.multiplierBps).toBe(multiplierBpsForTier(mode, tier as OutcomeTier));
        expect(card.aftermathKey).toBe(aftermathKeyForTier(tier as OutcomeTier));
      });
    }
  });

  it('keeps judge-readable labels aligned with the reference gallery', () => {
    expect(TIERS.map(outcomeLabelForTier)).toEqual([
      'TOTAL FAILURE',
      'MINOR SUCCESS',
      'CONTROLLED CHAOS',
      'MAJOR JACKPOT',
      'LEGENDARY CHAOS',
    ]);
  });
});
