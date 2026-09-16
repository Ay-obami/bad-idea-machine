import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { getEnvironmentDefinition } from './environments';
import { buildImpact } from './impact';
import { visualByte, visualU16 } from './random';
import type {
  EnvironmentId,
  MotionKeyframe,
  SceneAction,
  SceneEvent,
  SceneFinalizer,
  SceneHazard,
  SceneIntensity,
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

type TerminalBeat = Readonly<{
  actorId: string;
  action?: SceneAction;
  hazard: SceneHazard;
  intensity: SceneIntensity;
  soundCue?: string;
}>;

const KITCHEN_TEMPLATES: readonly EventTemplate[] = [
  { actorId: 'kitchen-toaster', action: 'launch', control: { x: 260, y: 255 }, end: { x: 430, y: 315 }, hazards: ['sparks', 'fire'], soundCue: 'toaster-pop', impactZone: 'leftCounter' },
  { actorId: 'kitchen-toast', action: 'ricochet', control: { x: 470, y: 135 }, end: { x: 760, y: 285 }, hazards: ['debris', 'shards'], soundCue: 'toast-whip', impactZone: 'sink' },
  { actorId: 'kitchen-pan', action: 'ricochet', control: { x: 560, y: 140 }, end: { x: 775, y: 300 }, hazards: ['sparks', 'debris'], soundCue: 'pan-clang', impactZone: 'stove' },
  { actorId: 'kitchen-kettle', action: 'vent', control: { x: 625, y: 300 }, end: { x: 585, y: 390 }, hazards: ['steam', 'smoke'], soundCue: 'kettle-hiss', impactZone: 'sink' },
  { actorId: 'kitchen-cabinet', action: 'swing', control: { x: 395, y: 165 }, end: { x: 455, y: 220 }, hazards: ['debris', 'shards'], soundCue: 'cabinet-slam', impactZone: 'ceilingLeft' },
  { actorId: 'kitchen-plates', action: 'shatter', control: { x: 500, y: 230 }, end: { x: 540, y: 385 }, hazards: ['shards', 'debris'], soundCue: 'ceramic-shatter', impactZone: 'stove' },
  { actorId: 'kitchen-ball', action: 'roll', control: { x: 670, y: 325 }, end: { x: 165, y: 500 }, hazards: ['debris', 'shards'], soundCue: 'ball-rumble', impactZone: 'leftCounter' },
  { actorId: 'kitchen-rocket', action: 'launch', control: { x: 610, y: 175 }, end: { x: 105, y: 125 }, hazards: ['fire', 'blast'], soundCue: 'rocket-blast', impactZone: 'ceilingLeft' },
  { actorId: 'kitchen-safe', action: 'drop', control: { x: 705, y: 220 }, end: { x: 585, y: 510 }, hazards: ['blast', 'debris'], soundCue: 'safe-crash', impactZone: 'floorCenter' },
];

const GARAGE_TEMPLATES: readonly EventTemplate[] = [
  { actorId: 'garage-hammer', action: 'swing', control: { x: 300, y: 245 }, end: { x: 440, y: 340 }, hazards: ['sparks', 'debris'], soundCue: 'hammer-clang', impactZone: 'workbench' },
  { actorId: 'garage-wrench', action: 'ricochet', control: { x: 430, y: 115 }, end: { x: 710, y: 285 }, hazards: ['sparks', 'debris'], soundCue: 'wrench-ricochet', impactZone: 'shelf' },
  { actorId: 'garage-drill', action: 'launch', control: { x: 500, y: 240 }, end: { x: 740, y: 405 }, hazards: ['sparks', 'smoke'], soundCue: 'drill-runaway', impactZone: 'tireLane' },
  { actorId: 'garage-saw', action: 'ricochet', control: { x: 555, y: 250 }, end: { x: 290, y: 455 }, hazards: ['sparks', 'debris'], soundCue: 'saw-screech', impactZone: 'floorCenter' },
  { actorId: 'garage-chain', action: 'drop', control: { x: 600, y: 240 }, end: { x: 620, y: 440 }, hazards: ['sparks', 'debris'], soundCue: 'chain-snap', impactZone: 'floorCenter' },
  { actorId: 'garage-tire', action: 'roll', control: { x: 425, y: 420 }, end: { x: 865, y: 475 }, hazards: ['debris', 'smoke'], soundCue: 'tire-thump', impactZone: 'tank' },
  { actorId: 'garage-rocket', action: 'launch', control: { x: 605, y: 125 }, end: { x: 120, y: 155 }, hazards: ['fire', 'blast'], soundCue: 'rocket-blast', impactZone: 'toolWall' },
  { actorId: 'garage-tank', action: 'vent', control: { x: 850, y: 360 }, end: { x: 795, y: 395 }, hazards: ['smoke', 'blast'], soundCue: 'tank-hiss', impactZone: 'tank' },
  { actorId: 'garage-toolbox', action: 'collapse', control: { x: 540, y: 400 }, end: { x: 455, y: 500 }, hazards: ['debris', 'sparks'], soundCue: 'toolbox-spill', impactZone: 'floorCenter' },
  { actorId: 'garage-shelf', action: 'collapse', control: { x: 730, y: 245 }, end: { x: 690, y: 415 }, hazards: ['debris', 'sparks'], soundCue: 'shelf-collapse', impactZone: 'shelf' },
  { actorId: 'garage-safe', action: 'drop', control: { x: 825, y: 220 }, end: { x: 665, y: 515 }, hazards: ['blast', 'debris'], soundCue: 'safe-crash', impactZone: 'floorCenter' },
];

const KITCHEN_SHARED = ['kitchen-toaster', 'kitchen-toast', 'kitchen-pan', 'kitchen-kettle', 'kitchen-cabinet', 'kitchen-plates'] as const;
const GARAGE_SHARED = ['garage-hammer', 'garage-wrench', 'garage-drill', 'garage-saw', 'garage-chain', 'garage-tire', 'garage-shelf'] as const;

const KITCHEN_SHARED_HAZARDS: Readonly<Record<string, SceneHazard>> = {
  'kitchen-toaster': 'fire',
  'kitchen-toast': 'debris',
  'kitchen-pan': 'sparks',
  'kitchen-kettle': 'steam',
  'kitchen-cabinet': 'debris',
  'kitchen-plates': 'shards',
};

const GARAGE_SHARED_HAZARDS: Readonly<Record<string, SceneHazard>> = {
  'garage-hammer': 'sparks',
  'garage-wrench': 'debris',
  'garage-drill': 'fire',
  'garage-saw': 'sparks',
  'garage-chain': 'debris',
  'garage-tire': 'smoke',
  'garage-shelf': 'debris',
};

const KITCHEN_TERMINALS: Readonly<Record<OutcomeTier, readonly TerminalBeat[]>> = {
  0: [
    { actorId: 'kitchen-safe', hazard: 'blast', intensity: 3 },
    { actorId: 'kitchen-rocket', hazard: 'fire', intensity: 3 },
  ],
  1: [
    { actorId: 'kitchen-ball', hazard: 'debris', intensity: 1 },
    { actorId: 'kitchen-rocket', action: 'near-miss', hazard: 'smoke', intensity: 1, soundCue: 'rocket-flyby' },
  ],
  2: [
    { actorId: 'kitchen-ball', hazard: 'shards', intensity: 2 },
    { actorId: 'kitchen-safe', hazard: 'debris', intensity: 2 },
  ],
  3: [
    { actorId: 'kitchen-rocket', hazard: 'blast', intensity: 3 },
    { actorId: 'kitchen-safe', hazard: 'blast', intensity: 3 },
  ],
  4: [
    { actorId: 'kitchen-ball', hazard: 'debris', intensity: 3 },
    { actorId: 'kitchen-rocket', hazard: 'blast', intensity: 3 },
    { actorId: 'kitchen-safe', hazard: 'blast', intensity: 3 },
  ],
};

const GARAGE_TERMINALS: Readonly<Record<OutcomeTier, readonly TerminalBeat[]>> = {
  0: [
    { actorId: 'garage-safe', hazard: 'blast', intensity: 3 },
    { actorId: 'garage-toolbox', hazard: 'debris', intensity: 3 },
    { actorId: 'garage-tank', hazard: 'blast', intensity: 3 },
  ],
  1: [{ actorId: 'garage-toolbox', hazard: 'debris', intensity: 1 }],
  2: [
    { actorId: 'garage-toolbox', hazard: 'debris', intensity: 2 },
    { actorId: 'garage-tank', hazard: 'smoke', intensity: 2 },
  ],
  3: [
    { actorId: 'garage-tank', hazard: 'blast', intensity: 3 },
    { actorId: 'garage-rocket', hazard: 'fire', intensity: 3 },
    { actorId: 'garage-safe', hazard: 'debris', intensity: 3 },
  ],
  4: [
    { actorId: 'garage-toolbox', hazard: 'debris', intensity: 3 },
    { actorId: 'garage-tank', hazard: 'blast', intensity: 3 },
    { actorId: 'garage-rocket', hazard: 'blast', intensity: 3 },
    { actorId: 'garage-safe', hazard: 'blast', intensity: 3 },
  ],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function templatesFor(environment: EnvironmentId): readonly EventTemplate[] {
  return environment === 'kitchen' ? KITCHEN_TEMPLATES : GARAGE_TEMPLATES;
}

function templateFor(environment: EnvironmentId, actorId: string): EventTemplate {
  const template = templatesFor(environment).find(candidate => candidate.actorId === actorId);
  if (!template) throw new Error(`unknown ${environment} event template: ${actorId}`);
  return template;
}

function scriptDurationMs(visualSeed: Hex): number {
  return 4_700 + (visualU16(visualSeed, 18) % 1_501);
}

function seededOrder<T>(values: readonly T[], visualSeed: Hex, cursor: number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = visualU16(visualSeed, cursor + index * 2) % (index + 1);
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

function decoyIndices(visualSeed: Hex, count: number): ReadonlySet<number> {
  const wanted = Math.min(count, 1 + (visualByte(visualSeed, 25) % 3));
  const indices = new Set<number>();
  const start = count > 0 ? visualU16(visualSeed, 26) % count : 0;
  const stride = 1 + (visualByte(visualSeed, 28) % Math.max(1, count - 1));
  for (let offset = 0; offset < count * 2 && indices.size < wanted; offset += 1) indices.add((start + offset * stride) % count);
  for (let index = 0; indices.size < wanted && index < count; index += 1) indices.add(index);
  return indices;
}

function effectSeed(visualSeed: Hex, index: number): number {
  return (visualByte(visualSeed, index + 2) << 16) | (visualByte(visualSeed, index + 13) << 8) | visualByte(visualSeed, index + 27);
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
    { at: .56, x: clamp(template.control.x + controlJitterX, 30, 970), y: clamp(template.control.y + controlJitterY, 30, 570), rotation: actor.rotation + spin * .55, scale: actor.scale * 1.05 },
    { at: 1, x: clamp(template.end.x + endJitterX, 20, 980), y: clamp(template.end.y + endJitterY, 20, 580), rotation: actor.rotation + spin, scale: actor.scale },
  ];
}

function impactPointFor(environment: EnvironmentId, template: EventTemplate, path: readonly MotionKeyframe[]): ScenePoint {
  const definition = getEnvironmentDefinition(environment);
  if (template.impactZone && definition.impactZones[template.impactZone]) return definition.impactZones[template.impactZone];
  const end = path.at(-1)!;
  return { x: end.x, y: end.y };
}

function buildEvent(input: Readonly<{
  environment: EnvironmentId;
  template: EventTemplate;
  visualSeed: Hex;
  index: number;
  startMs: number;
  totalDurationMs: number;
  hazard: SceneHazard;
  intensity: SceneIntensity;
  decoy: boolean;
  action?: SceneAction;
  soundCue?: string;
  idPrefix: string;
}>): SceneEvent {
  const requestedDuration = 780 + (visualByte(input.visualSeed, input.index + 12) % 241);
  const durationMs = Math.max(1, Math.min(requestedDuration, input.totalDurationMs - input.startMs));
  const path = pathFor(input.environment, input.template, input.visualSeed, input.index);
  const point = impactPointFor(input.environment, input.template, path);
  const action = input.action ?? input.template.action;
  return {
    id: `${input.idPrefix}-${input.template.actorId}`,
    actorId: input.template.actorId,
    action,
    startMs: input.startMs,
    durationMs,
    path,
    impacts: [buildImpact({
      environment: input.environment,
      actorId: input.template.actorId,
      action,
      hazard: input.hazard,
      intensity: input.intensity,
      point,
      durationMs,
      zone: input.template.impactZone,
    })],
    hazard: input.hazard,
    intensity: input.intensity,
    decoy: input.decoy,
    effectSeed: effectSeed(input.visualSeed, input.index),
    soundCue: input.soundCue ?? input.template.soundCue,
  };
}

export function buildSharedSequence(environment: EnvironmentId, visualSeed: Hex): readonly SceneEvent[] {
  const durationMs = scriptDurationMs(visualSeed);
  const actorIds = environment === 'kitchen' ? KITCHEN_SHARED : GARAGE_SHARED;
  const hazards = environment === 'kitchen' ? KITCHEN_SHARED_HAZARDS : GARAGE_SHARED_HAZARDS;
  const ordered = seededOrder(actorIds, visualSeed, 2);
  const decoys = decoyIndices(visualSeed, ordered.length);
  const lastSharedStart = Math.floor(durationMs * .52);

  return ordered.map((actorId, index) => {
    const template = templateFor(environment, actorId);
    const startMs = ordered.length === 1 ? 0 : Math.floor(index * lastSharedStart / (ordered.length - 1));
    const intensity = (2 + (visualByte(visualSeed, index + 9) % 2)) as 2 | 3;
    return buildEvent({
      environment,
      template,
      visualSeed,
      index,
      startMs,
      totalDurationMs: durationMs,
      hazard: hazards[actorId] ?? template.hazards[0],
      intensity,
      decoy: decoys.has(index),
      idPrefix: `${environment}-shared-${index}`,
    });
  });
}

export function buildTerminalSequence(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): readonly SceneEvent[] {
  const durationMs = scriptDurationMs(visualSeed);
  const beats = environment === 'kitchen' ? KITCHEN_TERMINALS[tier] : GARAGE_TERMINALS[tier];
  const firstStart = Math.floor(durationMs * .67);
  const latestStart = Math.max(firstStart, durationMs - 1_050);

  return beats.map((beat, index) => {
    const template = templateFor(environment, beat.actorId);
    const startMs = beats.length === 1
      ? firstStart
      : Math.floor(firstStart + index * (latestStart - firstStart) / (beats.length - 1));
    const seedIndex = 64 + tier * 11 + index * 3;
    return buildEvent({
      environment,
      template,
      visualSeed,
      index: seedIndex,
      startMs,
      totalDurationMs: durationMs,
      hazard: beat.hazard,
      intensity: beat.intensity,
      decoy: false,
      action: beat.action,
      soundCue: beat.soundCue,
      idPrefix: `${environment}-terminal-${tier}-${index}`,
    });
  });
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

export function buildSceneScript(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): SceneScript {
  const durationMs = scriptDurationMs(visualSeed);
  const shared = buildSharedSequence(environment, visualSeed);
  const terminal = buildTerminalSequence(environment, tier, visualSeed);
  return { environment, durationMs, events: [...shared, ...terminal], finalizer: finalizerFor(environment, tier) };
}

export function sceneDurationMs(script: SceneScript): number {
  return script.durationMs;
}

export function catastropheSummary(script: SceneScript): readonly string[] {
  const actors = new Map(getEnvironmentDefinition(script.environment).actors.map(actor => [actor.id, actor.assetId] as const));
  return script.events.slice(0, 5).map(event => {
    const assetId = actors.get(event.actorId) ?? event.actorId;
    return `${assetId.replaceAll('-', ' ')} ${event.action.replaceAll('-', ' ')} / ${event.hazard}`;
  });
}
