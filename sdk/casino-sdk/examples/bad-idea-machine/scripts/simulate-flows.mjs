import { readFileSync } from 'node:fs';
import {
  createPublicClient,
  createWalletClient,
  decodeAbiParameters,
  defineChain,
  encodeAbiParameters,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const PLAYER_PRIVATE_KEY = process.env.PLAYER_PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEPLOYED_URL = new URL('../../../simulator/local-node/deployed.json', import.meta.url);

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

const MULTIPLIER_BPS = {
  0: [0n, 12_000n, 20_000n, 40_000n, 80_000n],
  1: [0n, 15_000n, 30_000n, 60_000n, 120_000n],
  2: [0n, 20_000n, 50_000n, 100_000n, 160_000n],
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    await sleep(250);
  }
  throw new Error(`Timed out waiting for session ${sessionId} to settle through VRF`);
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
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL), pollingInterval: 150 });
  const walletClient = createWalletClient({ account: player, chain, transport: http(RPC_URL) });

  const approval = await walletClient.writeContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'approve',
    args: [deployment.host, (1n << 256n) - 1n],
  });
  await publicClient.waitForTransactionReceipt({ hash: approval });

  const wager = parseEther('10');
  const startBalance = await publicClient.readContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [player.address],
  });

  for (const mode of [0, 1, 2]) {
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

    const expectedPayout = (wager * MULTIPLIER_BPS[mode][Number(tier)]) / 10_000n;
    if (settled.args.payout !== expectedPayout) {
      throw new Error(
        `Mode ${mode}: payout mismatch for tier ${tier}; expected ${expectedPayout}, got ${settled.args.payout}`,
      );
    }

    console.log(
      `PASS mode=${mode} session=${sessionId} tier=${tier} payout=${settled.args.payout} randomness=${settled.args.randomness.slice(0, 12)}…`,
    );
  }

  const endBalance = await publicClient.readContract({
    address: deployment.token,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [player.address],
  });
  if (endBalance === undefined || startBalance === undefined) throw new Error('Could not read player balance');

  console.log('PASS all three risk modes opened, received real local VRF, and settled against the host');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
