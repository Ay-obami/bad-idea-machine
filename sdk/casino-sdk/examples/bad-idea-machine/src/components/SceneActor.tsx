import { useEffect, useRef, type CSSProperties } from 'react';

import { ACTOR_ATLAS_COLUMNS, ACTOR_ATLAS_ROWS, getActorSprite } from '../scene/presentation';
import type { SceneActorDefinition, SceneEvent } from '../scene/types';
import { ActorArtwork } from './scenes/ActorArtwork';

type Props = {
  actor: SceneActorDefinition;
  event?: SceneEvent;
  revision: number;
};

export function SceneActor({ actor, event, revision }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const sprite = getActorSprite(actor.id);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    for (const animation of element.getAnimations()) animation.cancel();
    if (!event) return;

    const frames: Keyframe[] = event.path.map(frame => ({
      offset: frame.at,
      left: `${frame.x / 10}%`,
      top: `${frame.y / 6}%`,
      transform: `translate(-50%, -50%) rotate(${frame.rotation}deg) scale(${frame.scale ?? actor.scale})`,
    }));

    const animation = element.animate(frames, {
      duration: event.durationMs,
      easing: 'cubic-bezier(.2,.75,.2,1)',
      fill: 'forwards',
    });

    return () => animation.cancel();
  }, [actor, event, revision]);

  const homeStyle: CSSProperties = {
    left: `${actor.home.x / 10}%`,
    top: `${actor.home.y / 6}%`,
    zIndex: actor.zIndex,
    transform: `translate(-50%, -50%) rotate(${actor.rotation}deg) scale(${actor.scale})`,
  };

  const spriteStyle: CSSProperties | undefined = sprite ? {
    backgroundImage: `url(${sprite.src})`,
    backgroundSize: `${ACTOR_ATLAS_COLUMNS * 100}% ${ACTOR_ATLAS_ROWS * 100}%`,
    backgroundPosition: `${sprite.column * 100 / (ACTOR_ATLAS_COLUMNS - 1)}% ${sprite.row * 100 / (ACTOR_ATLAS_ROWS - 1)}%`,
  } : undefined;

  return (
    <div
      ref={ref}
      className={`scene-actor scene-actor--${actor.kind} ${sprite ? 'scene-actor--photo' : 'scene-actor--illustrated'}`}
      data-scene-actor={actor.id}
      data-scene-actor-kind={actor.kind}
      data-scene-moving={event ? 'true' : 'false'}
      data-photo-actor={sprite ? 'true' : 'false'}
      aria-label={actor.ariaLabel}
      style={homeStyle}
    >
      {sprite ? (
        <span className="photo-actor-sprite" aria-hidden style={spriteStyle} />
      ) : (
        <ActorArtwork kind={actor.kind} />
      )}
    </div>
  );
}
