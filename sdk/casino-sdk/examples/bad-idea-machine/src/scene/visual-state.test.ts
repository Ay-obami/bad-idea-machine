import { describe, expect, it } from 'vitest';

import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import { damageStateForTier, outcomeCardsForMode, outcomeLabelForTier } from './visual-state';

const TIERS: readonly OutcomeTier[] = [0, 1, 2, 3, 4];
const MODES: readonly RiskMode[] = [0, 1, 2];

describe('cinematic damage states', () => {
  it('maps every payout tier to a distinct persistent room state', () => {
    const states = TIERS.map(damageStateForTier);
    expect(new Set(states).size).toBe(5);
    expect(states).toEqual(['failure', 'minor', 'controlled', 'major', 'legendary']);
  });

  it('keeps the damage ladder ordered from rubble to legendary destruction', () => {
    expect(damageStateForTier(0)).toBe('failure');
    expect(damageStateForTier(1)).toBe('minor');
    expect(damageStateForTier(2)).toBe('controlled');
    expect(damageStateForTier(3)).toBe('major');
    expect(damageStateForTier(4)).toBe('legendary');
  });
});

describe('possible outcome cards', () => {
  it('uses the real multiplier for each risk mode and tier', () => {
    for (const mode of MODES) {
      const cards = outcomeCardsForMode(mode);
      expect(cards).toHaveLength(5);
      cards.forEach((card, tier) => {
        expect(card.tier).toBe(tier);
        expect(card.multiplierBps).toBe(multiplierBpsForTier(mode, tier as OutcomeTier));
        expect(card.damageState).toBe(damageStateForTier(tier as OutcomeTier));
      });
    }
  });

  it('gives each result tier a judge-readable damage label', () => {
    expect(TIERS.map(outcomeLabelForTier)).toEqual([
      'TOTAL FAILURE',
      'MINOR SUCCESS',
      'CONTROLLED CHAOS',
      'MAJOR PAYOUT',
      'LEGENDARY CHAOS',
    ]);
  });
});
