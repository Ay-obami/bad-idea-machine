import type { OutcomeTier } from '../lib/badIdea';
import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  type KitchenPropId,
  type KitchenZoneId,
  type KitchenPermanentZoneId,
  type KitchenDestructibleZoneId,
} from './kitchen-destruction-blueprint';

export type KitchenTerminalLayerKind =
  | 'architecture'
  | 'prop'
  | 'shadow'
  | 'debris'
  | 'hazard'
  | 'full-frame';

export type KitchenTerminalLayer = Readonly<{
  id: string;
  tier: OutcomeTier;
  kind: KitchenTerminalLayerKind;
  ownerId: string;
  state: string;
  path: string;
}>;

export type KitchenTerminalTierPlan = Readonly<{
  architecture: readonly KitchenTerminalLayer[];
  props: readonly KitchenTerminalLayer[];
  shadows: readonly KitchenTerminalLayer[];
  debris: readonly KitchenTerminalLayer[];
  hazards: readonly KitchenTerminalLayer[];
}>;

const TIERS = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];

const debrisStates: Readonly<Record<OutcomeTier, Readonly<{
  'ceramic-debris': string;
  'cabinet-debris': string;
  'floor-debris': string;
}>>> = {
  0: {
    'ceramic-debris': 'heavy-shattered',
    'cabinet-debris': 'damaged-panels',
    'floor-debris': 'heavy-mixed',
  },
  1: {
    'ceramic-debris': 'one-plate-shards',
    'cabinet-debris': 'none',
    'floor-debris': 'light-local',
  },
  2: {
    'ceramic-debris': 'moderate-shards',
    'cabinet-debris': 'light-hardware',
    'floor-debris': 'ceramic-local',
  },
  3: {
    'ceramic-debris': 'broad-shards',
    'cabinet-debris': 'broken-panels',
    'floor-debris': 'mixed-broad',
  },
  4: {
    'ceramic-debris': 'max-shattered',
    'cabinet-debris': 'collapsed-panels',
    'floor-debris': 'maximum-field',
  },
};

function architectureLayers(tier: OutcomeTier): readonly KitchenTerminalLayer[] {
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];

  return KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => {
    const state = zone.kind === 'permanent'
      ? composition.shellStates[zone.id as KitchenPermanentZoneId]
      : composition.zoneStates[zone.id as KitchenDestructibleZoneId];

    return {
      id: `tier/${tier}/architecture/${zone.id}/${state}`,
      tier,
      kind: 'architecture' as const,
      ownerId: zone.id,
      state,
      path: `/rooms/kitchen/terminal/shared/architecture/${zone.id}/${state}.webp`,
    };
  });
}

function propLayers(tier: OutcomeTier): readonly KitchenTerminalLayer[] {
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];

  return KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => {
    const state = composition.propStates[prop.id];

    return {
      id: `tier/${tier}/prop/${prop.id}/${state}`,
      tier,
      kind: 'prop' as const,
      ownerId: prop.id,
      state,
      path: `/rooms/kitchen/terminal/shared/props/${prop.id}/${state}.webp`,
    };
  });
}

function shadowLayers(tier: OutcomeTier): readonly KitchenTerminalLayer[] {
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];

  return KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => {
    const state = composition.propStates[prop.id];

    return {
      id: `tier/${tier}/shadow/${prop.id}/${state}`,
      tier,
      kind: 'shadow' as const,
      ownerId: prop.id,
      state,
      path: `/rooms/kitchen/terminal/shared/shadows/${prop.id}/${state}.webp`,
    };
  });
}

function debrisLayers(tier: OutcomeTier): readonly KitchenTerminalLayer[] {
  return Object.entries(debrisStates[tier]).filter(([, state]) => state !== 'none').map(([ownerId, state]) => ({
    id: `tier/${tier}/debris/${ownerId}/${state}`,
    tier,
    kind: 'debris' as const,
    ownerId,
    state,
    path: `/rooms/kitchen/terminal/shared/debris/${ownerId}/${state}.webp`,
  }));
}

function hazardLayers(tier: OutcomeTier): readonly KitchenTerminalLayer[] {
  const hazards = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier].hazards;

  return [
    {
      id: `tier/${tier}/hazard/fire/${hazards.fire}`,
      tier,
      kind: 'hazard' as const,
      ownerId: 'fire',
      state: hazards.fire,
      path: `/rooms/kitchen/terminal/shared/hazards/fire/${hazards.fire}.webp`,
    },
    {
      id: `tier/${tier}/hazard/smoke/${hazards.smoke}`,
      tier,
      kind: 'hazard' as const,
      ownerId: 'smoke',
      state: hazards.smoke,
      path: `/rooms/kitchen/terminal/shared/hazards/smoke/${hazards.smoke}.webp`,
    },
    {
      id: `tier/${tier}/hazard/power/${hazards.power}`,
      tier,
      kind: 'hazard' as const,
      ownerId: 'power',
      state: hazards.power,
      path: `/rooms/kitchen/terminal/shared/hazards/power/${hazards.power}.webp`,
    },
  ].filter(layer => layer.state !== 'none' && layer.state !== 'normal');
}

export const KITCHEN_TERMINAL_LAYER_PLAN: readonly KitchenTerminalLayer[] = TIERS.flatMap(tier => [
  ...architectureLayers(tier),
  ...propLayers(tier),
  ...shadowLayers(tier),
  ...debrisLayers(tier),
  ...hazardLayers(tier),
]);

export function kitchenTerminalLayersForTier(tier: OutcomeTier): KitchenTerminalTierPlan {
  const layers = KITCHEN_TERMINAL_LAYER_PLAN.filter(layer => layer.tier === tier);

  return {
    architecture: layers.filter(layer => layer.kind === 'architecture'),
    props: layers.filter(layer => layer.kind === 'prop'),
    shadows: layers.filter(layer => layer.kind === 'shadow'),
    debris: layers.filter(layer => layer.kind === 'debris'),
    hazards: layers.filter(layer => layer.kind === 'hazard'),
  };
}

export function validateKitchenTerminalLayerPlan(): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const paths = new Map<string, string>();
  const sourcesByState = new Map<string, string>();

  for (const layer of KITCHEN_TERMINAL_LAYER_PLAN) {
    if (ids.has(layer.id)) errors.push(`duplicate terminal layer id: ${layer.id}`);
    ids.add(layer.id);

    const stateKey = `${layer.kind}/${layer.ownerId}/${layer.state}`;
    const previous = paths.get(layer.path);
    if (previous && previous !== stateKey) errors.push(`conflicting terminal layer path: ${layer.path}`);
    paths.set(layer.path, stateKey);
    const source = sourcesByState.get(stateKey);
    if (source && source !== layer.path) errors.push(`state has conflicting terminal sources: ${stateKey}`);
    sourcesByState.set(stateKey, layer.path);

    if (layer.kind === 'full-frame') {
      errors.push(`forbidden full-frame terminal layer: ${layer.id}`);
    }
  }

  for (const tier of TIERS) {
    const plan = kitchenTerminalLayersForTier(tier);
    const expectedZoneIds = new Set<KitchenZoneId>(
      KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => zone.id),
    );
    const expectedPropIds = new Set<KitchenPropId>(
      KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => prop.id),
    );

    const architectureIds = new Set(plan.architecture.map(layer => layer.ownerId as KitchenZoneId));
    const propIds = new Set(plan.props.map(layer => layer.ownerId as KitchenPropId));
    const shadowIds = new Set(plan.shadows.map(layer => layer.ownerId as KitchenPropId));

    if (architectureIds.size !== expectedZoneIds.size ||
        [...expectedZoneIds].some(id => !architectureIds.has(id))) {
      errors.push(`tier ${tier}: incomplete architecture ownership`);
    }

    if (propIds.size !== expectedPropIds.size ||
        [...expectedPropIds].some(id => !propIds.has(id))) {
      errors.push(`tier ${tier}: incomplete prop ownership`);
    }

    if (shadowIds.size !== expectedPropIds.size ||
        [...expectedPropIds].some(id => !shadowIds.has(id))) {
      errors.push(`tier ${tier}: incomplete prop shadow ownership`);
    }

    const debrisOwners = new Set(plan.debris.map(layer => layer.ownerId));
    for (const required of Object.entries(debrisStates[tier]).filter(([, state]) => state !== 'none').map(([owner]) => owner)) {
      if (!debrisOwners.has(required)) errors.push(`tier ${tier}: missing debris family ${required}`);
    }

    const hazardOwners = new Set(plan.hazards.map(layer => layer.ownerId));
    for (const required of Object.entries(KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier].hazards)
      .filter(([, state]) => state !== 'none' && state !== 'normal').map(([owner]) => owner)) {
      if (!hazardOwners.has(required)) errors.push(`tier ${tier}: missing hazard layer ${required}`);
    }
  }

  return errors;
}
