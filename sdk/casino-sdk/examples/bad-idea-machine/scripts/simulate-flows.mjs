import { readFileSync } from 'node:fs';
import {
  createPublicClient,
  createWalletClient,
  decodeAbiParameters,
  defineChain,
  encodeAbiParameters,
  encodePacked,
  hexToBytes,
  http,
  keccak256,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const PLAYER_PRIVATE_KEY = process.env.PLAYER_PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEPLOYED_URL = new URL('../../../simulator/local-node/deployed.json', import.meta.url);
const SOAK_ROUNDS_PER_MODE = Number.parseInt(process.env.SOAK_ROUNDS_PER_MODE ?? '35', 10);

if (!Number.isInteger(SOAK_ROUNDS_PER_MODE) || SOAK_ROUNDS_PER_MODE < 1) {
  throw new Error(`SOAK_ROUNDS_PER_MODE must be a positive integer; got ${process.env.SOAK_ROUNDS_PER_MODE}`);
}

const TOKEN_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

const HOST_ABI = [
  {
    type: 'function',
    name: 'openSession',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'game', type: 'address' },
      { name: 'vault_', type: 'address' },
      { name: 'wager', type: 'uint256' },
      { name: 'gameData', type: 'bytes' },
    ],
    outputs: [
      { name: 'sessionId', type: 'uint256' },
      { name: 'requestId', type: 'bytes32' },
    ],
  },
  {
    type: 'function',
    name: 'currentSessionId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'CasinoSessionSettled',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sessionId', type: 'uint256' },
      { indexed: true, name: 'game', type: 'address' },
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'phase', type: 'uint8' },
      { indexed: false, name: 'payout', type: 'uint256' },
      { indexed: false, name: 'randomness', type: 'bytes32' },
      { indexed: false, name: 'gameState', type: 'bytes' },
    ],
  },
];

const GAME_ABI = [
  {
    type: 'function',
    name: 'quoteCaps',
    stateMutability: 'pure',
    inputs: [
      { name: 'wager', type: 'uint256' },
      { name: 'gameData', type: 'bytes' },
    ],
    outputs: [
      { name: 'maxEscrowStake', type: 'uint256' },
      { name: 'maxReservedProfit', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'quoteRiskParams',
    stateMutability: 'pure',
    inputs: [
      { name: 'wager', type: 'uint256' },
      { name: 'gameData', type: 'bytes' },
    ],
    outputs: [
      { name: 'maxPayout', type: 'uint256' },
      { name: 'probabilityWad', type: 'uint256' },
      { name: 'expectedPayout', type: 'uint256' },
      { name: 'subJackpotVarianceScaled', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'tierFromRoll',
    stateMutability: 'pure',
    inputs: [
      { name: 'riskMode', type: 'uint8' },
      { name: 'roll', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'multiplierBps',
    stateMutability: 'pure',
    inputs: [
      { name: 'riskMode', type: 'uint8' },
      { name: 'tier', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

const MULTIPLIER_BPS = {
  0: [0n, 12_000n, 20_000n, 40_000n, 80_000n],
  1: [0n, 15_000n, 30_000n, 60_000n, 120_000n],
  2: [0n, 20_000n, 50_000n, 100_000n, 160_000n],
};

const THRESHOLDS = {
  0: [4_500, 8_000, 9_500, 9_900, 10_000],
  1: [6_500, 8_500, 9_500, 9_900, 10_000],
  2: [8_000, 9_000, 9_600, 9_900, 10_000],
};

const BOUNDARY_CASES = {
  0: [
    [0, 0], [4_499, 0], [4_500, 1], [7_999, 1], [8_000, 2],
    [9_499, 2], [9_500, 3], [9_899, 3], [9_900, 4], [9_999, 4],
  ],
  1: [
    [0, 0], [6_499, 0], [6_500, 1], [8_499, 1], [8_500, 2],
    [9_499, 2], [9_500, 3], [9_899, 3], [9_900, 4], [9_999, 4],
  ],
  2: [
    [0, 0], [7_999, 0], [8_000, 1], [8_999, 1], [9_000, 2],
    [9_599, 2], [9_600, 3], [9_899, 3], [9_900, 4], [9_999, 4],
  ],
};

const TOP_TIER_PROBABILITY_WAD = 10_000_000_000_000_000n;
const PAYOUT_DOMAIN = 'BAD_IDEA_PAYOUT';
const ACCEPTED_16BIT_RANGE = 60_000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function uniformRoll10k(seed) {
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

function recomputeTier(mode, randomness) {
  const payoutSeed = keccak256(
    encodePacked(['bytes32', 'string'], [randomness, PAYOUT_DOMAIN]),
  );
  const roll = uniformRoll10k(payoutSeed);
  const tier = THRESHOLDS[mode].findIndex(maxExclusive => roll < maxExclusive);
  if (tier < 0) throw new Error(`Mode ${mode}: local tier mapping failed for roll ${roll}`);
  return { tier, roll };
}

async function waitForSettlement(publicClient, host, sessionId, fromBlock) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const logs = await publicClient.getContractEvents({
      address: host,
      abi: HOST_ABI,
      eventName: 'CasinoSessionSettled',
      fromBlock,
      toBlock: 'latest',
    });
    const match = logs.find(log => log.args.sessionId === sessionId);
    if (match) return match;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for session ${sessionId} to settle through VRF`);
}

async function verifyContractMath(publicClient, gameAddress, wager) {
  for (const mode of [0, 1, 2]) {
    const gameData = encodeAbiParameters([{ type: 'uint8' }], [mode]);
    const topMultiplierBps = MULTIPLIER_BPS[mode][4];
    const maxPayout = (wager * topMultiplierBps) / 10_000n;

    const [maxEscrowStake, maxReservedProfit] = await publicClient.readContract({
      address: gameAddress,
      abi: GAME_ABI,
      functionName: 'quoteCaps',
      args: [wager, gameData],
    });
    if (maxEscrowStake !== wager) throw new Error(`Mode ${mode}: quoteCaps escrow mismatch`);
    if (maxReservedProfit !== maxPayout - wager) {
      throw new Error(`Mode ${mode}: quoteCaps reserved-profit mismatch`);
    }

    const [quotedMaxPayout, probabilityWad, expectedPayout, variance] = await publicClient.readContract({
      address: gameAddress,
      abi: GAME_ABI,
      functionName: 'quoteRiskParams',
      args: [wager, gameData],
    });
    if (quotedMaxPayout !== maxPayout) {
      throw new Error(`Mode ${mode}: quoteRiskParams maxPayout mismatch`);
    }
    if (probabilityWad !== TOP_TIER_PROBABILITY_WAD) {
      throw new Error(`Mode ${mode}: top-tier probability is not exactly 1% WAD`);
    }
    if (expectedPayout !== (wager * 9_600n) / 10_000n) {
      throw new Error(`Mode ${mode}: expected payout is not 96% of wager`);
    }
    if (variance !== 0n) throw new Error(`Mode ${mode}: unexpected sub-jackpot variance`);

    for (let tier = 0; tier <= 4; tier += 1) {
      const actual = await publicClient.readContract({
        address: gameAddress,
        abi: GAME_ABI,
        functionName: 'multiplierBps',
        args: [mode, tier],
      });
      if (actual !== MULTIPLIER_BPS[mode][tier]) {
        throw new Error(`Mode ${mode}: tier ${tier} multiplier mismatch`);
      }
    }

    for (const [roll, expectedTier] of BOUNDARY_CASES[mode]) {
      const actualTier = await publicClient.readContract({
        address: gameAddress,
        abi: GAME_ABI,
        functionName: 'tierFromRoll',
        args: [mode, BigInt(roll)],
      });
      if (Number(actualTier) !== expectedTier) {
        throw new Error(`Mode ${mode}: roll ${roll} expected tier ${expectedTier}, got ${actualTier}`);
      }
    }

    console.log(`PASS contract quotes + paytable boundaries mode=${mode}`);
  }
}

async function settleAndVerifyRound({ publicClient, walletClient, deployment, game, wager, mode }) {
  const beforeId = await publicClient.readContract({
    address: deployment.host,
    abi: HOST_ABI,
    functionName: 'currentSessionId',
  });
  const gameData = encodeAbiParameters([{ type: 'uint8' }], [mode]);
  const openHash = await walletClient.writeContract({
    address: deployment.host,
    abi: HOST_ABI,
    functionName: 'openSession',
    args: [game.address, deployment.vault, wager, gameData],
  });
  const openReceipt = await publicClient.waitForTransactionReceipt({ hash: openHash });
  const sessionId = beforeId + 1n;
  const settled = await waitForSettlement(publicClient, deployment.host, sessionId, openReceipt.blockNumber);

  if (settled.args.phase !== 3) {
    throw new Error(`Mode ${mode}: expected SETTLED phase 3, got ${settled.args.phase}`);
  }
  if (!settled.args.randomness || /^0x0+$/.test(settled.args.randomness)) {
    throw new Error(`Mode ${mode}: settlement contained no VRF randomness`);
  }

  const [stateMode, tier, stateRandomness] = decodeAbiParameters(
    [{ type: 'uint8' }, { type: 'uint8' }, { type: 'bytes32' }],
    settled.args.gameState,
  );
  if (Number(stateMode) !== mode) {
    throw new Error(`Mode ${mode}: contract state reported mode ${stateMode}`);
  }
  if (stateRandomness.toLowerCase() !== settled.args.randomness.toLowerCase()) {
    throw new Error(`Mode ${mode}: gameState randomness differs from settlement randomness`);
  }
  if (Number(tier) < 0 || Number(tier) > 4) {
    throw new Error(`Mode ${mode}: invalid tier ${tier}`);
  }

  const independentlyComputed = recomputeTier(mode, settled.args.randomness);
  if (Number(tier) !== independentlyComputed.tier) {
    throw new Error(
      `Mode ${mode}: VRF tier mismatch at roll ${independentlyComputed.roll}; ` +
        `contract=${tier} client=${independentlyComputed.tier}`,
    );
  }

  const expectedPayout = (wager * MULTIPLIER_BPS[mode][Number(tier)]) / 10_000n;
  if (settled.args.payout !== expectedPayout) {
    throw new Error(
      `Mode ${mode}: payout mismatch for tier ${tier}; expected ${expectedPayout}, got ${settled.args.payout}`,
    );
  }

  return { sessionId, tier: Number(tier), roll: independentlyComputed.roll };
}

async function main() {
  const deployment = JSON.parse(readFileSync(DEPLOYED_URL, 'utf8'));
  const game = deployment.games.find(entry => entry.name === 'BadIdeaMachineGame');
  if (!game) throw new Error('BadIdeaMachineGame was not auto-deployed by the simulator');

  const chain = defineChain({
    id: deployment.chainId,
    name: `Bad Idea local ${deployment.chainId}`,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  });
  const player = privateKeyToAccount(PLAYER_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL), pollingInterval: 100 });
  const walletClient = createWalletClient({ account: player, chain, transport: http(RPC_URL) });

  const approval = await walletClient.writeContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'approve',
    args: [deployment.host, (1n << 256n) - 1n],
  });
  await publicClient.waitForTransactionReceipt({ hash: approval });

  const wager = parseEther('10');
  await verifyContractMath(publicClient, game.address, wager);

  const startBalance = await publicClient.readContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [player.address],
  });

  const tierCounts = {
    0: [0, 0, 0, 0, 0],
    1: [0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0],
  };
  let verifiedRounds = 0;

  for (const mode of [0, 1, 2]) {
    for (let round = 1; round <= SOAK_ROUNDS_PER_MODE; round += 1) {
      const settled = await settleAndVerifyRound({
        publicClient,
        walletClient,
        deployment,
        game,
        wager,
        mode,
      });
      tierCounts[mode][settled.tier] += 1;
      verifiedRounds += 1;

      if (round === 1 || round % 10 === 0 || round === SOAK_ROUNDS_PER_MODE) {
        console.log(
          `PASS mode=${mode} soak=${round}/${SOAK_ROUNDS_PER_MODE} ` +
            `session=${settled.sessionId} tier=${settled.tier} roll=${settled.roll}`,
        );
      }
    }
  }

  const endBalance = await publicClient.readContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [player.address],
  });
  if (endBalance === undefined || startBalance === undefined) throw new Error('Could not read player balance');

  const expectedRounds = SOAK_ROUNDS_PER_MODE * 3;
  if (verifiedRounds !== expectedRounds) {
    throw new Error(`Expected ${expectedRounds} verified settlements, got ${verifiedRounds}`);
  }

  console.log(`PASS ${verifiedRounds} real local-VRF settlements independently recomputed from stored randomness`);
  console.log(`Tier counts: ${JSON.stringify(tierCounts)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
