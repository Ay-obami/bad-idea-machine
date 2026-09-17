import { describe, expect, it } from 'vitest';

import { getAftermathPreloadSources, preloadAftermathSources } from './aftermath-preload';

describe('aftermath preloading', () => {
  it('does not request legacy full-frame Kitchen aftermath plates', async () => {
    expect(getAftermathPreloadSources('kitchen')).toEqual([]);
    const started: string[] = [];
    await preloadAftermathSources('kitchen', async source => { started.push(source); });
    expect(started).toEqual([]);
  });

  it('still requests every Garage aftermath before its tier is known', () => {
    const sources = getAftermathPreloadSources('garage');
    expect(sources).toEqual([
      '/rooms/garage/aftermath/0x.webp',
      '/rooms/garage/aftermath/1_2x.webp',
      '/rooms/garage/aftermath/3x.webp',
      '/rooms/garage/aftermath/10x.webp',
      '/rooms/garage/aftermath/100x.webp',
    ]);
    expect(new Set(sources).size).toBe(5);
  });

  it('starts all five Garage requests before waiting for any one plate to finish', async () => {
    const started: string[] = [];
    const releases: Array<() => void> = [];
    const preload = preloadAftermathSources('garage', source => new Promise<void>(resolve => {
      started.push(source);
      releases.push(resolve);
    }));

    expect(started).toEqual(getAftermathPreloadSources('garage'));
    let finished = false;
    void preload.then(() => { finished = true; });
    await Promise.resolve();
    expect(finished).toBe(false);
    releases.forEach(release => release());
    await preload;
    expect(finished).toBe(true);
  });
});
