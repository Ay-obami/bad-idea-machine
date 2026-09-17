import { useId } from 'react';
import { kitchenProofArt, kitchenProofObjects as objects, kitchenSprites, type KitchenSprite } from '../environments/kitchen/proof-manifest';
import { kitchenFrame } from '../scene/kitchen-proof';

type Props = Readonly<{ elapsedMs: number; backgroundSource?: string; atlasSource?: string }>;

/** One SVG viewBox scales the room, actors, shadows and contact points together. */
export function KitchenRoom({ elapsedMs, backgroundSource = kitchenProofArt.background, atlasSource = kitchenProofArt.atlas }: Props) {
  const id = useId().replaceAll(':', '');
  const frame = kitchenFrame(elapsedMs);
  const thickness = 6 * Math.sin(frame.door.yaw * Math.PI / 180);
  function sprite(name: KitchenSprite, x: number, y: number, width: number, height: number) {
    const [sx, sy, sw, sh] = kitchenSprites[name].box;
    return <svg x={x} y={y} width={width} height={height} viewBox={`${sx} ${sy} ${sw} ${sh}`} preserveAspectRatio="none" overflow="visible">
      <use href={`#${id}-atlas`} clipPath={`url(#${id}-${name})`} />
    </svg>;
  }
  return (
    <svg className="kitchen-room" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Kitchen visual proof. ${frame.label}`} data-damage={frame.damageIds.join(' ')}>
      <defs>
        <image id={`${id}-atlas`} href={atlasSource} width="1536" height="1024" />
        {Object.entries(kitchenSprites).map(([name, sprite]) => <clipPath id={`${id}-${name}`} key={name}><path d={sprite.path} /></clipPath>)}
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`${id}-door-shadow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <image href={backgroundSource} width="1000" height="600" preserveAspectRatio="none" />
      <ellipse cx="581" cy="316" rx="44" ry="4" fill="#27190e" opacity=".55" filter={`url(#${id}-shadow)`} />

      {/* Each plate has a visible ceramic underside/rim, so rotation reads as depth instead of a flat cutout. */}
      {frame.individualPlates.filter(plate => !plate.shattered).map(plate => <g key={plate.id} data-room-object={`plate-${plate.id}`}>
        <ellipse cx={plate.x} cy="312" rx="28" ry="2" opacity={Math.max(0, (plate.y - 160) / 420)} filter={`url(#${id}-shadow)`} />
        <g transform={`translate(${plate.x} ${plate.y}) rotate(${plate.rotation})`}>
          <ellipse cx="0" cy={1.5 * plate.depthScale} rx="31.5" ry={3.8 * plate.depthScale} fill="#b8a98d" stroke="#73664f" strokeWidth=".7" opacity=".9" />
          {sprite('singlePlate', -33.5, -5.5 * plate.depthScale, 67, 11 * plate.depthScale)}
          <path d={`M-26 ${1.2 * plate.depthScale} Q0 ${4.4 * plate.depthScale} 26 ${1.2 * plate.depthScale}`} fill="none" stroke="#f4ead6" strokeWidth=".9" opacity=".75" />
        </g>
      </g>)}

      {/* Shadow, solid edge and face all follow the same anchored projection. */}
      <g transform={`translate(${3 + thickness * 2} ${3 + thickness})`} opacity=".28" filter={`url(#${id}-door-shadow)`}>
        <rect x="500" y="0" width="109" height="174" fill="#1d1008" transform={`matrix(${frame.door.matrix.join(' ')})`} />
      </g>
      <g data-room-object="door" transform={`matrix(${frame.door.matrix.join(' ')})`}>
        <path d={`M500 0L${500 - thickness} ${thickness}V${174 + thickness}L500 174Z`} fill="#84704d" />
        <path d={`M500 174L${500 - thickness} ${174 + thickness}H${609 - thickness}L609 174Z`} fill="#5e4c32" />
        {sprite('door', frame.door.x, frame.door.y, objects.door.size.width, objects.door.size.height)}
        <path d="M500 1V174H609" fill="none" stroke="#d9c6a1" strokeWidth=".7" />
        <rect x="605" y="10" width="4" height="13" rx="1" fill="#796640" />
      </g>

      {/* Fixed upper hinge stays attached. The lower mounting scars remain on the cabinet frame. */}
      <rect x="605" y="10" width="4" height="13" rx="1" fill="#74613b" />
      <path d="M607 139l-7 4m8 2l-8 5m9 1l-6 5" fill="none" stroke="#4c301a" strokeWidth="1.5" opacity=".85" />
      <circle cx="606" cy="145" r="2.1" fill="#24170d" />
      <circle cx="608" cy="153" r="1.7" fill="#382315" />

      {/* The lower bracket visibly tears away; its shadow separates from the mounting scar before impact. */}
      <g data-room-object="lower-hinge">
        <ellipse cx={frame.lowerHinge.x + 2} cy={frame.lowerHinge.y + 7} rx="7" ry="3" fill="#27190e" opacity={frame.lowerHinge.shadowOpacity} filter={`url(#${id}-shadow)`} />
        <g transform={`translate(${frame.lowerHinge.x} ${frame.lowerHinge.y}) rotate(${frame.lowerHinge.rotation})`}>
          <path d="M-4-7H5Q8-7 8-4V8H2V-1H-4Z" fill="#8b7950" stroke="#3f3524" strokeWidth=".9" />
          <path d="M-2-5H4M-2-2H4" stroke="#cdbb86" strokeWidth=".7" />
          <circle cx="3" cy="4" r="1.6" fill="#21180f" />
        </g>
      </g>

      <g data-room-object="hinge-screw" transform={`translate(${frame.hingeScrew.x} ${frame.hingeScrew.y}) rotate(${frame.hingeScrew.rotation})`}>
        <path d="M0-1H6M6-3V1" stroke="#c0aa77" strokeWidth="1.8" />
        <path d="M1-2V0M3-2V0" stroke="#615335" strokeWidth=".7" />
      </g>

      <ellipse cx={frame.toast.x + 14} cy="313" rx="15" ry="3" fill="#39291a" opacity={frame.toast.shadowOpacity} filter={`url(#${id}-shadow)`} />
      <g data-room-object="toast" transform={`translate(${frame.toast.x + 14} ${frame.toast.y + 17}) scale(1 ${frame.toast.scaleY}) rotate(${frame.toast.rotation})`}>
        {sprite('toast', -14, -17, objects.toast.size.width, objects.toast.size.height)}
      </g>
      <g data-room-object="toaster" transform={`rotate(${frame.toaster.rotation} ${objects.toaster.pivot.x} ${objects.toaster.pivot.y})`}>
        {sprite('toaster', frame.toaster.x, frame.toaster.y, objects.toaster.size.width, objects.toaster.size.height)}
      </g>
      {frame.ceramicFragments.length > 0 && <g data-room-damage="broken-plates">
        {frame.ceramicFragments.map(piece => <g key={piece.id}>
          <ellipse cx={piece.x} cy={piece.shadowY} rx={piece.width * .4} ry="1" fill="#39281a" opacity={piece.shadowOpacity} />
          <g transform={`translate(${piece.x} ${piece.y}) scale(1 ${piece.scaleY}) rotate(${piece.rotation})`}>
            {sprite(piece.sprite, -piece.width / 2, -piece.width / 5, piece.width, piece.width * .44)}
          </g>
        </g>)}
      </g>}
    </svg>
  );
}
