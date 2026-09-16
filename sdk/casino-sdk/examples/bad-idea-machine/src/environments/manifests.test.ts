import { describe, expect, it } from 'vitest';
import { getEnvironmentArt } from './index';

const expectedAftermathKeys = ['failure', 'minor', 'moderate', 'severe', 'legendary'] as const;

for (const environment of ['kitchen', 'garage'] as const) {
  describe(`${environment} art manifest`, () => {
    it('has one clean plate, six gallery states, and five distinct aftermath plates', () => {
      const art = getEnvironmentArt(environment);
      expect(art.cleanPlate).toMatch(/^\/rooms\//);
      expect(Object.keys(art.gallery)).toEqual(['before', ...expectedAftermathKeys]);
      expect(Object.keys(art.aftermaths)).toEqual([...expectedAftermathKeys]);
      expect(new Set(Object.values(art.aftermaths)).size).toBe(5);
    });

    it('gives every interactive object a physical origin and pivot', () => {
      const art = getEnvironmentArt(environment);
      for (const object of art.objects) {
        expect(object.originZone.length).toBeGreaterThan(0);
        expect(object.home.x).toBeGreaterThanOrEqual(0);
        expect(object.home.x).toBeLessThanOrEqual(1000);
        expect(object.home.y).toBeGreaterThanOrEqual(0);
        expect(object.home.y).toBeLessThanOrEqual(600);
        expect(object.pivot.x).toBeGreaterThanOrEqual(0);
        expect(object.pivot.y).toBeGreaterThanOrEqual(0);
      }
    });
  });
}
