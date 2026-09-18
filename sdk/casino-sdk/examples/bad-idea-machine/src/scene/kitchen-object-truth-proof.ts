import {
  KITCHEN_INTACT_ATLAS,
  KITCHEN_INTACT_DRAW_ORDER,
} from './kitchen-intact-atlas';

export type KitchenObjectTruthId = 'pan' | 'toaster';

export type KitchenObjectTruthObject = Readonly<{
  id: KitchenObjectTruthId;
  label: string;
  bodyFrame: keyof typeof KITCHEN_INTACT_ATLAS.frames;
  shadowFrame: keyof typeof KITCHEN_INTACT_ATLAS.frames;
  focus: Readonly<{ x: number; y: number; width: number; height: number }>;
}>;

export const KITCHEN_OBJECT_TRUTH_OBJECTS: readonly KitchenObjectTruthObject[] = [
  {
    id: 'pan',
    label: 'Pan',
    bodyFrame: 'prop/pan/resting',
    shadowFrame: 'prop/pan/shadow',
    focus: { x: 310, y: 230, width: 285, height: 135 },
  },
  {
    id: 'toaster',
    label: 'Toaster',
    bodyFrame: 'prop/toaster/resting',
    shadowFrame: 'prop/toaster/shadow',
    focus: { x: 575, y: 195, width: 185, height: 160 },
  },
] as const;

export function kitchenObjectTruthDrawOrder(
  objectId: KitchenObjectTruthId,
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly (keyof typeof KITCHEN_INTACT_ATLAS.frames)[] {
  const object = KITCHEN_OBJECT_TRUTH_OBJECTS.find(item => item.id === objectId);
  if (!object) throw new Error(`Unknown Kitchen truth object: ${objectId}`);

  return KITCHEN_INTACT_DRAW_ORDER.filter(id => {
    if (id === object.bodyFrame) return bodyVisible;
    if (id === object.shadowFrame) return shadowVisible;
    return true;
  });
}

export function validateKitchenObjectTruthProof(): readonly string[] {
  const errors: string[] = [];

  for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
    const body = KITCHEN_INTACT_ATLAS.frames[object.bodyFrame];
    const shadow = KITCHEN_INTACT_ATLAS.frames[object.shadowFrame];

    if (!body) errors.push(`${object.id}: missing body frame`);
    if (!shadow) errors.push(`${object.id}: missing shadow frame`);

    if (body?.kind !== 'prop') errors.push(`${object.id}: body frame is not a prop layer`);
    if (shadow?.kind !== 'shadow') errors.push(`${object.id}: shadow frame is not a shadow layer`);

    const { x, y, width, height } = object.focus;
    if (x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
      errors.push(`${object.id}: focus region outside logical canvas`);
    }
  }

  return errors;
}
