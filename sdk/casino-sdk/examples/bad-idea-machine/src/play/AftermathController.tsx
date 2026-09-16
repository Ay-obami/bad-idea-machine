import { useEffect, useMemo } from 'react';

import { getEnvironmentArt } from '../environments';
import type { OutcomeTier } from '../lib/badIdea';
import { aftermathKeyForTier } from '../scene/visual-state';
import type { EnvironmentId } from '../scene/types';

type Props = Readonly<{
  environment: EnvironmentId;
  tier?: OutcomeTier;
  phase: 'idle' | 'arming' | 'revealing' | 'result';
  onVisible: () => void;
  onError: () => void;
}>;

export function AftermathController({ environment, tier, phase, onVisible, onError }: Props) {
  const aftermathKey = tier === undefined ? undefined : aftermathKeyForTier(tier);
  const src = useMemo(() => {
    if (!aftermathKey) return undefined;
    return getEnvironmentArt(environment).aftermaths[aftermathKey];
  }, [aftermathKey, environment]);

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;
    const image = new window.Image();
    image.decoding = 'async';
    image.src = src;
  }, [src]);

  if (phase !== 'result' || !src || !aftermathKey) return null;

  const reveal = () => {
    window.requestAnimationFrame(() => onVisible());
  };

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="authored-aftermath"
      data-authored-aftermath={aftermathKey}
      data-aftermath-src={src}
      onLoad={reveal}
      onError={onError}
    />
  );
}
