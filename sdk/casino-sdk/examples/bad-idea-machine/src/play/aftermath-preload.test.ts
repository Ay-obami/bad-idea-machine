import { describe, expect, it } from 'vitest';

import { getAftermathPreloadSources } from './aftermath-preload';

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
});
