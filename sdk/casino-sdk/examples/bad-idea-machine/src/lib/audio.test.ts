import { afterEach, describe, expect, it } from 'vitest';

import { isMachineMuted, primeAudio, setMachineMuted } from './audio';

afterEach(() => setMachineMuted(false));

describe('machine audio controls', () => {
  it('tracks mute state independently of scene presentation', () => {
    setMachineMuted(true);
    expect(isMachineMuted()).toBe(true);
    setMachineMuted(false);
    expect(isMachineMuted()).toBe(false);
  });

  it('can prime safely when no browser AudioContext exists', () => {
    expect(() => primeAudio()).not.toThrow();
  });
});
