import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { visualByte } from './random';
import { KITCHEN_PROOF_DURATION, kitchenFrame } from './kitchen-proof';

export type KitchenVariant = 'grease-fire' | 'steam-short' | 'pan-spark';

export const KITCHEN_REVEAL_MS = 5_600;
export const KITCHEN_MELTDOWN_DURATION = 8_000;

export type KitchenFinalDamage = Readonly<{
  tier: OutcomeTier;
  structuralSignature: string;
  severity: 1 | 2 | 3 | 4 | 5;
  catastrophic: boolean;
  rocket: boolean;
  scorch: number;
  cracks: number;
  cabinetDrop: number;
  debris: number;
  fire: number;
  smoke: number;
  ceilingSoot: number;
}>;

const FINAL_DAMAGE: Readonly<Record<OutcomeTier, KitchenFinalDamage>> = {
  0: { tier: 0, structuralSignature: 'loss-charred-collapse', severity: 4, catastrophic: true, rocket: false, scorch: .94, cracks: .86, cabinetDrop: .84, debris: .9, fire: .72, smoke: .92, ceilingSoot: .9 },
  1: { tier: 1, structuralSignature: 'minor-localized-scorch', severity: 1, catastrophic: false, rocket: false, scorch: .3, cracks: .12, cabinetDrop: .12, debris: .28, fire: .16, smoke: .25, ceilingSoot: .08 },
  2: { tier: 2, structuralSignature: 'moderate-counter-cabinet-damage', severity: 2, catastrophic: false, rocket: false, scorch: .5, cracks: .36, cabinetDrop: .34, debris: .52, fire: .32, smoke: .48, ceilingSoot: .3 },
  3: { tier: 3, structuralSignature: 'severe-upper-cabinet-burn', severity: 4, catastrophic: false, rocket: false, scorch: .76, cracks: .66, cabinetDrop: .7, debris: .76, fire: .52, smoke: .72, ceilingSoot: .65 },
  4: { tier: 4, structuralSignature: 'legendary-rocket-cinematic-devastation', severity: 5, catastrophic: false, rocket: true, scorch: 1, cracks: 1, cabinetDrop: 1, debris: 1, fire: .86, smoke: 1, ceilingSoot: 1 },
};

// All rest positions are authored against the approved proof room: pan on the left stove,
// kettle on the right counter/sink run, toaster/cabinet/plates supplied by kitchenFrame.
const VARIANT_GEOMETRY = {
  'grease-fire': {
    object: 'pan' as const,
    start: { x: 165, y: 300, rotation: -6 },
    contact: { x: 188, y: 302 },
    end: { x: 250, y: 316, rotation: 28 },
    spillFrom: { x: 180, y: 314 },
    spillTo: { x: 145, y: 319 },
    ignition: { x: 164, y: 307 },
  },
  'steam-short': {
    object: 'kettle' as const,
    start: { x: 790, y: 290, rotation: 0 },
    contact: { x: 766, y: 299 },
    end: { x: 744, y: 321, rotation: -42 },
    spillFrom: { x: 755, y: 320 },
    spillTo: { x: 610, y: 324 },
    ignition: { x: 600, y: 309 },
  },
  'pan-spark': {
    object: 'pan' as const,
    start: { x: 165, y: 300, rotation: -6 },
    contact: { x: 188, y: 302 },
    end: { x: 535, y: 314, rotation: -35 },
    spillFrom: { x: 242, y: 318 },
    spillTo: { x: 558, y: 321 },
    ignition: { x: 568, y: 306 },
  },
} as const;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function progress(time: number, start: number, duration: number): number {
  return smooth((time - start) / duration);
}

export function kitchenVariantFromSeed(visualSeed: Hex): KitchenVariant {
  return (['grease-fire', 'steam-short', 'pan-spark'] as const)[visualByte(visualSeed, 0) % 3];
}

export function kitchenFinalDamage(tier: OutcomeTier): KitchenFinalDamage {
  return FINAL_DAMAGE[tier];
}

export function kitchenMeltdownFrame(elapsedMs: number, variant: KitchenVariant, tier: OutcomeTier) {
  const time = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(KITCHEN_MELTDOWN_DURATION, elapsedMs)) : 0;
  const proof = kitchenFrame(Math.min(time, KITCHEN_PROOF_DURATION));
  const geometry = VARIANT_GEOMETRY[variant];

  // One actual ceramic fragment leaves the approved plate break and travels to the next object.
  const shardFlight = progress(time, 2_710, 500);
  const shardStart = { x: 418, y: 307 };
  const shardX = shardStart.x + (geometry.contact.x - shardStart.x) * shardFlight;
  const shardY = shardStart.y + (geometry.contact.y - shardStart.y) * shardFlight - Math.sin(shardFlight * Math.PI) * 34;

  const secondaryContact = progress(time, 2_710, 500);
  const secondaryDuration = variant === 'pan-spark' ? 1_240 : 900;
  const secondaryMotion = progress(time, 3_210, secondaryDuration);
  const spillProgress = progress(time, 3_520, 1_020);
  const ignitionProgress = progress(time, 4_500, 700);
  const smokeProgress = progress(time, 5_000, KITCHEN_REVEAL_MS - 5_000);
  const outcomeProgress = time < KITCHEN_REVEAL_MS ? 0 : progress(time, KITCHEN_REVEAL_MS, KITCHEN_MELTDOWN_DURATION - KITCHEN_REVEAL_MS);

  const contactPulse = secondaryContact > 0 && secondaryContact < 1 ? Math.sin(secondaryContact * Math.PI) : 0;
  const objectX = geometry.start.x + (geometry.end.x - geometry.start.x) * secondaryMotion;
  const objectY = geometry.start.y + (geometry.end.y - geometry.start.y) * secondaryMotion - Math.sin(secondaryMotion * Math.PI) * (variant === 'pan-spark' ? 24 : 10);
  const objectRotation = geometry.start.rotation + (geometry.end.rotation - geometry.start.rotation) * secondaryMotion;

  const sharedDamageIds = [...proof.damageIds];
  if (secondaryContact > .35) sharedDamageIds.push(`${variant}-secondary-contact`);
  if (spillProgress > .05) sharedDamageIds.push('counter-spill');
  if (ignitionProgress > .12) sharedDamageIds.push('localized-fire');
  if (smokeProgress > .15) sharedDamageIds.push('smoke-staining');

  const finalDamage = kitchenFinalDamage(tier);
  const revealDamageIds = outcomeProgress > .08 ? [finalDamage.structuralSignature] : [];

  return {
    time,
    variant,
    proof,
    triggerShard: {
      x: shardX,
      y: shardY,
      rotation: -30 + 310 * shardFlight,
      progress: shardFlight,
      visible: shardFlight > 0 && shardFlight < 1,
      target: geometry.contact,
    },
    secondaryObject: {
      kind: geometry.object,
      x: objectX,
      y: objectY,
      rotation: objectRotation,
      motion: secondaryMotion,
      contactPulse,
      contact: geometry.contact,
    },
    spill: {
      progress: spillProgress,
      opacity: .08 + .62 * spillProgress,
      from: geometry.spillFrom,
      to: geometry.spillTo,
    },
    ignition: {
      progress: ignitionProgress,
      x: geometry.ignition.x,
      y: geometry.ignition.y,
      intensity: .2 + .8 * ignitionProgress,
    },
    smoke: {
      progress: smokeProgress,
      x: geometry.ignition.x,
      y: geometry.ignition.y - 5,
      opacity: .64 * smokeProgress,
    },
    sharedDamageIds: [...new Set(sharedDamageIds)],
    revealDamageIds,
    outcomeProgress,
    finalDamage,
    label: time < 2_710
      ? proof.label
      : time < 3_210
        ? variant === 'steam-short'
          ? 'A ceramic shard leaves the break and crosses the room toward the kettle.'
          : 'A ceramic shard leaves the break and ricochets toward the pan on the stove.'
        : time < 3_520
          ? variant === 'steam-short'
            ? 'The shard clips the kettle. The kettle starts tipping.'
            : 'The shard hits the pan. Metal moves only after contact.'
          : time < 4_500
            ? variant === 'steam-short'
              ? 'Water sheets from the tipped kettle toward the damaged appliance.'
              : variant === 'pan-spark'
                ? 'The pan flies off the stove and drags a hot spill toward the toaster cord.'
                : 'Oil spills directly across the hot burner surface.'
            : time < KITCHEN_REVEAL_MS
              ? 'The spill reaches the impact point and ignites. Smoke rises from that same surface.'
              : 'The payout is known. The same room now settles into its final damage state.',
  };
}
