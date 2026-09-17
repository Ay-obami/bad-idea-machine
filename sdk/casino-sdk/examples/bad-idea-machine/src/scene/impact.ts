import type {
  EnvironmentId,
  ImpactEffect,
  ImpactEvent,
  Material,
  SceneAction,
  SceneHazard,
  SceneIntensity,
  ScenePoint,
} from './types';

function actorMaterial(actorId: string): Material {
  if (actorId.includes('plates')) return 'ceramic';
  if (actorId.includes('cabinet') || actorId.includes('shelf') || actorId.includes('toolbox')) return 'wood';
  if (['toaster', 'kettle', 'drill', 'saw'].some(name => actorId.includes(name))) return 'appliance';
  return 'metal';
}

function targetMaterial(environment: EnvironmentId, zone?: string): Material {
  if (zone?.includes('ceiling') || zone === 'floorCenter') return 'masonry';
  if (environment === 'kitchen') return zone === 'stove' || zone === 'sink' || zone === 'fridge' ? 'appliance' : 'wood';
  return zone === 'shelf' || zone === 'workbench' ? 'wood' : 'metal';
}

function effectForHazard(hazard: SceneHazard): ImpactEffect {
  if (hazard === 'fire') return 'fire';
  if (hazard === 'blast') return 'blast';
  if (hazard === 'shards') return 'shatter';
  if (hazard === 'sparks' || hazard === 'alarm') return 'spark';
  if (hazard === 'debris') return 'debris';
  return 'dust';
}

export function buildImpact(input: Readonly<{
  environment: EnvironmentId;
  actorId: string;
  action: SceneAction;
  hazard: SceneHazard;
  intensity: SceneIntensity;
  point: ScenePoint;
  durationMs: number;
  zone?: string;
}>): ImpactEvent {
  const effect = effectForHazard(input.hazard);
  const strength = Math.min(4, Math.max(1, input.intensity + (input.action === 'explode' ? 1 : 0))) as 1 | 2 | 3 | 4;
  const zone = input.zone ?? `${Math.round(input.point.x)}-${Math.round(input.point.y)}`;
  return {
    atMs: Math.max(0, Math.min(input.durationMs, Math.round(input.durationMs * .82))),
    point: input.point,
    materialA: actorMaterial(input.actorId),
    materialB: targetMaterial(input.environment, input.zone),
    strength,
    effect,
    persistentDamage: [`${zone}-${effect}`],
  };
}
