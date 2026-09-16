import type { EnvironmentId, SceneEvent, SceneHazard } from './types';

export type SceneSoundLayer = Readonly<{
  kind: 'tone' | 'noise';
  delayMs: number;
  durationMs: number;
  gain: number;
  frequency?: number;
  endFrequency?: number;
  waveform?: OscillatorType;
  filterHz?: number;
}>;

function seededRandom(seed: number) {
  let state = (seed || 0x243f6a88) >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function tone(
  frequency: number,
  durationMs: number,
  delayMs: number,
  gain: number,
  waveform: OscillatorType = 'triangle',
  endFrequency?: number,
): SceneSoundLayer {
  return { kind: 'tone', frequency, durationMs, delayMs, gain, waveform, endFrequency };
}

function noise(durationMs: number, delayMs: number, gain: number, filterHz: number): SceneSoundLayer {
  return { kind: 'noise', durationMs, delayMs, gain, filterHz };
}

function palettePlan(environment: EnvironmentId, event: SceneEvent): SceneSoundLayer[] {
  const cue = event.soundCue;
  if (environment === 'kitchen') {
    if (cue.includes('toaster')) return [tone(1_080, 70, 0, .035, 'sine'), tone(1_520, 95, 60, .03, 'triangle')];
    if (cue.includes('kettle')) return [noise(460, 0, .035, 1_150), tone(1_240, 300, 40, .02, 'sine', 1_620)];
    if (cue.includes('ceramic')) return [noise(120, 0, .045, 1_900), tone(1_420, 80, 25, .025, 'square'), tone(1_860, 60, 72, .018, 'triangle')];
    if (cue.includes('pan')) return [tone(320, 170, 0, .055, 'triangle'), tone(680, 110, 28, .035, 'sine')];
    if (cue.includes('cat')) return [tone(510, 190, 0, .032, 'triangle', 730), tone(790, 100, 95, .024, 'sine')];
    return [tone(180, 220, 0, .035, 'triangle'), noise(105, 35, .025, 720)];
  }

  if (cue.includes('drill')) return [tone(170, 420, 0, .04, 'sawtooth', 410), tone(340, 310, 20, .02, 'square', 720)];
  if (cue.includes('saw')) return [tone(230, 430, 0, .042, 'sawtooth', 690), noise(160, 55, .03, 1_300)];
  if (cue.includes('chain')) return [tone(145, 120, 0, .055, 'square'), noise(110, 35, .04, 650), tone(230, 90, 92, .03, 'triangle')];
  if (cue.includes('tire')) return [tone(72, 430, 0, .04, 'sine', 46), noise(170, 150, .025, 170)];
  if (cue.includes('wrench') || cue.includes('hammer')) return [tone(105, 130, 0, .065, 'square'), tone(285, 95, 24, .04, 'triangle'), noise(80, 18, .025, 900)];
  return [tone(92, 240, 0, .04, 'sawtooth'), noise(120, 28, .03, 380)];
}

function hazardPlan(hazard: SceneHazard, event: SceneEvent): SceneSoundLayer[] {
  const random = seededRandom(event.effectSeed ^ 0x9e3779b9);
  const at = () => Math.floor(random() * Math.max(70, event.durationMs * .48));
  switch (hazard) {
    case 'fire': return [noise(420, 0, .055, 380), tone(86, 330, 28, .03, 'sawtooth', 132), noise(100, at(), .032, 1_250)];
    case 'blast': return [noise(390, 0, .09, 85), tone(46, 440, 0, .1, 'sawtooth', 31), noise(150, 20, .06, 1_600)];
    case 'smoke': return [noise(520, 0, .038, 590), noise(170, at(), .025, 1_080)];
    case 'debris': return [tone(64 + Math.floor(random() * 90), 110, at(), .052, 'square'), noise(100, at(), .04, 420), tone(130, 80, at(), .03, 'triangle')];
    case 'sparks': return [noise(58, at(), .035, 1_650), tone(900 + Math.floor(random() * 1_200), 45, at(), .02, 'square'), tone(1_250, 40, at(), .016, 'triangle')];
    case 'alarm': return [tone(420, 170, 0, .034, 'triangle'), tone(690, 170, 145, .038, 'triangle'), tone(420, 170, 290, .034, 'triangle')];
    case 'steam': return [noise(560, 0, .04, 1_300), tone(1_100, 360, 45, .018, 'sine', 1_480)];
    case 'shards': return [noise(135, 0, .045, 1_850), tone(1_480, 70, 18, .024, 'square'), tone(1_950, 55, 70, .018, 'triangle')];
  }
}

export function buildEventSoundPlan(environment: EnvironmentId, event: SceneEvent): readonly SceneSoundLayer[] {
  const random = seededRandom(event.effectSeed ^ (environment === 'kitchen' ? 0x51f15e : 0xa5a5a5a5));
  const plan = [...palettePlan(environment, event), ...hazardPlan(event.hazard, event)];

  for (let layer = 1; layer < event.intensity; layer += 1) {
    const delayMs = Math.floor(random() * Math.max(80, event.durationMs * .55));
    plan.push(noise(75 + Math.floor(random() * 115), delayMs, .027 + layer * .014, 180 + Math.floor(random() * 1_350)));
    plan.push(tone(52 + Math.floor(random() * 590), 80 + Math.floor(random() * 150), delayMs + 16, .021 + layer * .014, layer === 2 ? 'sawtooth' : 'square'));
  }

  if (event.decoy) {
    plan.push(tone(environment === 'kitchen' ? 760 : 520, 120, Math.floor(event.durationMs * .55), .02, 'triangle'));
  }

  return plan.sort((a, b) => a.delayMs - b.delayMs);
}
