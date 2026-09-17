import type { EnvironmentId, SceneHazard } from '../scene/types';

export type SampleRole = 'action' | 'impact' | 'debris' | 'ambience';

export type AudioSample = Readonly<{
  id: string;
  url: string;
  role: SampleRole;
}>;

const kitchen = (name: string, role: SampleRole): AudioSample => ({
  id: `kitchen.${name}`,
  url: `/audio/kitchen/${name}.wav`,
  role,
});

const garage = (name: string, role: SampleRole): AudioSample => ({
  id: `garage.${name}`,
  url: `/audio/garage/${name}.wav`,
  role,
});

export const AUDIO_SAMPLES = {
  'kitchen.appliance-pop': kitchen('appliance-pop', 'action'),
  'kitchen.toast-whip': kitchen('toast-whip', 'action'),
  'kitchen.pan-clang': kitchen('pan-clang', 'impact'),
  'kitchen.steam-hiss': kitchen('steam-hiss', 'action'),
  'kitchen.cabinet-slam': kitchen('cabinet-slam', 'impact'),
  'kitchen.ceramic-shatter': kitchen('ceramic-shatter', 'impact'),
  'kitchen.heavy-thud': kitchen('heavy-thud', 'impact'),
  'kitchen.rocket-whoosh': kitchen('rocket-whoosh', 'action'),
  'kitchen.fire-crackle': kitchen('fire-crackle', 'debris'),
  'kitchen.debris': kitchen('debris', 'debris'),
  'kitchen.sparks': kitchen('sparks', 'debris'),
  'kitchen.blast': kitchen('blast', 'impact'),
  'kitchen.ambience': kitchen('ambience', 'ambience'),

  'garage.metal-tool': garage('metal-tool', 'impact'),
  'garage.drill-runaway': garage('drill-runaway', 'action'),
  'garage.saw-screech': garage('saw-screech', 'action'),
  'garage.chain-snap': garage('chain-snap', 'impact'),
  'garage.tire-thump': garage('tire-thump', 'impact'),
  'garage.toolbox-spill': garage('toolbox-spill', 'impact'),
  'garage.shelf-collapse': garage('shelf-collapse', 'impact'),
  'garage.tank-hiss': garage('tank-hiss', 'action'),
  'garage.heavy-thud': garage('heavy-thud', 'impact'),
  'garage.rocket-whoosh': garage('rocket-whoosh', 'action'),
  'garage.sparks': garage('sparks', 'debris'),
  'garage.debris': garage('debris', 'debris'),
  'garage.blast': garage('blast', 'impact'),
  'garage.ambience': garage('ambience', 'ambience'),
} as const satisfies Readonly<Record<string, AudioSample>>;

export type AudioSampleId = keyof typeof AUDIO_SAMPLES;

const CUE_FAMILY: Readonly<Record<EnvironmentId, Readonly<Record<string, AudioSampleId>>>> = {
  kitchen: {
    'toaster-pop': 'kitchen.appliance-pop',
    'toast-whip': 'kitchen.toast-whip',
    'pan-clang': 'kitchen.pan-clang',
    'pan-crash': 'kitchen.pan-clang',
    'kettle-hiss': 'kitchen.steam-hiss',
    'cabinet-slam': 'kitchen.cabinet-slam',
    'ceramic-shatter': 'kitchen.ceramic-shatter',
    'ball-rumble': 'kitchen.heavy-thud',
    'rocket-blast': 'kitchen.rocket-whoosh',
    'rocket-flyby': 'kitchen.rocket-whoosh',
    'safe-crash': 'kitchen.heavy-thud',
  },
  garage: {
    'hammer-clang': 'garage.metal-tool',
    'hammer-crash': 'garage.metal-tool',
    'wrench-ricochet': 'garage.metal-tool',
    'drill-runaway': 'garage.drill-runaway',
    'saw-screech': 'garage.saw-screech',
    'chain-snap': 'garage.chain-snap',
    'tire-thump': 'garage.tire-thump',
    'rocket-blast': 'garage.rocket-whoosh',
    'rocket-flyby': 'garage.rocket-whoosh',
    'tank-hiss': 'garage.tank-hiss',
    'toolbox-spill': 'garage.toolbox-spill',
    'shelf-collapse': 'garage.shelf-collapse',
    'safe-crash': 'garage.heavy-thud',
  },
};

const HAZARD_SAMPLE: Readonly<Record<EnvironmentId, Readonly<Record<SceneHazard, AudioSampleId>>>> = {
  kitchen: {
    sparks: 'kitchen.sparks',
    fire: 'kitchen.fire-crackle',
    smoke: 'kitchen.debris',
    debris: 'kitchen.debris',
    blast: 'kitchen.blast',
    alarm: 'kitchen.appliance-pop',
    steam: 'kitchen.steam-hiss',
    shards: 'kitchen.ceramic-shatter',
  },
  garage: {
    sparks: 'garage.sparks',
    fire: 'garage.sparks',
    smoke: 'garage.debris',
    debris: 'garage.debris',
    blast: 'garage.blast',
    alarm: 'garage.metal-tool',
    steam: 'garage.tank-hiss',
    shards: 'garage.debris',
  },
};

export function sampleForCue(environment: EnvironmentId, cue: string): AudioSampleId {
  return CUE_FAMILY[environment][cue] ?? (environment === 'kitchen' ? 'kitchen.debris' : 'garage.debris');
}

export function sampleForHazard(environment: EnvironmentId, hazard: SceneHazard): AudioSampleId {
  return HAZARD_SAMPLE[environment][hazard];
}

export function ambienceSample(environment: EnvironmentId): AudioSampleId {
  return environment === 'kitchen' ? 'kitchen.ambience' : 'garage.ambience';
}

export function getAudioSample(id: AudioSampleId): AudioSample {
  return AUDIO_SAMPLES[id];
}
