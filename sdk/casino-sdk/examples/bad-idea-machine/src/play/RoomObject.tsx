import { useEffect, useMemo, useRef, type CSSProperties } from 'react';

import type { RoomObjectAsset } from '../environments/types';
import type { SceneActorDefinition, SceneEvent } from '../scene/types';

type Props = Readonly<{
  actor: SceneActorDefinition;
  asset: RoomObjectAsset;
  event?: SceneEvent;
  revision: number;
}>;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function RoomObject({ actor, asset, event, revision }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const pivotX = useMemo(() => {
    const objectWidthInStageUnits = Math.max(1, asset.widthPct * 10);
    return clamp(50 + ((asset.pivot.x - asset.home.x) / objectWidthInStageUnits) * 100, 0, 100);
  }, [asset]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    for (const animation of element.getAnimations()) animation.cancel();
    if (!event) return;

    const frames: Keyframe[] = event.path.map(frame => {
      const dx = (frame.x - actor.home.x) / 10;
      const dy = (frame.y - actor.home.y) / 6;
      return {
        offset: frame.at,
        transform: `translate(-50%, -50%) translate3d(${dx}cqw, ${dy}cqh, 0) rotate(${frame.rotation}deg) scale(${frame.scale ?? actor.scale})`,
      };
    });

    const animation = element.animate(frames, {
      duration: event.durationMs,
      easing: 'cubic-bezier(.2,.75,.2,1)',
      fill: 'forwards',
    });

    return () => animation.cancel();
  }, [actor, event, revision]);

  const style: CSSProperties = {
    left: `${actor.home.x / 10}%`,
    top: `${actor.home.y / 6}%`,
    width: `${asset.widthPct}%`,
    zIndex: actor.zIndex,
    transform: `translate(-50%, -50%) rotate(${actor.rotation}deg) scale(${actor.scale})`,
    transformOrigin: `${pivotX}% 50%`,
  };

  return (
    <img
      ref={ref}
      src={asset.src}
      alt=""
      draggable={false}
      className="room-object"
      data-room-object={actor.assetId}
      data-scene-actor={actor.id}
      data-origin-zone={asset.originZone}
      data-scene-moving={event ? 'true' : 'false'}
      aria-label={actor.ariaLabel}
      style={style}
    />
  );
}
