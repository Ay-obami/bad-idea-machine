import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import type { EnvironmentId } from './types';

export type DamageState = 'failure' | 'minor' | 'controlled' | 'major' | 'legendary';
export type VisualPhase = 'idle' | 'arming' | 'revealing' | 'result';

export type OutcomeCard = {
  tier: OutcomeTier;
  multiplierBps: number;
  damageState: DamageState;
  label: string;
  shortCopy: string;
};

const DAMAGE_STATES: readonly DamageState[] = ['failure', 'minor', 'controlled', 'major', 'legendary'];
const LABELS = ['TOTAL FAILURE', 'MINOR SUCCESS', 'CONTROLLED CHAOS', 'MAJOR PAYOUT', 'LEGENDARY CHAOS'] as const;
const COPY = [
  'The plan failed before the room did.',
  'Localized damage. Most of the room survived.',
  'A proper mess, but the machine delivered.',
  'Serious structural regret. Somehow, a payout.',
  'Catastrophic mayhem. Nothing in this room is the same.',
] as const;

const BASE_FRAME: Readonly<Record<EnvironmentId, number>> = {
  kitchen: 0,
  garage: 7,
};

export function damageStateForTier(tier: OutcomeTier): DamageState {
  return DAMAGE_STATES[tier];
}

export function outcomeLabelForTier(tier: OutcomeTier): string {
  return LABELS[tier];
}

/**
 * The photographic atlas contains fourteen 16:9 frames in a fixed order:
 * kitchen idle, kitchen live chaos, kitchen results 0..4,
 * garage idle, garage live chaos, garage results 0..4.
 */
export function sceneFrameForState(
  environment: EnvironmentId,
  phase: VisualPhase,
  tier?: OutcomeTier,
): number {
  const base = BASE_FRAME[environment];
  if (phase === 'revealing') return base + 1;
  if (phase === 'result' && tier !== undefined) return base + 2 + tier;
  return base;
}

export function outcomeCardsForMode(mode: RiskMode): OutcomeCard[] {
  return ([0, 1, 2, 3, 4] as const).map(tier => ({
    tier,
    multiplierBps: multiplierBpsForTier(mode, tier),
    damageState: damageStateForTier(tier),
    label: outcomeLabelForTier(tier),
    shortCopy: COPY[tier],
  }));
}

export function multiplierDisplay(multiplierBps: number): string {
  const value = multiplierBps / 10_000;
  return `${value.toFixed(Number.isInteger(value) ? 2 : value < 10 ? 2 : 1)}×`;
}
