export type KitchenPanTruthLayer = 'support' | 'shadow' | 'body';
export type KitchenToastTruthLayer = 'support' | 'shadow' | 'body';

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
