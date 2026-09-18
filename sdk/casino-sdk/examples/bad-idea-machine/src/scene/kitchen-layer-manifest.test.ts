import { describe, expect, it } from 'vitest';

import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';
import {
  KITCHEN_LAYER_ASSETS,
  kitchenAssetsForTier,
  validateKitchenLayerManifest,
} from './kitchen-layer-manifest';

describe('kitchen layer manifest', () => {
  it('covers every authored shell, zone and prop state', () => {
    expect(validateKitchenLayerManifest()).toEqual([]);

    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'permanent')) {
      for (const state of zone.states) {
        expect(KITCHEN_LAYER_ASSETS.some(asset =>
          asset.kind === 'shell-overlay' && asset.ownerId === zone.id && asset.state === state,
        )).toBe(true);
      }
    }

    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible')) {
      for (const state of zone.states) {
        expect(KITCHEN_LAYER_ASSETS.some(asset =>
          asset.kind === 'zone-state' && asset.ownerId === zone.id && asset.state === state,
        )).toBe(true);
      }
    }

    for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
      for (const state of prop.states) {
        expect(KITCHEN_LAYER_ASSETS.some(asset =>
          asset.kind === 'prop-state' && asset.ownerId === prop.id && asset.state === state,
        )).toBe(true);
      }
    }
  });

  it('requires masks and contact shadows for every controllable component', () => {
    for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible')) {
      expect(KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'zone-mask' && asset.ownerId === zone.id)).toBe(true);
    }

    for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
      expect(KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'prop-mask' && asset.ownerId === prop.id)).toBe(true);
      expect(KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'prop-shadow' && asset.ownerId === prop.id)).toBe(true);
    }
  });

  it('resolves every tier from the same permanent shell plus local layers', () => {
    const signatures = new Set<string>();

    for (const tier of [0, 1, 2, 3, 4] as const) {
      const assets = kitchenAssetsForTier(tier);
      expect(assets[0].kind).toBe('permanent-shell');
      expect(assets.filter(asset => asset.kind === 'zone-state')).toHaveLength(
        KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible').length,
      );
      expect(assets.filter(asset => asset.kind === 'prop-state')).toHaveLength(
        KITCHEN_DESTRUCTION_BLUEPRINT.props.length,
      );
      expect(assets.some(asset => asset.kind === 'full-frame-aftermath')).toBe(false);
      signatures.add(assets.map(asset => asset.id).join('|'));
    }

    expect(signatures.size).toBe(5);
  });
});
