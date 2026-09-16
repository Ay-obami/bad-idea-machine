export const FOLEY_SAMPLE_PATHS = {
  'kitchen-toaster-pop': '/audio/foley/kitchen-toaster-pop.wav',
  'kitchen-steam-hiss': '/audio/foley/kitchen-steam-hiss.wav',
  'kitchen-ceramic-break': '/audio/foley/kitchen-ceramic-break.wav',
  'kitchen-pan-hit': '/audio/foley/kitchen-pan-hit.wav',
  'garage-drill': '/audio/foley/garage-drill.wav',
  'garage-saw': '/audio/foley/garage-saw.wav',
  'garage-chain': '/audio/foley/garage-chain.wav',
  'garage-tire': '/audio/foley/garage-tire.wav',
  'metal-impact': '/audio/foley/metal-impact.wav',
  'wood-crack': '/audio/foley/wood-crack.wav',
  'heavy-crash': '/audio/foley/heavy-crash.wav',
  'rocket-whoosh': '/audio/foley/rocket-whoosh.wav',
  'sparks-burst': '/audio/foley/sparks-burst.wav',
  'debris-fall': '/audio/foley/debris-fall.wav',
  'fire-crackle': '/audio/foley/fire-crackle.wav',
  'kitchen-aftermath': '/audio/foley/kitchen-aftermath.wav',
  'garage-aftermath': '/audio/foley/garage-aftermath.wav',
} as const;

export type FoleySampleId = keyof typeof FOLEY_SAMPLE_PATHS;

export const ALL_FOLEY_SAMPLE_IDS = Object.freeze(Object.keys(FOLEY_SAMPLE_PATHS) as FoleySampleId[]);

export function getFoleySamplePath(sampleId: FoleySampleId): string {
  return FOLEY_SAMPLE_PATHS[sampleId];
}
