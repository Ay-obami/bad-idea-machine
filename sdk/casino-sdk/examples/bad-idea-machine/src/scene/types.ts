export type EnvironmentId = 'kitchen' | 'garage';
export type ScenePoint = Readonly<{ x: number; y: number }>;
export type SceneHazard = 'sparks' | 'fire' | 'smoke' | 'debris' | 'blast' | 'alarm' | 'steam' | 'shards';
export type SceneAction = 'launch' | 'drop' | 'swing' | 'roll' | 'ricochet' | 'ignite' | 'explode' | 'collapse' | 'vent' | 'shatter' | 'near-miss';
export type SceneIntensity = 1 | 2 | 3;
export type Material = 'metal' | 'wood' | 'ceramic' | 'glass' | 'masonry' | 'appliance';
export type ImpactEffect = 'spark' | 'shatter' | 'fire' | 'dust' | 'debris' | 'blast';

export type ImpactEvent = Readonly<{
  atMs: number;
  point: ScenePoint;
  materialA: Material;
  materialB: Material;
  strength: 1 | 2 | 3 | 4;
  effect: ImpactEffect;
  persistentDamage: readonly string[];
}>;

export type SceneActorDefinition = Readonly<{
  id: string;
  assetId: string;
  home: ScenePoint;
  rotation: number;
  scale: number;
  zIndex: number;
  ariaLabel: string;
}>;

export type MotionKeyframe = Readonly<{
  at: number;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}>;

export type SceneEvent = Readonly<{
  id: string;
  actorId: string;
  action: SceneAction;
  startMs: number;
  durationMs: number;
  path: readonly MotionKeyframe[];
  impacts: readonly ImpactEvent[];
  hazard: SceneHazard;
  intensity: SceneIntensity;
  decoy: boolean;
  effectSeed: number;
  soundCue: string;
}>;

export type SceneFinalizer = Readonly<{
  tier: 0 | 1 | 2 | 3 | 4;
  label: string;
  flavor: string;
  impact?: ScenePoint;
}>;

export type SceneScript = Readonly<{
  environment: EnvironmentId;
  durationMs: number;
  events: readonly SceneEvent[];
  finalizer: SceneFinalizer;
}>;
