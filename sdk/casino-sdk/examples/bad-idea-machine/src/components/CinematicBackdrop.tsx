import type { CSSProperties } from 'react';

import type { OutcomeTier } from '../lib/badIdea';
import type { EnvironmentId } from '../scene/types';
import { damageStateForTier, type DamageState } from '../scene/visual-state';

const ROOM_PHOTOS: Record<EnvironmentId, string> = {
  kitchen: 'https://images.unsplash.com/photo-1767706508438-0665b65a1ae9?auto=format&fit=crop&q=86&w=2200',
  garage: 'https://images.unsplash.com/photo-1763202282638-371d7060ee51?auto=format&fit=crop&q=86&w=2200',
};

const BLAST_PHOTO = 'https://images.unsplash.com/photo-1768889097721-cbe9741445bd?auto=format&fit=crop&q=82&w=1800';

type Props = {
  environment: EnvironmentId;
  phase: 'idle' | 'arming' | 'revealing' | 'result';
  tier?: OutcomeTier;
  compact?: boolean;
};

export function CinematicBackdrop({ environment, phase, tier, compact = false }: Props) {
  const damage: DamageState | 'clean' = phase === 'result' && tier !== undefined
    ? damageStateForTier(tier)
    : 'clean';

  const style = {
    '--room-photo': `url("${ROOM_PHOTOS[environment]}")`,
    '--blast-photo': `url("${BLAST_PHOTO}")`,
  } as CSSProperties;

  return (
    <div
      className={`cinematic-backdrop cinematic-backdrop--${environment} cinematic-backdrop--${phase} cinematic-backdrop--damage-${damage} ${compact ? 'cinematic-backdrop--compact' : ''}`}
      data-damage-state={damage}
      style={style}
      aria-hidden="true"
    >
      <div className="cinematic-backdrop__photo" />
      <div className="cinematic-backdrop__blast" />
      <div className="cinematic-backdrop__smoke" />
      <div className="cinematic-backdrop__scorch cinematic-backdrop__scorch--a" />
      <div className="cinematic-backdrop__scorch cinematic-backdrop__scorch--b" />
      <div className="cinematic-backdrop__cracks" />
      <div className="cinematic-backdrop__debris">
        {Array.from({ length: compact ? 7 : 18 }, (_, index) => <i key={index} />)}
      </div>
      <div className="cinematic-backdrop__grade" />
    </div>
  );
}
