export const KITCHEN_APPROVED_MASTER = {
  sourceUrl: '/rooms/kitchen/rebuild/truth/approved-master.webp',
  sourceWidth: 1000,
  sourceHeight: 600,
  originalSourceWidth: 1619,
  originalSourceHeight: 971,
  logicalWidth: 1000,
  logicalHeight: 600,
  status: 'approved' as const,
  role: 'visual-reference-only' as const,
  source: 'repository-local-materialized-master' as const,
} as const;

/**
 * The approved master is the visual authority for camera, lighting, materials
 * and rest composition. The final renderer must reconstruct it from layers;
 * it must not use this flattened image as the destructible runtime scene.
 */
export const KITCHEN_MASTER_URL = KITCHEN_APPROVED_MASTER.sourceUrl;
