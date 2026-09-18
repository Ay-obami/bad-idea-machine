export type KitchenPanTruthLayer = 'support' | 'shadow' | 'body';

export const KITCHEN_PAN_TRUTH = {
  referenceUrl: '/rooms/kitchen/truth/pan-reference.webp',
  supportUrl: '/rooms/kitchen/truth/pan-support.webp',
  bodyUrl: '/rooms/kitchen/truth/pan-body.webp',
  shadowUrl: '/rooms/kitchen/truth/pan-shadow.webp',
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

export function kitchenPanTruthLayers(
  bodyVisible: boolean,
  shadowVisible: boolean,
): readonly KitchenPanTruthLayer[] {
  const layers: KitchenPanTruthLayer[] = ['support'];
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
    if (!url.startsWith('/rooms/kitchen/truth/')) {
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
