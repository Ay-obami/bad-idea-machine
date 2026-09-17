import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { visualByte } from './random';
import {
  KITCHEN_MELTDOWN_DURATION,
  KITCHEN_REVEAL_MS,
  kitchenVariantFromSeed,
  type KitchenVariant,
} from './kitchen-meltdown';
import type {
  ImpactEffect,
  Material,
  MotionKeyframe,
  SceneAction,
  SceneEvent,
  SceneHazard,
  SceneIntensity,
  ScenePoint,
  SceneScript,
} from './types';

type KitchenEventInput = Readonly<{
  id: string;
  actorId: string;
  action: SceneAction;
  startMs: number;
  durationMs: number;
  start: ScenePoint;
  end: ScenePoint;
  rotation?: number;
  hazard: SceneHazard;
  intensity: SceneIntensity;
  soundCue: string;
  impactAt?: number;
  materialA?: Material;
  materialB?: Material;
  effect?: ImpactEffect;
  damage?: readonly string[];
  seed: number;
}>;

function path(input: KitchenEventInput): readonly MotionKeyframe[] {
  const rotation = input.rotation ?? 0;
  return [
    { at: 0, x: input.start.x, y: input.start.y, rotation: 0, scale: 1 },
    {
      at: .58,
      x: input.start.x + (input.end.x - input.start.x) * .62,
      y: Math.min(input.start.y, input.end.y) - 10,
      rotation: rotation * .55,
      scale: 1.02,
    },
    { at: 1, x: input.end.x, y: input.end.y, rotation, scale: 1 },
  ];
}

function event(input: KitchenEventInput): SceneEvent {
  return {
    id: input.id,
    actorId: input.actorId,
    action: input.action,
    startMs: input.startMs,
    durationMs: input.durationMs,
    path: path(input),
    impacts: [{
      atMs: input.impactAt ?? Math.round(input.durationMs * .72),
      point: input.end,
      materialA: input.materialA ?? 'appliance',
      materialB: input.materialB ?? 'masonry',
      strength: Math.min(4, input.intensity + 1) as 1 | 2 | 3 | 4,
      effect: input.effect ?? (input.hazard === 'fire' ? 'fire' : input.hazard === 'sparks' ? 'spark' : 'debris'),
      persistentDamage: input.damage ?? [],
    }],
    hazard: input.hazard,
    intensity: input.intensity,
    decoy: false,
    effectSeed: input.seed,
    soundCue: input.soundCue,
  };
}

function proofEvents(seed: Hex): readonly SceneEvent[] {
  const base = visualByte(seed, 8) << 8;
  return [
    event({
      id: 'proof-toaster', actorId: 'kitchen-toaster', action: 'launch', startMs: 650, durationMs: 400,
      start: { x: 580, y: 270 }, end: { x: 564, y: 173 }, rotation: -2,
      hazard: 'sparks', intensity: 1, soundCue: 'toaster-pop', impactAt: 300,
      materialA: 'appliance', materialB: 'wood', effect: 'debris', seed: base + 1,
    }),
    event({
      id: 'proof-hinge', actorId: 'kitchen-cabinet', action: 'swing', startMs: 1_050, durationMs: 570,
      start: { x: 606, y: 14 }, end: { x: 608, y: 149 }, rotation: 14,
      hazard: 'debris', intensity: 2, soundCue: 'cabinet-slam', impactAt: 180,
      materialA: 'wood', materialB: 'masonry', effect: 'debris', damage: ['loose-hinge'], seed: base + 2,
    }),
    event({
      id: 'proof-door-plate', actorId: 'kitchen-cabinet', action: 'swing', startMs: 1_620, durationMs: 90,
      start: { x: 506, y: 146 }, end: { x: 498, y: 158 }, rotation: 3,
      hazard: 'debris', intensity: 1, soundCue: 'cabinet-slam', impactAt: 78,
      materialA: 'wood', materialB: 'ceramic', effect: 'debris', seed: base + 3,
    }),
    event({
      id: 'proof-ceramic', actorId: 'kitchen-plates', action: 'shatter', startMs: 1_710, durationMs: 1_000,
      start: { x: 472, y: 157 }, end: { x: 420, y: 304 }, rotation: 12,
      hazard: 'shards', intensity: 2, soundCue: 'ceramic-shatter', impactAt: 505,
      materialA: 'ceramic', materialB: 'masonry', effect: 'shatter', damage: ['broken-plates'], seed: base + 4,
    }),
  ];
}

function variantEvents(variant: KitchenVariant, seed: Hex): readonly SceneEvent[] {
  const base = (visualByte(seed, 10) << 8) | visualByte(seed, 11);

  if (variant === 'grease-fire') {
    return [
      event({
        id: 'grease-pan-hit', actorId: 'kitchen-pan', action: 'ricochet', startMs: 2_710, durationMs: 500,
        start: { x: 418, y: 307 }, end: { x: 188, y: 302 }, rotation: 30,
        hazard: 'debris', intensity: 2, soundCue: 'ceramic-pan', impactAt: 490,
        materialA: 'ceramic', materialB: 'metal', effect: 'debris', seed: base + 1,
      }),
      event({
        id: 'grease-spill', actorId: 'kitchen-pan', action: 'roll', startMs: 3_210, durationMs: 900,
        start: { x: 165, y: 300 }, end: { x: 250, y: 316 }, rotation: 28,
        hazard: 'debris', intensity: 1, soundCue: 'pan-clang', materialA: 'metal', materialB: 'masonry', effect: 'debris', damage: ['counter-spill'], seed: base + 2,
      }),
      event({
        id: 'grease-ignite', actorId: 'kitchen-pan', action: 'ignite', startMs: 4_500, durationMs: 700,
        start: { x: 180, y: 314 }, end: { x: 164, y: 307 },
        hazard: 'fire', intensity: 2, soundCue: 'pan-ignite', materialA: 'metal', materialB: 'appliance', effect: 'fire', damage: ['localized-fire'], seed: base + 3,
      }),
      event({
        id: 'shared-smoke', actorId: 'kitchen-kettle', action: 'vent', startMs: 5_200, durationMs: 399,
        start: { x: 164, y: 307 }, end: { x: 164, y: 250 },
        hazard: 'smoke', intensity: 2, soundCue: 'steam-hiss', materialA: 'appliance', materialB: 'masonry', effect: 'fire', damage: ['smoke-staining'], seed: base + 4,
      }),
    ];
  }

  if (variant === 'steam-short') {
    return [
      event({
        id: 'steam-kettle-hit', actorId: 'kitchen-kettle', action: 'ricochet', startMs: 2_710, durationMs: 500,
        start: { x: 418, y: 307 }, end: { x: 766, y: 299 }, rotation: 330,
        hazard: 'debris', intensity: 2, soundCue: 'ceramic-kettle', impactAt: 490,
        materialA: 'ceramic', materialB: 'metal', effect: 'debris', seed: base + 1,
      }),
      event({
        id: 'steam-spill', actorId: 'kitchen-kettle', action: 'vent', startMs: 3_210, durationMs: 900,
        start: { x: 790, y: 290 }, end: { x: 744, y: 321 }, rotation: -42,
        hazard: 'steam', intensity: 2, soundCue: 'kettle-steam', materialA: 'metal', materialB: 'appliance', effect: 'debris', damage: ['counter-spill'], seed: base + 2,
      }),
      event({
        id: 'steam-short', actorId: 'kitchen-toaster', action: 'ignite', startMs: 4_500, durationMs: 700,
        start: { x: 610, y: 324 }, end: { x: 600, y: 309 },
        hazard: 'sparks', intensity: 2, soundCue: 'sparks-short', materialA: 'appliance', materialB: 'metal', effect: 'spark', damage: ['localized-fire'], seed: base + 3,
      }),
      event({
        id: 'shared-smoke', actorId: 'kitchen-kettle', action: 'vent', startMs: 5_200, durationMs: 399,
        start: { x: 600, y: 309 }, end: { x: 600, y: 252 },
        hazard: 'smoke', intensity: 2, soundCue: 'steam-hiss', materialA: 'appliance', materialB: 'masonry', effect: 'fire', damage: ['smoke-staining'], seed: base + 4,
      }),
    ];
  }

  return [
    event({
      id: 'pan-shard-hit', actorId: 'kitchen-pan', action: 'ricochet', startMs: 2_710, durationMs: 500,
      start: { x: 418, y: 307 }, end: { x: 188, y: 302 }, rotation: 30,
      hazard: 'debris', intensity: 2, soundCue: 'ceramic-pan', impactAt: 490,
      materialA: 'ceramic', materialB: 'metal', effect: 'debris', seed: base + 1,
    }),
    event({
      id: 'pan-cord-hit', actorId: 'kitchen-pan', action: 'ricochet', startMs: 3_210, durationMs: 1_240,
      start: { x: 165, y: 300 }, end: { x: 535, y: 314 }, rotation: -35,
      hazard: 'sparks', intensity: 2, soundCue: 'pan-clang', materialA: 'metal', materialB: 'appliance', effect: 'spark', damage: ['counter-spill'], seed: base + 2,
    }),
    event({
      id: 'pan-ignite', actorId: 'kitchen-toaster', action: 'ignite', startMs: 4_500, durationMs: 700,
      start: { x: 558, y: 321 }, end: { x: 568, y: 306 },
      hazard: 'fire', intensity: 2, soundCue: 'toaster-sparks', materialA: 'appliance', materialB: 'metal', effect: 'fire', damage: ['localized-fire'], seed: base + 3,
    }),
    event({
      id: 'shared-smoke', actorId: 'kitchen-kettle', action: 'vent', startMs: 5_200, durationMs: 399,
      start: { x: 568, y: 306 }, end: { x: 568, y: 250 },
      hazard: 'smoke', intensity: 2, soundCue: 'steam-hiss', materialA: 'appliance', materialB: 'masonry', effect: 'fire', damage: ['smoke-staining'], seed: base + 4,
    }),
  ];
}

function terminalEvents(tier: OutcomeTier, seed: Hex): readonly SceneEvent[] {
  const base = (visualByte(seed, 20) << 8) | tier * 32;
  switch (tier) {
    case 0:
      return [
        event({
          id: 'outcome-0-cabinet-collapse', actorId: 'kitchen-cabinet', action: 'collapse', startMs: 5_900, durationMs: 900,
          start: { x: 500, y: 170 }, end: { x: 474, y: 312 }, rotation: 28,
          hazard: 'fire', intensity: 3, soundCue: 'cabinet-collapse', materialA: 'wood', materialB: 'masonry', effect: 'fire', damage: ['loss-charred-collapse'], seed: base + 1,
        }),
        event({
          id: 'outcome-0-safe-crash', actorId: 'kitchen-safe', action: 'drop', startMs: 6_650, durationMs: 850,
          start: { x: 720, y: 70 }, end: { x: 650, y: 500 }, rotation: 12,
          hazard: 'debris', intensity: 3, soundCue: 'safe-crash', materialA: 'metal', materialB: 'masonry', effect: 'debris', seed: base + 2,
        }),
      ];
    case 1:
      return [event({
        id: 'outcome-1-local-settle', actorId: 'kitchen-pan', action: 'drop', startMs: 6_050, durationMs: 720,
        start: { x: 250, y: 316 }, end: { x: 240, y: 326 }, rotation: 8,
        hazard: 'smoke', intensity: 1, soundCue: 'pan-settle', materialA: 'metal', materialB: 'masonry', effect: 'debris', damage: ['minor-localized-scorch'], seed: base + 1,
      })];
    case 2:
      return [event({
        id: 'outcome-2-counter-break', actorId: 'kitchen-kettle', action: 'drop', startMs: 6_000, durationMs: 820,
        start: { x: 744, y: 321 }, end: { x: 700, y: 338 }, rotation: -22,
        hazard: 'debris', intensity: 2, soundCue: 'kettle-crash', materialA: 'metal', materialB: 'masonry', effect: 'debris', damage: ['moderate-counter-cabinet-damage'], seed: base + 1,
      })];
    case 3:
      return [event({
        id: 'outcome-3-upper-burn', actorId: 'kitchen-cabinet', action: 'collapse', startMs: 5_950, durationMs: 1_000,
        start: { x: 510, y: 150 }, end: { x: 486, y: 296 }, rotation: 34,
        hazard: 'fire', intensity: 3, soundCue: 'cabinet-collapse', materialA: 'wood', materialB: 'masonry', effect: 'fire', damage: ['severe-upper-cabinet-burn'], seed: base + 1,
      })];
    case 4:
      return [
        event({
          id: 'outcome-4-rocket', actorId: 'kitchen-rocket', action: 'launch', startMs: 5_850, durationMs: 850,
          start: { x: 880, y: 420 }, end: { x: 180, y: 165 }, rotation: -18,
          hazard: 'fire', intensity: 3, soundCue: 'rocket-blast', materialA: 'appliance', materialB: 'masonry', effect: 'blast', damage: ['legendary-rocket-cinematic-devastation'], seed: base + 1,
        }),
        event({
          id: 'outcome-4-safe', actorId: 'kitchen-safe', action: 'drop', startMs: 6_650, durationMs: 850,
          start: { x: 720, y: 70 }, end: { x: 610, y: 505 }, rotation: -16,
          hazard: 'blast', intensity: 3, soundCue: 'safe-crash', materialA: 'metal', materialB: 'masonry', effect: 'blast', seed: base + 2,
        }),
      ];
  }
}

function finalizer(tier: OutcomeTier) {
  const copy = [
    ['TOTAL CHAOS. ZERO DINNER.', 'The kitchen is ruined and somehow still unprofitable.'],
    ['SOMEHOW, BREAKFAST PAID.', 'A small return escaped through one localized scorch mark.'],
    ['QUESTIONABLE CULINARY ENGINEERING', 'The same accident produced a moderately damaged kitchen and actual value.'],
    ['THE KITCHEN SHOULD NOT HAVE WORKED', 'The upper cabinets lost the argument. The payout did not.'],
    ['CATASTROPHICALLY EDIBLE SUCCESS', 'A rocket crossed the room. The kitchen stayed visible. The payout is magnificent.'],
  ] as const;
  return { tier, label: copy[tier][0], flavor: copy[tier][1], impact: { x: 620, y: 320 } };
}

export function buildKitchenMeltdownScript(tier: OutcomeTier, visualSeed: Hex): SceneScript {
  const variant = kitchenVariantFromSeed(visualSeed);
  return {
    environment: 'kitchen',
    durationMs: KITCHEN_MELTDOWN_DURATION,
    revealStartMs: KITCHEN_REVEAL_MS,
    variant,
    events: [...proofEvents(visualSeed), ...variantEvents(variant, visualSeed), ...terminalEvents(tier, visualSeed)],
    finalizer: finalizer(tier),
  };
}
