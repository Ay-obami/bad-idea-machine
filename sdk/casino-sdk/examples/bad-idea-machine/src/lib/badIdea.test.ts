import { describe, expect, it } from 'vitest';

import {
  ABSOLUTELY_NOT,
  CONTROLLED,
  SEND_IT,
  decodeGameData,
  decodeGameState,
  encodeGameData,
  multiplierBpsForTier,
  payoutFor,
  tierFromRoll,
  type OutcomeTier,
  type RiskMode,
} from './badIdea';

const EXPECTED = {
  0: [
    { maxExclusive: 4500, multiplierBps: 0 },
    { maxExclusive: 8000, multiplierBps: 12_000 },
    { maxExclusive: 9500, multiplierBps: 20_000 },
    { maxExclusive: 9900, multiplierBps: 40_000 },
    { maxExclusive: 10_000, multiplierBps: 80_000 },
  ],
  1: [
    { maxExclusive: 6500, multiplierBps: 0 },
    { maxExclusive: 8500, multiplierBps: 15_000 },
    { maxExclusive: 9500, multiplierBps: 30_000 },
    { maxExclusive: 9900, multiplierBps: 60_000 },
    { maxExclusive: 10_000, multiplierBps: 120_000 },
  ],
  2: [
    { maxExclusive: 8000, multiplierBps: 0 },
    { maxExclusive: 9000, multiplierBps: 20_000 },
    { maxExclusive: 9600, multiplierBps: 50_000 },
    { maxExclusive: 9900, multiplierBps: 100_000 },
    { maxExclusive: 10_000, multiplierBps: 160_000 },
  ],
} as const;

describe('Bad Idea Machine paytables', () => {
  it('locks the approved threshold tables', () => {
    expect(CONTROLLED).toEqual(EXPECTED[0]);
    expect(SEND_IT).toEqual(EXPECTED[1]);
    expect(ABSOLUTELY_NOT).toEqual(EXPECTED[2]);
  });

  for (const mode of [0, 1, 2] as const) {
    it(`has exactly 96.00% RTP for mode ${mode}`, () => {
      const counts = [0, 0, 0, 0, 0];
      for (let roll = 0; roll < 10_000; roll += 1) {
        counts[tierFromRoll(mode, roll)] += 1;
      }

      const expectedCounts = EXPECTED[mode].map((row, index) => {
        const previous = index === 0 ? 0 : EXPECTED[mode][index - 1].maxExclusive;
        return row.maxExclusive - previous;
      });
      expect(counts).toEqual(expectedCounts);

      const weightedBps = counts.reduce(
        (sum, count, tier) => sum + count * multiplierBpsForTier(mode, tier as OutcomeTier),
        0,
      );
      expect(weightedBps / 10_000).toBe(9_600);
    });
  }

  it('maps every approved boundary exactly', () => {
    expect(tierFromRoll(0, 4499)).toBe(0);
    expect(tierFromRoll(0, 4500)).toBe(1);
    expect(tierFromRoll(0, 7999)).toBe(1);
    expect(tierFromRoll(0, 8000)).toBe(2);
    expect(tierFromRoll(0, 9499)).toBe(2);
    expect(tierFromRoll(0, 9500)).toBe(3);
    expect(tierFromRoll(0, 9899)).toBe(3);
    expect(tierFromRoll(0, 9900)).toBe(4);

    expect(tierFromRoll(1, 6499)).toBe(0);
    expect(tierFromRoll(1, 6500)).toBe(1);
    expect(tierFromRoll(1, 8499)).toBe(1);
    expect(tierFromRoll(1, 8500)).toBe(2);
    expect(tierFromRoll(1, 9499)).toBe(2);
    expect(tierFromRoll(1, 9500)).toBe(3);
    expect(tierFromRoll(1, 9899)).toBe(3);
    expect(tierFromRoll(1, 9900)).toBe(4);

    expect(tierFromRoll(2, 7999)).toBe(0);
    expect(tierFromRoll(2, 8000)).toBe(1);
    expect(tierFromRoll(2, 8999)).toBe(1);
    expect(tierFromRoll(2, 9000)).toBe(2);
    expect(tierFromRoll(2, 9599)).toBe(2);
    expect(tierFromRoll(2, 9600)).toBe(3);
    expect(tierFromRoll(2, 9899)).toBe(3);
    expect(tierFromRoll(2, 9900)).toBe(4);
    expect(tierFromRoll(2, 9999)).toBe(4);
  });

  it('rejects rolls outside 0..9999', () => {
    expect(() => tierFromRoll(0, -1)).toThrow();
    expect(() => tierFromRoll(0, 10_000)).toThrow();
  });
});

describe('Bad Idea Machine ABI codecs', () => {
  it('round-trips each risk mode as abi.encode(uint8)', () => {
    for (const mode of [0, 1, 2] as const) {
      const encoded = encodeGameData(mode);
      expect(encoded).toHaveLength(66);
      expect(decodeGameData(encoded)).toBe(mode);
    }
  });

  it('rejects invalid decoded risk modes', () => {
    const invalid = `0x${'0'.repeat(63)}3` as `0x${string}`;
    expect(decodeGameData(invalid)).toBeNull();
  });

  it('decodes settled game state without reinterpreting the VRF word', () => {
    const randomness = `0x${'ab'.repeat(32)}` as const;
    const state = encodeState(2, 4, randomness);
    expect(decodeGameState(state)).toEqual({ riskMode: 2, tier: 4, randomness });
  });
});

describe('payout math', () => {
  it('uses total-return multipliers with integer floor division', () => {
    const wager = 10n ** 18n;
    expect(payoutFor(wager, 0, 1)).toBe((wager * 12_000n) / 10_000n);
    expect(payoutFor(wager, 1, 4)).toBe(wager * 12n);
    expect(payoutFor(wager, 2, 4)).toBe(wager * 16n);
    expect(payoutFor(wager, 2, 0)).toBe(0n);
  });
});

function encodeState(
  riskMode: RiskMode,
  tier: OutcomeTier,
  randomness: `0x${string}`,
): `0x${string}` {
  const word = (value: number) => value.toString(16).padStart(64, '0');
  return `0x${word(riskMode)}${word(tier)}${randomness.slice(2)}`;
}
