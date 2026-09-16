import type { CSSProperties } from 'react';

import type { ImpactEffect, ImpactEvent, SceneEvent } from '../scene/types';

type ChaosStyle = CSSProperties & { [key: `--${string}`]: string };

type Props = {
  events: readonly SceneEvent[];
};

type ParticleKind = 'spark' | 'ember' | 'smoke' | 'debris' | 'shard' | 'steam';

function seededRandom(seed: number) {
  let state = (seed || 0x6d2b79f5) >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function kindsForEffect(effect: ImpactEffect): readonly ParticleKind[] {
  if (effect === 'fire') return ['ember', 'spark', 'ember', 'smoke'];
  if (effect === 'dust') return ['smoke', 'debris', 'smoke'];
  if (effect === 'debris') return ['debris', 'spark', 'debris', 'smoke'];
  if (effect === 'blast') return ['spark', 'debris', 'ember', 'smoke', 'shard'];
  if (effect === 'shatter') return ['shard', 'shard', 'spark', 'debris'];
  return ['spark', 'spark', 'ember', 'debris'];
}

function particlesFor(event: SceneEvent, impact: ImpactEvent, impactIndex: number) {
  const random = seededRandom(event.effectSeed ^ ((impactIndex + 1) * 0x9e3779b9));
  const kinds = kindsForEffect(impact.effect);
  const count = 10 + impact.strength * 10 + (impact.effect === 'blast' ? 12 : 0);

  return Array.from({ length: count }, (_, index) => {
    const kind = kinds[index % kinds.length];
    const smokeLike = kind === 'smoke' || kind === 'steam';
    const spread = impact.strength >= 3 ? 1.25 : 1;
    const dx = (random() - .5) * (smokeLike ? 190 : 470) * spread;
    const dy = smokeLike ? -(80 + random() * 235) : (random() - .68) * 360 * spread;
    const size = smokeLike ? 24 + random() * 54 : 5 + random() * (impact.strength * 7 + 11);
    const rotation = (random() - .5) * 1_080;
    const duration = smokeLike ? 900 + random() * 700 : 520 + random() * 520;
    const delay = impact.atMs + random() * 120;

    const style: ChaosStyle = {
      '--vfx-x': `${impact.point.x / 10}%`,
      '--vfx-y': `${impact.point.y / 6}%`,
      '--vfx-dx': `${dx}px`,
      '--vfx-dy': `${dy}px`,
      '--vfx-size': `${size}px`,
      '--vfx-rotation': `${rotation}deg`,
      '--vfx-duration': `${duration}ms`,
      '--vfx-delay': `${delay}ms`,
    };

    return { kind, style };
  });
}

export function SceneVfx({ events }: Props) {
  return (
    <div className="scene-vfx-layer" aria-hidden="true">
      {events.flatMap(event => event.impacts.map((impact, impactIndex) => {
        const originStyle: ChaosStyle = {
          '--impact-x': `${impact.point.x / 10}%`,
          '--impact-y': `${impact.point.y / 6}%`,
          '--impact-delay': `${impact.atMs}ms`,
        };
        const particles = particlesFor(event, impact, impactIndex);
        const showShockwave = impact.effect === 'blast' || impact.effect === 'fire' || impact.strength >= 3;

        return (
          <div
            className={`scene-impact scene-impact--${impact.effect} scene-impact--strength-${impact.strength}`}
            data-vfx-event={event.id}
            data-vfx-impact={impactIndex}
            data-vfx-effect={impact.effect}
            data-impact-materials={`${impact.materialA}:${impact.materialB}`}
            key={`${event.id}-${impactIndex}`}
            style={originStyle}
          >
            {showShockwave && <span className="scene-shockwave scene-impact__delayed" />}
            {(impact.effect === 'fire' || impact.effect === 'blast') && <span className="scene-flame scene-impact__delayed" />}
            {particles.map((particle, index) => (
              <span
                className={`scene-particle scene-particle--${particle.kind}`}
                key={`${event.id}-${impactIndex}-${index}`}
                style={particle.style}
              />
            ))}
          </div>
        );
      }))}
    </div>
  );
}
