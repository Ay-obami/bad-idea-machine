import type { CSSProperties } from 'react';

import type { SceneEvent, SceneHazard } from '../scene/types';

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

function kindsForHazard(hazard: SceneHazard): readonly ParticleKind[] {
  if (hazard === 'fire') return ['ember', 'spark', 'ember', 'smoke'];
  if (hazard === 'smoke') return ['smoke', 'smoke', 'ember', 'debris'];
  if (hazard === 'debris') return ['debris', 'spark', 'debris', 'smoke'];
  if (hazard === 'blast') return ['spark', 'debris', 'ember', 'smoke', 'shard'];
  if (hazard === 'steam') return ['steam', 'steam', 'smoke'];
  if (hazard === 'shards') return ['shard', 'shard', 'spark', 'debris'];
  if (hazard === 'alarm') return ['spark', 'ember'];
  return ['spark', 'spark', 'ember', 'debris'];
}

function originFor(event: SceneEvent) {
  if (event.impact) return event.impact;
  const end = event.path.at(-1);
  return end ? { x: end.x, y: end.y } : { x: 500, y: 300 };
}

function particlesFor(event: SceneEvent) {
  const random = seededRandom(event.effectSeed ^ 0x9e3779b9);
  const kinds = kindsForHazard(event.hazard);
  const origin = originFor(event);
  const count = 16 + event.intensity * 12 + (event.hazard === 'blast' ? 14 : 0);

  return Array.from({ length: count }, (_, index) => {
    const kind = kinds[index % kinds.length];
    const smokeLike = kind === 'smoke' || kind === 'steam';
    const spread = event.intensity === 3 ? 1.25 : 1;
    const dx = (random() - .5) * (smokeLike ? 190 : 470) * spread;
    const dy = smokeLike ? -(80 + random() * 235) : (random() - .68) * 360 * spread;
    const size = smokeLike ? 24 + random() * 54 : 5 + random() * (event.intensity * 7 + 11);
    const rotation = (random() - .5) * 1_080;
    const duration = smokeLike ? 900 + random() * 700 : 520 + random() * 520;
    const delay = random() * 120;

    const style: ChaosStyle = {
      '--vfx-x': `${origin.x / 10}%`,
      '--vfx-y': `${origin.y / 6}%`,
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
      {events.map(event => {
        const origin = originFor(event);
        const originStyle: ChaosStyle = {
          '--impact-x': `${origin.x / 10}%`,
          '--impact-y': `${origin.y / 6}%`,
        };
        const particles = particlesFor(event);
        const showShockwave = event.hazard === 'blast' || event.hazard === 'fire' || event.intensity === 3;

        return (
          <div
            className={`scene-impact scene-impact--${event.hazard} scene-impact--intensity-${event.intensity}`}
            data-vfx-event={event.id}
            data-vfx-hazard={event.hazard}
            key={event.id}
            style={originStyle}
          >
            {showShockwave && <span className="scene-shockwave" />}
            {(event.hazard === 'fire' || event.hazard === 'blast') && <span className="scene-flame" />}
            {particles.map((particle, index) => (
              <span
                className={`scene-particle scene-particle--${particle.kind}`}
                key={`${event.id}-${index}`}
                style={particle.style}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
