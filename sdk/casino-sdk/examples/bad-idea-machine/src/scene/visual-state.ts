import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import type { EnvironmentId } from './types';

export type DamageState = 'failure' | 'minor' | 'controlled' | 'major' | 'legendary';
export type VisualRoomPhase = 'idle' | 'arming' | 'revealing' | 'result';

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
  'Nothing worked. Just rubble.',
  'A little destruction. Something survived.',
  'Things got wild, but the machine delivered.',
  'Serious damage. The room is barely recognizable.',
  'Total annihilation. This room will never be the same.',
] as const;

export function damageStateForTier(tier: OutcomeTier): DamageState {
  return DAMAGE_STATES[tier];
}

export function outcomeLabelForTier(tier: OutcomeTier): string {
  return LABELS[tier];
}

export function sceneAssetForState(
  environment: EnvironmentId,
  phase: VisualRoomPhase,
  tier?: OutcomeTier,
): string {
  if (phase === 'revealing') return `/cinematic/${environment}-chaos.webp`;
  if (phase === 'result' && tier !== undefined) return `/cinematic/${environment}-result-${tier}.webp`;
  return `/cinematic/${environment}-idle.webp`;
}

export function sceneAtlasFrame(environment: EnvironmentId, phase: VisualRoomPhase, tier?: OutcomeTier): number {
  const base = environment === 'kitchen' ? 0 : 7;
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
