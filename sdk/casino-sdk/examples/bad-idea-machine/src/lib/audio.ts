import { buildEventSoundPlan, type SceneSoundLayer } from '../scene/audio-plan';
import type { EnvironmentId, SceneEvent } from '../scene/types';

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
