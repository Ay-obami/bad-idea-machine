import type { OutcomeTier } from '../lib/badIdea';
import type { EnvironmentId } from './types';

export const SCENE_ATLAS_SRC = '/scenes/scene-atlas.avif';
export const ACTOR_ATLAS_SRC = '/actors/actor-atlas.webp';
export const SCENE_ATLAS_FRAMES = 14;
export const ACTOR_ATLAS_COLUMNS = 4;
export const ACTOR_ATLAS_ROWS = 4;

export type ScenePlatePhase = 'idle' | 'arming' | 'revealing' | 'result';

export type ScenePlate = Readonly<{
  src: string;
  frame: number;
  label: string;
}>;

export type ActorSprite = Readonly<{
  src: string;
  column: number;
  row: number;
}>;

export type OutcomePresentation = Readonly<{
  tier: OutcomeTier;
  title: string;
  damageLevel: number;
  tone: 'failure' | 'minor' | 'medium' | 'major' | 'legendary';
  kitchenCopy: string;
  garageCopy: string;
}>;

export const OUTCOME_PRESENTATIONS: readonly OutcomePresentation[] = [
  {
    tier: 0,
    title: 'TOTAL FAILURE',
    damageLevel: 1,
    tone: 'failure',
    kitchenCopy: 'Nothing worked. Just rubble and a very expensive smell.',
    garageCopy: 'It all went wrong. The mess is the only measurable output.',
  },
  {
    tier: 1,
    title: 'MINOR SUCCESS',
    damageLevel: 2,
    tone: 'minor',
    kitchenCopy: 'A little chaos, but something survived long enough to count.',
    garageCopy: 'A little destruction, but the machine technically delivered.',
  },
  {
    tier: 2,
    title: 'CONTROLLED CHAOS',
    damageLevel: 3,
    tone: 'medium',
    kitchenCopy: 'Things got wild. Against all evidence, the machine delivered.',
    garageCopy: 'Tools became projectiles. Somehow, there is still a payout.',
  },
  {
    tier: 3,
    title: 'MAJOR JACKPOT',
    damageLevel: 4,
    tone: 'major',
    kitchenCopy: 'Absolute mayhem. The kitchen is no longer a kitchen.',
    garageCopy: 'Serious damage. The workshop has entered a new tax category.',
  },
  {
    tier: 4,
    title: 'LEGENDARY CHAOS',
    damageLevel: 5,
    tone: 'legendary',
    kitchenCopy: 'Total annihilation. This room will never be the same.',
    garageCopy: 'Complete destruction. The garage is officially a write-off.',
  },
] as const;

const SCENE_FRAMES: Readonly<Record<EnvironmentId, Readonly<{
  idle: number;
  chaos: number;
  results: readonly [number, number, number, number, number];
}>>> = {
  kitchen: { idle: 0, chaos: 1, results: [2, 3, 4, 5, 6] },
  garage: { idle: 7, chaos: 8, results: [9, 10, 11, 12, 13] },
};

const ACTOR_SPRITES: Readonly<Record<string, ActorSprite>> = {
  'kitchen-toaster': { src: ACTOR_ATLAS_SRC, column: 0, row: 0 },
  'kitchen-cat': { src: ACTOR_ATLAS_SRC, column: 1, row: 0 },
  'kitchen-pan': { src: ACTOR_ATLAS_SRC, column: 2, row: 0 },
  'kitchen-kettle': { src: ACTOR_ATLAS_SRC, column: 3, row: 0 },
  'kitchen-ball': { src: ACTOR_ATLAS_SRC, column: 0, row: 1 },
  'kitchen-rocket': { src: ACTOR_ATLAS_SRC, column: 1, row: 1 },
  'kitchen-safe': { src: ACTOR_ATLAS_SRC, column: 2, row: 1 },
  'garage-hammer': { src: ACTOR_ATLAS_SRC, column: 3, row: 1 },
  'garage-drill': { src: ACTOR_ATLAS_SRC, column: 0, row: 2 },
  'garage-tire': { src: ACTOR_ATLAS_SRC, column: 1, row: 2 },
  'garage-rocket': { src: ACTOR_ATLAS_SRC, column: 2, row: 2 },
  'garage-safe': { src: ACTOR_ATLAS_SRC, column: 3, row: 2 },
  'garage-toolbox': { src: ACTOR_ATLAS_SRC, column: 0, row: 3 },
};

export function getOutcomePresentation(tier: OutcomeTier): OutcomePresentation {
  return OUTCOME_PRESENTATIONS[tier];
}

export function getScenePlate(
  environment: EnvironmentId,
  phase: ScenePlatePhase,
  tier?: OutcomeTier,
): ScenePlate {
  const frames = SCENE_FRAMES[environment];
  const frame = phase === 'revealing'
    ? frames.chaos
    : phase === 'result'
      ? frames.results[tier ?? 0]
      : frames.idle;

  return {
    src: SCENE_ATLAS_SRC,
    frame,
    label: phase === 'result'
      ? `${environment} aftermath tier ${tier ?? 0}`
      : `${environment} ${phase === 'revealing' ? 'chaos' : 'ready'} scene`,
  };
}

export function getActorSprite(actorId: string): ActorSprite | undefined {
  return ACTOR_SPRITES[actorId];
}
