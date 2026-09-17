import { describe, expect, it } from 'vitest';
import { getEnvironmentArt } from '../environments';
import { getEnvironmentDefinition } from './environments';

for (const environment of ['kitchen', 'garage'] as const) {
  describe(`${environment} scripted actors`, () => {
    it('resolves every actor to a room-native art asset', () => {
      const artIds = new Set(getEnvironmentArt(environment).objects.map(object => object.id));
      for (const actor of getEnvironmentDefinition(environment).actors) {
        expect(artIds.has(actor.assetId), `${actor.id} -> ${actor.assetId}`).toBe(true);
      }
    });
  });
}
