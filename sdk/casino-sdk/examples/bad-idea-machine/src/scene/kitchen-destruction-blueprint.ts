import type { OutcomeTier } from '../lib/badIdea';

export type KitchenZoneId =
  | 'left-shell'
  | 'right-wall-shell'
  | 'plate-cabinet'
  | 'upper-stove-cabinet'
  | 'backsplash'
  | 'stove-range'
  | 'right-counter'
  | 'right-lower-cabinet'
  | 'sink-run'
  | 'floor-center';

export type KitchenPermanentZoneId = Extract<KitchenZoneId, 'left-shell' | 'right-wall-shell'>;
export type KitchenDestructibleZoneId = Exclude<KitchenZoneId, KitchenPermanentZoneId>;

export type KitchenPropId =
  | 'pan'
  | 'toaster'
  | 'toast'
  | 'kettle'
  | 'plate-stack'
  | 'oven-towel';

export type KitchenBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type KitchenZone = Readonly<{
  id: KitchenZoneId;
  label: string;
  kind: 'permanent' | 'destructible';
  bounds: KitchenBounds;
  states: readonly string[];
  notes: string;
}>;

export type KitchenProp = Readonly<{
  id: KitchenPropId;
  label: string;
  material: 'metal' | 'ceramic' | 'fabric' | 'food' | 'appliance';
  support: Readonly<{
    zoneId: KitchenZoneId;
    surface: string;
  }>;
  rest: Readonly<{
    x: number;
    y: number;
    rotation: number;
  }>;
  states: readonly string[];
  defaultState: string;
}>;

export type KitchenDamageMutation = Readonly<{
  zoneId: KitchenDestructibleZoneId;
  state: string;
}>;

export type KitchenVariantBeat = Readonly<{
  id: string;
  after?: string;
  actor: KitchenPropId | KitchenDestructibleZoneId;
  target: KitchenPropId | KitchenDestructibleZoneId;
  action: string;
  contact: Readonly<{ x: number; y: number }>;
  damage?: readonly KitchenDamageMutation[];
}>;

export type KitchenVariant = Readonly<{
  id: 'cabinet-pan' | 'cabinet-kettle' | 'toaster-burn';
  label: string;
  premise: string;
  beats: readonly KitchenVariantBeat[];
  sharedUntilBeat: number;
}>;

export type KitchenHazardProfile = Readonly<{
  fire: 'none' | 'localized' | 'smoldering' | 'active';
  smoke: 'none' | 'light' | 'medium' | 'heavy';
  power: 'normal' | 'flicker' | 'partial-outage';
}>;

export type KitchenTierComposition = Readonly<{
  tier: OutcomeTier;
  artDirection: string;
  shellStates: Readonly<Record<KitchenPermanentZoneId, string>>;
  zoneStates: Readonly<Record<KitchenDestructibleZoneId, string>>;
  propStates: Readonly<Record<KitchenPropId, string>>;
  hazards: KitchenHazardProfile;
}>;

const zones: readonly KitchenZone[] = [
  {
    id: 'left-shell',
    label: 'Fridge / window / left counter shell',
    kind: 'permanent',
    bounds: { x: 0, y: 0, width: 345, height: 600 },
    states: ['intact', 'soot-dusted', 'smoke-stained', 'glass-cracked'],
    notes: 'Structural identity anchor. It may receive localized surface damage, smoke and cracked glass but is not removed.',
  },
  {
    id: 'right-wall-shell',
    label: 'Far-right wall / art shell',
    kind: 'permanent',
    bounds: { x: 895, y: 0, width: 105, height: 325 },
    states: ['intact', 'soot-dusted', 'wall-cracked', 'blackened'],
    notes: 'Structural identity anchor. Surface damage escalates at high tiers while the camera/room identity remains readable.',
  },
  {
    id: 'plate-cabinet',
    label: 'Open plate cabinet',
    kind: 'destructible',
    bounds: { x: 565, y: 0, width: 205, height: 173 },
    states: ['intact', 'hinge-stressed', 'door-hanging', 'shelf-damaged', 'carcass-broken'],
    notes: 'Door, hinge, shelf, plate support and exposed interior are authored separately.',
  },
  {
    id: 'upper-stove-cabinet',
    label: 'Upper cabinetry above range',
    kind: 'destructible',
    bounds: { x: 350, y: 0, width: 225, height: 170 },
    states: ['intact', 'smoke-stained', 'heat-warped', 'door-dropped', 'carcass-damaged'],
    notes: 'Receives heat/smoke and becomes structural damage only at severe terminal beats.',
  },
  {
    id: 'backsplash',
    label: 'Central backsplash',
    kind: 'destructible',
    bounds: { x: 315, y: 165, width: 520, height: 150 },
    states: ['intact', 'sooted', 'cracked', 'spalled', 'blackened'],
    notes: 'Carries exact ignition origin, soot growth and impact cracks without full-frame overlays.',
  },
  {
    id: 'stove-range',
    label: 'Range / burners',
    kind: 'destructible',
    bounds: { x: 337, y: 286, width: 265, height: 265 },
    states: ['intact', 'pan-shifted', 'grease-burning', 'scorched', 'warped'],
    notes: 'Primary fire zone; burner, grease, pan contact and heat damage share one geometry.',
  },
  {
    id: 'right-counter',
    label: 'Toaster / kettle counter',
    kind: 'destructible',
    bounds: { x: 600, y: 285, width: 280, height: 120 },
    states: ['intact', 'wet', 'scorched', 'chipped', 'fractured'],
    notes: 'Supports toaster/kettle and catches ceramic, water and electrical damage.',
  },
  {
    id: 'right-lower-cabinet',
    label: 'Right lower cabinetry',
    kind: 'destructible',
    bounds: { x: 600, y: 402, width: 230, height: 168 },
    states: ['intact', 'stained', 'drawer-ajar', 'panel-damaged', 'collapsed'],
    notes: 'Secondary structural zone for severe/absurd outcomes.',
  },
  {
    id: 'sink-run',
    label: 'Sink / far-right counter run',
    kind: 'destructible',
    bounds: { x: 830, y: 300, width: 170, height: 300 },
    states: ['intact', 'wet', 'debris-littered', 'chipped', 'damaged'],
    notes: 'Receives secondary spill/debris; large structural change is reserved for terminal damage.',
  },
  {
    id: 'floor-center',
    label: 'Central floor / rug',
    kind: 'destructible',
    bounds: { x: 245, y: 510, width: 610, height: 90 },
    states: ['intact', 'light-debris', 'ceramic-debris', 'mixed-debris', 'heavy-debris'],
    notes: 'Persistent resting plane for debris that actually leaves the counter.',
  },
] as const;

const props: readonly KitchenProp[] = [
  {
    id: 'pan',
    label: 'Cast-iron pan',
    material: 'metal',
    support: { zoneId: 'stove-range', surface: 'front-left burner grate' },
    rest: { x: 454, y: 300, rotation: 0 },
    states: ['resting', 'nudged', 'tipped', 'displaced', 'scorched'],
    defaultState: 'resting',
  },
  {
    id: 'toaster',
    label: 'Two-slice toaster',
    material: 'appliance',
    support: { zoneId: 'right-counter', surface: 'stone counter' },
    rest: { x: 668, y: 282, rotation: 0 },
    states: ['resting', 'active', 'shorted', 'scorched'],
    defaultState: 'resting',
  },
  {
    id: 'toast',
    label: 'Toast slice',
    material: 'food',
    support: { zoneId: 'right-counter', surface: 'toaster slot' },
    rest: { x: 660, y: 246, rotation: 0 },
    states: ['loaded', 'airborne', 'landed', 'charred'],
    defaultState: 'loaded',
  },
  {
    id: 'kettle',
    label: 'Electric kettle',
    material: 'appliance',
    support: { zoneId: 'right-counter', surface: 'stone counter' },
    rest: { x: 775, y: 281, rotation: 0 },
    states: ['resting', 'tipped', 'displaced', 'scorched'],
    defaultState: 'resting',
  },
  {
    id: 'plate-stack',
    label: 'Ceramic plate stack',
    material: 'ceramic',
    support: { zoneId: 'plate-cabinet', surface: 'lower cabinet shelf' },
    rest: { x: 623, y: 118, rotation: 0 },
    states: ['stacked', 'disturbed', 'missing-one', 'scattered', 'shattered'],
    defaultState: 'stacked',
  },
  {
    id: 'oven-towel',
    label: 'Oven towel',
    material: 'fabric',
    support: { zoneId: 'stove-range', surface: 'oven handle' },
    rest: { x: 481, y: 407, rotation: 0 },
    states: ['hanging', 'singed', 'fallen', 'burned'],
    defaultState: 'hanging',
  },
] as const;

const variants: readonly KitchenVariant[] = [
  {
    id: 'cabinet-pan',
    label: 'Plate to pan',
    premise: 'A real plate support failure creates a metal contact that displaces the pan and spills grease onto an active burner.',
    sharedUntilBeat: 5,
    beats: [
      {
        id: 'shelf-slip',
        actor: 'plate-cabinet',
        target: 'plate-stack',
        action: 'lower shelf/stack loses support',
        contact: { x: 623, y: 132 },
        damage: [{ zoneId: 'plate-cabinet', state: 'hinge-stressed' }],
      },
      {
        id: 'hero-plate-fall',
        after: 'shelf-slip',
        actor: 'plate-stack',
        target: 'pan',
        action: 'one plate tips out under gravity',
        contact: { x: 512, y: 291 },
      },
      {
        id: 'pan-handle-strike',
        after: 'hero-plate-fall',
        actor: 'plate-stack',
        target: 'pan',
        action: 'ceramic strikes pan handle',
        contact: { x: 508, y: 291 },
      },
      {
        id: 'pan-displacement',
        after: 'pan-handle-strike',
        actor: 'pan',
        target: 'stove-range',
        action: 'pan yaws and shifts on grate',
        contact: { x: 455, y: 298 },
        damage: [{ zoneId: 'stove-range', state: 'pan-shifted' }],
      },
      {
        id: 'grease-spill',
        after: 'pan-displacement',
        actor: 'pan',
        target: 'stove-range',
        action: 'grease leaves pan and follows stove surface',
        contact: { x: 468, y: 302 },
      },
      {
        id: 'burner-ignition',
        after: 'grease-spill',
        actor: 'stove-range',
        target: 'backsplash',
        action: 'grease reaches lit burner and ignites at contact',
        contact: { x: 472, y: 298 },
        damage: [
          { zoneId: 'stove-range', state: 'grease-burning' },
          { zoneId: 'backsplash', state: 'sooted' },
        ],
      },
      {
        id: 'local-fire-growth',
        after: 'burner-ignition',
        actor: 'stove-range',
        target: 'upper-stove-cabinet',
        action: 'heat rises from actual burner origin',
        contact: { x: 474, y: 255 },
        damage: [{ zoneId: 'upper-stove-cabinet', state: 'smoke-stained' }],
      },
    ],
  },
  {
    id: 'cabinet-kettle',
    label: 'Plate to kettle short',
    premise: 'A falling plate tips the supported kettle; water travels across the counter into powered hardware and creates a localized electrical arc.',
    sharedUntilBeat: 5,
    beats: [
      {
        id: 'stack-shift',
        actor: 'plate-cabinet',
        target: 'plate-stack',
        action: 'plate stack shifts at shelf edge',
        contact: { x: 625, y: 130 },
        damage: [{ zoneId: 'plate-cabinet', state: 'hinge-stressed' }],
      },
      {
        id: 'plate-kettle-fall',
        after: 'stack-shift',
        actor: 'plate-stack',
        target: 'kettle',
        action: 'hero plate falls toward kettle shoulder',
        contact: { x: 753, y: 273 },
      },
      {
        id: 'kettle-strike',
        after: 'plate-kettle-fall',
        actor: 'plate-stack',
        target: 'kettle',
        action: 'ceramic contact tips kettle left',
        contact: { x: 752, y: 275 },
      },
      {
        id: 'kettle-tip',
        after: 'kettle-strike',
        actor: 'kettle',
        target: 'right-counter',
        action: 'kettle rotates around base contact',
        contact: { x: 760, y: 304 },
        damage: [{ zoneId: 'right-counter', state: 'wet' }],
      },
      {
        id: 'water-run',
        after: 'kettle-tip',
        actor: 'kettle',
        target: 'toaster',
        action: 'water follows counter fall line toward powered toaster/outlet',
        contact: { x: 699, y: 292 },
      },
      {
        id: 'electrical-short',
        after: 'water-run',
        actor: 'toaster',
        target: 'backsplash',
        action: 'powered appliance arcs at wet contact',
        contact: { x: 704, y: 260 },
        damage: [
          { zoneId: 'right-counter', state: 'scorched' },
          { zoneId: 'backsplash', state: 'cracked' },
        ],
      },
      {
        id: 'arc-aftermath',
        after: 'electrical-short',
        actor: 'toaster',
        target: 'right-lower-cabinet',
        action: 'heat and debris settle locally',
        contact: { x: 692, y: 360 },
        damage: [{ zoneId: 'right-lower-cabinet', state: 'stained' }],
      },
    ],
  },
  {
    id: 'toaster-burn',
    label: 'Toast to burner',
    premise: 'The toaster launches a visible slice toward the range; the slice reaches the hot zone, ignites, and escalates into a grease flare that loads the cabinet above.',
    sharedUntilBeat: 5,
    beats: [
      {
        id: 'toaster-jam',
        actor: 'toaster',
        target: 'toast',
        action: 'toaster spring releases after a jam',
        contact: { x: 660, y: 246 },
      },
      {
        id: 'toast-eject',
        after: 'toaster-jam',
        actor: 'toast',
        target: 'stove-range',
        action: 'toast follows a ballistic arc toward stove',
        contact: { x: 548, y: 292 },
      },
      {
        id: 'toast-burner-contact',
        after: 'toast-eject',
        actor: 'toast',
        target: 'stove-range',
        action: 'toast lands on hot grate/burner edge',
        contact: { x: 546, y: 292 },
      },
      {
        id: 'toast-ignition',
        after: 'toast-burner-contact',
        actor: 'stove-range',
        target: 'toast',
        action: 'heat chars and ignites toast at the actual landing point',
        contact: { x: 546, y: 292 },
        damage: [{ zoneId: 'stove-range', state: 'grease-burning' }],
      },
      {
        id: 'grease-flare',
        after: 'toast-ignition',
        actor: 'stove-range',
        target: 'pan',
        action: 'localized flame reaches pan grease',
        contact: { x: 485, y: 286 },
        damage: [{ zoneId: 'backsplash', state: 'sooted' }],
      },
      {
        id: 'cabinet-heat-load',
        after: 'grease-flare',
        actor: 'stove-range',
        target: 'upper-stove-cabinet',
        action: 'rising heat deforms upper cabinet hardware',
        contact: { x: 490, y: 170 },
        damage: [{ zoneId: 'upper-stove-cabinet', state: 'heat-warped' }],
      },
      {
        id: 'shelf-failure',
        after: 'cabinet-heat-load',
        actor: 'upper-stove-cabinet',
        target: 'plate-cabinet',
        action: 'adjacent cabinet load transfers into plate shelf',
        contact: { x: 585, y: 128 },
        damage: [{ zoneId: 'plate-cabinet', state: 'shelf-damaged' }],
      },
      {
        id: 'plate-fall',
        after: 'shelf-failure',
        actor: 'plate-stack',
        target: 'right-counter',
        action: 'plates fall from visibly damaged support',
        contact: { x: 624, y: 308 },
        damage: [{ zoneId: 'right-counter', state: 'chipped' }],
      },
    ],
  },
] as const;

const tiers: Readonly<Record<OutcomeTier, KitchenTierComposition>> = {
  0: {
    tier: 0,
    artDirection: 'Catastrophic loss: ugly heat/impact wreck, blackened and debris-heavy rather than celebratory.',
    shellStates: {
      'left-shell': 'smoke-stained',
      'right-wall-shell': 'wall-cracked',
    },
    zoneStates: {
      'plate-cabinet': 'shelf-damaged',
      'upper-stove-cabinet': 'heat-warped',
      backsplash: 'blackened',
      'stove-range': 'warped',
      'right-counter': 'fractured',
      'right-lower-cabinet': 'panel-damaged',
      'sink-run': 'debris-littered',
      'floor-center': 'heavy-debris',
    },
    propStates: {
      pan: 'scorched',
      toaster: 'scorched',
      toast: 'charred',
      kettle: 'displaced',
      'plate-stack': 'shattered',
      'oven-towel': 'burned',
    },
    hazards: { fire: 'smoldering', smoke: 'heavy', power: 'partial-outage' },
  },
  1: {
    tier: 1,
    artDirection: 'Small localized damage: one readable accident, mostly habitable room.',
    shellStates: {
      'left-shell': 'intact',
      'right-wall-shell': 'intact',
    },
    zoneStates: {
      'plate-cabinet': 'hinge-stressed',
      'upper-stove-cabinet': 'intact',
      backsplash: 'intact',
      'stove-range': 'pan-shifted',
      'right-counter': 'intact',
      'right-lower-cabinet': 'intact',
      'sink-run': 'intact',
      'floor-center': 'light-debris',
    },
    propStates: {
      pan: 'nudged',
      toaster: 'resting',
      toast: 'landed',
      kettle: 'resting',
      'plate-stack': 'missing-one',
      'oven-towel': 'hanging',
    },
    hazards: { fire: 'none', smoke: 'none', power: 'normal' },
  },
  2: {
    tier: 2,
    artDirection: 'Moderate destruction: several connected surfaces show damage, but architecture is still largely intact.',
    shellStates: {
      'left-shell': 'soot-dusted',
      'right-wall-shell': 'intact',
    },
    zoneStates: {
      'plate-cabinet': 'door-hanging',
      'upper-stove-cabinet': 'smoke-stained',
      backsplash: 'sooted',
      'stove-range': 'grease-burning',
      'right-counter': 'chipped',
      'right-lower-cabinet': 'intact',
      'sink-run': 'intact',
      'floor-center': 'ceramic-debris',
    },
    propStates: {
      pan: 'tipped',
      toaster: 'active',
      toast: 'charred',
      kettle: 'tipped',
      'plate-stack': 'scattered',
      'oven-towel': 'singed',
    },
    hazards: { fire: 'localized', smoke: 'light', power: 'normal' },
  },
  3: {
    tier: 3,
    artDirection: 'Severe room damage: structural cabinet/counter consequences with broad persistent debris.',
    shellStates: {
      'left-shell': 'smoke-stained',
      'right-wall-shell': 'wall-cracked',
    },
    zoneStates: {
      'plate-cabinet': 'shelf-damaged',
      'upper-stove-cabinet': 'heat-warped',
      backsplash: 'cracked',
      'stove-range': 'scorched',
      'right-counter': 'chipped',
      'right-lower-cabinet': 'panel-damaged',
      'sink-run': 'intact',
      'floor-center': 'mixed-debris',
    },
    propStates: {
      pan: 'displaced',
      toaster: 'shorted',
      toast: 'charred',
      kettle: 'displaced',
      'plate-stack': 'shattered',
      'oven-towel': 'fallen',
    },
    hazards: { fire: 'smoldering', smoke: 'medium', power: 'flicker' },
  },
  4: {
    tier: 4,
    artDirection: 'Absurd cinematic devastation: widest structural destruction while preserving the same room/camera identity.',
    shellStates: {
      'left-shell': 'glass-cracked',
      'right-wall-shell': 'blackened',
    },
    zoneStates: {
      'plate-cabinet': 'carcass-broken',
      'upper-stove-cabinet': 'carcass-damaged',
      backsplash: 'spalled',
      'stove-range': 'warped',
      'right-counter': 'fractured',
      'right-lower-cabinet': 'collapsed',
      'sink-run': 'damaged',
      'floor-center': 'heavy-debris',
    },
    propStates: {
      pan: 'scorched',
      toaster: 'scorched',
      toast: 'charred',
      kettle: 'scorched',
      'plate-stack': 'shattered',
      'oven-towel': 'burned',
    },
    hazards: { fire: 'active', smoke: 'heavy', power: 'partial-outage' },
  },
};

export const KITCHEN_DESTRUCTION_BLUEPRINT = {
  canvas: { width: 1000, height: 600 },
  zones,
  props,
  variants,
  tiers,
} as const;

export function kitchenDamageCount(tier: OutcomeTier): number {
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];
  return [
    ...Object.values(composition.shellStates),
    ...Object.values(composition.zoneStates),
  ].filter(state => state !== 'intact').length;
}

export function validateKitchenDestructionBlueprint(): readonly string[] {
  const errors: string[] = [];
  const zoneById = new Map(zones.map(zone => [zone.id, zone] as const));
  const propById = new Map(props.map(prop => [prop.id, prop] as const));
  const componentIds = new Set<string>([...zoneById.keys(), ...propById.keys()]);

  for (const zone of zones) {
    if (zone.kind === 'destructible') {
      if (zone.states[0] !== 'intact') errors.push(`${zone.id}: first state must be intact`);
      if (zone.states.length < 4) errors.push(`${zone.id}: needs at least four authored states`);
    }
  }

  for (const prop of props) {
    if (!zoneById.has(prop.support.zoneId)) errors.push(`${prop.id}: unknown support zone ${prop.support.zoneId}`);
    if (!prop.states.includes(prop.defaultState)) errors.push(`${prop.id}: default state is not authored`);
    if (prop.rest.x < 0 || prop.rest.x > 1000 || prop.rest.y < 0 || prop.rest.y > 600) {
      errors.push(`${prop.id}: rest anchor outside canvas`);
    }
  }

  for (const variant of variants) {
    const beatIds = new Set<string>();
    variant.beats.forEach((beat, index) => {
      if (beatIds.has(beat.id)) errors.push(`${variant.id}: duplicate beat ${beat.id}`);
      beatIds.add(beat.id);

      if (!componentIds.has(beat.actor)) errors.push(`${variant.id}/${beat.id}: unknown actor ${beat.actor}`);
      if (!componentIds.has(beat.target)) errors.push(`${variant.id}/${beat.id}: unknown target ${beat.target}`);

      if (index === 0 && beat.after) errors.push(`${variant.id}: first beat cannot depend on another beat`);
      if (index > 0 && beat.after !== variant.beats[index - 1].id) {
        errors.push(`${variant.id}/${beat.id}: causal chain must reference previous beat`);
      }

      for (const mutation of beat.damage ?? []) {
        const zone = zoneById.get(mutation.zoneId);
        if (!zone || zone.kind !== 'destructible') {
          errors.push(`${variant.id}/${beat.id}: invalid damage zone ${mutation.zoneId}`);
        } else if (!zone.states.includes(mutation.state)) {
          errors.push(`${variant.id}/${beat.id}: unknown state ${mutation.state} for ${mutation.zoneId}`);
        }
      }
    });

    if (variant.sharedUntilBeat < 3 || variant.sharedUntilBeat >= variant.beats.length) {
      errors.push(`${variant.id}: shared progression must contain at least three beats and leave a terminal beat`);
    }
  }

  const permanent = zones.filter(
    (zone): zone is KitchenZone & { id: KitchenPermanentZoneId } => zone.kind === 'permanent',
  );
  const destructible = zones.filter(
    (zone): zone is KitchenZone & { id: KitchenDestructibleZoneId } => zone.kind === 'destructible',
  );

  for (const tier of [0, 1, 2, 3, 4] as const) {
    const composition = tiers[tier];

    for (const zone of permanent) {
      const state = composition.shellStates[zone.id];
      if (!state) errors.push(`tier ${tier}: missing shell state ${zone.id}`);
      else if (!zone.states.includes(state)) errors.push(`tier ${tier}: invalid shell ${zone.id} state ${state}`);
    }

    for (const zone of destructible) {
      const state = composition.zoneStates[zone.id];
      if (!state) errors.push(`tier ${tier}: missing zone ${zone.id}`);
      else if (!zone.states.includes(state)) errors.push(`tier ${tier}: invalid ${zone.id} state ${state}`);
    }

    for (const prop of props) {
      const state = composition.propStates[prop.id];
      if (!state) errors.push(`tier ${tier}: missing prop ${prop.id}`);
      else if (!prop.states.includes(state)) errors.push(`tier ${tier}: invalid ${prop.id} state ${state}`);
    }
  }

  return errors;
}
