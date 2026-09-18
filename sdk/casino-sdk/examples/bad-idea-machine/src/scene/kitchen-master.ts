export const KITCHEN_APPROVED_MASTER = {
  sourceUrl: 'https://cdn.creativeclaw.co/u/534269cc/images/d48c2325-2071-4642-92a1-5d174d35444a.png',
  sourceWidth: 1619,
  sourceHeight: 971,
  logicalWidth: 1000,
  logicalHeight: 600,
  status: 'approved' as const,
  role: 'visual-reference-only' as const,
} as const;

/**
 * The approved master is the visual authority for camera, lighting, materials
 * and rest composition. The final renderer must reconstruct it from layers;
 * it must not use this flattened image as the destructible runtime scene.
 */
export const KITCHEN_MASTER_URL = KITCHEN_APPROVED_MASTER.sourceUrl;
