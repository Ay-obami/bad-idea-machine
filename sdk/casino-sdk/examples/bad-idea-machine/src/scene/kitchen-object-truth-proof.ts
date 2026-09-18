export type KitchenObjectTruthId = 'pan' | 'toaster';

export type KitchenObjectTruthFrame = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  destX: number;
  destY: number;
  kind: 'support' | 'shadow' | 'body';
}>;

export const KITCHEN_OBJECT_TRUTH_ATLAS = {
  url: '/rooms/kitchen/rebuild/proof/object-extraction-v1.webp',
  width: 512,
  height: 386,
  source: 'container-extracted-approved-master' as const,
  frames: {
    'pan/support': { x: 4, y: 4, width: 240, height: 110, destX: 325, destY: 235, kind: 'support' },
    'pan/body': { x: 248, y: 4, width: 240, height: 110, destX: 325, destY: 235, kind: 'body' },
    'pan/shadow': { x: 4, y: 118, width: 240, height: 110, destX: 325, destY: 235, kind: 'shadow' },
    'toaster/support': { x: 248, y: 118, width: 150, height: 130, destX: 585, destY: 205, kind: 'support' },
    'toaster/body': { x: 4, y: 252, width: 150, height: 130, destX: 585, destY: 205, kind: 'body' },
    'toaster/shadow': { x: 158, y: 252, width: 150, height: 130, destX: 585, destY: 205, kind: 'shadow' },
  } satisfies Readonly<Record<string, KitchenObjectTruthFrame>>,
} as const;

export type KitchenObjectTruthObject = Readonly<{
  id: KitchenObjectTruthId;
  label: string;
  supportFrame: keyof typeof KITCHEN_OBJECT_TRUTH_ATLAS.frames;
  bodyFrame: keyof typeof KITCHEN_OBJECT_TRUTH_ATLAS.frames;
  shadowFrame: keyof typeof KITCHEN_OBJECT_TRUTH_ATLAS.frames;
  focus: Readonly<{ x: number; y: number; width: number; height: number }>;
}>;

export const KITCHEN_OBJECT_TRUTH_OBJECTS: readonly KitchenObjectTruthObject[] = [
  {
    id: 'pan',
    label: 'Pan',
    supportFrame: 'pan/support',
    bodyFrame: 'pan/body',
    shadowFrame: 'pan/shadow',
    focus: { x: 305, y: 220, width: 285, height: 145 },
  },
  {
    id: 'toaster',
    label: 'Toaster assembly',
    supportFrame: 'toaster/support',
    bodyFrame: 'toaster/body',
    shadowFrame: 'toaster/shadow',
    focus: { x: 565, y: 185, width: 200, height: 175 },
  },
] as const;

export function kitchenObjectTruthDrawOrder(
  objectId: KitchenObjectTruthId,
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly (keyof typeof KITCHEN_OBJECT_TRUTH_ATLAS.frames)[] {
  const object = KITCHEN_OBJECT_TRUTH_OBJECTS.find(item => item.id === objectId);
  if (!object) throw new Error(`Unknown Kitchen truth object: ${objectId}`);

  const order: (keyof typeof KITCHEN_OBJECT_TRUTH_ATLAS.frames)[] = [object.supportFrame];
  if (shadowVisible) order.push(object.shadowFrame);
  if (bodyVisible) order.push(object.bodyFrame);
  return order;
}

export function validateKitchenObjectTruthProof(): readonly string[] {
  const errors: string[] = [];

  if (!KITCHEN_OBJECT_TRUTH_ATLAS.url.startsWith('/rooms/')) {
    errors.push('truth atlas must be repository-local');
  }

  for (const [id, frame] of Object.entries(KITCHEN_OBJECT_TRUTH_ATLAS.frames)) {
    if (frame.x < 0 ||
        frame.y < 0 ||
        frame.x + frame.width > KITCHEN_OBJECT_TRUTH_ATLAS.width ||
        frame.y + frame.height > KITCHEN_OBJECT_TRUTH_ATLAS.height) {
      errors.push(`${id}: frame outside atlas`);
    }

    if (frame.destX < 0 ||
        frame.destY < 0 ||
        frame.destX + frame.width > 1000 ||
        frame.destY + frame.height > 600) {
      errors.push(`${id}: destination outside logical canvas`);
    }
  }

  for (const object of KITCHEN_OBJECT_TRUTH_OBJECTS) {
    const support = KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.supportFrame];
    const body = KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.bodyFrame];
    const shadow = KITCHEN_OBJECT_TRUTH_ATLAS.frames[object.shadowFrame];

    if (!support || support.kind !== 'support') errors.push(`${object.id}: invalid support frame`);
    if (!body || body.kind !== 'body') errors.push(`${object.id}: invalid body frame`);
    if (!shadow || shadow.kind !== 'shadow') errors.push(`${object.id}: invalid shadow frame`);

    const sameRegistration =
      support?.destX === body?.destX &&
      support?.destY === body?.destY &&
      support?.width === body?.width &&
      support?.height === body?.height &&
      support?.destX === shadow?.destX &&
      support?.destY === shadow?.destY &&
      support?.width === shadow?.width &&
      support?.height === shadow?.height;

    if (!sameRegistration) errors.push(`${object.id}: support/body/shadow registration mismatch`);

    const { x, y, width, height } = object.focus;
    if (x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
      errors.push(`${object.id}: focus region outside logical canvas`);
    }
  }

  return errors;
}
