import { useId } from 'react';
import { kitchenProofArt, kitchenProofObjects as objects, kitchenSprites, type KitchenSprite } from '../environments/kitchen/proof-manifest';
import { kitchenFrame } from '../scene/kitchen-proof';

const base = import.meta.env.BASE_URL;
type Props = Readonly<{ elapsedMs: number; backgroundSource?: string; atlasSource?: string }>;

/** One SVG viewBox scales the room, actors, shadows, contact points and all follow-on damage together. */
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
        {Object.entries(kitchenSprites).map(([name, kitchenSprite]) => <clipPath id={`${id}-${name}`} key={name}><path d={kitchenSprite.path} /></clipPath>)}
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`${id}-door-shadow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${id}-heat-glow`} x="-100%" y="-160%" width="300%" height="380%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <linearGradient id={`${id}-grease`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b2614" stopOpacity=".66" />
          <stop offset=".55" stopColor="#6f4d26" stopOpacity=".5" />
          <stop offset="1" stopColor="#a17839" stopOpacity=".34" />
        </linearGradient>
        <linearGradient id={`${id}-small-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd783" />
          <stop offset=".38" stopColor="#f6a12c" />
          <stop offset=".8" stopColor="#b8491d" />
          <stop offset="1" stopColor="#6b2b19" stopOpacity=".2" />
        </linearGradient>
      </defs>

      <image href={backgroundSource} width="1000" height="600" preserveAspectRatio="none" />

      {/* The pan is part of the same room from frame zero. It remains small, supported and perspective-grounded. */}
      <g data-room-object="pan">
        <ellipse cx={frame.pan.x} cy={frame.pan.y + 29} rx="42" ry="4.2" fill="#1f160f" opacity={frame.pan.shadowOpacity} filter={`url(#${id}-shadow)`} />
        <g transform={`translate(${frame.pan.x} ${frame.pan.y}) rotate(${frame.pan.rotation}) scale(1 ${frame.pan.pitchScale})`}>
          <image href={`${base}rooms/kitchen/objects/pan.webp`} x="-55" y="-33" width="110" height="66" preserveAspectRatio="xMidYMid meet" />
        </g>
      </g>

      {/* Grease stays attached to the horizontal stove surface. It appears only after the pan has tipped. */}
      {frame.oil.progress > 0 && <g data-room-damage="grease-spill">
        <path
          d={`M${frame.oil.from.x} ${frame.oil.from.y} Q${(frame.oil.from.x + frame.oil.headX) / 2} ${Math.max(frame.oil.from.y, frame.oil.headY) + 2} ${frame.oil.headX} ${frame.oil.headY}`}
          fill="none"
          stroke={`url(#${id}-grease)`}
          strokeWidth={frame.oil.width}
          strokeLinecap="round"
          opacity={frame.oil.opacity}
        />
        <ellipse cx={frame.oil.headX} cy={frame.oil.headY} rx={2.5 + 8 * frame.oil.progress} ry={1 + 2.2 * frame.oil.progress} fill="#6d4b26" opacity={.2 + .38 * frame.oil.progress} />
        <path d={`M${frame.oil.from.x + 1} ${frame.oil.from.y - 1}Q${frame.oil.headX - 8} ${frame.oil.headY - 2} ${frame.oil.headX - 2} ${frame.oil.headY - 1}`} fill="none" stroke="#c09b58" strokeWidth=".65" opacity={.16 + .2 * frame.oil.progress} />
      </g>}

      {/* Localized ignition lives at the exact oil/burner contact, not as a room-wide VFX layer. */}
      {frame.fire.progress > 0 && <g data-room-damage="localized-burner-fire">
        <ellipse cx={frame.fire.x} cy={frame.fire.y + 2} rx={10 + 9 * frame.fire.glow} ry={3 + 2 * frame.fire.glow} fill="#9c3f1b" opacity={.15 + .26 * frame.fire.glow} filter={`url(#${id}-heat-glow)`} />
        <ellipse cx={frame.fire.x} cy={frame.fire.y + 1} rx={7 + 5 * frame.fire.glow} ry={2.2} fill="#2b1a0f" opacity={.18 + .32 * frame.fire.glow} />
        {[-5, 1, 6].map((offset, index) => {
          const scale = (.68 + index * .13) * frame.fire.glow;
          const height = frame.fire.height * (.72 + index * .16);
          return <path
            key={offset}
            d={`M${frame.fire.x + offset - 3} ${frame.fire.y + 1} Q${frame.fire.x + offset - 1} ${frame.fire.y - height * .5} ${frame.fire.x + offset + 1} ${frame.fire.y - height} Q${frame.fire.x + offset + 6} ${frame.fire.y - height * .38} ${frame.fire.x + offset + 4} ${frame.fire.y + 1}Z`}
            fill={`url(#${id}-small-flame)`}
            opacity={Math.min(.88, .18 + scale)}
          />;
        })}
      </g>}

      <ellipse cx="581" cy="316" rx="44" ry="4" fill="#27190e" opacity=".55" filter={`url(#${id}-shadow)`} />

      {/* Plates keep a real shallow ceramic body throughout flight. Roll stays modest; pitch/depth carries the 3D read. */}
      {frame.individualPlates.filter(plate => !plate.shattered).map(plate => {
        const faceRy = plate.faceHeight / 2;
        const bodyRy = Math.max(2.8, faceRy * .56);
        return <g key={plate.id} data-room-object={`plate-${plate.id}`}>
          <ellipse cx={plate.x} cy="312" rx="28" ry="2" opacity={Math.max(0, (plate.y - 160) / 420)} filter={`url(#${id}-shadow)`} />
          <g transform={`translate(${plate.x} ${plate.y}) rotate(${plate.rotation})`}>
            <path
              d={`M-33 0 A33 ${faceRy} 0 0 0 33 0 L30 ${plate.bodyDepth} A30 ${bodyRy} 0 0 1 -30 ${plate.bodyDepth} Z`}
              fill="#b7a78c"
              stroke="#6e6049"
              strokeWidth=".9"
            />
            <ellipse cx="0" cy="0" rx="33" ry={faceRy} fill="#e8dcc7" stroke="#786b55" strokeWidth=".8" />
            {sprite('singlePlate', -33.5, -faceRy, 67, plate.faceHeight)}
            <ellipse cx="0" cy="0" rx="27.5" ry={Math.max(3.8, faceRy * .56)} fill="none" stroke="#fff7e6" strokeWidth="1.05" opacity=".9" />
            <path d={`M-29 ${plate.bodyDepth * .55} Q0 ${plate.bodyDepth + bodyRy * .65} 29 ${plate.bodyDepth * .55}`} fill="none" stroke="#5f533f" strokeWidth=".75" opacity=".75" />
          </g>
        </g>;
      })}

      {/* Door shadow, solid edge and face all follow the same upper-hinge-anchored projection. */}
      <g transform={`translate(${3 + thickness * 2} ${3 + thickness})`} opacity=".28" filter={`url(#${id}-door-shadow)`}>
        <rect x="500" y="0" width="109" height="174" fill="#1d1008" transform={`matrix(${frame.door.matrix.join(' ')})`} />
      </g>
      <g data-room-object="door" transform={`matrix(${frame.door.matrix.join(' ')})`}>
        <path d={`M500 0L${500 - thickness} ${thickness}V${174 + thickness}L500 174Z`} fill="#84704d" />
        <path d={`M500 174L${500 - thickness} ${174 + thickness}H${609 - thickness}L609 174Z`} fill="#5e4c32" />
        {sprite('door', frame.door.x, frame.door.y, objects.door.size.width, objects.door.size.height)}
        <path d="M500 1V174H609" fill="none" stroke="#d9c6a1" strokeWidth=".7" />
        <path d="M598 4H606V24H598Z" fill="#9e8550" stroke="#40341f" strokeWidth=".9" />
        <circle cx="602" cy="9" r="1.25" fill="#3b2d1a" />
        <circle cx="602" cy="19" r="1.25" fill="#3b2d1a" />
      </g>

      {/* Fixed upper leaf + pin make the surviving pivot visually unambiguous. */}
      <g data-room-object="upper-hinge" opacity={.9 + frame.upperHinge.load * .1}>
        <path d="M606 4H615V24H606Z" fill="#856f43" stroke="#352b1a" strokeWidth=".9" />
        <circle cx="611" cy="9" r="1.3" fill="#2f2417" />
        <circle cx="611" cy="19" r="1.3" fill="#2f2417" />
        <rect x="603.8" y="3" width="4.6" height="22" rx="2.2" fill="#b49a5f" stroke="#4d3f25" strokeWidth=".8" />
        <path d="M606 3V25" stroke="#e0c985" strokeWidth=".7" opacity=".8" />
        <ellipse cx="606" cy="25.5" rx={3 + frame.upperHinge.load * 1.5} ry="1.4" fill="#2c1b10" opacity={.18 + frame.upperHinge.load * .22} filter={`url(#${id}-shadow)`} />
      </g>

      <path d="M607 139l-7 4m8 2l-8 5m9 1l-6 5" fill="none" stroke="#4c301a" strokeWidth="1.5" opacity=".85" />
      <circle cx="606" cy="145" r="2.1" fill="#24170d" />
      <circle cx="608" cy="153" r="1.7" fill="#382315" />

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

      {frame.doorPlateContact.active && <g data-room-contact="door-plate" opacity={frame.doorPlateContact.opacity}>
        <ellipse cx={frame.doorPlateContact.x} cy={frame.doorPlateContact.y + 5} rx={8 + frame.doorPlateContact.compression} ry="2.4" fill="#2b1b10" filter={`url(#${id}-shadow)`} />
        <path d={`M${frame.doorPlateContact.x - 6} ${frame.doorPlateContact.y} Q${frame.doorPlateContact.x} ${frame.doorPlateContact.y + 3} ${frame.doorPlateContact.x + 6} ${frame.doorPlateContact.y}`} fill="none" stroke="#5b4731" strokeWidth="1.2" />
      </g>}

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

      {/* This is one of the same ceramic materials, not a new decorative particle system. */}
      {frame.panTrigger.visible && <g data-room-object="pan-trigger-shard">
        <ellipse cx={frame.panTrigger.x} cy="318" rx="5" ry="1" fill="#251910" opacity={frame.panTrigger.shadowOpacity} filter={`url(#${id}-shadow)`} />
        <g transform={`translate(${frame.panTrigger.x} ${frame.panTrigger.y}) rotate(${frame.panTrigger.rotation})`}>
          {sprite('shard4', -8, -4, 16, 9)}
        </g>
      </g>}
    </svg>
  );
}
