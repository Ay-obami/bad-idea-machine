import { describe, expect, it } from 'vitest';

import { buildVisualRoute, routeDurationMs } from './route';

const SEED_A = `0x${'12'.repeat(32)}` as const;
const SEED_B = `0x${'f3'.repeat(32)}` as const;

describe('catastrophe routes', () => {
  it('is deterministic for the same tier and visual seed', () => {
    expect(buildVisualRoute(3, SEED_A)).toEqual(buildVisualRoute(3, SEED_A));
  });

  it('uses visual seed only to vary presentation', () => {
    const first = buildVisualRoute(2, SEED_A);
    const second = buildVisualRoute(2, SEED_B);
    expect(first.map(step => step.station)).toEqual(second.map(step => step.station));
    expect(first.some((step, index) => step.variant !== second[index]?.variant)).toBe(true);
  });

  it('makes higher tiers travel farther through the machine', () => {
    expect(buildVisualRoute(1, SEED_A).length).toBe(4);
    expect(buildVisualRoute(2, SEED_A).length).toBe(6);
    expect(buildVisualRoute(3, SEED_A).length).toBe(8);
    expect(buildVisualRoute(4, SEED_A).length).toBe(10);
  });

  it('lets failures terminate at several early stations', () => {
    const stations = new Set<string>();
    for (let byte = 0; byte < 32; byte += 1) {
      const seed = `0x${byte.toString(16).padStart(2, '0')}${'00'.repeat(31)}` as const;
      const route = buildVisualRoute(0, seed);
      stations.add(route.at(-1)?.station ?? '');
    }
    expect(stations.size).toBeGreaterThanOrEqual(3);
    expect([...stations].every(station => ['toaster', 'cat', 'hammer'].includes(station))).toBe(true);
  });

  it('keeps reveal durations in the intended fast casino range', () => {
    expect(routeDurationMs(buildVisualRoute(0, SEED_A))).toBeGreaterThanOrEqual(1_800);
    expect(routeDurationMs(buildVisualRoute(0, SEED_A))).toBeLessThanOrEqual(3_200);
    expect(routeDurationMs(buildVisualRoute(4, SEED_A))).toBeGreaterThanOrEqual(5_000);
    expect(routeDurationMs(buildVisualRoute(4, SEED_A))).toBeLessThanOrEqual(7_200);
  });
});
