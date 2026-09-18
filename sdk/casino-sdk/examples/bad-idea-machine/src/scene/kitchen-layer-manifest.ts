import type { OutcomeTier } from '../lib/badIdea';
import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  type KitchenDestructibleZoneId,
  type KitchenPermanentZoneId,
  type KitchenPropId,
} from './kitchen-destruction-blueprint';

export type KitchenLayerAssetKind =
  | 'permanent-shell'
  | 'shell-overlay'
  | 'zone-state'
  | 'zone-mask'
  | 'prop-state'
  | 'prop-mask'
  | 'prop-shadow'
  | 'full-frame-aftermath';

export type KitchenLayerAsset = Readonly<{
  id: string;
  kind: KitchenLayerAssetKind;
  ownerId: string;
  state?: string;
  path: string;
}>;

const shellAsset: KitchenLayerAsset = {
  id: 'shell/permanent',
  kind: 'permanent-shell',
  ownerId: 'kitchen',
  state: 'base',
  path: '/rooms/kitchen/layers/shell/permanent.webp',
};

const permanentZones = KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(
  (zone): zone is (typeof KITCHEN_DESTRUCTION_BLUEPRINT.zones)[number] & { id: KitchenPermanentZoneId } =>
    zone.kind === 'permanent',
);

const shellOverlayAssets: readonly KitchenLayerAsset[] = permanentZones.flatMap(zone =>
  zone.states.map(state => ({
    id: `shell/${zone.id}/${state}`,
    kind: 'shell-overlay' as const,
    ownerId: zone.id,
    state,
    path: `/rooms/kitchen/layers/shell/${zone.id}/${state}.webp`,
  })),
);

const destructibleZones = KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(
  (zone): zone is (typeof KITCHEN_DESTRUCTION_BLUEPRINT.zones)[number] & { id: KitchenDestructibleZoneId } =>
    zone.kind === 'destructible',
);

const zoneStateAssets: readonly KitchenLayerAsset[] = destructibleZones.flatMap(zone =>
  zone.states.map(state => ({
    id: `zone/${zone.id}/${state}`,
    kind: 'zone-state' as const,
    ownerId: zone.id,
    state,
    path: `/rooms/kitchen/layers/zones/${zone.id}/${state}.webp`,
  })),
);

const zoneMaskAssets: readonly KitchenLayerAsset[] = destructibleZones.map(zone => ({
  id: `zone/${zone.id}/mask`,
  kind: 'zone-mask' as const,
  ownerId: zone.id,
  path: `/rooms/kitchen/layers/zones/${zone.id}/mask.webp`,
}));

const propStateAssets: readonly KitchenLayerAsset[] = KITCHEN_DESTRUCTION_BLUEPRINT.props.flatMap(prop =>
  prop.states.map(state => ({
    id: `prop/${prop.id}/${state}`,
    kind: 'prop-state' as const,
    ownerId: prop.id,
    state,
    path: `/rooms/kitchen/layers/props/${prop.id}/${state}.webp`,
  })),
);

const propMaskAssets: readonly KitchenLayerAsset[] = KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => ({
  id: `prop/${prop.id}/mask`,
  kind: 'prop-mask' as const,
  ownerId: prop.id,
  path: `/rooms/kitchen/layers/props/${prop.id}/mask.webp`,
}));

const propShadowAssets: readonly KitchenLayerAsset[] = KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => ({
  id: `prop/${prop.id}/shadow`,
  kind: 'prop-shadow' as const,
  ownerId: prop.id,
  path: `/rooms/kitchen/layers/props/${prop.id}/shadow.webp`,
}));

export const KITCHEN_LAYER_ASSETS: readonly KitchenLayerAsset[] = [
  shellAsset,
  ...shellOverlayAssets,
  ...zoneStateAssets,
  ...zoneMaskAssets,
  ...propStateAssets,
  ...propMaskAssets,
  ...propShadowAssets,
];

function assetFor(
  kind: 'zone-state' | 'prop-state',
  ownerId: KitchenDestructibleZoneId | KitchenPropId,
  state: string,
): KitchenLayerAsset {
  const asset = KITCHEN_LAYER_ASSETS.find(candidate =>
    candidate.kind === kind && candidate.ownerId === ownerId && candidate.state === state,
  );

  if (!asset) throw new Error(`Missing Kitchen layer asset: ${kind}/${ownerId}/${state}`);
  return asset;
}

export function kitchenAssetsForTier(tier: OutcomeTier): readonly KitchenLayerAsset[] {
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];

  const shellLayers = permanentZones.map(zone => {
    const state = composition.shellStates[zone.id];
    const asset = KITCHEN_LAYER_ASSETS.find(candidate =>
      candidate.kind === 'shell-overlay' && candidate.ownerId === zone.id && candidate.state === state,
    );
    if (!asset) throw new Error(`Missing Kitchen shell overlay: ${zone.id}/${state}`);
    return asset;
  });

  const zoneLayers = destructibleZones.map(zone =>
    assetFor('zone-state', zone.id, composition.zoneStates[zone.id]),
  );

  const propLayers = KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop =>
    assetFor('prop-state', prop.id, composition.propStates[prop.id]),
  );

  return [
    shellAsset,
    ...shellLayers,
    ...zoneLayers,
    ...propLayers,
    ...zoneMaskAssets,
    ...propMaskAssets,
    ...propShadowAssets,
  ];
}

export function validateKitchenLayerManifest(): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const asset of KITCHEN_LAYER_ASSETS) {
    if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`);
    ids.add(asset.id);

    if (paths.has(asset.path)) errors.push(`duplicate asset path: ${asset.path}`);
    paths.add(asset.path);

    if (asset.kind === 'full-frame-aftermath') {
      errors.push(`forbidden full-frame aftermath: ${asset.id}`);
    }
  }

  for (const zone of permanentZones) {
    for (const state of zone.states) {
      if (!KITCHEN_LAYER_ASSETS.some(asset =>
        asset.kind === 'shell-overlay' && asset.ownerId === zone.id && asset.state === state,
      )) {
        errors.push(`missing shell overlay: ${zone.id}/${state}`);
      }
    }
  }

  for (const zone of destructibleZones) {
    for (const state of zone.states) {
      if (!KITCHEN_LAYER_ASSETS.some(asset =>
        asset.kind === 'zone-state' && asset.ownerId === zone.id && asset.state === state,
      )) {
        errors.push(`missing zone state: ${zone.id}/${state}`);
      }
    }

    if (!KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'zone-mask' && asset.ownerId === zone.id)) {
      errors.push(`missing zone mask: ${zone.id}`);
    }
  }

  for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
    for (const state of prop.states) {
      if (!KITCHEN_LAYER_ASSETS.some(asset =>
        asset.kind === 'prop-state' && asset.ownerId === prop.id && asset.state === state,
      )) {
        errors.push(`missing prop state: ${prop.id}/${state}`);
      }
    }

    if (!KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'prop-mask' && asset.ownerId === prop.id)) {
      errors.push(`missing prop mask: ${prop.id}`);
    }

    if (!KITCHEN_LAYER_ASSETS.some(asset => asset.kind === 'prop-shadow' && asset.ownerId === prop.id)) {
      errors.push(`missing prop shadow: ${prop.id}`);
    }
  }

  for (const tier of [0, 1, 2, 3, 4] as const) {
    try {
      kitchenAssetsForTier(tier);
    } catch (error) {
      errors.push(`tier ${tier}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return errors;
}
