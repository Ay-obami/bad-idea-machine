import { useId } from 'react';

import type { OutcomeTier } from '../lib/badIdea';
import {
  kitchenMeltdownFrame,
  type KitchenVariant,
} from '../scene/kitchen-meltdown';
import { KitchenRoom } from './KitchenRoom';
import '../styles/kitchen-meltdown.css';

type Props = Readonly<{
  elapsedMs: number;
  variant: KitchenVariant;
  tier: OutcomeTier;
}>;

const base = import.meta.env.BASE_URL;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function KitchenMeltdownRoom({ elapsedMs, variant, tier }: Props) {
  const id = useId().replaceAll(':', '');
  const frame = kitchenMeltdownFrame(elapsedMs, variant, tier);
  const outcome = frame.outcomeProgress;
  const damage = frame.finalDamage;
  const spillEndX = frame.spill.from.x + (frame.spill.to.x - frame.spill.from.x) * frame.spill.progress;
  const spillEndY = frame.spill.from.y + (frame.spill.to.y - frame.spill.from.y) * frame.spill.progress;
  const finalFire = frame.ignition.progress * (.55 + damage.fire * outcome * .95);
  const finalSmoke = clamp(frame.smoke.progress * .5 + damage.smoke * outcome);
  const rocketProgress = tier === 4 ? clamp((outcome - .08) / .48) : 0;
  const safeProgress = tier === 0 ? clamp((outcome - .3) / .45) : 0;
  const secondaryWidth = frame.secondaryObject.kind === 'kettle' ? 60 : 94;
  const secondaryHeight = frame.secondaryObject.kind === 'kettle' ? 72 : 62;

  return (
    <div
      className="kitchen-meltdown-room"
      data-kitchen-variant={variant}
      data-kitchen-tier={tier}
      data-kitchen-damage={[...frame.sharedDamageIds, ...frame.revealDamageIds].join(' ')}
      aria-label={`Kitchen Meltdown. ${frame.label}`}
    >
      <KitchenRoom elapsedMs={elapsedMs} />
      <svg className="kitchen-meltdown-room__overlay" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <filter id={`${id}-soft`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id={`${id}-smoke`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9" /></filter>
          <radialGradient id={`${id}-scorch`}>
            <stop offset="0" stopColor="#25150b" stopOpacity=".8" />
            <stop offset=".45" stopColor="#4c2510" stopOpacity=".56" />
            <stop offset="1" stopColor="#120c08" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-spill`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={variant === 'steam-short' ? '#b7d1c8' : '#513117'} stopOpacity={variant === 'steam-short' ? '.62' : '.78'} />
            <stop offset="1" stopColor={variant === 'steam-short' ? '#d9e6df' : '#8f5e25'} stopOpacity=".34" />
          </linearGradient>
          <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff1a4" />
            <stop offset=".35" stopColor="#ffb12e" />
            <stop offset=".72" stopColor="#ef5020" />
            <stop offset="1" stopColor="#8e1f13" stopOpacity=".2" />
          </linearGradient>
        </defs>

        {/* Secondary object belongs to the room and follows the same 1000x600 clock. */}
        <ellipse
          cx={frame.secondaryObject.x}
          cy={332}
          rx={secondaryWidth * .38}
          ry="4"
          fill="#24160e"
          opacity={.16 + frame.secondaryObject.motion * .3}
          filter={`url(#${id}-soft)`}
        />
        <image
          href={`${base}rooms/kitchen/objects/${frame.secondaryObject.kind}.webp`}
          x={frame.secondaryObject.x - secondaryWidth / 2}
          y={frame.secondaryObject.y - secondaryHeight / 2}
          width={secondaryWidth}
          height={secondaryHeight}
          preserveAspectRatio="xMidYMid meet"
          transform={`rotate(${frame.secondaryObject.rotation} ${frame.secondaryObject.x} ${frame.secondaryObject.y})`}
        />

        {frame.secondaryObject.contactPulse > 0 && <g opacity={.22 + frame.secondaryObject.contactPulse * .55}>
          <circle cx={frame.secondaryObject.contact.x} cy={frame.secondaryObject.contact.y} r={5 + 9 * frame.secondaryObject.contactPulse} fill="none" stroke="#f0d6a0" strokeWidth="2" />
          <path d={`M${frame.secondaryObject.contact.x - 10} ${frame.secondaryObject.contact.y + 5}l-8 7m20-10 7 8`} stroke="#e8c581" strokeWidth="1.5" />
        </g>}

        {/* Spill grows along the counter from the actual collision source. */}
        {frame.spill.progress > 0 && <g data-room-damage="counter-spill">
          <path
            d={`M${frame.spill.from.x} ${frame.spill.from.y} C${frame.spill.from.x + 26} ${frame.spill.from.y + 8}, ${spillEndX - 30} ${spillEndY - 7}, ${spillEndX} ${spillEndY}`}
            fill="none"
            stroke={`url(#${id}-spill)`}
            strokeWidth={6 + 14 * frame.spill.progress}
            strokeLinecap="round"
            opacity={frame.spill.opacity}
          />
          <ellipse cx={spillEndX} cy={spillEndY} rx={9 + 22 * frame.spill.progress} ry={2 + 5 * frame.spill.progress} fill={variant === 'steam-short' ? '#b9d2c8' : '#6f431d'} opacity={.2 + .42 * frame.spill.progress} />
        </g>}

        {/* Scorch and flame originate at the same physical point as ignition. */}
        {frame.ignition.progress > 0 && <g data-room-damage="localized-fire">
          <ellipse
            cx={frame.ignition.x}
            cy={frame.ignition.y + 5}
            rx={18 + 42 * frame.ignition.progress + 44 * damage.scorch * outcome}
            ry={6 + 13 * frame.ignition.progress + 10 * damage.scorch * outcome}
            fill={`url(#${id}-scorch)`}
            opacity={.35 + .5 * frame.ignition.progress}
          />
          {[0, 1, 2].map(index => {
            const offset = (index - 1) * (10 + 7 * finalFire);
            const height = 26 + finalFire * (35 + index * 8);
            return <path
              key={index}
              d={`M${frame.ignition.x + offset - 10} ${frame.ignition.y + 4} Q${frame.ignition.x + offset - 4} ${frame.ignition.y - height * .48} ${frame.ignition.x + offset} ${frame.ignition.y - height} Q${frame.ignition.x + offset + 14} ${frame.ignition.y - height * .35} ${frame.ignition.x + offset + 9} ${frame.ignition.y + 4}Z`}
              fill={`url(#${id}-flame)`}
              opacity={clamp(.12 + finalFire * .86 - index * .06)}
            />;
          })}
        </g>}

        {/* Smoke accumulates from the ignition point; it never appears elsewhere in the room. */}
        {finalSmoke > 0 && <g data-room-damage="smoke-staining" filter={`url(#${id}-smoke)`}>
          {[0, 1, 2, 3, 4].map(index => {
            const rise = 34 + index * 37 + finalSmoke * 60;
            const sway = Math.sin(index * 1.7 + frame.time / 650) * (12 + index * 3);
            return <ellipse
              key={index}
              cx={frame.smoke.x + sway}
              cy={frame.smoke.y - rise}
              rx={24 + index * 9 + finalSmoke * 24}
              ry={18 + index * 11 + finalSmoke * 28}
              fill={index < 2 ? '#514b43' : '#353735'}
              opacity={clamp(finalSmoke * (.34 - index * .035))}
            />;
          })}
        </g>}

        {/* Five separately art-directed persistent structural outcomes appear only after reveal. */}
        {outcome > 0 && <g data-room-damage={damage.structuralSignature}>
          <path
            d="M430 112l-18 18 15 17-25 24 19 15-14 31m92-92-14 19 11 16-22 20 12 25"
            fill="none"
            stroke="#4a2e20"
            strokeWidth={1.2 + damage.cracks * outcome * 3.2}
            opacity={damage.cracks * outcome * .9}
          />
          <path
            d={`M365 ${82 + damage.cabinetDrop * outcome * 18}h92v92l-13 16h-78z`}
            fill="#d1c0a0"
            stroke="#6c5137"
            strokeWidth="2"
            opacity={damage.cabinetDrop * outcome * .72}
            transform={`rotate(${damage.cabinetDrop * outcome * 8} 456 82)`}
          />
          <path
            d="M340 36Q500 8 680 40Q628 78 520 65Q424 72 340 36Z"
            fill="#2b211b"
            opacity={damage.ceilingSoot * outcome * .48}
            filter={`url(#${id}-soft)`}
          />
          {Array.from({ length: Math.round(4 + damage.debris * 12) }, (_, index) => {
            const x = 355 + ((index * 53) % 390);
            const y = 326 + ((index * 17) % 35);
            const size = 4 + (index % 4) * 2;
            return <path key={index} d={`M${x} ${y}l${size} ${-size * .5} ${size * .7} ${size} -${size * 1.3} ${size * .4}Z`} fill={index % 3 ? '#d7ccb5' : '#76563c'} opacity={outcome * (.35 + damage.debris * .55)} />;
          })}
        </g>}

        {rocketProgress > 0 && <g data-room-object="legendary-rocket">
          <image
            href={`${base}rooms/kitchen/objects/rocket.webp`}
            x={880 - rocketProgress * 700}
            y={410 - rocketProgress * 245}
            width="86"
            height="58"
            transform={`rotate(${-38 - rocketProgress * 8} ${923 - rocketProgress * 700} ${439 - rocketProgress * 245})`}
          />
          <path d={`M${890 - rocketProgress * 700} ${438 - rocketProgress * 245}l${-30 - rocketProgress * 25} ${18 + rocketProgress * 8}`} stroke="#ff9d32" strokeWidth={5 + rocketProgress * 6} strokeLinecap="round" opacity={.35 + rocketProgress * .6} />
          {rocketProgress > .82 && <circle cx="205" cy="178" r={25 + (rocketProgress - .82) * 190} fill="none" stroke="#e28a3f" strokeWidth="8" opacity={(1 - rocketProgress) * 3.8} />}
        </g>}

        {safeProgress > 0 && <g data-room-object="loss-safe">
          <ellipse cx="650" cy="520" rx={34 + safeProgress * 25} ry="7" fill="#1c1510" opacity={.2 + safeProgress * .4} filter={`url(#${id}-soft)`} />
          <image
            href={`${base}rooms/kitchen/objects/safe.webp`}
            x={690 - safeProgress * 70}
            y={62 + safeProgress * safeProgress * 420}
            width="92"
            height="92"
            transform={`rotate(${safeProgress * 16} ${736 - safeProgress * 70} ${108 + safeProgress * safeProgress * 420})`}
          />
        </g>}
      </svg>
    </div>
  );
}
