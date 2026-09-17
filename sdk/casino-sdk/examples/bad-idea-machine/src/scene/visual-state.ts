import type { AftermathKey } from '../environments/types';
import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';

export type DamageState = AftermathKey;

export type OutcomeCard = {
  tier: OutcomeTier;
  multiplierBps: number;
  aftermathKey: AftermathKey;
  damageState: DamageState;
  label: string;
  shortCopy: string;
};

const AFTERMATHS: readonly AftermathKey[] = ['failure', 'minor', 'moderate', 'severe', 'legendary'];
const LABELS = ['TOTAL FAILURE', 'MINOR SUCCESS', 'CONTROLLED CHAOS', 'MAJOR JACKPOT', 'LEGENDARY CHAOS'] as const;
const COPY = [
  'Everything broke and you still got nothing.',
  'A little destruction. Most of the room survived.',
  'Multiple systems failed. The room is still standing.',
  'Serious cascading damage. The room is no longer functional.',
  'Architecture changed. Common sense did not survive.',
] as const;

export function aftermathKeyForTier(tier: OutcomeTier): AftermathKey {
  return AFTERMATHS[tier];
}

/** @deprecated Use aftermathKeyForTier. Kept until legacy preview code is removed. */
export function damageStateForTier(tier: OutcomeTier): DamageState {
  return aftermathKeyForTier(tier);
}

export function outcomeLabelForTier(tier: OutcomeTier): string {
  return LABELS[tier];
}

export function outcomeCardsForMode(mode: RiskMode): OutcomeCard[] {
  return ([0, 1, 2, 3, 4] as const).map(tier => {
    const aftermathKey = aftermathKeyForTier(tier);
    return {
      tier,
      multiplierBps: multiplierBpsForTier(mode, tier),
      aftermathKey,
      damageState: aftermathKey,
      label: outcomeLabelForTier(tier),
      shortCopy: COPY[tier],
    };
  });
}

export function multiplierDisplay(multiplierBps: number): string {
  const value = multiplierBps / 10_000;
  return `${value.toFixed(Number.isInteger(value) ? 2 : value < 10 ? 2 : 1)}×`;
}
