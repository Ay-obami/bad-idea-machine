import { describe, expect, it } from 'vitest';
import { hasRecoverableRound, visibleView } from './view-state';

describe('visibleView', () => {
  it('forces play while an economic round is in flight', () => {
    expect(visibleView('gallery', true)).toBe('play');
  });

  it('allows the gallery when no round is in flight', () => {
    expect(visibleView('gallery', false)).toBe('gallery');
  });
});

describe('hasRecoverableRound', () => {
  const gameAddress = '0x1111111111111111111111111111111111111111';

  it('detects a waiting Chain round for the current game', () => {
    expect(hasRecoverableRound([
      { gameAddress, phase: 1, phaseName: 'WAITING_RANDOMNESS' },
    ], gameAddress)).toBe(true);
  });

  it('ignores terminal sessions and sessions owned by another game', () => {
    expect(hasRecoverableRound([
      { gameAddress, phase: 2, phaseName: 'SETTLED' },
      { gameAddress: '0x2222222222222222222222222222222222222222', phase: 1, phaseName: 'WAITING_RANDOMNESS' },
    ], gameAddress)).toBe(false);
  });
});
