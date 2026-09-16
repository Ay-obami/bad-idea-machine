import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';

import { visualByte, visualU16 } from './random';

const SEED = `0x${'00112233445566778899aabbccddeeff'.repeat(2)}` as Hex;

describe('scene visual randomness helpers', () => {
  it('reads visual bytes deterministically with wrapping', () => {
    expect(visualByte(SEED, 0)).toBe(0x00);
    expect(visualByte(SEED, 1)).toBe(0x11);
    expect(visualByte(SEED, 32)).toBe(0x00);
  });

  it('builds deterministic unsigned 16-bit values', () => {
    expect(visualU16(SEED, 0)).toBe(0x0011);
    expect(visualU16(SEED, 2)).toBe(0x2233);
  });
});
