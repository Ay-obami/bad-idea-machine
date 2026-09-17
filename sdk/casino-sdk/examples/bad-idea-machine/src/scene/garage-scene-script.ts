import type { Hex } from 'viem';

import type { OutcomeTier } from '../lib/badIdea';
import { getEnvironmentDefinition } from './environments';
import { buildImpact } from './impact';
import { visualByte, visualU16 } from './random';
import type {
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

const GARAGE_SHARED = ['garage-hammer', 'garage-wrench', 'garage-drill', 'garage-saw', 'garage-chain', 'garage-tire', 'garage-shelf'] as const;
const GARAGE_SHARED_HAZARDS: Readonly<Record<string, SceneHazard>> = {
  'garage-hammer': 'sparks',
  'garage-wrench': 'debris',
  'garage-drill': 'fire',
  'garage-saw': 'sparks',
  'garage-chain': 'debris',
  'garage-tire': 'smoke',
  'garage-shelf': 'debris',
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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const durationMs = (seed: Hex) => 4_700 + (visualU16(seed, 18) % 1_501);

function templateFor(actorId: string): EventTemplate {
  const template = GARAGE_TEMPLATES.find(candidate => candidate.actorId === actorId);
  if (!template) throw new Error(`unknown garage event template: ${actorId}`);
  return template;
}

function seededOrder<T>(values: readonly T[], seed: Hex, cursor: number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = visualU16(seed, cursor + index * 2) % (index + 1);
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

function decoyIndices(seed: Hex, count: number): ReadonlySet<number> {
  const wanted = Math.min(count, 1 + (visualByte(seed, 25) % 3));
  const indices = new Set<number>();
  const start = count > 0 ? visualU16(seed, 26) % count : 0;
  const stride = 1 + (visualByte(seed, 28) % Math.max(1, count - 1));
  for (let offset = 0; offset < count * 2 && indices.size < wanted; offset += 1) indices.add((start + offset * stride) % count);
  for (let index = 0; indices.size < wanted && index < count; index += 1) indices.add(index);
  return indices;
}

function effectSeed(seed: Hex, index: number): number {
  return (visualByte(seed, index + 2) << 16) | (visualByte(seed, index + 13) << 8) | visualByte(seed, index + 27);
}

function pathFor(template: EventTemplate, seed: Hex, index: number): readonly MotionKeyframe[] {
  const actor = getEnvironmentDefinition('garage').actors.find(candidate => candidate.id === template.actorId)!;
  const controlJitterX = (visualByte(seed, index + 5) % 61) - 30;
  const controlJitterY = (visualByte(seed, index + 16) % 51) - 25;
  const endJitterX = (visualByte(seed, index + 7) % 31) - 15;
  const endJitterY = (visualByte(seed, index + 18) % 31) - 15;
  const spin = 90 + (visualByte(seed, index + 22) % 271);
  return [
    { at: 0, x: actor.home.x, y: actor.home.y, rotation: actor.rotation, scale: actor.scale },
    { at: .56, x: clamp(template.control.x + controlJitterX, 30, 970), y: clamp(template.control.y + controlJitterY, 30, 570), rotation: actor.rotation + spin * .55, scale: actor.scale * 1.05 },
    { at: 1, x: clamp(template.end.x + endJitterX, 20, 980), y: clamp(template.end.y + endJitterY, 20, 580), rotation: actor.rotation + spin, scale: actor.scale },
  ];
}

function buildEvent(input: Readonly<{
  template: EventTemplate;
  seed: Hex;
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
  const requested = 780 + (visualByte(input.seed, input.index + 12) % 241);
  const eventDuration = Math.max(1, Math.min(requested, input.totalDurationMs - input.startMs));
  const path = pathFor(input.template, input.seed, input.index);
  const zone = input.template.impactZone;
  const point = zone ? getEnvironmentDefinition('garage').impactZones[zone] : path.at(-1)!;
  const action = input.action ?? input.template.action;
  return {
    id: `${input.idPrefix}-${input.template.actorId}`,
    actorId: input.template.actorId,
    action,
    startMs: input.startMs,
    durationMs: eventDuration,
    path,
    impacts: [buildImpact({ environment: 'garage', actorId: input.template.actorId, action, hazard: input.hazard, intensity: input.intensity, point, durationMs: eventDuration, zone })],
    hazard: input.hazard,
    intensity: input.intensity,
    decoy: input.decoy,
    effectSeed: effectSeed(input.seed, input.index),
    soundCue: input.soundCue ?? input.template.soundCue,
  };
}

export function buildGarageSharedSequence(seed: Hex): readonly SceneEvent[] {
  const total = durationMs(seed);
  const ordered = seededOrder(GARAGE_SHARED, seed, 2);
  const decoys = decoyIndices(seed, ordered.length);
  const lastSharedStart = Math.floor(total * .52);
  return ordered.map((actorId, index) => buildEvent({
    template: templateFor(actorId),
    seed,
    index,
    startMs: Math.floor(index * lastSharedStart / (ordered.length - 1)),
    totalDurationMs: total,
    hazard: GARAGE_SHARED_HAZARDS[actorId],
    intensity: (2 + (visualByte(seed, index + 9) % 2)) as 2 | 3,
    decoy: decoys.has(index),
    idPrefix: `garage-shared-${index}`,
  }));
}

export function buildGarageTerminalSequence(tier: OutcomeTier, seed: Hex): readonly SceneEvent[] {
  const total = durationMs(seed);
  const beats = GARAGE_TERMINALS[tier];
  const firstStart = Math.floor(total * .67);
  const latestStart = Math.max(firstStart, total - 1_050);
  return beats.map((beat, index) => buildEvent({
    template: templateFor(beat.actorId),
    seed,
    index: 64 + tier * 11 + index * 3,
    startMs: beats.length === 1 ? firstStart : Math.floor(firstStart + index * (latestStart - firstStart) / (beats.length - 1)),
    totalDurationMs: total,
    hazard: beat.hazard,
    intensity: beat.intensity,
    decoy: false,
    action: beat.action,
    soundCue: beat.soundCue,
    idPrefix: `garage-terminal-${tier}-${index}`,
  }));
}

function finalizer(tier: OutcomeTier): SceneFinalizer {
  const copy = [
    ['WORKSHOP DESTROYED. PROFIT MISSING.', 'Everything broke except the house edge.'],
    ['MINOR INDUSTRIAL MIRACLE', 'One useful thing survived the impact.'],
    ['OSHA WOULD HAVE QUESTIONS', 'The workshop somehow manufactured a respectable return.'],
    ['HEAVY MACHINERY, HEAVIER PAYOUT', 'The tool wall lost. You did not.'],
    ['INDUSTRIAL-GRADE BAD DECISION', 'Every warning light is on and the payout is enormous.'],
  ] as const;
  return { tier, label: copy[tier][0], flavor: copy[tier][1], impact: getEnvironmentDefinition('garage').impactZones.core };
}

export function buildGarageSceneScript(tier: OutcomeTier, seed: Hex): SceneScript {
  return {
    environment: 'garage',
    durationMs: durationMs(seed),
    events: [...buildGarageSharedSequence(seed), ...buildGarageTerminalSequence(tier, seed)],
    finalizer: finalizer(tier),
  };
}
