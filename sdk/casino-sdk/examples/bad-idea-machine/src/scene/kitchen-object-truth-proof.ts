export type KitchenPanTruthLayer = 'support' | 'shadow' | 'body';
export type KitchenToastTruthLayer = 'support' | 'shadow' | 'body';
export type KitchenTowelTruthLayer = 'support' | 'shadow' | 'body';
export type KitchenPlateTruthLayer = 'support' | 'stackShadow' | 'stackBody' | 'heroShadow' | 'heroBody';

export type KitchenTruthAtlasFrame = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export const KITCHEN_PAN_TRUTH = {
  referenceUrl: '/rooms/kitchen/rebuild/truth/pan-reference.webp',
  supportUrl: '/rooms/kitchen/rebuild/truth/pan-support.webp',
  bodyUrl: '/rooms/kitchen/rebuild/truth/pan-body.webp',
  shadowUrl: '/rooms/kitchen/rebuild/truth/pan-shadow.webp',
  width: 240,
  height: 110,
  logicalBounds: {
    x: 325,
    y: 235,
    width: 240,
    height: 110,
  },
  source: 'approved-master-local-extraction' as const,
  role: 'single-object-truth-gate' as const,
} as const;

export const KITCHEN_TOAST_TRUTH = {
  atlasUrl: '/rooms/kitchen/rebuild/truth/toast-truth-atlas.webp',
  atlasWidth: 304,
  atlasHeight: 165,
  cropWidth: 150,
  cropHeight: 130,
  logicalBounds: {
    x: 585,
    y: 205,
    width: 150,
    height: 130,
  },
  frames: {
    reference: { x: 0, y: 0, width: 150, height: 130 },
    support: { x: 152, y: 0, width: 150, height: 130 },
    body: { x: 0, y: 132, width: 37, height: 19 },
    shadow: { x: 40, y: 132, width: 35, height: 18 },
    face: { x: 80, y: 132, width: 41, height: 31 },
  } satisfies Readonly<Record<'reference' | 'support' | 'body' | 'shadow' | 'face', KitchenTruthAtlasFrame>>,
  restPlacement: {
    body: { x: 58, y: 32 },
    shadow: { x: 60, y: 33 },
  },
  source: 'approved-master-local-extraction' as const,
  hiddenFaceSource: 'deterministic-local-reconstruction-from-approved-toast-pixels' as const,
  role: 'single-object-truth-gate' as const,
} as const;

export const KITCHEN_TOWEL_TRUTH = {
  atlasUrl: '/rooms/kitchen/rebuild/truth/towel-truth-atlas.webp',
  atlasWidth: 252,
  atlasHeight: 325,
  cropWidth: 125,
  cropHeight: 175,
  logicalBounds: {
    x: 430,
    y: 360,
    width: 125,
    height: 175,
  },
  frames: {
    reference: { x: 0, y: 0, width: 125, height: 175 },
    support: { x: 127, y: 0, width: 125, height: 175 },
    body: { x: 0, y: 177, width: 77, height: 143 },
    shadow: { x: 79, y: 177, width: 81, height: 148 },
  } satisfies Readonly<Record<'reference' | 'support' | 'body' | 'shadow', KitchenTruthAtlasFrame>>,
  restPlacement: {
    body: { x: 19, y: 16 },
    shadow: { x: 20, y: 16 },
  },
  source: 'approved-master-local-extraction' as const,
  supportSource: 'deterministic-local-oven-reconstruction' as const,
  role: 'single-object-truth-gate' as const,
} as const;

export const KITCHEN_PLATE_TRUTH = {
  atlasUrl: '/rooms/kitchen/rebuild/truth/plate-truth-atlas.webp',
  atlasWidth: 288,
  atlasHeight: 125,
  cropWidth: 135,
  cropHeight: 85,
  logicalBounds: { x: 555, y: 67, width: 135, height: 85 },
  frames: {
    reference: { x: 0, y: 0, width: 135, height: 85 },
    support: { x: 137, y: 0, width: 135, height: 85 },
    heroBody: { x: 0, y: 87, width: 70, height: 20 },
    heroShadow: { x: 72, y: 87, width: 70, height: 20 },
    stackBody: { x: 144, y: 87, width: 70, height: 33 },
    stackShadow: { x: 216, y: 87, width: 70, height: 18 },
  } satisfies Readonly<Record<'reference' | 'support' | 'heroBody' | 'heroShadow' | 'stackBody' | 'stackShadow', KitchenTruthAtlasFrame>>,
  restPlacement: {
    heroBody: { x: 18, y: 18 },
    heroShadow: { x: 18, y: 25 },
    stackBody: { x: 18, y: 24 },
    stackShadow: { x: 18, y: 44 },
  },
  source: 'approved-master-local-extraction' as const,
  supportSource: 'deterministic-local-cabinet-backing-reconstruction' as const,
  role: 'two-object-truth-gate' as const,
} as const;

export function kitchenPanTruthLayers(
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly KitchenPanTruthLayer[] {
  const layers: KitchenPanTruthLayer[] = ['support'];
  if (shadowVisible) layers.push('shadow');
  if (bodyVisible) layers.push('body');
  return layers;
}

export function kitchenToastTruthLayers(
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly KitchenToastTruthLayer[] {
  const layers: KitchenToastTruthLayer[] = ['support'];
  if (shadowVisible) layers.push('shadow');
  if (bodyVisible) layers.push('body');
  return layers;
}

export function kitchenTowelTruthLayers(
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly KitchenTowelTruthLayer[] {
  const layers: KitchenTowelTruthLayer[] = ['support'];
  if (shadowVisible) layers.push('shadow');
  if (bodyVisible) layers.push('body');
  return layers;
}

export function kitchenPlateTruthLayers(
  stackBodyVisible: boolean,
  stackShadowVisible: boolean,
  heroBodyVisible: boolean,
  heroShadowVisible: boolean,
): readonly KitchenPlateTruthLayer[] {
  const layers: KitchenPlateTruthLayer[] = ['support'];
  if (stackShadowVisible) layers.push('stackShadow');
  if (stackBodyVisible) layers.push('stackBody');
  if (heroShadowVisible) layers.push('heroShadow');
  if (heroBodyVisible) layers.push('heroBody');
  return layers;
}

export function validateKitchenPlateTruth(): readonly string[] {
  const errors: string[] = [];
  const truth = KITCHEN_PLATE_TRUTH;
  if (!truth.atlasUrl.startsWith('/rooms/kitchen/rebuild/truth/') ||
      /creativeclaw|^https?:\/\//i.test(truth.atlasUrl)) {
    errors.push('plate atlas must be repository-local');
  }
  for (const [id, frame] of Object.entries(truth.frames)) {
    if (frame.x < 0 || frame.y < 0 || frame.width <= 0 || frame.height <= 0 ||
        frame.x + frame.width > truth.atlasWidth ||
        frame.y + frame.height > truth.atlasHeight) {
      errors.push(`plate atlas frame outside bounds: ${id}`);
    }
  }
  const { x, y, width, height } = truth.logicalBounds;
  if (width !== truth.cropWidth || height !== truth.cropHeight ||
      x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
    errors.push('plate truth registration outside logical canvas');
  }
  for (const [id, placement] of Object.entries(truth.restPlacement)) {
    const frame = truth.frames[id as keyof typeof truth.restPlacement];
    if (placement.x < 0 || placement.y < 0 ||
        placement.x + frame.width > truth.cropWidth ||
        placement.y + frame.height > truth.cropHeight) {
      errors.push(`plate rest placement outside crop: ${id}`);
    }
  }
  return errors;
}

export function validateKitchenPanTruth(): readonly string[] {
  const errors: string[] = [];

  for (const [label, url] of Object.entries({
    reference: KITCHEN_PAN_TRUTH.referenceUrl,
    support: KITCHEN_PAN_TRUTH.supportUrl,
    body: KITCHEN_PAN_TRUTH.bodyUrl,
    shadow: KITCHEN_PAN_TRUTH.shadowUrl,
  })) {
    if (!url.startsWith('/rooms/kitchen/rebuild/truth/')) {
      errors.push(`${label}: truth asset must be repository-local`);
    }

    if (/creativeclaw/i.test(url) || /^https?:\/\//i.test(url)) {
      errors.push(`${label}: remote asset dependency is forbidden`);
    }
  }

  const { x, y, width, height } = KITCHEN_PAN_TRUTH.logicalBounds;

  if (width !== KITCHEN_PAN_TRUTH.width || height !== KITCHEN_PAN_TRUTH.height) {
    errors.push('pan truth registration size mismatch');
  }

  if (x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
    errors.push('pan truth registration outside logical canvas');
  }

  return errors;
}

export function validateKitchenToastTruth(): readonly string[] {
  const errors: string[] = [];
  const truth = KITCHEN_TOAST_TRUTH;

  if (!truth.atlasUrl.startsWith('/rooms/kitchen/rebuild/truth/')) {
    errors.push('toast atlas must be repository-local');
  }

  if (/creativeclaw/i.test(truth.atlasUrl) || /^https?:\/\//i.test(truth.atlasUrl)) {
    errors.push('toast atlas remote dependency is forbidden');
  }

  for (const [id, frame] of Object.entries(truth.frames)) {
    if (frame.x < 0 ||
        frame.y < 0 ||
        frame.width <= 0 ||
        frame.height <= 0 ||
        frame.x + frame.width > truth.atlasWidth ||
        frame.y + frame.height > truth.atlasHeight) {
      errors.push(`toast atlas frame outside bounds: ${id}`);
    }
  }

  const { x, y, width, height } = truth.logicalBounds;
  if (width !== truth.cropWidth || height !== truth.cropHeight) {
    errors.push('toast truth registration size mismatch');
  }

  if (x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
    errors.push('toast truth registration outside logical canvas');
  }

  for (const [id, placement] of Object.entries(truth.restPlacement)) {
    const frame = truth.frames[id as 'body' | 'shadow'];
    if (placement.x < 0 ||
        placement.y < 0 ||
        placement.x + frame.width > truth.cropWidth ||
        placement.y + frame.height > truth.cropHeight) {
      errors.push(`toast rest placement outside crop: ${id}`);
    }
  }

  return errors;
}


export function validateKitchenTowelTruth(): readonly string[] {
  const errors: string[] = [];
  const truth = KITCHEN_TOWEL_TRUTH;

  if (!truth.atlasUrl.startsWith('/rooms/kitchen/rebuild/truth/')) {
    errors.push('towel atlas must be repository-local');
  }

  if (/creativeclaw/i.test(truth.atlasUrl) || /^https?:\/\//i.test(truth.atlasUrl)) {
    errors.push('towel atlas remote dependency is forbidden');
  }

  for (const [id, frame] of Object.entries(truth.frames)) {
    if (frame.x < 0 ||
        frame.y < 0 ||
        frame.width <= 0 ||
        frame.height <= 0 ||
        frame.x + frame.width > truth.atlasWidth ||
        frame.y + frame.height > truth.atlasHeight) {
      errors.push(`towel atlas frame outside bounds: ${id}`);
    }
  }

  const { x, y, width, height } = truth.logicalBounds;
  if (width !== truth.cropWidth || height !== truth.cropHeight) {
    errors.push('towel truth registration size mismatch');
  }

  if (x < 0 || y < 0 || x + width > 1000 || y + height > 600) {
    errors.push('towel truth registration outside logical canvas');
  }

  for (const [id, placement] of Object.entries(truth.restPlacement)) {
    const frame = truth.frames[id as 'body' | 'shadow'];
    if (placement.x < 0 ||
        placement.y < 0 ||
        placement.x + frame.width > truth.cropWidth ||
        placement.y + frame.height > truth.cropHeight) {
      errors.push(`towel rest placement outside crop: ${id}`);
    }
  }

  return errors;
}
