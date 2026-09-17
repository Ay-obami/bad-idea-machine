import { useMemo } from 'react';

import { getEnvironmentArt } from '../environments';
import { getEnvironmentDefinition } from '../scene/environments';
import type { EnvironmentId, SceneEvent } from '../scene/types';
import { RoomObject } from './RoomObject';

type Props = Readonly<{
  environment: EnvironmentId;
  startedByActor: ReadonlyMap<string, SceneEvent>;
  revision: number;
}>;

export function RoomStage({ environment, startedByActor, revision }: Props) {
  const art = getEnvironmentArt(environment);
  const definition = getEnvironmentDefinition(environment);
  const assetById = useMemo(() => new Map(art.objects.map(asset => [asset.id, asset] as const)), [art]);

  return (
    <div className="room-stage" data-room-stage={environment}>
      <img src={art.cleanPlate} alt="" className="room-stage__plate" draggable={false} />
      <div className="room-stage__objects" aria-label={`${art.label} interactive objects`}>
        {definition.actors.map(actor => {
          const asset = assetById.get(actor.assetId);
          if (!asset) return null;
          return (
            <RoomObject
              key={actor.id}
              actor={actor}
              asset={asset}
              event={startedByActor.get(actor.id)}
              revision={revision}
            />
          );
        })}
      </div>
    </div>
  );
}
