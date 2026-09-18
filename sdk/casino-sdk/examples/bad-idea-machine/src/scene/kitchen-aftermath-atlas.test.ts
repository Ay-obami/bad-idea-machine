import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import {
  KITCHEN_AFTERMATH_ZONE_ATLAS,
  kitchenAftermathZoneFrame,
  validateKitchenAftermathZoneAtlas,
} from './kitchen-aftermath-atlas';

describe('kitchen aftermath zone atlas', () => {
  it('contains one registered crop for every shell/zone in every tier', () => {
    expect(validateKitchenAftermathZoneAtlas()).toEqual([]);

    for (const tier of [0, 1, 2, 3, 4] as const) {
      for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones) {
        const frame = kitchenAftermathZoneFrame(tier, zone.id);
        expect(frame.destX).toBe(zone.bounds.x);
        expect(frame.destY).toBe(zone.bounds.y);
        expect(frame.width).toBe(zone.bounds.width);
        expect(frame.height).toBe(zone.bounds.height);
      }
    }
  });

  it('keeps every atlas frame inside the baked source image', () => {
    for (const frame of Object.values(KITCHEN_AFTERMATH_ZONE_ATLAS.frames)) {
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(KITCHEN_AFTERMATH_ZONE_ATLAS.width);
      expect(frame.y + frame.height).toBeLessThanOrEqual(KITCHEN_AFTERMATH_ZONE_ATLAS.height);
    }
  });

  it('is a local-zone atlas, never a full-frame tier outcome', () => {
    expect(KITCHEN_AFTERMATH_ZONE_ATLAS.role).toBe('registered-local-zone-source');
    expect(Object.values(KITCHEN_AFTERMATH_ZONE_ATLAS.frames)
      .some(frame => frame.width === 1000 && frame.height === 600)).toBe(false);
  });
});
