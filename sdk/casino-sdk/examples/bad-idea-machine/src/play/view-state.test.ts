import { describe, expect, it } from 'vitest';
import { visibleView } from './view-state';

describe('visibleView', () => {
  it('forces play while an economic round is in flight', () => {
    expect(visibleView('gallery', true)).toBe('play');
  });

  it('allows the gallery when no round is in flight', () => {
    expect(visibleView('gallery', false)).toBe('gallery');
  });
});
