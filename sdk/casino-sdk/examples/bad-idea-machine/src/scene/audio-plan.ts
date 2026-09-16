import { type FoleySampleId } from './audio-samples';
import type { EnvironmentId, ImpactEvent, SceneEvent, ScenePoint } from './types';

export type SceneSoundRole = 'action' | 'impact' | 'hazard' | 'debris' | 'ambience';

export type SceneSoundLayer = Readonly<{
  kind: 'sample';
  sampleId: FoleySampleId;
  role: SceneSoundRole;
  delayMs: number;
  gain: number;
  pan: number;
  playbackRate: number;
  loop?: boolean;
}>;

function seededRandom(seed: number) {
  let state = (seed || 0x243f6a88) >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function naturalRate(random: () => number): number {
  return Number((.92 + random() * .16).toFixed(3));
}

function panFor(point: ScenePoint): number {
  return Number(clamp(((point.x - 500) / 500) * .7, -.7, .7).toFixed(3));
}

function layer(
  sampleId: FoleySampleId,
  role: SceneSoundRole,
  delayMs: number,
  gain: number,
  pan: number,
  playbackRate: number,
  loop = false,
): SceneSoundLayer {
  return {
    kind: 'sample',
    sampleId,
    role,
    delayMs: Math.max(0, Math.round(delayMs)),
    gain: Number(clamp(gain, 0, .82).toFixed(3)),
    pan: Number(clamp(pan, -.7, .7).toFixed(3)),
    playbackRate: Number(clamp(playbackRate, .88, 1.12).toFixed(3)),
    ...(loop ? { loop: true } : {}),
  };
}

function actionSample(environment: EnvironmentId, cue: string): FoleySampleId | undefined {
  if (environment === 'kitchen') {
    if (cue.includes('toaster') || cue.includes('toast')) return 'kitchen-toaster-pop';
    if (cue.includes('kettle') || cue.includes('steam')) return 'kitchen-steam-hiss';
    if (cue.includes('ceramic') || cue.includes('plate') || cue.includes('dish')) return 'kitchen-ceramic-break';
    if (cue.includes('pan')) return 'kitchen-pan-hit';
    if (cue.includes('rocket')) return 'rocket-whoosh';
    if (cue.includes('safe') || cue.includes('ball')) return 'heavy-crash';
    return undefined;
  }

  if (cue.includes('drill')) return 'garage-drill';
  if (cue.includes('saw')) return 'garage-saw';
  if (cue.includes('chain')) return 'garage-chain';
  if (cue.includes('tire')) return 'garage-tire';
  if (cue.includes('rocket')) return 'rocket-whoosh';
  if (cue.includes('safe') || cue.includes('shelf') || cue.includes('toolbox')) return 'heavy-crash';
  if (cue.includes('wrench') || cue.includes('hammer')) return 'metal-impact';
  return undefined;
}

function impactSample(environment: EnvironmentId, impact: ImpactEvent, cue: string): FoleySampleId {
  if (impact.effect === 'shatter' || impact.materialA === 'ceramic' || impact.materialB === 'ceramic' || impact.materialA === 'glass' || impact.materialB === 'glass') {
    return environment === 'kitchen' ? 'kitchen-ceramic-break' : 'debris-fall';
  }
  if (impact.materialA === 'wood' || impact.materialB === 'wood') return 'wood-crack';
  if (impact.strength >= 3 || impact.effect === 'blast') return 'heavy-crash';
  if (environment === 'kitchen' && cue.includes('pan')) return 'kitchen-pan-hit';
  if (environment === 'garage' && cue.includes('tire')) return 'garage-tire';
  if (environment === 'garage' && cue.includes('chain')) return 'garage-chain';
  return 'metal-impact';
}

function hazardSample(environment: EnvironmentId, event: SceneEvent): FoleySampleId | undefined {
  switch (event.hazard) {
    case 'fire': return 'fire-crackle';
    case 'sparks': return 'sparks-burst';
    case 'steam': return environment === 'kitchen' ? 'kitchen-steam-hiss' : 'debris-fall';
    case 'shards': return environment === 'kitchen' ? 'kitchen-ceramic-break' : 'debris-fall';
    case 'blast': return 'debris-fall';
    case 'debris': return 'debris-fall';
    case 'smoke': return 'debris-fall';
    case 'alarm': return undefined;
  }
}

function fallbackImpact(event: SceneEvent): ImpactEvent {
  const final = event.path.at(-1) ?? { at: 1, x: 500, y: 300, rotation: 0 };
  return {
    atMs: Math.round(event.durationMs * .72),
    point: { x: final.x, y: final.y },
    materialA: 'metal',
    materialB: 'masonry',
    strength: event.intensity,
    effect: event.hazard === 'fire' ? 'fire' : event.hazard === 'sparks' ? 'spark' : 'debris',
    persistentDamage: [],
  };
}

export function buildEventSoundPlan(environment: EnvironmentId, event: SceneEvent): readonly SceneSoundLayer[] {
  const random = seededRandom(event.effectSeed ^ (environment === 'kitchen' ? 0x51f15e : 0xa5a5a5a5));
  const impact = event.impacts[0] ?? fallbackImpact(event);
  const impactAt = clamp(impact.atMs, 0, event.durationMs);
  const impactPan = panFor(impact.point);
  const plan: SceneSoundLayer[] = [];

  const action = actionSample(environment, event.soundCue);
  if (action) {
    plan.push(layer(action, 'action', 0, .26, panFor(event.path[0] ?? impact.point), naturalRate(random)));
  }

  plan.push(layer(
    impactSample(environment, impact, event.soundCue),
    'impact',
    impactAt,
    impact.strength >= 4 ? .74 : impact.strength === 3 ? .66 : .56,
    impactPan,
    naturalRate(random),
  ));

  const hazard = hazardSample(environment, event);
  if (hazard) {
    plan.push(layer(
      hazard,
      'hazard',
      clamp(impactAt + 24, 0, event.durationMs),
      event.hazard === 'fire' ? .28 : .32,
      impactPan,
      naturalRate(random),
    ));
  }

  for (let index = 1; index < event.intensity; index += 1) {
    const delay = clamp(impactAt + 70 + random() * 150 + index * 42, 0, event.durationMs);
    const offsetPan = clamp(impactPan + (random() - .5) * .3, -.7, .7);
    plan.push(layer('debris-fall', 'debris', delay, .24 + index * .06, offsetPan, naturalRate(random)));
  }

  if (event.decoy) {
    plan.push(layer(
      environment === 'kitchen' ? 'kitchen-pan-hit' : 'metal-impact',
      'action',
      clamp(event.durationMs * .45, 0, event.durationMs),
      .18,
      clamp(-impactPan * .6, -.7, .7),
      naturalRate(random),
    ));
  }

  return plan.sort((a, b) => a.delayMs - b.delayMs || a.role.localeCompare(b.role));
}

export function buildAftermathSoundPlan(environment: EnvironmentId, tier: 0 | 1 | 2 | 3 | 4): readonly SceneSoundLayer[] {
  const gain = .08 + tier * .02;
  return [layer(
    environment === 'kitchen' ? 'kitchen-aftermath' : 'garage-aftermath',
    'ambience',
    0,
    gain,
    0,
    1,
    true,
  )];
}
