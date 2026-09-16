import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { getEnvironmentDefinition } from './environments';
import { visualByte, visualU16 } from './random';
import type {
  EnvironmentId,
  MotionKeyframe,
  SceneAction,
  SceneEvent,
  SceneFinalizer,
  SceneHazard,
  ScenePoint,
  SceneScript,
} from './types';

type EventTemplate = Readonly<{
  actorId: string;
  action: SceneAction;
  end: ScenePoint;
  control: ScenePoint;
  hazards: readonly SceneHazard[];
  soundCue: string;
  impactZone?: string;
}>;

const KITCHEN_TEMPLATES: readonly EventTemplate[] = [
  { actorId: 'kitchen-toaster', action: 'launch', control: { x: 260, y: 255 }, end: { x: 430, y: 315 }, hazards: ['sparks', 'fire'], soundCue: 'toaster-pop', impactZone: 'leftCounter' },
  { actorId: 'kitchen-toast', action: 'ricochet', control: { x: 470, y: 135 }, end: { x: 760, y: 285 }, hazards: ['debris', 'shards'], soundCue: 'toast-whip', impactZone: 'sink' },
  { actorId: 'kitchen-cat', action: 'near-miss', control: { x: 520, y: 335 }, end: { x: 815, y: 455 }, hazards: ['alarm', 'debris'], soundCue: 'cat-panic', impactZone: 'floorCenter' },
  { actorId: 'kitchen-pan', action: 'ricochet', control: { x: 560, y: 140 }, end: { x: 775, y: 300 }, hazards: ['sparks', 'debris'], soundCue: 'pan-clang', impactZone: 'stove' },
  { actorId: 'kitchen-kettle', action: 'vent', control: { x: 625, y: 300 }, end: { x: 585, y: 390 }, hazards: ['steam', 'smoke'], soundCue: 'kettle-hiss', impactZone: 'sink' },
  { actorId: 'kitchen-cabinet', action: 'swing', control: { x: 395, y: 165 }, end: { x: 455, y: 220 }, hazards: ['debris', 'shards'], soundCue: 'cabinet-slam', impactZone: 'ceilingLeft' },
  { actorId: 'kitchen-plates', action: 'shatter', control: { x: 500, y: 230 }, end: { x: 540, y: 385 }, hazards: ['shards', 'debris'], soundCue: 'ceramic-shatter', impactZone: 'stove' },
  { actorId: 'kitchen-fan', action: 'launch', control: { x: 630, y: 185 }, end: { x: 390, y: 345 }, hazards: ['sparks', 'smoke'], soundCue: 'fan-overdrive', impactZone: 'stove' },
  { actorId: 'kitchen-ball', action: 'roll', control: { x: 670, y: 325 }, end: { x: 165, y: 500 }, hazards: ['debris', 'shards'], soundCue: 'ball-rumble', impactZone: 'leftCounter' },
  { actorId: 'kitchen-rocket', action: 'launch', control: { x: 610, y: 175 }, end: { x: 105, y: 125 }, hazards: ['fire', 'blast'], soundCue: 'rocket-blast', impactZone: 'ceilingLeft' },
  { actorId: 'kitchen-safe', action: 'drop', control: { x: 705, y: 220 }, end: { x: 585, y: 510 }, hazards: ['blast', 'debris'], soundCue: 'safe-crash', impactZone: 'floorCenter' },
  { actorId: 'kitchen-core', action: 'ignite', control: { x: 515, y: 420 }, end: { x: 515, y: 455 }, hazards: ['fire', 'alarm'], soundCue: 'core-overload', impactZone: 'core' },
];

const GARAGE_TEMPLATES: readonly EventTemplate[] = [
  { actorId: 'garage-hammer', action: 'swing', control: { x: 300, y: 245 }, end: { x: 440, y: 340 }, hazards: ['sparks', 'debris'], soundCue: 'hammer-clang', impactZone: 'workbench' },
  { actorId: 'garage-wrench', action: 'ricochet', control: { x: 430, y: 115 }, end: { x: 710, y: 285 }, hazards: ['sparks', 'debris'], soundCue: 'wrench-ricochet', impactZone: 'shelf' },
  { actorId: 'garage-drill', action: 'launch', control: { x: 500, y: 240 }, end: { x: 740, y: 405 }, hazards: ['sparks', 'smoke'], soundCue: 'drill-runaway', impactZone: 'tireLane' },
  { actorId: 'garage-saw', action: 'ricochet', control: { x: 555, y: 250 }, end: { x: 290, y: 455 }, hazards: ['sparks', 'debris'], soundCue: 'saw-screech', impactZone: 'floorCenter' },
  { actorId: 'garage-chain', action: 'drop', control: { x: 600, y: 240 }, end: { x: 620, y: 440 }, hazards: ['sparks', 'debris'], soundCue: 'chain-snap', impactZone: 'floorCenter' },
  { actorId: 'garage-fan', action: 'launch', control: { x: 565, y: 250 }, end: { x: 355, y: 415 }, hazards: ['sparks', 'smoke'], soundCue: 'fan-overdrive', impactZone: 'workbench' },
  { actorId: 'garage-tire', action: 'roll', control: { x: 425, y: 420 }, end: { x: 865, y: 475 }, hazards: ['debris', 'smoke'], soundCue: 'tire-thump', impactZone: 'tank' },
  { actorId: 'garage-ball', action: 'roll', control: { x: 510, y: 430 }, end: { x: 820, y: 470 }, hazards: ['debris', 'sparks'], soundCue: 'ball-rumble', impactZone: 'tireLane' },
  { actorId: 'garage-rocket', action: 'launch', control: { x: 605, y: 125 }, end: { x: 120, y: 155 }, hazards: ['fire', 'blast'], soundCue: 'rocket-blast', impactZone: 'toolWall' },
  { actorId: 'garage-tank', action: 'vent', control: { x: 850, y: 360 }, end: { x: 795, y: 395 }, hazards: ['smoke', 'blast'], soundCue: 'tank-hiss', impactZone: 'tank' },
  { actorId: 'garage-shelf', action: 'collapse', control: { x: 730, y: 245 }, end: { x: 690, y: 415 }, hazards: ['debris', 'sparks'], soundCue: 'shelf-collapse', impactZone: 'shelf' },
  { actorId: 'garage-safe', action: 'drop', control: { x: 825, y: 220 }, end: { x: 665, y: 515 }, hazards: ['blast', 'debris'], soundCue: 'safe-crash', impactZone: 'floorCenter' },
  { actorId: 'garage-core', action: 'ignite', control: { x: 600, y: 435 }, end: { x: 600, y: 470 }, hazards: ['fire', 'alarm'], soundCue: 'core-overload', impactZone: 'core' },
];

const PRIMARY_HAZARDS: readonly SceneHazard[] = ['fire', 'blast'];
const SECONDARY_HAZARDS: readonly SceneHazard[] = ['debris', 'smoke', 'steam', 'shards'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function templatesFor(environment: EnvironmentId): readonly EventTemplate[] {
  return environment === 'kitchen' ? KITCHEN_TEMPLATES : GARAGE_TEMPLATES;
}

function shuffledTemplates(environment: EnvironmentId, visualSeed: Hex): EventTemplate[] {
  const deck = [...templatesFor(environment)];
  let cursor = 1;
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapWith = visualU16(visualSeed, cursor) % (index + 1);
    [deck[index], deck[swapWith]] = [deck[swapWith], deck[index]];
    cursor += 2;
  }
  return deck;
}

function isLongTravel(template: EventTemplate, environment: EnvironmentId): boolean {
  const actor = getEnvironmentDefinition(environment).actors.find(candidate => candidate.id === template.actorId);
  if (!actor) return false;
  return Math.abs(template.end.x - actor.home.x) >= 350 || Math.abs(template.end.y - actor.home.y) >= 180;
}

function selectedTemplates(environment: EnvironmentId, visualSeed: Hex, count: number): EventTemplate[] {
  const selected = shuffledTemplates(environment, visualSeed).slice(0, count);
  if (!selected.some(template => isLongTravel(template, environment))) {
    const hero = templatesFor(environment).find(template => isLongTravel(template, environment));
    if (hero && !selected.some(template => template.actorId === hero.actorId)) selected[selected.length - 1] = hero;
  }
  return selected;
}

function decoyIndices(visualSeed: Hex, count: number): ReadonlySet<number> {
  const wanted = 1 + (visualByte(visualSeed, 25) % 3);
  const indices = new Set<number>();
  const start = visualU16(visualSeed, 26) % count;
  const stride = 1 + (visualByte(visualSeed, 28) % Math.max(1, count - 1));

  for (let offset = 0; offset < count * 2 && indices.size < wanted; offset += 1) {
    indices.add((start + offset * stride) % count);
  }
  for (let index = 0; indices.size < wanted && index < count; index += 1) {
    indices.add(index);
  }
  return indices;
}

function effectSeed(visualSeed: Hex, index: number): number {
  return (
    (visualByte(visualSeed, index + 2) << 16)
    | (visualByte(visualSeed, index + 13) << 8)
    | visualByte(visualSeed, index + 27)
  );
}

function hazardFor(template: EventTemplate, visualSeed: Hex, index: number): SceneHazard {
  if (index === 0) return PRIMARY_HAZARDS[visualByte(visualSeed, 20) % PRIMARY_HAZARDS.length];
  if (index === 1) return SECONDARY_HAZARDS[visualByte(visualSeed, 21) % SECONDARY_HAZARDS.length];
  return template.hazards[visualByte(visualSeed, index + 10) % template.hazards.length];
}

function pathFor(environment: EnvironmentId, template: EventTemplate, visualSeed: Hex, index: number): readonly MotionKeyframe[] {
  const actor = getEnvironmentDefinition(environment).actors.find(candidate => candidate.id === template.actorId);
  if (!actor) throw new Error(`unknown ${environment} scene actor: ${template.actorId}`);

  const controlJitterX = (visualByte(visualSeed, index + 5) % 61) - 30;
  const controlJitterY = (visualByte(visualSeed, index + 16) % 51) - 25;
  const endJitterX = (visualByte(visualSeed, index + 7) % 31) - 15;
  const endJitterY = (visualByte(visualSeed, index + 18) % 31) - 15;
  const spin = 90 + (visualByte(visualSeed, index + 22) % 271);

  return [
    { at: 0, x: actor.home.x, y: actor.home.y, rotation: actor.rotation, scale: actor.scale },
    {
      at: .56,
      x: clamp(template.control.x + controlJitterX, 30, 970),
      y: clamp(template.control.y + controlJitterY, 30, 570),
      rotation: actor.rotation + spin * .55,
      scale: actor.scale * 1.05,
    },
    {
      at: 1,
      x: clamp(template.end.x + endJitterX, 20, 980),
      y: clamp(template.end.y + endJitterY, 20, 580),
      rotation: actor.rotation + spin,
      scale: actor.scale,
    },
  ];
}

function impactFor(environment: EnvironmentId, template: EventTemplate, path: readonly MotionKeyframe[]): ScenePoint {
  const definition = getEnvironmentDefinition(environment);
  if (template.impactZone && definition.impactZones[template.impactZone]) {
    return definition.impactZones[template.impactZone];
  }
  const end = path.at(-1)!;
  return { x: end.x, y: end.y };
}

function finalizerFor(environment: EnvironmentId, tier: OutcomeTier): SceneFinalizer {
  const definition = getEnvironmentDefinition(environment);
  const impact = definition.impactZones.core;
  if (environment === 'kitchen') {
    const copy = [
      ['TOTAL CHAOS. ZERO DINNER.', 'The kitchen is ruined and somehow still unprofitable.'],
      ['SOMEHOW, BREAKFAST PAID.', 'A small return escaped through the smoke.'],
      ['QUESTIONABLE CULINARY ENGINEERING', 'The appliances have accidentally created value.'],
      ['THE KITCHEN SHOULD NOT HAVE WORKED', 'Against every safety label, this paid surprisingly well.'],
      ['CATASTROPHICALLY EDIBLE SUCCESS', 'The room is on fire. The payout is magnificent.'],
    ] as const;
    return { tier, label: copy[tier][0], flavor: copy[tier][1], impact };
  }

  const copy = [
    ['WORKSHOP DESTROYED. PROFIT MISSING.', 'Everything broke except the house edge.'],
    ['MINOR INDUSTRIAL MIRACLE', 'One useful thing survived the impact.'],
    ['OSHA WOULD HAVE QUESTIONS', 'The workshop somehow manufactured a respectable return.'],
    ['HEAVY MACHINERY, HEAVIER PAYOUT', 'The tool wall lost. You did not.'],
    ['INDUSTRIAL-GRADE BAD DECISION', 'Every warning light is on and the payout is enormous.'],
  ] as const;
  return { tier, label: copy[tier][0], flavor: copy[tier][1], impact };
}

export function buildSceneScript(
  environment: EnvironmentId,
  tier: OutcomeTier,
  visualSeed: Hex,
): SceneScript {
  const count = 8 + (visualByte(visualSeed, 31) % 5);
  const durationMs = 4_700 + (visualU16(visualSeed, 18) % 1_501);
  const templates = selectedTemplates(environment, visualSeed, count);
  const decoys = decoyIndices(visualSeed, count);
  const latestStart = durationMs - 1_050;

  const events: readonly SceneEvent[] = templates.map((template, index) => {
    const startMs = count === 1 ? 0 : Math.floor(index * latestStart / (count - 1));
    const requestedDuration = 800 + (visualByte(visualSeed, index + 12) % 251);
    const durationMsForEvent = Math.min(requestedDuration, durationMs - startMs);
    const path = pathFor(environment, template, visualSeed, index);
    const intensity = (2 + (visualByte(visualSeed, index + 9) % 2)) as 2 | 3;

    return {
      id: `${environment}-${index}-${template.actorId}`,
      actorId: template.actorId,
      action: template.action,
      startMs,
      durationMs: durationMsForEvent,
      path,
      impact: impactFor(environment, template, path),
      hazard: hazardFor(template, visualSeed, index),
      intensity,
      decoy: decoys.has(index),
      effectSeed: effectSeed(visualSeed, index),
      soundCue: template.soundCue,
    };
  });

  return {
    environment,
    durationMs,
    events,
    finalizer: finalizerFor(environment, tier),
  };
}

export function sceneDurationMs(script: SceneScript): number {
  return script.durationMs;
}

export function catastropheSummary(script: SceneScript): readonly string[] {
  const actors = new Map(getEnvironmentDefinition(script.environment).actors.map(actor => [actor.id, actor.kind] as const));
  return script.events.slice(0, 5).map(event => {
    const kind = actors.get(event.actorId) ?? event.actorId;
    return `${kind.replaceAll('-', ' ')} ${event.action.replaceAll('-', ' ')} / ${event.hazard}`;
  });
}
