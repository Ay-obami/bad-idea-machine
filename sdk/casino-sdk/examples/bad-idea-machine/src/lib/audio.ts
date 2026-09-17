import { ALL_FOLEY_SAMPLE_IDS, getFoleySamplePath, type FoleySampleId } from '../scene/audio-samples';
import { buildAftermathSoundPlan, buildEventSoundPlan, type SceneSoundLayer } from '../scene/audio-plan';
import type { EnvironmentId, SceneEvent } from '../scene/types';

let context: AudioContext | null = null;
let muted = false;
let ambienceSource: AudioBufferSourceNode | null = null;
const bufferCache = new Map<FoleySampleId, Promise<AudioBuffer | null>>();

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

async function loadSample(ctx: AudioContext, sampleId: FoleySampleId): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(sampleId);
  if (cached) return cached;

  const pending = fetch(getFoleySamplePath(sampleId), { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`foley ${sampleId} returned ${response.status}`);
      return response.arrayBuffer();
    })
    .then(bytes => ctx.decodeAudioData(bytes))
    .catch(() => null);

  bufferCache.set(sampleId, pending);
  return pending;
}

function fallbackNoise(ctx: AudioContext, layer: SceneSoundLayer, start: number): void {
  const duration = layer.role === 'ambience' ? .8 : layer.role === 'impact' ? .22 : .14;
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let state = 0x9e3779b9 ^ Math.floor(layer.playbackRate * 10_000);

  for (let index = 0; index < frameCount; index += 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    const noise = (state / 0x1_0000_0000) * 2 - 1;
    const envelope = layer.role === 'ambience' ? .18 : Math.pow(1 - index / frameCount, 2.2);
    data[index] = noise * envelope;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();
  filter.type = 'bandpass';
  filter.frequency.value = layer.role === 'impact' ? 430 : 920;
  filter.Q.value = .7;
  gain.gain.value = Math.min(.12, layer.gain * .22);
  panner.pan.value = layer.pan;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(panner).connect(ctx.destination);
  source.start(start);
}

async function playLayer(layer: SceneSoundLayer, baseTime: number, ctx: AudioContext, trackAmbience = false): Promise<void> {
  const buffer = await loadSample(ctx, layer.sampleId);
  const scheduled = baseTime + layer.delayMs / 1_000;
  const start = Math.max(ctx.currentTime + .008, scheduled);

  if (!buffer) {
    fallbackNoise(ctx, layer, start);
    return;
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();
  source.buffer = buffer;
  source.playbackRate.value = layer.playbackRate;
  source.loop = layer.loop ?? false;
  gain.gain.value = layer.gain;
  panner.pan.value = layer.pan;
  source.connect(gain).connect(panner).connect(ctx.destination);
  source.start(start);

  if (trackAmbience) {
    ambienceSource?.stop();
    ambienceSource = source;
    source.addEventListener('ended', () => {
      if (ambienceSource === source) ambienceSource = null;
    }, { once: true });
  }
}

function playPlan(plan: readonly SceneSoundLayer[], trackAmbience = false): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const baseTime = ctx.currentTime;
  for (const sound of plan) void playLayer(sound, baseTime, ctx, trackAmbience && sound.role === 'ambience');
}

function preloadSamples(ctx: AudioContext): void {
  for (const sampleId of ALL_FOLEY_SAMPLE_IDS) void loadSample(ctx, sampleId);
}

export function setMachineMuted(next: boolean): void {
  muted = next;
  if (muted) stopAftermathAmbience();
}

export function isMachineMuted(): boolean {
  return muted;
}

export function primeAudio(): void {
  if (muted) return;
  const ctx = getContext();
  if (ctx) preloadSamples(ctx);
}

export function playSceneEventSound(environment: EnvironmentId, event: SceneEvent): void {
  playPlan(buildEventSoundPlan(environment, event));
}

export function playAftermathAmbience(environment: EnvironmentId, tier: 0 | 1 | 2 | 3 | 4): void {
  stopAftermathAmbience();
  playPlan(buildAftermathSoundPlan(environment, tier), true);
}

export function stopAftermathAmbience(): void {
  if (!ambienceSource) return;
  try {
    ambienceSource.stop();
  } catch {
    // A source may already have ended between render phases.
  }
  ambienceSource = null;
}

/** @deprecated Result audio is now the restrained room aftermath ambience. */
export function playResultSound(_multiplierBps: number): void {
  // Deliberately no casino jingle. Kept as a compatibility no-op for older callers.
}
