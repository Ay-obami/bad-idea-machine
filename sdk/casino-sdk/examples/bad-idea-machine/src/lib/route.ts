import { hexToBytes, type Hex } from 'viem';

import type { OutcomeTier } from './badIdea';

export type MachineStation =
  | 'button'
  | 'toaster'
  | 'cat'
  | 'hammer'
  | 'ball'
  | 'fan'
  | 'dominoes'
  | 'rocket'
  | 'safe'
  | 'core';

export type RouteStep = Readonly<{
  station: MachineStation;
  variant: string;
  durationMs: number;
}>;

const STATIONS: readonly MachineStation[] = [
  'button',
  'toaster',
  'cat',
  'hammer',
  'ball',
  'fan',
  'dominoes',
  'rocket',
  'safe',
  'core',
];

const VARIANTS: Record<MachineStation, readonly string[]> = {
  button: ['slam', 'double-tap', 'hesitant'],
  toaster: ['launch', 'double-launch', 'burnt-launch', 'jam'],
  cat: ['jump-right', 'wire-attack', 'cup-swipe', 'refuse'],
  hammer: ['clean-hit', 'ricochet', 'wild-swing', 'miss'],
  ball: ['fast-roll', 'wobble-roll', 'bank-shot'],
  fan: ['spin-up', 'reverse-spin', 'overdrive'],
  dominoes: ['clean-cascade', 'zigzag', 'split-cascade'],
  rocket: ['vertical', 'sideways', 'sputter'],
  safe: ['clean-drop', 'chain-snap', 'bounce'],
  core: ['impossible-sync', 'overload', 'catastrophic-success'],
};

const STEP_COUNTS: Record<Exclude<OutcomeTier, 0>, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
};

const TARGET_DURATION_MS: Record<OutcomeTier, number> = {
  0: 2_400,
  1: 3_200,
  2: 4_200,
  3: 5_100,
  4: 6_400,
};

function byteAt(seed: Hex, index: number): number {
  const bytes = hexToBytes(seed);
  return bytes[index % bytes.length];
}

function variantFor(station: MachineStation, seed: Hex, index: number): string {
  const choices = VARIANTS[station];
  return choices[byteAt(seed, index + 7) % choices.length];
}

/**
 * Cosmetic-only deterministic route. The tier has already been settled by the
 * contract; visualSeed can alter variants and early-failure punchlines but can
 * never change the economic result.
 */
export function buildVisualRoute(tier: OutcomeTier, visualSeed: Hex): readonly RouteStep[] {
  const count = tier === 0 ? 2 + (byteAt(visualSeed, 0) % 3) : STEP_COUNTS[tier];
  const stations = STATIONS.slice(0, count);
  const target = TARGET_DURATION_MS[tier];
  const baseDuration = Math.floor(target / count);

  return stations.map((station, index) => {
    const isFailureStop = tier === 0 && index === stations.length - 1;
    const failureVariant =
      station === 'toaster' ? 'jam' : station === 'cat' ? 'refuse' : station === 'hammer' ? 'miss' : null;

    return {
      station,
      variant: isFailureStop && failureVariant ? failureVariant : variantFor(station, visualSeed, index),
      durationMs: baseDuration,
    };
  });
}

export function routeDurationMs(route: readonly RouteStep[]): number {
  return route.reduce((sum, step) => sum + step.durationMs, 0);
}

export function failureCaption(route: readonly RouteStep[]): string {
  const stop = route.at(-1)?.station;
  if (stop === 'toaster') return 'BREAKFAST-BASED FAILURE';
  if (stop === 'cat') return 'UNCOOPERATIVE PERSONNEL';
  if (stop === 'hammer') return 'CALIBRATION WAS A SUGGESTION';
  return 'GOOD START.';
}
