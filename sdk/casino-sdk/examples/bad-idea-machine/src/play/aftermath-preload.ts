import { useEffect, useState } from 'react';

import { getEnvironmentArt, type AftermathKey } from '../environments';
import type { EnvironmentId } from '../scene/types';

const AFTERMATH_ORDER: readonly AftermathKey[] = ['failure', 'minor', 'moderate', 'severe', 'legendary'];

export type AftermathPreloadStatus = 'loading' | 'ready' | 'error';
export type AftermathImageLoader = (source: string) => Promise<void>;

export function getAftermathPreloadSources(environment: EnvironmentId): readonly string[] {
  const art = getEnvironmentArt(environment);
  return AFTERMATH_ORDER.map(key => art.aftermaths[key]);
}

function loadBrowserImage(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to preload ${source}`));
    image.src = source;
  });
}

export function preloadAftermathSources(
  environment: EnvironmentId,
  loadImage: AftermathImageLoader = loadBrowserImage,
): Promise<void> {
  return Promise.all(getAftermathPreloadSources(environment).map(source => loadImage(source))).then(() => undefined);
}

export function useAftermathPreload(environment: EnvironmentId): AftermathPreloadStatus {
  const [state, setState] = useState<{ environment: EnvironmentId; status: AftermathPreloadStatus }>(() => ({
    environment,
    status: 'loading',
  }));

  useEffect(() => {
    let active = true;
    setState({ environment, status: 'loading' });

    void preloadAftermathSources(environment)
      .then(() => {
        if (active) setState({ environment, status: 'ready' });
      })
      .catch(() => {
        if (active) setState({ environment, status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [environment]);

  return state.environment === environment ? state.status : 'loading';
}
