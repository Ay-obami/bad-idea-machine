import { buildEventSoundPlan, type SceneSoundLayer } from '../scene/audio-plan';
import type { EnvironmentId, SceneEvent } from '../scene/types';
import type { RouteStep } from './route';

let context: AudioContext | null = null;
let muted = false;

type ToneEvent = Readonly<{
  kind: 'tone';
  atMs: number;
  durationMs: number;
  frequency: number;
  endFrequency?: number;
  volume: number;
  wave: OscillatorType;
}>;

type NoiseEvent = Readonly<{
  kind: 'noise';
  atMs: number;
  durationMs: number;
  volume: number;
  filterHz: number;
}>;

export type SoundEvent = ToneEvent | NoiseEvent;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function seededRandom(seed: number) {
  let state = (seed || 0x45d9f3b) >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function toneEvent(
  frequency: number,
  durationMs: number,
  atMs = 0,
  volume = .05,
  wave: OscillatorType = 'square',
  endFrequency?: number,
): ToneEvent {
  return { kind: 'tone', frequency, durationMs, atMs, volume, wave, endFrequency };
}

function noiseEvent(
  durationMs: number,
  atMs = 0,
  volume = .05,
  filterHz = 260,
): NoiseEvent {
  return { kind: 'noise', durationMs, atMs, volume, filterHz };
}

function stationPlan(step: RouteStep): SoundEvent[] {
  switch (step.station) {
    case 'button':
      return [toneEvent(58, 160, 0, .095, 'sawtooth'), toneEvent(116, 70, 28, .04, 'square')];
    case 'toaster':
      return [toneEvent(980, 80, 0, .04, 'sine'), toneEvent(step.variant === 'jam' ? 710 : 1_420, 130, 85, .035, 'sine')];
    case 'cat':
      return [toneEvent(step.variant === 'refuse' ? 330 : 520, 180, 0, .035, 'triangle'), toneEvent(step.variant === 'refuse' ? 250 : 690, 150, 80, .027, 'triangle')];
    case 'hammer':
      return [toneEvent(82, 150, 0, .09, 'sawtooth'), toneEvent(step.variant === 'miss' ? 118 : 240, 75, 30, .045, 'square')];
    case 'ball':
      return [toneEvent(92, 380, 0, .04, 'sine', 62), noiseEvent(150, 180, .025, 180)];
    case 'fan':
      return [toneEvent(145, 470, 0, .035, 'sawtooth', 290), toneEvent(74, 330, 80, .018, 'triangle')];
    case 'dominoes':
      return Array.from({ length: 7 }, (_, index) => toneEvent(210 + index * 18, 45, index * 42, .024, 'square'));
    case 'rocket':
      return [toneEvent(105, 620, 0, .065, 'sawtooth', 225), noiseEvent(360, 30, .045, 120), toneEvent(440, 180, 390, .035, 'triangle')];
    case 'safe':
      return [toneEvent(45, 180, 0, .11, 'sawtooth'), noiseEvent(120, 15, .06, 90), toneEvent(95, 90, 34, .05, 'square')];
    case 'core':
      return [
        toneEvent(220, 720, 0, .045, 'sine', 330),
        toneEvent(440, 590, 110, .05, 'sine', 660),
        toneEvent(880, 410, 250, .058, 'triangle', 1_030),
        noiseEvent(250, 470, .055, 130),
        toneEvent(42, 220, 510, .11, 'sawtooth'),
      ];
  }
}

function hazardPlan(step: RouteStep): SoundEvent[] {
  const random = seededRandom(step.effectSeed ^ 0x9e3779b9);
  const at = () => Math.floor(random() * Math.max(80, step.durationMs * .55));
  const high = () => 700 + Math.floor(random() * 1_500);
  const low = () => 42 + Math.floor(random() * 120);

  switch (step.hazard) {
    case 'sparks':
      return [noiseEvent(55, at(), .04, 1_600), toneEvent(high(), 45, at(), .022, 'square'), toneEvent(high(), 38, at(), .018, 'triangle')];
    case 'fire':
      return [noiseEvent(360, 0, .055, 420), noiseEvent(110, at(), .045, 1_050), toneEvent(88, 320, 35, .03, 'sawtooth', 135)];
    case 'smoke':
      return [noiseEvent(520, 0, .04, 620), noiseEvent(180, at(), .025, 1_200)];
    case 'debris':
      return [toneEvent(low(), 95, at(), .06, 'square'), noiseEvent(85, at(), .04, 350), toneEvent(low(), 80, at(), .045, 'sawtooth')];
    case 'blast':
      return [noiseEvent(380, 0, .085, 95), noiseEvent(145, 18, .065, 1_500), toneEvent(48, 420, 0, .105, 'sawtooth', 34), toneEvent(280, 130, 24, .035, 'square')];
    case 'alarm':
      return [toneEvent(410, 180, 0, .035, 'triangle'), toneEvent(690, 180, 155, .038, 'triangle'), toneEvent(410, 180, 310, .035, 'triangle')];
  }
}

export function soundPlanForStep(step: RouteStep): readonly SoundEvent[] {
  const random = seededRandom(step.effectSeed ^ 0xa5a5a5a5);
  const plan = [...stationPlan(step), ...hazardPlan(step)];

  for (let layer = 1; layer < step.intensity; layer += 1) {
    const atMs = Math.floor(random() * Math.max(80, step.durationMs * .65));
    plan.push(noiseEvent(70 + Math.floor(random() * 110), atMs, .028 + layer * .014, 180 + Math.floor(random() * 1_250)));
    plan.push(toneEvent(55 + Math.floor(random() * 520), 70 + Math.floor(random() * 160), atMs + 18, .022 + layer * .014, layer === 2 ? 'sawtooth' : 'square'));
  }

  if (step.terminal) {
    plan.push(noiseEvent(220, Math.max(0, step.durationMs - 260), .06, 120));
    plan.push(toneEvent(66, 300, Math.max(0, step.durationMs - 280), .07, 'sawtooth', 44));
  }

  return plan.sort((a, b) => a.atMs - b.atMs);
}

function sceneLayerToSoundEvent(layer: SceneSoundLayer): SoundEvent {
  if (layer.kind === 'noise') {
    return noiseEvent(layer.durationMs, layer.delayMs, layer.gain, layer.filterHz ?? 260);
  }
  return toneEvent(
    layer.frequency ?? 220,
    layer.durationMs,
    layer.delayMs,
    layer.gain,
    layer.waveform ?? 'triangle',
    layer.endFrequency,
  );
}

function playTone(event: ToneEvent, baseTime: number, ctx: AudioContext): void {
  const start = baseTime + event.atMs / 1_000;
  const end = start + event.durationMs / 1_000;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = event.wave;
  oscillator.frequency.setValueAtTime(event.frequency, start);
  if (event.endFrequency !== undefined) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, event.endFrequency), end);

  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(event.volume, start + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, end);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(end + .02);
}

function playNoise(event: NoiseEvent, baseTime: number, ctx: AudioContext): void {
  const start = baseTime + event.atMs / 1_000;
  const duration = event.durationMs / 1_000;
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const envelope = 1 - index / frameCount;
    data[index] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(event.filterHz, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(event.volume, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
  source.stop(start + duration + .02);
}

function playPlan(plan: readonly SoundEvent[]): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const baseTime = ctx.currentTime;

  for (const event of plan) {
    if (event.kind === 'tone') playTone(event, baseTime, ctx);
    else playNoise(event, baseTime, ctx);
  }
}

export function setMachineMuted(next: boolean): void {
  muted = next;
}

export function isMachineMuted(): boolean {
  return muted;
}

export function primeAudio(): void {
  if (muted) return;
  getContext();
}

export function playStationSound(step: RouteStep): void {
  playPlan(soundPlanForStep(step));
}

export function playSceneEventSound(environment: EnvironmentId, event: SceneEvent): void {
  playPlan(buildEventSoundPlan(environment, event).map(sceneLayerToSoundEvent));
}

export function playResultSound(multiplierBps: number): void {
  if (muted) return;

  if (multiplierBps === 0) {
    playPlan([
      noiseEvent(240, 0, .05, 170),
      toneEvent(130, 340, 0, .05, 'sawtooth', 72),
      toneEvent(48, 220, 180, .08, 'square'),
    ]);
    return;
  }

  const huge = multiplierBps >= 80_000;
  const scale = huge ? [220, 330, 440, 660, 880, 1_100] : [330, 495, 660, 825];
  const plan: SoundEvent[] = [noiseEvent(huge ? 420 : 180, 0, huge ? .08 : .045, huge ? 105 : 260)];

  scale.forEach((frequency, index) => {
    plan.push(toneEvent(frequency, huge ? 280 : 220, index * (huge ? 80 : 90), huge ? .052 : .04, index % 2 === 0 ? 'triangle' : 'sine'));
  });

  if (huge) {
    plan.push(toneEvent(52, 520, 0, .1, 'sawtooth', 34));
    plan.push(noiseEvent(260, 290, .065, 1_400));
  }

  playPlan(plan);
}
