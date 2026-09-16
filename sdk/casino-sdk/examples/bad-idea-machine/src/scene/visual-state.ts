import { multiplierBpsForTier, type OutcomeTier, type RiskMode } from '../lib/badIdea';
import type { EnvironmentId } from './types';

export type DamageState = 'failure' | 'minor' | 'controlled' | 'major' | 'legendary';
export type VisualPhase = 'idle' | 'arming' | 'revealing' | 'result';
export type ActorAtlasCell = { col: number; row: number };

export type OutcomeCard = {
  tier: OutcomeTier;
  multiplierBps: number;
  damageState: DamageState;
  label: string;
  shortCopy: string;
};

export const ROOM_ATLAS_SRC = '/cinematic/scene-atlas.avif';
export const ACTOR_ATLAS_SRC = '/cinematic/actor-atlas.webp';
export const ROOM_ATLAS_FRAME_COUNT = 14;

const DAMAGE_STATES: readonly DamageState[] = ['failure', 'minor', 'controlled', 'major', 'legendary'];
const LABELS = ['TOTAL FAILURE', 'MINOR SUCCESS', 'CONTROLLED CHAOS', 'MAJOR PAYOUT', 'LEGENDARY CHAOS'] as const;
const COPY = [
  'Nothing worked. Just rubble.',
  'A little destruction. Something survived.',
  'Things got wild, but the machine delivered.',
  'Serious damage. The room is barely recognizable.',
  'Total annihilation. This room will never be the same.',
] as const;

const ACTOR_CELLS: Readonly<Record<string, ActorAtlasCell>> = {
  'kitchen-toaster': { col: 0, row: 0 },
  'kitchen-cat': { col: 1, row: 0 },
  'kitchen-pan': { col: 2, row: 0 },
  'kitchen-kettle': { col: 3, row: 0 },
  'kitchen-ball': { col: 0, row: 1 },
  'kitchen-rocket': { col: 1, row: 1 },
  'kitchen-safe': { col: 2, row: 1 },
  'garage-hammer': { col: 3, row: 1 },
  'garage-drill': { col: 0, row: 2 },
  'garage-tire': { col: 1, row: 2 },
  'garage-rocket': { col: 2, row: 2 },
  'garage-safe': { col: 3, row: 2 },
  'garage-toolbox': { col: 0, row: 3 },
};

export function damageStateForTier(tier: OutcomeTier): DamageState {
  return DAMAGE_STATES[tier];
}

export function outcomeLabelForTier(tier: OutcomeTier): string {
  return LABELS[tier];
}

export function roomFrameFor(environment: EnvironmentId, phase: VisualPhase, tier?: OutcomeTier): number {
  const offset = environment === 'kitchen' ? 0 : 7;
  if (phase === 'idle' || phase === 'arming') return offset;
  if (phase === 'revealing') return offset + 1;
  if (tier === undefined) throw new Error('A settled payout tier is required for a result room frame.');
  return offset + 2 + tier;
}

export function actorAtlasCellFor(actorId: string): ActorAtlasCell | undefined {
  return ACTOR_CELLS[actorId];
}

export function actorPhotoFor(actorId: string): string | undefined {
  return ACTOR_CELLS[actorId] ? ACTOR_ATLAS_SRC : undefined;
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
