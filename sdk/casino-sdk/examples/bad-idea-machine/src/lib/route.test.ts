import { describe, expect, it } from 'vitest';

import type { OutcomeTier } from './badIdea';
import { buildVisualRoute, routeDurationMs, type MachineStation } from './route';

const SERIAL: readonly MachineStation[] = [
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

const SEEDS = [
  `0x${'00'.repeat(32)}`,
  `0x${'11'.repeat(32)}`,
  `0x${'23'.repeat(32)}`,
  `0x${'5a'.repeat(32)}`,
  `0x${'a5'.repeat(32)}`,
  `0x${'ef'.repeat(32)}`,
] as const;

const TIERS = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];
const REQUIRED_HAZARDS = ['fire', 'smoke', 'debris', 'blast'] as const;

describe('Bad Idea Machine visual choreography', () => {
  it('is deterministic for the same settled visual seed', () => {
    expect(buildVisualRoute(3, SEEDS[3])).toEqual(buildVisualRoute(3, SEEDS[3]));
  });

  it('does not reveal the payout tier through route length or early station order', () => {
    for (const seed of SEEDS) {
      const routes = TIERS.map(tier => buildVisualRoute(tier, seed));
      const lengths = routes.map(route => route.length);
      const earlySignatures = routes.map(route => route.slice(0, 6).map(step => step.station).join('>'));

      expect(new Set(lengths).size).toBe(1);
      expect(lengths[0]).toBeGreaterThanOrEqual(8);
      expect(lengths[0]).toBeLessThanOrEqual(10);
      expect(new Set(earlySignatures).size).toBe(1);
    }
  });

  it('never falls back to the old serial station-prefix reveal', () => {
    for (const seed of SEEDS) {
      for (const tier of TIERS) {
        const route = buildVisualRoute(tier, seed);
        expect(route.map(step => step.station)).not.toEqual(SERIAL.slice(0, route.length));
      }
    }
  });

  it('produces materially different route orders from different visual seeds', () => {
    const signatures = SEEDS.map(seed =>
      buildVisualRoute(2, seed)
        .map(step => step.station)
        .join('>'),
    );

    expect(new Set(signatures).size).toBeGreaterThanOrEqual(4);
  });

  it('makes every reveal visibly dangerous instead of allowing quiet routes', () => {
    for (const seed of SEEDS) {
      const route = buildVisualRoute(3, seed);
      const hazards = new Set(route.map(step => step.hazard));

      expect(route.every(step => step.intensity >= 2 && step.intensity <= 3)).toBe(true);
      for (const hazard of REQUIRED_HAZARDS) expect(hazards.has(hazard)).toBe(true);
      expect(route.every(step => Number.isInteger(step.effectSeed))).toBe(true);
      expect(route.some(step => step.decoys.length > 0)).toBe(true);
    }
  });

  it('keeps every tier in the same suspense-length envelope', () => {
    for (const seed of SEEDS) {
      for (const tier of TIERS) {
        const duration = routeDurationMs(buildVisualRoute(tier, seed));
        expect(duration).toBeGreaterThanOrEqual(4_200);
        expect(duration).toBeLessThanOrEqual(7_000);
      }
    }
  });
});
