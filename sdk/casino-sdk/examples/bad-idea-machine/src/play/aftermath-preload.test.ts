import { describe, expect, it } from 'vitest';

import { getAftermathPreloadSources, preloadAftermathSources } from './aftermath-preload';

describe('uniform aftermath preloading', () => {
  it('requests every Kitchen aftermath before a tier is known', () => {
    expect(getAftermathPreloadSources('kitchen')).toEqual([
      '/rooms/kitchen/aftermath/0x.webp',
      '/rooms/kitchen/aftermath/1_2x.webp',
      '/rooms/kitchen/aftermath/3x.webp',
      '/rooms/kitchen/aftermath/10x.webp',
      '/rooms/kitchen/aftermath/100x.webp',
    ]);
  });

  it('requests every Garage aftermath before a tier is known', () => {
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

  it('starts all five requests before waiting for any one plate to finish', async () => {
    const started: string[] = [];
    const releases: Array<() => void> = [];

    const preload = preloadAftermathSources('kitchen', source => new Promise<void>(resolve => {
      started.push(source);
      releases.push(resolve);
    }));

    expect(started).toEqual(getAftermathPreloadSources('kitchen'));

    let finished = false;
    void preload.then(() => { finished = true; });
    await Promise.resolve();
    expect(finished).toBe(false);

    releases.forEach(release => release());
    await preload;
    expect(finished).toBe(true);
  });
});
