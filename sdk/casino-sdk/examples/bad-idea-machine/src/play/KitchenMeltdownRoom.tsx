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

  // Both props are present in every intact room. Variant selection changes motion, never room inventory.
  const panActive = frame.secondaryObject.kind === 'pan';
  const kettleActive = frame.secondaryObject.kind === 'kettle';
  const panSparkCorrection = variant === 'pan-spark' && panActive
    ? -50 * (1 - frame.secondaryObject.motion)
    : 0;
  const pan = panActive
    ? { x: frame.secondaryObject.x + panSparkCorrection, y: frame.secondaryObject.y, rotation: frame.secondaryObject.rotation }
    : { x: 585, y: 302, rotation: -8 };
  const kettle = kettleActive
    ? { x: frame.secondaryObject.x, y: frame.secondaryObject.y, rotation: frame.secondaryObject.rotation }
    : { x: 730, y: 287, rotation: 0 };

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

        {/* Stable room inventory: pan and kettle exist before the random chain is selected. */}
        <ellipse cx={pan.x} cy="332" rx="37" ry="4" fill="#24160e" opacity={.2 + (panActive ? frame.secondaryObject.motion * .25 : 0)} filter={`url(#${id}-soft)`} />
        <image
          href={`${base}rooms/kitchen/objects/pan.webp`}
          x={pan.x - 47}
          y={pan.y - 31}
          width="94"
          height="62"
          preserveAspectRatio="xMidYMid meet"
          transform={`rotate(${pan.rotation} ${pan.x} ${pan.y})`}
        />
        <ellipse cx={kettle.x} cy="326" rx="25" ry="4" fill="#24160e" opacity={.18 + (kettleActive ? frame.secondaryObject.motion * .25 : 0)} filter={`url(#${id}-soft)`} />
        <image
          href={`${base}rooms/kitchen/objects/kettle.webp`}
          x={kettle.x - 30}
          y={kettle.y - 36}
          width="60"
          height="72"
          preserveAspectRatio="xMidYMid meet"
          transform={`rotate(${kettle.rotation} ${kettle.x} ${kettle.y})`}
        />

        {frame.secondaryObject.contactPulse > 0 && <g opacity={.22 + frame.secondaryObject.contactPulse * .55}>
          <circle cx={frame.secondaryObject.contact.x} cy={frame.secondaryObject.contact.y} r={5 + 9 * frame.secondaryObject.contactPulse} fill="none" stroke="#f0d6a0" strokeWidth="2" />
          <path d={`M${frame.secondaryObject.contact.x - 10} ${frame.secondaryObject.contact.y + 5}l-8 7m20-10 7 8`} stroke="#e8c581" strokeWidth="1.5" />
        </g>}

        {/* Spill grows along the actual countertop from the collision source. */}
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

        {/* Smoke rises only from the ignition point and accumulates into the final room. */}
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

        {/* Common settled debris comes from the same plate/counter zone; structural damage below is tier-specific. */}
        {outcome > 0 && <g opacity={outcome}>
          {Array.from({ length: Math.round(3 + damage.debris * 9) }, (_, index) => {
            const x = 360 + ((index * 53) % 365);
            const y = 326 + ((index * 17) % 35);
            const size = 4 + (index % 4) * 2;
            return <path key={index} d={`M${x} ${y}l${size} ${-size * .5} ${size * .7} ${size} -${size * 1.3} ${size * .4}Z`} fill={index % 3 ? '#d7ccb5' : '#76563c'} opacity={.35 + damage.debris * .55} />;
          })}
        </g>}

        {/* Tier 1: small, localized repairable damage. */}
        {tier === 1 && outcome > 0 && <g data-room-damage="minor-localized-scorch" opacity={outcome}>
          <path d="M648 286l-8 8 7 8-9 7" fill="none" stroke="#5c4330" strokeWidth="1.4" />
          <ellipse cx={frame.ignition.x + 12} cy={frame.ignition.y + 3} rx="24" ry="7" fill="#392319" opacity=".28" />
          <path d="M660 316l12 2-7 5-13-2z" fill="#c8b89b" stroke="#765b41" strokeWidth=".7" />
        </g>}

        {/* Tier 2: cracked counter edge and damaged backsplash, without upper-cabinet collapse. */}
        {tier === 2 && outcome > 0 && <g data-room-damage="moderate-counter-cabinet-damage" opacity={outcome}>
          <path d="M555 324l24-7 18 9 31-8 24 10 30-6" fill="none" stroke="#493426" strokeWidth="2.6" />
          <path d="M617 268l-11 14 9 12-16 13m45-42 9 15-8 12 13 12" fill="none" stroke="#6d5240" strokeWidth="1.8" />
          <path d="M604 280h24v17h-24zM636 274h20v19h-20z" fill="#8f9e8f" opacity=".42" stroke="#4c584d" />
        </g>}

        {/* Tier 3: the upper cabinet itself sags and burns; a separate silhouette from tier 2. */}
        {tier === 3 && outcome > 0 && <g data-room-damage="severe-upper-cabinet-burn" opacity={outcome}>
          <path d="M372 62h102v112l-15 22-82-7z" fill="#cbb898" stroke="#62472f" strokeWidth="2.3" transform={`rotate(${9 * outcome} 472 64)`} />
          <path d="M390 84h65v76h-65z" fill="none" stroke="#7a6043" strokeWidth="3" />
          <path d="M455 55l-18 25 14 22-23 31 17 25-20 32" fill="none" stroke="#3e2a1f" strokeWidth="3" />
          <ellipse cx="430" cy="105" rx="72" ry="40" fill="#2b1d15" opacity=".36" filter={`url(#${id}-soft)`} />
        </g>}

        {/* Tier 0: failed round leaves a charred local collapse plus a heavy impact crater. */}
        {tier === 0 && outcome > 0 && <g data-room-damage="loss-charred-collapse" opacity={outcome}>
          <path d="M390 48h98v136l-32 33-72-23z" fill="#5f4938" stroke="#2b211a" strokeWidth="3" transform={`rotate(${15 * outcome} 488 50)`} />
          <path d="M405 73h58v83h-58z" fill="#28211c" opacity=".8" />
          <path d="M350 42Q450 6 558 44Q535 105 458 96Q397 98 350 42Z" fill="#211713" opacity=".62" filter={`url(#${id}-soft)`} />
          <ellipse cx="650" cy="504" rx={34 + safeProgress * 44} ry={7 + safeProgress * 10} fill="#241811" opacity={.25 + safeProgress * .48} />
          <path d="M613 498l18-12 17 9 16-13 20 10 17-6" fill="none" stroke="#493327" strokeWidth={2 + safeProgress * 3} />
        </g>}

        {safeProgress > 0 && <g data-room-object="loss-safe">
          <ellipse cx="650" cy="520" rx={34 + safeProgress * 25} ry="7" fill="#1c1510" opacity={.2 + safeProgress * .4} filter={`url(#${id}-soft)`} />
          <image href={`${base}rooms/kitchen/objects/safe.webp`} x={690 - safeProgress * 70} y={62 + safeProgress * safeProgress * 420} width="92" height="92" transform={`rotate(${safeProgress * 16} ${736 - safeProgress * 70} ${108 + safeProgress * safeProgress * 420})`} />
        </g>}

        {/* Tier 4: unique cross-room rocket event and blast-damaged architecture. */}
        {tier === 4 && outcome > 0 && <g data-room-damage="legendary-rocket-cinematic-devastation" opacity={outcome}>
          <path d="M118 92l31 17-13 31 28 18-24 33 32 26" fill="none" stroke="#3b291f" strokeWidth="4" />
          <path d="M170 126l-26 18 18 23-23 22 31 18-16 30" fill="none" stroke="#5b3b2b" strokeWidth="3" />
          <path d="M298 35Q493 2 716 36L684 68Q554 48 411 72L325 61Z" fill="#261b16" opacity=".55" filter={`url(#${id}-soft)`} />
          {rocketProgress > .76 && <g opacity={clamp((rocketProgress - .76) / .24)}>
            <ellipse cx="205" cy="178" rx="54" ry="44" fill="#201714" stroke="#694331" strokeWidth="6" />
            <path d="M205 134l-17 26-31-7 17 28-24 22 34 1 13 31 12-32 34 5-25-24 19-29-31 9z" fill="#3a271e" opacity=".86" />
          </g>}
        </g>}

        {rocketProgress > 0 && <g data-room-object="legendary-rocket">
          <image href={`${base}rooms/kitchen/objects/rocket.webp`} x={880 - rocketProgress * 700} y={410 - rocketProgress * 245} width="86" height="58" transform={`rotate(${-38 - rocketProgress * 8} ${923 - rocketProgress * 700} ${439 - rocketProgress * 245})`} />
          <path d={`M${890 - rocketProgress * 700} ${438 - rocketProgress * 245}l${-30 - rocketProgress * 25} ${18 + rocketProgress * 8}`} stroke="#ff9d32" strokeWidth={5 + rocketProgress * 6} strokeLinecap="round" opacity={.35 + rocketProgress * .6} />
          {rocketProgress > .82 && <circle cx="205" cy="178" r={25 + (rocketProgress - .82) * 190} fill="none" stroke="#e28a3f" strokeWidth="8" opacity={(1 - rocketProgress) * 3.8} />}
        </g>}
      </svg>
    </div>
  );
}
