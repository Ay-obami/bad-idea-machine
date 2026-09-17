import { useId } from 'react';
import { kitchenProofArt, kitchenProofObjects as objects, kitchenSprites, type KitchenSprite } from '../environments/kitchen/proof-manifest';
import { kitchenFrame } from '../scene/kitchen-proof';

const fragments: readonly [KitchenSprite, number, number, number, number][] = [
  ['shard1', -37, 2, 24, -12], ['shard2', -10, -5, 19, 15],
  ['shard3', 41, 8, 12, 28], ['shard4', -55, 13, 23, -8],
  ['shard5', 17, 16, 14, -24], ['shard6', 57, 1, 28, 7],
];

type Props = Readonly<{ elapsedMs: number; backgroundSource?: string; atlasSource?: string }>;

/** One SVG viewBox scales the room, actors, shadows and contact points together. */
export function KitchenRoom({ elapsedMs, backgroundSource = kitchenProofArt.background, atlasSource = kitchenProofArt.atlas }: Props) {
  const id = useId().replaceAll(':', '');
  const frame = kitchenFrame(elapsedMs);
  function sprite(name: KitchenSprite, x: number, y: number, width: number, height: number) {
    const [sx, sy, sw, sh] = kitchenSprites[name].box;
    return <svg x={x} y={y} width={width} height={height} viewBox={`${sx} ${sy} ${sw} ${sh}`} preserveAspectRatio="none" overflow="visible">
      <image href={atlasSource} width="1536" height="1024" clipPath={`url(#${id}-${name})`} />
    </svg>;
  }
  return (
    <svg className="kitchen-room" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Kitchen visual proof. ${frame.label}`} data-damage={frame.damageIds.join(' ')}>
      <defs>
        {Object.entries(kitchenSprites).map(([name, sprite]) => <clipPath id={`${id}-${name}`} key={name}><path d={sprite.path} /></clipPath>)}
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${id}-door-shadow`} x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="3" dy="3" stdDeviation="2" floodOpacity=".35" /></filter>
      </defs>
      <image href={backgroundSource} width="1000" height="600" preserveAspectRatio="none" />
      {/* Empty shelf and counter are in the plate: there are no baked-in actor duplicates. */}
      <ellipse cx="581" cy="316" rx="44" ry="4" fill="#27190e" opacity=".55" filter={`url(#${id}-shadow)`} />
      {frame.platesVisible && <g data-room-object="plates" transform={`rotate(${frame.plates.rotation} ${frame.plates.x + 33} ${frame.plates.y + 10})`}>
        <ellipse cx={frame.plates.x + 34} cy="311" rx={25 - (frame.plates.y - 145) / 15} ry="2" opacity={(frame.plates.y - 145) / 500} filter={`url(#${id}-shadow)`} />
        {sprite('plates', frame.plates.x, frame.plates.y, objects.plates.size.width, objects.plates.size.height)}
      </g>}
      {/* Door is attached at its authored upper hinge, in front of the cupboard interior. */}
      <g data-room-object="door" transform={`rotate(${frame.door.rotation} ${objects.door.pivot.x} ${objects.door.pivot.y})`} filter={`url(#${id}-door-shadow)`}>
        {sprite('door', frame.door.x, frame.door.y, objects.door.size.width, objects.door.size.height)}
      </g>
      <rect x="605" y="10" width="3" height="13" rx="1" fill="#74613b" />
      <rect x="605" y="142" width="3" height="12" rx="1" fill="#756341" transform={frame.damageIds.includes('loose-hinge') ? 'rotate(-18 606 142)' : undefined} />
      {frame.damageIds.includes('loose-hinge') && <path d="M600 138l5 3-3 5 4 4" fill="none" stroke="#372411" strokeWidth="1.4" />}
      <g data-room-object="toast" transform={`rotate(${frame.toast.rotation} ${frame.toast.x + 14} ${frame.toast.y + 17})`}>
        {sprite('toast', frame.toast.x, frame.toast.y, objects.toast.size.width, objects.toast.size.height)}
      </g>
      <g data-room-object="toaster" transform={`rotate(${frame.toaster.rotation} ${objects.toaster.pivot.x} ${objects.toaster.pivot.y})`}>
        {sprite('toaster', frame.toaster.x, frame.toaster.y, objects.toaster.size.width, objects.toaster.size.height)}
      </g>
      {frame.shardsVisible && <g data-room-damage="broken-plates">
        {fragments.map(([name, dx, dy, width, rotation], index) => {
          const p = 1 - (1 - frame.fragments) ** 3;
          const x = 434 + dx * p;
          const y = 309 + dy * p - Math.sin(frame.fragments * Math.PI) * (8 + index * 2);
          return <g key={name} transform={`translate(${x} ${y}) rotate(${rotation * p})`}>
            <ellipse cx="0" cy="4" rx={width * .45} ry="2" fill="#3c2819" opacity=".36" />
            {sprite(name, -width / 2, -width / 5, width, width * .44)}
          </g>;
        })}
        <path d="M416 314l8-3m16 9 8-2m-1-10 7 1" stroke="#523820" strokeWidth="1" opacity=".65" />
      </g>}
    </svg>
  );
}
