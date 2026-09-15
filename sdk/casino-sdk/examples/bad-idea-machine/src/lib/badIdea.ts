import {
  decodeAbiParameters,
  encodeAbiParameters,
  encodePacked,
  hexToBytes,
  keccak256,
  type Hex,
} from 'viem';
import type { HexString } from '@chain/casino-sdk';

export type RiskMode = 0 | 1 | 2;
export type OutcomeTier = 0 | 1 | 2 | 3 | 4;

export type PaytableRow = Readonly<{
  maxExclusive: number;
  multiplierBps: number;
}>;

export type BadIdeaOutcome = Readonly<{
  riskMode: RiskMode;
  tier: OutcomeTier;
  randomness: Hex;
  payoutRoll: number;
  multiplierBps: number;
  visualSeed: Hex;
}>;

export const BASIS_POINTS = 10_000n;
export const RTP_BPS = 9_600n;
export const TOP_TIER_PROBABILITY_WAD = 10_000_000_000_000_000n; // 1%
export const EMPTY_HEX = '0x' as HexString;

export const CONTROLLED = [
  { maxExclusive: 4_500, multiplierBps: 0 },
  { maxExclusive: 8_000, multiplierBps: 12_000 },
  { maxExclusive: 9_500, multiplierBps: 20_000 },
  { maxExclusive: 9_900, multiplierBps: 40_000 },
  { maxExclusive: 10_000, multiplierBps: 80_000 },
] as const satisfies readonly PaytableRow[];

export const SEND_IT = [
  { maxExclusive: 6_500, multiplierBps: 0 },
  { maxExclusive: 8_500, multiplierBps: 15_000 },
  { maxExclusive: 9_500, multiplierBps: 30_000 },
  { maxExclusive: 9_900, multiplierBps: 60_000 },
  { maxExclusive: 10_000, multiplierBps: 120_000 },
] as const satisfies readonly PaytableRow[];

export const ABSOLUTELY_NOT = [
  { maxExclusive: 8_000, multiplierBps: 0 },
  { maxExclusive: 9_000, multiplierBps: 20_000 },
  { maxExclusive: 9_600, multiplierBps: 50_000 },
  { maxExclusive: 9_900, multiplierBps: 100_000 },
  { maxExclusive: 10_000, multiplierBps: 160_000 },
] as const satisfies readonly PaytableRow[];

export const PAYTABLES = [CONTROLLED, SEND_IT, ABSOLUTELY_NOT] as const;

export const RISK_MODE_LABELS: Record<RiskMode, string> = {
  0: 'CONTROLLED',
  1: 'SEND IT',
  2: 'ABSOLUTELY NOT',
};

export const RISK_MODE_STATUS: Record<RiskMode, string> = {
  0: 'SAFETY SYSTEMS: ENABLED',
  1: 'SAFETY SYSTEMS: OPTIONAL',
  2: 'COMMON SENSE: OFFLINE',
};

const GAME_DATA_PARAMS = [{ type: 'uint8' }] as const;
const GAME_STATE_PARAMS = [{ type: 'uint8' }, { type: 'uint8' }, { type: 'bytes32' }] as const;
const PAYOUT_DOMAIN = 'BAD_IDEA_PAYOUT';
const VISUAL_DOMAIN = 'BAD_IDEA_VISUAL';
const ACCEPTED_16BIT_RANGE = 60_000;

function isRiskMode(value: number): value is RiskMode {
  return value === 0 || value === 1 || value === 2;
}

function isOutcomeTier(value: number): value is OutcomeTier {
  return Number.isInteger(value) && value >= 0 && value <= 4;
}

export function encodeGameData(riskMode: RiskMode): HexString {
  return encodeAbiParameters(GAME_DATA_PARAMS, [riskMode]);
}

export function decodeGameData(gameData: HexString): RiskMode | null {
  try {
    const [decoded] = decodeAbiParameters(GAME_DATA_PARAMS, gameData);
    const riskMode = Number(decoded);
    return isRiskMode(riskMode) ? riskMode : null;
  } catch {
    return null;
  }
}

export function decodeGameState(
  gameState: HexString,
): { riskMode: RiskMode; tier: OutcomeTier; randomness: Hex } | null {
  try {
    const [decodedMode, decodedTier, randomness] = decodeAbiParameters(GAME_STATE_PARAMS, gameState);
    const riskMode = Number(decodedMode);
    const tier = Number(decodedTier);
    if (!isRiskMode(riskMode) || !isOutcomeTier(tier)) return null;
    return { riskMode, tier, randomness };
  } catch {
    return null;
  }
}

export function tierFromRoll(riskMode: RiskMode, roll: number): OutcomeTier {
  if (!Number.isInteger(roll) || roll < 0 || roll >= 10_000) {
    throw new RangeError(`roll must be an integer from 0 through 9999; got ${roll}`);
  }

  const table = PAYTABLES[riskMode];
  for (let tier = 0; tier < table.length; tier += 1) {
    if (roll < table[tier].maxExclusive) return tier as OutcomeTier;
  }

  throw new Error('unreachable paytable state');
}

export function multiplierBpsForTier(riskMode: RiskMode, tier: OutcomeTier): number {
  return PAYTABLES[riskMode][tier].multiplierBps;
}

export function payoutFor(wager: bigint, riskMode: RiskMode, tier: OutcomeTier): bigint {
  if (wager < 0n) throw new RangeError('wager cannot be negative');
  return (wager * BigInt(multiplierBpsForTier(riskMode, tier))) / BASIS_POINTS;
}

export function maxMultiplierX(riskMode: RiskMode): number {
  return multiplierBpsForTier(riskMode, 4) / Number(BASIS_POINTS);
}

export function maxPayout(wager: bigint, riskMode: RiskMode): bigint {
  return payoutFor(wager, riskMode, 4);
}

export function maxReservedProfit(wager: bigint, riskMode: RiskMode): bigint {
  const payout = maxPayout(wager, riskMode);
  return payout > wager ? payout - wager : 0n;
}

export function payoutSeedFromRandomness(randomness: Hex): Hex {
  return keccak256(encodePacked(['bytes32', 'string'], [randomness, PAYOUT_DOMAIN]));
}

export function visualSeedFromRandomness(randomness: Hex): Hex {
  return keccak256(encodePacked(['bytes32', 'string'], [randomness, VISUAL_DOMAIN]));
}

/**
 * Converts a 32-byte seed into a uniform 0..9999 roll without modulo bias.
 * Each 16-bit sample is accepted only below 60,000, which contains exactly six
 * complete 10,000-outcome partitions. If a 32-byte word contains only rejected
 * samples, the word itself is hashed and sampling continues deterministically.
 */
export function uniformRoll10k(seed: Hex): number {
  let current = seed;

  while (true) {
    const bytes = hexToBytes(current);
    for (let index = 0; index + 1 < bytes.length; index += 2) {
      const sample = (bytes[index] << 8) | bytes[index + 1];
      if (sample < ACCEPTED_16BIT_RANGE) return sample % 10_000;
    }
    current = keccak256(current);
  }
}

export function outcomeFromRandomness(riskMode: RiskMode, randomness: Hex): BadIdeaOutcome {
  const payoutSeed = payoutSeedFromRandomness(randomness);
  const payoutRoll = uniformRoll10k(payoutSeed);
  const tier = tierFromRoll(riskMode, payoutRoll);

  return {
    riskMode,
    tier,
    randomness,
    payoutRoll,
    multiplierBps: multiplierBpsForTier(riskMode, tier),
    visualSeed: visualSeedFromRandomness(randomness),
  };
}

// SessionPhase enum from ICasinoGameV2.sol.
export const PHASE_SETTLED = 3;
export const PHASE_FORFEITED = 4;
export const PHASE_CANCELLED = 5;

export function isTerminalPhase(phase: number | undefined): boolean {
  return phase === PHASE_SETTLED || phase === PHASE_FORFEITED || phase === PHASE_CANCELLED;
}
