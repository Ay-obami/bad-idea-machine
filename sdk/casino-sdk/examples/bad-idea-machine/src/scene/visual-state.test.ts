import { describe, expect, it } from 'vitest';

import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import {
  actorAtlasCellFor,
  actorPhotoFor,
  damageStateForTier,
  outcomeCardsForMode,
  outcomeLabelForTier,
  roomFrameFor,
} from './visual-state';

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

describe('authored photographic room frames', () => {
  it('uses intact and chaos frames without consulting payout tier', () => {
    expect(roomFrameFor('kitchen', 'idle')).toBe(0);
    expect(roomFrameFor('kitchen', 'arming')).toBe(0);
    expect(roomFrameFor('kitchen', 'revealing')).toBe(1);
    expect(roomFrameFor('garage', 'idle')).toBe(7);
    expect(roomFrameFor('garage', 'arming')).toBe(7);
    expect(roomFrameFor('garage', 'revealing')).toBe(8);
  });

  it('maps every result tier to its own authored aftermath frame', () => {
    expect(TIERS.map(tier => roomFrameFor('kitchen', 'result', tier))).toEqual([2, 3, 4, 5, 6]);
    expect(TIERS.map(tier => roomFrameFor('garage', 'result', tier))).toEqual([9, 10, 11, 12, 13]);
  });

  it('requires a settled tier for the result frame', () => {
    expect(() => roomFrameFor('kitchen', 'result')).toThrow(/tier/i);
  });
});

describe('photographic actor atlas', () => {
  it('resolves exact environment-native actor cells', () => {
    expect(actorPhotoFor('kitchen-toaster')).toBe('/cinematic/actor-atlas.webp');
    expect(actorAtlasCellFor('kitchen-toaster')).toEqual({ col: 0, row: 0 });
    expect(actorAtlasCellFor('kitchen-cat')).toEqual({ col: 1, row: 0 });
    expect(actorAtlasCellFor('kitchen-rocket')).toEqual({ col: 1, row: 1 });
    expect(actorAtlasCellFor('garage-hammer')).toEqual({ col: 3, row: 1 });
    expect(actorAtlasCellFor('garage-tire')).toEqual({ col: 1, row: 2 });
    expect(actorAtlasCellFor('garage-toolbox')).toEqual({ col: 0, row: 3 });
  });

  it('hides actors that do not have authored photographic art', () => {
    expect(actorPhotoFor('kitchen-toast')).toBeUndefined();
    expect(actorPhotoFor('garage-chain')).toBeUndefined();
    expect(actorAtlasCellFor('garage-core')).toBeUndefined();
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
