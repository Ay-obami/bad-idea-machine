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
  0: {
    tier: 0,
    structuralSignature: 'loss-charred-collapse',
    severity: 4,
    catastrophic: true,
    rocket: false,
    scorch: .94,
    cracks: .86,
    cabinetDrop: .84,
    debris: .9,
    fire: .72,
    smoke: .92,
    ceilingSoot: .9,
  },
  1: {
    tier: 1,
    structuralSignature: 'minor-localized-scorch',
    severity: 1,
    catastrophic: false,
    rocket: false,
    scorch: .3,
    cracks: .12,
    cabinetDrop: .12,
    debris: .28,
    fire: .16,
    smoke: .25,
    ceilingSoot: .08,
  },
  2: {
    tier: 2,
    structuralSignature: 'moderate-counter-cabinet-damage',
    severity: 2,
    catastrophic: false,
    rocket: false,
    scorch: .5,
    cracks: .36,
    cabinetDrop: .34,
    debris: .52,
    fire: .32,
    smoke: .48,
    ceilingSoot: .3,
  },
  3: {
    tier: 3,
    structuralSignature: 'severe-upper-cabinet-burn',
    severity: 4,
    catastrophic: false,
    rocket: false,
    scorch: .76,
    cracks: .66,
    cabinetDrop: .7,
    debris: .76,
    fire: .52,
    smoke: .72,
    ceilingSoot: .65,
  },
  4: {
    tier: 4,
    structuralSignature: 'legendary-rocket-cinematic-devastation',
    severity: 5,
    catastrophic: false,
    rocket: true,
    scorch: 1,
    cracks: 1,
    cabinetDrop: 1,
    debris: 1,
    fire: .86,
    smoke: 1,
    ceilingSoot: 1,
  },
};

const VARIANT_GEOMETRY = {
  'grease-fire': {
    object: 'pan' as const,
    start: { x: 585, y: 302, rotation: -8 },
    contact: { x: 548, y: 309 },
    end: { x: 675, y: 316, rotation: 24 },
    spillFrom: { x: 610, y: 318 },
    spillTo: { x: 714, y: 322 },
    ignition: { x: 690, y: 313 },
  },
  'steam-short': {
    object: 'kettle' as const,
    start: { x: 730, y: 287, rotation: 0 },
    contact: { x: 690, y: 304 },
    end: { x: 700, y: 322, rotation: -42 },
    spillFrom: { x: 710, y: 322 },
    spillTo: { x: 625, y: 325 },
    ignition: { x: 626, y: 313 },
  },
  'pan-spark': {
    object: 'pan' as const,
    start: { x: 635, y: 299, rotation: 5 },
    contact: { x: 570, y: 310 },
    end: { x: 603, y: 318, rotation: -31 },
    spillFrom: { x: 626, y: 319 },
    spillTo: { x: 574, y: 321 },
    ignition: { x: 580, y: 307 },
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
  const time = Number.isFinite(elapsedMs)
    ? Math.max(0, Math.min(KITCHEN_MELTDOWN_DURATION, elapsedMs))
    : 0;
  const proof = kitchenFrame(Math.min(time, KITCHEN_PROOF_DURATION));
  const geometry = VARIANT_GEOMETRY[variant];

  const secondaryContact = progress(time, 3_050, 420);
  const secondaryMotion = progress(time, 3_350, 780);
  const spillProgress = progress(time, 3_900, 1_000);
  const ignitionProgress = progress(time, 4_650, 720);
  const smokeProgress = progress(time, 4_980, KITCHEN_REVEAL_MS - 4_980);
  const outcomeProgress = time < KITCHEN_REVEAL_MS
    ? 0
    : progress(time, KITCHEN_REVEAL_MS, KITCHEN_MELTDOWN_DURATION - KITCHEN_REVEAL_MS);

  const contactPulse = secondaryContact > 0 && secondaryContact < 1
    ? Math.sin(secondaryContact * Math.PI)
    : 0;
  const objectX = geometry.start.x + (geometry.end.x - geometry.start.x) * secondaryMotion;
  const objectY = geometry.start.y
    + (geometry.end.y - geometry.start.y) * secondaryMotion
    - Math.sin(secondaryMotion * Math.PI) * 10;
  const objectRotation = geometry.start.rotation
    + (geometry.end.rotation - geometry.start.rotation) * secondaryMotion;

  const sharedDamageIds = [...proof.damageIds];
  if (secondaryContact > .35) sharedDamageIds.push(`${variant}-secondary-contact`);
  if (spillProgress > .05) sharedDamageIds.push('counter-spill');
  if (ignitionProgress > .12) sharedDamageIds.push('localized-fire');
  if (smokeProgress > .15) sharedDamageIds.push('smoke-staining');

  const finalDamage = kitchenFinalDamage(tier);
  const revealDamageIds = outcomeProgress > .08
    ? [finalDamage.structuralSignature]
    : [];

  return {
    time,
    variant,
    proof,
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
    label: time < 3_050
      ? proof.label
      : time < 3_900
        ? variant === 'steam-short'
          ? 'Ceramic debris clips the kettle and starts it tipping.'
          : 'A ceramic strike knocks the pan across the counter.'
        : time < 4_650
          ? variant === 'steam-short'
            ? 'Water sheets across the counter toward the damaged appliance.'
            : 'A fresh spill races toward a hot, sparking surface.'
          : time < KITCHEN_REVEAL_MS
            ? 'The impact point ignites. Smoke rises from the same damaged surface.'
            : 'The payout is known. The same room now settles into its final damage state.',
  };
}
