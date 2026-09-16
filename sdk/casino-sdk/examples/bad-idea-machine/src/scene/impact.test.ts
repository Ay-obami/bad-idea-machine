import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';

import { buildSceneScript } from './scene-script';

const SEED = `0x${'42'.repeat(32)}` as Hex;

for (const environment of ['kitchen', 'garage'] as const) {
  describe(`${environment} physical impacts`, () => {
    it('gives every visible VFX source an explicit in-bounds impact', () => {
      const script = buildSceneScript(environment, 4, SEED);
      for (const event of script.events) {
        expect(event.impacts.length).toBeGreaterThan(0);
        for (const impact of event.impacts) {
          expect(impact.atMs).toBeGreaterThanOrEqual(0);
          expect(impact.atMs).toBeLessThanOrEqual(event.durationMs);
          expect(impact.point.x).toBeGreaterThanOrEqual(0);
          expect(impact.point.x).toBeLessThanOrEqual(1000);
          expect(impact.point.y).toBeGreaterThanOrEqual(0);
          expect(impact.point.y).toBeLessThanOrEqual(600);
          expect(impact.persistentDamage.length).toBeGreaterThan(0);
        }
      }
    });

    it('never invents a persistent fire/blast/shatter source without an impact', () => {
      const script = buildSceneScript(environment, 3, SEED);
      for (const event of script.events) {
        if (['fire', 'blast', 'shards', 'sparks', 'debris'].includes(event.hazard)) {
          expect(event.impacts.some(impact => ['fire', 'blast', 'shatter', 'spark', 'debris'].includes(impact.effect))).toBe(true);
        }
      }
    });
  });
}
