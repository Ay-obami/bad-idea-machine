import { useId } from 'react';
import { kitchenProofArt, kitchenProofObjects as objects, kitchenSprites, type KitchenSprite } from '../environments/kitchen/proof-manifest';
import { greaseFireFrame } from '../scene/kitchen-grease-fire';
import { kitchenFrame } from '../scene/kitchen-proof';

type Props = Readonly<{
  elapsedMs: number;
  backgroundSource?: string;
  atlasSource?: string;
  chain?: 'grease-fire';
}>;

const base = import.meta.env.BASE_URL;

/** One SVG viewBox scales the room, actors, shadows and contact points together. */
export function KitchenRoom({ elapsedMs, backgroundSource = kitchenProofArt.background, atlasSource = kitchenProofArt.atlas, chain }: Props) {
  const id = useId().replaceAll(':', '');
  const frame = kitchenFrame(elapsedMs);
  const grease = chain === 'grease-fire' ? greaseFireFrame(elapsedMs) : null;
  const thickness = 6 * Math.sin(frame.door.yaw * Math.PI / 180);
  const damage = grease ? [...frame.damageIds, ...grease.damageIds] : frame.damageIds;

  function sprite(name: KitchenSprite, x: number, y: number, width: number, height: number) {
    const [sx, sy, sw, sh] = kitchenSprites[name].box;
    return <svg x={x} y={y} width={width} height={height} viewBox={`${sx} ${sy} ${sw} ${sh}`} preserveAspectRatio="none" overflow="visible">
      <use href={`#${id}-atlas`} clipPath={`url(#${id}-${name})`} />
    </svg>;
  }

  return (
    <svg className="kitchen-room" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Kitchen visual proof. ${grease?.label ?? frame.label}`} data-damage={damage.join(' ')}>
      <defs>
        <image id={`${id}-atlas`} href={atlasSource} width="1536" height="1024" />
        {Object.entries(kitchenSprites).map(([name, sprite]) => <clipPath id={`${id}-${name}`} key={name}><path d={sprite.path} /></clipPath>)}
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`${id}-door-shadow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${id}-oil-soft`} x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation=".8" /></filter>
        <filter id={`${id}-fire-distort`} x="-100%" y="-120%" width="300%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency=".018 .075" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation=".3" />
        </filter>
        <filter id={`${id}-fire-glow`} x="-120%" y="-140%" width="340%" height="380%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`${id}-smoke-soft`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
        <linearGradient id={`${id}-oil`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f2118" stopOpacity=".58" />
          <stop offset=".55" stopColor="#68431d" stopOpacity=".52" />
          <stop offset="1" stopColor="#a97a37" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id={`${id}-flame-outer`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffcf5b" stopOpacity=".95" />
          <stop offset=".42" stopColor="#ff7b24" stopOpacity=".92" />
          <stop offset="1" stopColor="#9c2816" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-flame-inner`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3b0" stopOpacity=".98" />
          <stop offset=".58" stopColor="#ffc44e" stopOpacity=".88" />
          <stop offset="1" stopColor="#ff7a24" stopOpacity="0" />
        </linearGradient>
      </defs>

      <image href={backgroundSource} width="1000" height="600" preserveAspectRatio="none" />

      {/* First Checkpoint 3 extension: one real pan, supported on the stove from the first frame. */}
      {grease && <g data-room-object="pan">
        <ellipse
          cx={grease.pan.x - 9}
          cy="314"
          rx={36 + grease.pan.motion * 3}
          ry="3.2"
          fill="#21150d"
          opacity={.18 + grease.pan.motion * .11}
          filter={`url(#${id}-shadow)`}
        />
        <g transform={`rotate(${grease.pan.rotation} ${grease.pan.x} ${grease.pan.y})`}>
          <image
            href={`${base}rooms/kitchen/objects/pan.webp`}
            x={grease.pan.x - 51}
            y={grease.pan.y - 30}
            width="102"
            height="64"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
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

      {/* One real fragment continues the chain. It is the same ceramic art used by the approved break. */}
      {grease?.triggerShard.visible && <g
        data-room-object="grease-trigger-shard"
        transform={`translate(${grease.triggerShard.x} ${grease.triggerShard.y}) rotate(${grease.triggerShard.rotation})`}
      >
        <ellipse cx="0" cy="8" rx="7" ry="1.3" fill="#2b1c12" opacity=".22" filter={`url(#${id}-shadow)`} />
        {sprite('shard2', -9, -4, 18, 9)}
      </g>}

      {/* Oil stays on the stove plane and only reaches the burner after the pan has tipped. */}
      {grease && grease.oil.progress > 0 && <g data-room-damage="oil-spill" opacity={grease.oil.opacity}>
        <path
          d={`M${grease.oil.from.x} ${grease.oil.from.y} C${grease.oil.from.x - 5} ${grease.oil.from.y + 2}, ${grease.oil.leadingEdge.x + 7} ${grease.oil.leadingEdge.y - 1}, ${grease.oil.leadingEdge.x} ${grease.oil.leadingEdge.y}`}
          fill="none"
          stroke={`url(#${id}-oil)`}
          strokeWidth={2.5 + grease.oil.progress * 4.2}
          strokeLinecap="round"
          filter={`url(#${id}-oil-soft)`}
        />
        <ellipse
          cx={grease.oil.leadingEdge.x}
          cy={grease.oil.leadingEdge.y + .6}
          rx={3 + grease.oil.progress * 9}
          ry={.9 + grease.oil.progress * 2.2}
          fill="#55351b"
          opacity={.22 + grease.oil.progress * .34}
        />
        <path
          d={`M${grease.oil.from.x - 2} ${grease.oil.from.y - 1} Q${(grease.oil.from.x + grease.oil.leadingEdge.x) / 2} ${grease.oil.from.y - 2} ${grease.oil.leadingEdge.x + 3} ${grease.oil.leadingEdge.y - 1}`}
          fill="none"
          stroke="#d6a85a"
          strokeWidth=".7"
          opacity={.12 + grease.oil.progress * .22}
        />
      </g>}

      {/* Fire is deliberately small and rooted on the burner, not a screen-space effect. */}
      {grease && grease.fire.intensity > 0 && <g data-room-damage="localized-grease-fire">
        <ellipse
          cx={grease.fire.root.x}
          cy={grease.fire.root.y + 1}
          rx={12 + grease.fire.intensity * 10}
          ry={2.4 + grease.fire.intensity * 2}
          fill="#ff7a21"
          opacity={.12 + grease.fire.intensity * .15}
          filter={`url(#${id}-fire-glow)`}
        />
        <g filter={`url(#${id}-fire-distort)`} opacity={.28 + grease.fire.intensity * .7}>
          <path
            d={`M${grease.fire.root.x - 10} ${grease.fire.root.y + 2} Q${grease.fire.root.x - 9} ${grease.fire.root.y - 13 - grease.fire.intensity * 10} ${grease.fire.root.x - 3} ${grease.fire.root.y - 22 - grease.fire.intensity * 13} Q${grease.fire.root.x + 1} ${grease.fire.root.y - 12} ${grease.fire.root.x + 2} ${grease.fire.root.y + 2}Z`}
            fill={`url(#${id}-flame-outer)`}
          />
          <path
            d={`M${grease.fire.root.x - 1} ${grease.fire.root.y + 2} Q${grease.fire.root.x + 1} ${grease.fire.root.y - 11 - grease.fire.intensity * 8} ${grease.fire.root.x + 8} ${grease.fire.root.y - 18 - grease.fire.intensity * 9} Q${grease.fire.root.x + 13} ${grease.fire.root.y - 6} ${grease.fire.root.x + 10} ${grease.fire.root.y + 2}Z`}
            fill={`url(#${id}-flame-outer)`}
          />
          <path
            d={`M${grease.fire.root.x - 5} ${grease.fire.root.y + 2} Q${grease.fire.root.x} ${grease.fire.root.y - 11 - grease.fire.intensity * 7} ${grease.fire.root.x + 4} ${grease.fire.root.y + 2}Z`}
            fill={`url(#${id}-flame-inner)`}
          />
        </g>
      </g>}

      {grease && grease.scorch.opacity > 0 && <g data-room-damage="burner-scorch" opacity={grease.scorch.opacity}>
        <ellipse cx={grease.scorch.center.x - 2} cy={grease.scorch.center.y + 1} rx="18" ry="4" fill="#2b1c14" opacity=".46" filter={`url(#${id}-oil-soft)`} />
        <ellipse cx={grease.scorch.center.x + 7} cy={grease.scorch.center.y - 2} rx="10" ry="3" fill="#5d3620" opacity=".31" />
      </g>}

      {grease && grease.smoke.opacity > 0 && <g data-room-damage="localized-smoke" filter={`url(#${id}-smoke-soft)`}>
        {[0, 1, 2].map(index => {
          const rise = 24 + index * 28 + grease.smoke.progress * 18;
          const sway = Math.sin(grease.time / 480 + index * 1.7) * (4 + index * 2);
          return <ellipse
            key={index}
            cx={grease.smoke.root.x + sway}
            cy={grease.smoke.root.y - rise}
            rx={11 + index * 5 + grease.smoke.progress * 5}
            ry={8 + index * 6 + grease.smoke.progress * 7}
            fill="#3f403d"
            opacity={grease.smoke.opacity * (1 - index * .16)}
          />;
        })}
      </g>}
    </svg>
  );
}
