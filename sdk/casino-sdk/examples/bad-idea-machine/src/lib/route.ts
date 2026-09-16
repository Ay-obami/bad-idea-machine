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

export type ChaosHazard = 'sparks' | 'fire' | 'smoke' | 'debris' | 'blast' | 'alarm';
export type ChaosIntensity = 1 | 2 | 3;

export type RouteStep = Readonly<{
  station: MachineStation;
  variant: string;
  durationMs: number;
  intensity: ChaosIntensity;
  hazard: ChaosHazard;
  decoys: readonly MachineStation[];
  effectSeed: number;
  terminal: boolean;
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
  button: ['slam', 'double-tap', 'hesitant', 'panic-slap'],
  toaster: ['launch', 'double-launch', 'burnt-launch', 'jam', 'flameout'],
  cat: ['jump-right', 'wire-attack', 'cup-swipe', 'refuse', 'panic-sprint'],
  hammer: ['clean-hit', 'ricochet', 'wild-swing', 'miss', 'handle-snap'],
  ball: ['fast-roll', 'wobble-roll', 'bank-shot', 'derail'],
  fan: ['spin-up', 'reverse-spin', 'overdrive', 'blade-eject'],
  dominoes: ['clean-cascade', 'zigzag', 'split-cascade', 'backfire'],
  rocket: ['vertical', 'sideways', 'sputter', 'premature-ignition'],
  safe: ['clean-drop', 'chain-snap', 'bounce', 'wall-hit'],
  core: ['impossible-sync', 'overload', 'catastrophic-success', 'meltdown'],
};

const HAZARDS: readonly ChaosHazard[] = ['sparks', 'fire', 'smoke', 'debris', 'blast', 'alarm'];
const MIN_STEP_DURATION_MS = 360;

function bytesFor(seed: Hex): Uint8Array {
  return hexToBytes(seed);
}

function byteAt(bytes: Uint8Array, index: number): number {
  return bytes[index % bytes.length];
}

function variantFor(station: MachineStation, bytes: Uint8Array, index: number): string {
  const choices = VARIANTS[station];
  return choices[byteAt(bytes, index + 7) % choices.length];
}

function shuffledStations(bytes: Uint8Array): MachineStation[] {
  const rest = STATIONS.slice(1);
  let cursor = 3;

  for (let index = rest.length - 1; index > 0; index -= 1) {
    const random = byteAt(bytes, cursor) + byteAt(bytes, cursor + 11) * 257;
    const swapWith = random % (index + 1);
    [rest[index], rest[swapWith]] = [rest[swapWith], rest[index]];
    cursor += 1;
  }

  const route = ['button', ...rest] as MachineStation[];
  const isSerial = route.every((station, index) => station === STATIONS[index]);
  if (isSerial) {
    const tail = route.slice(1).reverse();
    return ['button', ...tail];
  }
  return route;
}

function shuffledHazards(bytes: Uint8Array): ChaosHazard[] {
  const hazards = [...HAZARDS];
  let cursor = 21;

  for (let index = hazards.length - 1; index > 0; index -= 1) {
    const random = byteAt(bytes, cursor) + byteAt(bytes, cursor + 7) * 257;
    const swapWith = random % (index + 1);
    [hazards[index], hazards[swapWith]] = [hazards[swapWith], hazards[index]];
    cursor += 1;
  }

  return hazards;
}

function decoysFor(
  station: MachineStation,
  bytes: Uint8Array,
  index: number,
): readonly MachineStation[] {
  const count = 1 + (byteAt(bytes, index + 19) % 2);
  const start = byteAt(bytes, index + 23) % STATIONS.length;
  const stride = 1 + (byteAt(bytes, index + 24) % (STATIONS.length - 1));
  const decoys: MachineStation[] = [];

  for (let offset = 0; offset < STATIONS.length * 2 && decoys.length < count; offset += 1) {
    const candidate = STATIONS[(start + offset * stride) % STATIONS.length];
    if (candidate !== station && !decoys.includes(candidate)) decoys.push(candidate);
  }

  return decoys;
}

function effectSeedFor(bytes: Uint8Array, index: number): number {
  return (
    (byteAt(bytes, index + 2) << 16) |
    (byteAt(bytes, index + 13) << 8) |
    byteAt(bytes, index + 27)
  );
}

function stepDurations(bytes: Uint8Array, count: number, targetDuration: number): readonly number[] {
  const baseDuration = Math.floor(targetDuration / count);
  const durations: number[] = [];
  let remaining = targetDuration;

  for (let index = 0; index < count; index += 1) {
    const stepsAfter = count - index - 1;
    if (stepsAfter === 0) {
      durations.push(remaining);
      break;
    }

    const jitter = (byteAt(bytes, index + 15) % 181) - 90;
    const desired = baseDuration + jitter;
    const maximum = remaining - stepsAfter * MIN_STEP_DURATION_MS;
    const duration = Math.max(MIN_STEP_DURATION_MS, Math.min(maximum, desired));
    durations.push(duration);
    remaining -= duration;
  }

  return durations;
}

/**
 * Cosmetic-only deterministic choreography. The economic tier has already been
 * settled by the contract. The visible route deliberately does not encode that
 * tier: route length and early path are driven only by the domain-separated
 * visual seed, so a player cannot infer the payout by watching how "far" the
 * machine has progressed.
 */
export function buildVisualRoute(tier: OutcomeTier, visualSeed: Hex): readonly RouteStep[] {
  void tier;

  const bytes = bytesFor(visualSeed);
  const count = 8 + (byteAt(bytes, 31) % 3);
  const stations = shuffledStations(bytes).slice(0, count);
  const hazards = shuffledHazards(bytes);
  const durationRoll = (byteAt(bytes, 30) << 8) | byteAt(bytes, 29);
  const targetDuration = 4_700 + (durationRoll % 1_500);
  const durations = stepDurations(bytes, count, targetDuration);

  return stations.map((station, index) => {
    const intensity = (2 + (byteAt(bytes, index + 9) % 2)) as ChaosIntensity;
    const terminal = index === stations.length - 1;

    return {
      station,
      variant: variantFor(station, bytes, index),
      durationMs: durations[index],
      intensity: terminal ? 3 : intensity,
      hazard: hazards[index % hazards.length],
      decoys: decoysFor(station, bytes, index),
      effectSeed: effectSeedFor(bytes, index),
      terminal,
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
  if (stop === 'rocket') return 'SIDEWAYS DETONATION';
  if (stop === 'safe') return 'WEAPONIZED SAFE DROP';
  if (stop === 'ball') return 'UNSCHEDULED BALLISTICS';
  if (stop === 'fan') return 'FAN BECAME A PROJECTILE';
  if (stop === 'dominoes') return 'CHAIN REACTION REGRETTED';
  if (stop === 'core') return 'CORE ACHIEVED SENTIENCE';
  return 'GOOD START.';
}
