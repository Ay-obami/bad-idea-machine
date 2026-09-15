import type { MachineStation } from './route';

let context: AudioContext | null = null;
let muted = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(frequency: number, duration: number, volume = 0.06, type: OscillatorType = 'square') {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function impact(low = 70, high = 150) {
  tone(low, 0.16, 0.11, 'sawtooth');
  window.setTimeout(() => tone(high, 0.07, 0.045, 'square'), 30);
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

export function playStationSound(station: MachineStation, variant: string): void {
  if (muted) return;
  switch (station) {
    case 'button':
      impact(58, 110);
      break;
    case 'toaster':
      tone(980, 0.08, 0.045, 'sine');
      window.setTimeout(() => tone(1_420, 0.12, 0.035, 'sine'), variant === 'jam' ? 0 : 90);
      break;
    case 'cat':
      tone(variant === 'refuse' ? 330 : 520, 0.18, 0.035, 'triangle');
      window.setTimeout(() => tone(variant === 'refuse' ? 250 : 690, 0.16, 0.025, 'triangle'), 80);
      break;
    case 'hammer':
      impact(82, variant === 'miss' ? 118 : 240);
      break;
    case 'ball':
      tone(92, 0.38, 0.04, 'sine');
      break;
    case 'fan':
      tone(145, 0.5, 0.035, 'sawtooth');
      break;
    case 'dominoes':
      for (let i = 0; i < 7; i += 1) {
        window.setTimeout(() => tone(210 + i * 18, 0.045, 0.025, 'square'), i * 45);
      }
      break;
    case 'rocket':
      tone(105, 0.65, 0.065, 'sawtooth');
      window.setTimeout(() => tone(440, 0.18, 0.035, 'triangle'), 420);
      break;
    case 'safe':
      impact(45, 95);
      break;
    case 'core':
      tone(220, 0.75, 0.045, 'sine');
      window.setTimeout(() => tone(440, 0.6, 0.05, 'sine'), 120);
      window.setTimeout(() => tone(880, 0.42, 0.06, 'triangle'), 260);
      window.setTimeout(() => impact(42, 180), 520);
      break;
  }
}

export function playResultSound(multiplierBps: number): void {
  if (muted) return;
  if (multiplierBps === 0) {
    tone(110, 0.32, 0.04, 'sawtooth');
    return;
  }
  const scale = multiplierBps >= 80_000 ? [330, 440, 660, 880] : [330, 495, 660];
  scale.forEach((frequency, index) => {
    window.setTimeout(() => tone(frequency, 0.22, 0.045, 'triangle'), index * 95);
  });
}
