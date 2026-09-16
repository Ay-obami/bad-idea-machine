import type { EnvironmentId, SceneActorDefinition, ScenePoint } from './types';

export type EnvironmentDefinition = Readonly<{
  id: EnvironmentId;
  label: string;
  shortLabel: string;
  actors: readonly SceneActorDefinition[];
  impactZones: Readonly<Record<string, ScenePoint>>;
  ambientCue: string;
}>;

function actor(
  id: string,
  assetId: string,
  x: number,
  y: number,
  rotation: number,
  scale: number,
  zIndex: number,
  ariaLabel: string,
): SceneActorDefinition {
  return { id, assetId, home: { x, y }, rotation, scale, zIndex, ariaLabel };
}

const kitchenActors: readonly SceneActorDefinition[] = [
  actor('kitchen-toaster', 'toaster', 150, 355, -2, 1, 32, 'Toaster'),
  actor('kitchen-toast', 'toast', 160, 305, -8, .82, 38, 'Toast projectile'),
  actor('kitchen-pan', 'pan', 470, 285, 11, .95, 36, 'Frying pan'),
  actor('kitchen-kettle', 'kettle', 615, 350, -3, .95, 35, 'Kettle'),
  actor('kitchen-cabinet', 'cabinet-right', 320, 145, 0, 1, 18, 'Cabinet door'),
  actor('kitchen-plates', 'plates', 435, 155, 0, .9, 24, 'Stack of plates'),
  actor('kitchen-ball', 'ball', 790, 115, 0, .9, 42, 'Bowling ball'),
  actor('kitchen-rocket', 'rocket', 835, 425, -90, .9, 52, 'Kitchen rocket'),
  actor('kitchen-safe', 'safe', 690, 95, 0, .88, 55, 'Suspended safe'),
];

const garageActors: readonly SceneActorDefinition[] = [
  actor('garage-hammer', 'hammer', 165, 205, -18, 1, 40, 'Hammer'),
  actor('garage-wrench', 'wrench', 245, 180, 13, .9, 39, 'Wrench'),
  actor('garage-drill', 'drill', 350, 355, -6, 1, 43, 'Power drill'),
  actor('garage-saw', 'saw', 470, 350, 0, .95, 42, 'Circular saw'),
  actor('garage-chain', 'chain', 585, 135, 0, 1, 34, 'Hanging chain'),
  actor('garage-tire', 'tire', 115, 445, 0, 1, 48, 'Loose tire'),
  actor('garage-rocket', 'rocket', 825, 365, -90, .9, 54, 'Workshop rocket'),
  actor('garage-tank', 'tank', 895, 420, 0, 1, 33, 'Compressed gas tank'),
  actor('garage-toolbox', 'toolbox', 525, 445, 0, 1, 31, 'Toolbox'),
  actor('garage-shelf', 'shelf', 760, 155, 0, 1, 22, 'Loaded metal shelf'),
  actor('garage-safe', 'safe', 865, 95, 0, .88, 56, 'Suspended safe'),
];

export const ENVIRONMENTS: Readonly<Record<EnvironmentId, EnvironmentDefinition>> = {
  kitchen: {
    id: 'kitchen',
    label: 'KITCHEN MELTDOWN',
    shortLabel: 'KITCHEN',
    actors: kitchenActors,
    impactZones: {
      leftCounter: { x: 185, y: 365 },
      stove: { x: 485, y: 355 },
      sink: { x: 685, y: 385 },
      fridge: { x: 895, y: 300 },
      floorCenter: { x: 515, y: 500 },
      ceilingLeft: { x: 310, y: 80 },
      ceilingRight: { x: 735, y: 80 },
      core: { x: 515, y: 455 },
    },
    ambientCue: 'kitchen-appliance-hum',
  },
  garage: {
    id: 'garage',
    label: 'GARAGE MAYHEM',
    shortLabel: 'GARAGE',
    actors: garageActors,
    impactZones: {
      workbench: { x: 380, y: 365 },
      toolWall: { x: 300, y: 180 },
      floorCenter: { x: 515, y: 500 },
      tireLane: { x: 665, y: 480 },
      shelf: { x: 770, y: 190 },
      tank: { x: 895, y: 420 },
      ceiling: { x: 700, y: 75 },
      core: { x: 600, y: 470 },
    },
    ambientCue: 'garage-transformer-hum',
  },
};

export function getEnvironmentDefinition(environment: EnvironmentId): EnvironmentDefinition {
  return ENVIRONMENTS[environment];
}
