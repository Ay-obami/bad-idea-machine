import { KITCHEN_DESTRUCTION_BLUEPRINT } from './kitchen-destruction-blueprint';

export type KitchenAtlasFrame = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  destX: number;
  destY: number;
  kind: 'shell' | 'zone' | 'shadow' | 'prop';
}>;

export const KITCHEN_INTACT_ATLAS = {
  url: 'https://cdn.creativeclaw.co/u/534269cc/images/2d531b2f-6089-4297-a4eb-e93de30b0bad.png',
  width: 2048,
  height: 864,
  metrics: {
    mae: 0.14555722222222223,
    p99: 4,
    max: 56,
    exactPixelFraction: 0.9428183333333333,
  },
  frames: {
    'shell/permanent': { x: 3, y: 3, width: 1000, height: 600, destX: 0, destY: 0, kind: 'shell' },
    'zone/sink-run/intact': { x: 1006, y: 3, width: 170, height: 300, destX: 830, destY: 300, kind: 'zone' },
    'zone/stove-range/intact': { x: 1179, y: 3, width: 265, height: 265, destX: 337, destY: 286, kind: 'zone' },
    'zone/plate-cabinet/intact': { x: 1447, y: 3, width: 205, height: 173, destX: 565, destY: 0, kind: 'zone' },
    'zone/upper-stove-cabinet/intact': { x: 1655, y: 3, width: 225, height: 170, destX: 350, destY: 0, kind: 'zone' },
    'zone/right-lower-cabinet/intact': { x: 3, y: 606, width: 230, height: 168, destX: 600, destY: 402, kind: 'zone' },
    'zone/backsplash/intact': { x: 236, y: 606, width: 520, height: 150, destX: 315, destY: 165, kind: 'zone' },
    'prop/oven-towel/shadow': { x: 759, y: 606, width: 82, height: 140, destX: 446, destY: 380, kind: 'shadow' },
    'prop/oven-towel/hanging': { x: 844, y: 606, width: 74, height: 131, destX: 450, destY: 384, kind: 'prop' },
    'zone/right-counter/intact': { x: 921, y: 606, width: 280, height: 120, destX: 600, destY: 285, kind: 'zone' },
    'prop/toaster/shadow': { x: 1204, y: 606, width: 94, height: 97, destX: 616, destY: 232, kind: 'shadow' },
    'prop/kettle/shadow': { x: 1301, y: 606, width: 78, height: 92, destX: 739, destY: 229, kind: 'shadow' },
    'zone/floor-center/intact': { x: 1382, y: 606, width: 610, height: 90, destX: 245, destY: 510, kind: 'zone' },
    'prop/kettle/resting': { x: 3, y: 777, width: 70, height: 84, destX: 743, destY: 233, kind: 'prop' },
    'prop/toaster/resting': { x: 76, y: 777, width: 86, height: 74, destX: 620, destY: 251, kind: 'prop' },
    'prop/pan/shadow': { x: 165, y: 777, width: 155, height: 50, destX: 362, destY: 266, kind: 'shadow' },
    'prop/pan/resting': { x: 323, y: 777, width: 147, height: 42, destX: 366, destY: 270, kind: 'prop' },
    'prop/plate-stack/shadow': { x: 473, y: 777, width: 69, height: 37, destX: 573, destY: 83, kind: 'shadow' },
    'prop/plate-stack/stacked': { x: 545, y: 777, width: 61, height: 20, destX: 577, destY: 96, kind: 'prop' },
    'prop/toast-stack/stacked': { x: 609, y: 777, width: 48, height: 16, destX: 635, destY: 236, kind: 'prop' },
    'prop/toast/resting': { x: 660, y: 777, width: 30, height: 13, destX: 646, destY: 240, kind: 'prop' },
    'prop/hero-plate/resting': { x: 693, y: 777, width: 61, height: 10, destX: 577, destY: 88, kind: 'prop' },
  } satisfies Readonly<Record<string, KitchenAtlasFrame>>,
} as const;

export const KITCHEN_INTACT_DRAW_ORDER = [
  'shell/permanent',
  'zone/plate-cabinet/intact',
  'zone/upper-stove-cabinet/intact',
  'zone/backsplash/intact',
  'zone/stove-range/intact',
  'zone/right-counter/intact',
  'zone/right-lower-cabinet/intact',
  'zone/sink-run/intact',
  'zone/floor-center/intact',
  'prop/oven-towel/shadow',
  'prop/toaster/shadow',
  'prop/kettle/shadow',
  'prop/pan/shadow',
  'prop/plate-stack/shadow',
  'prop/plate-stack/stacked',
  'prop/hero-plate/resting',
  'prop/toaster/resting',
  'prop/toast-stack/stacked',
  'prop/toast/resting',
  'prop/kettle/resting',
  'prop/pan/resting',
  'prop/oven-towel/hanging',
] as const;

export function propIdFromKitchenAtlasFrame(id: string): string | null {
  const match = /^prop\/([^/]+)\//.exec(id);
  return match?.[1] ?? null;
}

export function validateKitchenIntactAtlas(): readonly string[] {
  const errors: string[] = [];
  const frames = KITCHEN_INTACT_ATLAS.frames;

  if (!frames['shell/permanent']) errors.push('missing permanent shell');

  for (const zone of KITCHEN_DESTRUCTION_BLUEPRINT.zones) {
    if (zone.kind !== 'destructible') continue;
    if (!frames[`zone/${zone.id}/intact`]) errors.push(`missing intact zone: ${zone.id}`);
  }

  for (const prop of KITCHEN_DESTRUCTION_BLUEPRINT.props) {
    if (!frames[`prop/${prop.id}/${prop.defaultState}`]) {
      errors.push(`missing rest prop: ${prop.id}/${prop.defaultState}`);
    }
  }

  for (const [id, frame] of Object.entries(frames)) {
    if (frame.x < 0 || frame.y < 0 ||
        frame.x + frame.width > KITCHEN_INTACT_ATLAS.width ||
        frame.y + frame.height > KITCHEN_INTACT_ATLAS.height) {
      errors.push(`atlas frame outside source: ${id}`);
    }

    if (frame.destX < 0 || frame.destY < 0 ||
        frame.destX + frame.width > 1000 ||
        frame.destY + frame.height > 600) {
      errors.push(`atlas frame outside logical canvas: ${id}`);
    }
  }

  for (const id of KITCHEN_INTACT_DRAW_ORDER) {
    if (!frames[id]) errors.push(`draw order references missing frame: ${id}`);
  }

  return errors;
}
