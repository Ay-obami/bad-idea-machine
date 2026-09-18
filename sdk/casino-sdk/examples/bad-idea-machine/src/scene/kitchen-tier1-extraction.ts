import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  type KitchenPropId,
  type KitchenZoneId,
} from './kitchen-destruction-blueprint';

export type KitchenExtractionKind = 'prop' | 'shadow' | 'debris';
export type KitchenExtractionShape =
  | Readonly<{ type: 'rect'; radius?: number }>
  | Readonly<{ type: 'ellipse' }>
  | Readonly<{ type: 'polygon'; points: readonly Readonly<{ x: number; y: number }>[] }>
  | Readonly<{ type: 'none' }>;

export type KitchenTier1ExtractionSpec = Readonly<{
  id: string;
  kind: KitchenExtractionKind;
  ownerId: string;
  sourceZoneId: KitchenZoneId;
  bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
  shape: KitchenExtractionShape;
  visible: boolean;
  notes: string;
}>;

const prop = (
  ownerId: KitchenPropId,
  sourceZoneId: KitchenZoneId,
  bounds: KitchenTier1ExtractionSpec['bounds'],
  shape: KitchenExtractionShape,
  notes: string,
  visible = true,
): KitchenTier1ExtractionSpec => ({
  id: `tier1/prop/${ownerId}`,
  kind: 'prop',
  ownerId,
  sourceZoneId,
  bounds,
  shape,
  visible,
  notes,
});

const shadow = (
  ownerId: KitchenPropId,
  sourceZoneId: KitchenZoneId,
  bounds: KitchenTier1ExtractionSpec['bounds'],
  shape: KitchenExtractionShape,
  notes: string,
  visible = true,
): KitchenTier1ExtractionSpec => ({
  id: `tier1/shadow/${ownerId}`,
  kind: 'shadow',
  ownerId,
  sourceZoneId,
  bounds,
  shape,
  visible,
  notes,
});

export const KITCHEN_TIER1_EXTRACTION_SPECS: readonly KitchenTier1ExtractionSpec[] = [
  prop(
    'pan',
    'backsplash',
    { x: 360, y: 265, width: 170, height: 50 },
    {
      type: 'polygon',
      points: [
        { x: 0, y: 19 }, { x: 42, y: 13 }, { x: 83, y: 5 }, { x: 132, y: 4 },
        { x: 160, y: 13 }, { x: 170, y: 25 }, { x: 157, y: 36 }, { x: 111, y: 47 },
        { x: 68, y: 43 }, { x: 31, y: 31 }, { x: 0, y: 27 },
      ],
    },
    'Nudged pan body only. Contact shadow is owned separately.',
  ),
  shadow(
    'pan',
    'stove-range',
    { x: 365, y: 286, width: 160, height: 34 },
    { type: 'ellipse' },
    'Soft grate/contact shadow under the nudged pan.',
  ),

  prop(
    'toaster',
    'backsplash',
    { x: 612, y: 232, width: 102, height: 83 },
    { type: 'rect', radius: 12 },
    'Tier 1 toaster remains structurally intact.',
  ),
  shadow(
    'toaster',
    'right-counter',
    { x: 616, y: 290, width: 98, height: 29 },
    { type: 'ellipse' },
    'Counter contact shadow under toaster.',
  ),

  prop(
    'toast-stack',
    'backsplash',
    { x: 628, y: 228, width: 64, height: 34 },
    {
      type: 'polygon',
      points: [
        { x: 2, y: 23 }, { x: 8, y: 8 }, { x: 20, y: 2 }, { x: 53, y: 3 },
        { x: 62, y: 13 }, { x: 58, y: 31 }, { x: 10, y: 33 },
      ],
    },
    'Remaining toast stays with the toaster from frame zero.',
  ),
  shadow(
    'toast-stack',
    'backsplash',
    { x: 632, y: 247, width: 56, height: 12 },
    { type: 'ellipse' },
    'Small contact shadow for remaining toast.',
  ),

  prop(
    'toast',
    'right-counter',
    { x: 610, y: 285, width: 112, height: 42 },
    {
      type: 'polygon',
      points: [
        { x: 9, y: 24 }, { x: 18, y: 11 }, { x: 39, y: 5 }, { x: 84, y: 6 },
        { x: 103, y: 16 }, { x: 107, y: 29 }, { x: 92, y: 37 }, { x: 27, y: 37 },
      ],
    },
    'Settled hero toast; broad search footprint will be tightened from visual review.',
  ),
  shadow(
    'toast',
    'right-counter',
    { x: 616, y: 307, width: 98, height: 15 },
    { type: 'ellipse' },
    'Flat counter shadow for landed toast.',
  ),

  prop(
    'kettle',
    'backsplash',
    { x: 728, y: 224, width: 104, height: 91 },
    {
      type: 'polygon',
      points: [
        { x: 7, y: 47 }, { x: 20, y: 28 }, { x: 31, y: 8 }, { x: 62, y: 4 },
        { x: 87, y: 16 }, { x: 101, y: 42 }, { x: 96, y: 74 }, { x: 79, y: 88 },
        { x: 36, y: 89 }, { x: 17, y: 76 },
      ],
    },
    'Tier 1 kettle remains resting and independently owned.',
  ),
  shadow(
    'kettle',
    'right-counter',
    { x: 738, y: 292, width: 88, height: 29 },
    { type: 'ellipse' },
    'Counter contact shadow under kettle.',
  ),

  prop(
    'plate-stack',
    'plate-cabinet',
    { x: 568, y: 78, width: 91, height: 54 },
    { type: 'ellipse' },
    'Remaining plate stack with one visible plate missing.',
  ),
  shadow(
    'plate-stack',
    'plate-cabinet',
    { x: 568, y: 111, width: 91, height: 20 },
    { type: 'ellipse' },
    'Shelf contact shadow for remaining stack.',
  ),

  prop(
    'hero-plate',
    'plate-cabinet',
    { x: 620, y: 116, width: 2, height: 2 },
    { type: 'none' },
    'Hero plate is shattered in Tier 1; its pixels belong to ceramic-debris, not a whole plate body.',
    false,
  ),
  shadow(
    'hero-plate',
    'plate-cabinet',
    { x: 620, y: 116, width: 2, height: 2 },
    { type: 'none' },
    'No whole-plate contact shadow remains after fracture.',
    false,
  ),

  prop(
    'oven-towel',
    'stove-range',
    { x: 438, y: 370, width: 100, height: 160 },
    {
      type: 'polygon',
      points: [
        { x: 18, y: 6 }, { x: 78, y: 5 }, { x: 87, y: 33 }, { x: 78, y: 78 },
        { x: 94, y: 145 }, { x: 70, y: 157 }, { x: 37, y: 151 }, { x: 15, y: 102 },
        { x: 6, y: 44 },
      ],
    },
    'Tier 1 towel remains hanging.',
  ),
  shadow(
    'oven-towel',
    'stove-range',
    { x: 443, y: 390, width: 90, height: 125 },
    { type: 'rect', radius: 8 },
    'Soft oven-front contact/occlusion shadow behind towel.',
  ),

  {
    id: 'tier1/debris/ceramic-debris',
    kind: 'debris',
    ownerId: 'ceramic-debris',
    sourceZoneId: 'right-counter',
    bounds: { x: 600, y: 285, width: 215, height: 120 },
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 14 }, { x: 214, y: 0 }, { x: 214, y: 118 }, { x: 0, y: 118 },
      ],
    },
    visible: true,
    notes: 'Tier 1 ceramic aftermath region. Must be visually narrowed after static review.',
  },
  {
    id: 'tier1/debris/cabinet-debris',
    kind: 'debris',
    ownerId: 'cabinet-debris',
    sourceZoneId: 'plate-cabinet',
    bounds: { x: 565, y: 118, width: 205, height: 55 },
    shape: { type: 'rect', radius: 0 },
    visible: false,
    notes: 'Tier 1 has no meaningful cabinet debris; slot exists for contract completeness.',
  },
  {
    id: 'tier1/debris/floor-debris',
    kind: 'debris',
    ownerId: 'floor-debris',
    sourceZoneId: 'floor-center',
    bounds: { x: 430, y: 510, width: 260, height: 65 },
    shape: { type: 'rect', radius: 0 },
    visible: true,
    notes: 'Small localized fragments that make it off the counter.',
  },
] as const;

export function validateKitchenTier1ExtractionSpecs(): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const zoneById = new Map(KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => [zone.id, zone]));
  const propIds = new Set(KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => prop.id));

  for (const spec of KITCHEN_TIER1_EXTRACTION_SPECS) {
    if (ids.has(spec.id)) errors.push(`duplicate extraction id: ${spec.id}`);
    ids.add(spec.id);

    const zone = zoneById.get(spec.sourceZoneId);
    if (!zone) {
      errors.push(`unknown source zone: ${spec.id}/${spec.sourceZoneId}`);
      continue;
    }

    const { x, y, width, height } = spec.bounds;
    if (x < zone.bounds.x ||
        y < zone.bounds.y ||
        x + width > zone.bounds.x + zone.bounds.width ||
        y + height > zone.bounds.y + zone.bounds.height) {
      errors.push(`extraction outside source zone: ${spec.id}`);
    }

    if (width <= 0 || height <= 0) errors.push(`invalid extraction bounds: ${spec.id}`);
  }

  const propSpecs = KITCHEN_TIER1_EXTRACTION_SPECS.filter(spec => spec.kind === 'prop');
  const seenProps = new Set<string>();

  for (const spec of propSpecs) {
    if (!propIds.has(spec.ownerId as KitchenPropId)) {
      errors.push(`unknown prop owner: ${spec.ownerId}`);
    }
    if (seenProps.has(spec.ownerId)) errors.push(`duplicate prop extraction: ${spec.ownerId}`);
    seenProps.add(spec.ownerId);
  }

  for (const propId of propIds) {
    if (!seenProps.has(propId)) errors.push(`missing prop extraction: ${propId}`);
  }

  return errors;
}
