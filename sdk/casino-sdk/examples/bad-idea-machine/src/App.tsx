import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bytesToHex, formatUnits, parseUnits, type Hex } from 'viem';
import type { RandomnessVerificationV1 } from '@chain/casino-sdk/guest';
import { computeMaxWager } from '@chain/casino-sdk/guest';

import { ControlPanel } from './components/ControlPanel';
import { FairnessReceipt } from './components/FairnessReceipt';
import { MachineStage, type MachinePhase } from './components/MachineStage';
import {
  EMPTY_HEX,
  PHASE_SETTLED,
  decodeGameData,
  decodeGameState,
  encodeGameData,
  isTerminalPhase,
  maxMultiplierX,
  maxReservedProfit,
  multiplierBpsForTier,
  outcomeFromRandomness,
  payoutFor,
  visualSeedFromRandomness,
  type OutcomeTier,
  type RiskMode,
} from './lib/badIdea';
import { isMachineMuted, primeAudio, setMachineMuted } from './lib/audio';
import { buildVisualRoute, routeDurationMs, type RouteStep } from './lib/route';
import { useCasinoHost } from './lib/useCasinoHost';

const DEMO_DECIMALS = 2;
const DEMO_STARTING_BALANCE = 250_000n; // 2,500.00 demo chUSD

type RoundStatus = 'opening' | 'waiting' | 'revealing' | 'done';

type Round = {
  source: 'host' | 'demo';
  riskMode: RiskMode;
  wager: bigint;
  status: RoundStatus;
  sessionKey?: string;
  sessionId?: string;
  tier?: OutcomeTier;
  randomness?: Hex;
  visualSeed?: Hex;
  route: readonly RouteStep[];
  multiplierBps?: number;
  payout?: bigint;
  requestId?: string;
  settleTransactionHash?: string;
  verification?: RandomnessVerificationV1 | null;
};

function browserRandomness(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function inferTierFromPayout(wager: bigint, payout: bigint, riskMode: RiskMode): OutcomeTier | null {
  for (let tier = 0; tier <= 4; tier += 1) {
    if (payoutFor(wager, riskMode, tier as OutcomeTier) === payout) return tier as OutcomeTier;
  }
  return null;
}

export function App() {
  const { hostApi, snapshot } = useCasinoHost();
  const standalone = useMemo(() => typeof window !== 'undefined' && window.self === window.top, []);

  const [riskMode, setRiskMode] = useState<RiskMode>(1);
  const [wagerInput, setWagerInput] = useState('10.00');
  const [round, setRound] = useState<Round | null>(null);
  const [demoBalance, setDemoBalance] = useState(DEMO_STARTING_BALANCE);
  const [error, setError] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [muted, setMuted] = useState(isMachineMuted);

  const liveHost = hostApi !== null && snapshot !== null;
  const demoMode = standalone && !liveHost;
  const ready = liveHost || demoMode;

  const decimals = liveHost ? snapshot.token.decimals ?? 18 : DEMO_DECIMALS;
  const symbol = liveHost ? snapshot.token.symbol ?? 'chUSD' : 'demo chUSD';
  const balance = useMemo(() => {
    if (demoMode) return demoBalance;
    const raw = snapshot?.balances.smartVaultBalance;
    return raw !== undefined ? BigInt(raw) : undefined;
  }, [demoMode, demoBalance, snapshot?.balances.smartVaultBalance]);

  const wager = useMemo(() => {
    if (!wagerInput.trim()) return null;
    try {
      const parsed = parseUnits(wagerInput.trim(), decimals);
      return parsed > 0n ? parsed : null;
    } catch {
      return null;
    }
  }, [wagerInput, decimals]);

  const platformMaxWager = useMemo(() => {
    if (!snapshot) return undefined;
    return computeMaxWager(snapshot, { maxMultiplierX: maxMultiplierX(riskMode) });
  }, [snapshot, riskMode]);

  const maxAllowedReservedProfit = useMemo(() => {
    const raw = snapshot?.casino?.maxAllowedReservedProfit;
    return raw !== undefined ? BigInt(raw) : undefined;
  }, [snapshot?.casino?.maxAllowedReservedProfit]);

  const roundInFlight = round !== null && round.status !== 'done';
  const insufficientBalance = wager !== null && balance !== undefined && wager > balance;
  const exceedsRiskLimit =
    liveHost &&
    wager !== null &&
    maxAllowedReservedProfit !== undefined &&
    maxReservedProfit(wager, riskMode) > maxAllowedReservedProfit;

  const walletReason = liveHost && snapshot.wallet.status !== 'ready'
    ? snapshot.wallet.status === 'disconnected'
      ? 'Connect your wallet in the Chain host to operate the machine.'
      : snapshot.wallet.status === 'setup-required'
        ? 'Finish Smart Vault setup in the Chain host first.'
        : 'Restore your Chain session key before betting.'
    : null;

  const reason = error
    ?? walletReason
    ?? (insufficientBalance ? `Insufficient ${demoMode ? 'demo credits' : 'balance'}.` : null)
    ?? (exceedsRiskLimit
      ? platformMaxWager !== undefined
        ? `House risk limit reached. Max wager: ${formatUnits(platformMaxWager, decimals)} ${symbol}.`
        : 'House risk limit reached for this volatility.'
      : null);

  const canPlay =
    ready &&
    !roundInFlight &&
    wager !== null &&
    !insufficientBalance &&
    !exceedsRiskLimit &&
    (!liveHost || snapshot.wallet.status === 'ready');

  // Recover an in-flight Chain round after iframe refresh. The session snapshot
  // remains authoritative; no localStorage copy of casino state is trusted.
  useEffect(() => {
    if (!liveHost || round || !snapshot) return;
    const pending = [...snapshot.sessions.items]
      .filter(item => item.gameAddress.toLowerCase() === snapshot.integration.gameAddress.toLowerCase())
      .filter(item => item.phase === 1 || item.phaseName === 'WAITING_RANDOMNESS')
      .sort((a, b) => b.lastEventTimestamp - a.lastEventTimestamp)[0];
    if (!pending?.raw.gameData || pending.wager === undefined) return;
    const recoveredMode = decodeGameData(pending.raw.gameData);
    if (recoveredMode === null) return;

    setRiskMode(recoveredMode);
    setRound({
      source: 'host',
      riskMode: recoveredMode,
      wager: BigInt(pending.wager),
      status: 'waiting',
      sessionKey: pending.sessionKey,
      sessionId: pending.sessionId,
      route: [],
      requestId: pending.raw.requestId,
      settleTransactionHash: pending.raw.settleTransactionHash,
    });
  }, [liveHost, round, snapshot]);

  // Resolve a Chain round from the pushed session row. gameState is preferred;
  // raw VRF is a safe fallback because the contract outcome is deterministic.
  useEffect(() => {
    if (!liveHost || !round || round.source !== 'host' || round.status !== 'waiting' || !snapshot) return;
    const row = snapshot.sessions.items.find(item => item.sessionKey === round.sessionKey);
    if (!row || !(row.isSettled || isTerminalPhase(row.phase))) return;

    if (row.phase !== undefined && row.phase !== PHASE_SETTLED) {
      setError(row.phaseName === 'CANCELLED' ? 'Randomness stalled. Chain cancelled and handled the round.' : 'The round did not settle normally.');
      setRound(null);
      return;
    }

    const decoded = row.raw.gameState ? decodeGameState(row.raw.gameState) : null;
    const rawRandomness = row.raw.randomness as Hex | undefined;
    const randomness = decoded?.randomness ?? rawRandomness;
    const settledMode = decoded?.riskMode ?? round.riskMode;
    let tier = decoded?.tier;

    if (tier === undefined && randomness) {
      tier = outcomeFromRandomness(settledMode, randomness).tier;
    }

    const chainPayout = row.payout !== undefined ? BigInt(row.payout) : undefined;
    if (tier === undefined && chainPayout !== undefined) {
      tier = inferTierFromPayout(round.wager, chainPayout, settledMode) ?? undefined;
    }
    if (tier === undefined || !randomness) return;

    const visualSeed = visualSeedFromRandomness(randomness);
    const route = buildVisualRoute(tier, visualSeed);
    setRound(current => current?.sessionKey === round.sessionKey
      ? {
          ...current,
          status: 'revealing',
          riskMode: settledMode,
          sessionId: row.sessionId,
          tier,
          randomness,
          visualSeed,
          route,
          multiplierBps: multiplierBpsForTier(settledMode, tier),
          payout: chainPayout ?? payoutFor(round.wager, settledMode, tier),
          requestId: row.raw.requestId,
          settleTransactionHash: row.raw.settleTransactionHash,
        }
      : current,
    );
  }, [liveHost, round, snapshot]);

  const hostApiRef = useRef(hostApi);
  hostApiRef.current = hostApi;

  // Finish the presentation before telling the host to reveal the withheld
  // payout in its balance UI. Demo mode mirrors that timing with fake credits.
  useEffect(() => {
    if (!round || round.status !== 'revealing' || round.tier === undefined || round.payout === undefined) return;
    const timer = window.setTimeout(() => {
      setRound(current => current && current.status === 'revealing' ? { ...current, status: 'done' } : current);

      if (round.source === 'demo') {
        setDemoBalance(current => current + round.payout!);
        return;
      }

      if (round.sessionId) {
        void hostApiRef.current?.revealOutcome({ sessionId: round.sessionId }).catch(() => {});
        if (hostApiRef.current?.getRandomnessVerification) {
          void hostApiRef.current.getRandomnessVerification({ sessionId: round.sessionId })
            .then(verification => {
              setRound(current => current?.sessionId === round.sessionId ? { ...current, verification } : current);
            })
            .catch(() => {});
        }
      }
    }, routeDurationMs(round.route));
    return () => window.clearTimeout(timer);
  }, [round]);

  const openHostRound = useCallback(async (mode: RiskMode, amount: bigint) => {
    if (!hostApi) return;
    const pendingKey = `pending:${Date.now()}`;
    setRound({
      source: 'host',
      riskMode: mode,
      wager: amount,
      status: 'opening',
      sessionKey: pendingKey,
      route: [],
    });

    try {
      const { sessionKey } = await hostApi.openSession({
        wager: amount.toString(),
        gameData: encodeGameData(mode),
        randomnessRequestData: EMPTY_HEX,
      });
      setRound(current => current?.sessionKey === pendingKey ? { ...current, sessionKey, status: 'waiting' } : current);
    } catch (cause) {
      setRound(null);
      setError(cause instanceof Error ? cause.message : 'The machine failed to accept the wager.');
    }
  }, [hostApi]);

  const openDemoRound = useCallback((mode: RiskMode, amount: bigint) => {
    setDemoBalance(current => current - amount);
    setRound({ source: 'demo', riskMode: mode, wager: amount, status: 'opening', route: [] });

    window.setTimeout(() => {
      const randomness = browserRandomness();
      const outcome = outcomeFromRandomness(mode, randomness);
      const route = buildVisualRoute(outcome.tier, outcome.visualSeed);
      setRound(current => current?.source === 'demo' && current.status === 'opening'
        ? {
            ...current,
            status: 'revealing',
            tier: outcome.tier,
            randomness,
            visualSeed: outcome.visualSeed,
            route,
            multiplierBps: outcome.multiplierBps,
            payout: payoutFor(amount, mode, outcome.tier),
          }
        : current,
      );
    }, 520);
  }, []);

  const handlePlay = () => {
    if (!canPlay || wager === null) return;
    primeAudio();
    setError(null);
    setReceiptOpen(false);
    if (demoMode) openDemoRound(riskMode, wager);
    else void openHostRound(riskMode, wager);
  };

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    setMachineMuted(next);
    if (!next) primeAudio();
  };

  if (!ready) {
    return (
      <main className="boot-screen">
        <div className="boot-screen__mark">BIM</div>
        <span className="boot-screen__spinner" />
        <strong>CONNECTING DANGEROUS EQUIPMENT…</strong>
      </main>
    );
  }

  const displayMode = round?.riskMode ?? riskMode;
  const machinePhase: MachinePhase = !round
    ? 'idle'
    : round.status === 'opening' || round.status === 'waiting'
      ? 'arming'
      : round.status === 'revealing'
        ? 'revealing'
        : 'result';
  const balanceText = balance === undefined ? '—' : formatUnits(balance, decimals);
  const payoutText = round?.payout === undefined ? '0' : formatUnits(round.payout, decimals);
  const wagerText = round ? formatUnits(round.wager, decimals) : wagerInput;
  const multiplierText = round?.multiplierBps === undefined
    ? '—'
    : `${(round.multiplierBps / 10_000).toFixed(round.multiplierBps % 10_000 === 0 ? 0 : 1)}×`;

  return (
    <main className={`app-shell app-shell--mode-${displayMode}`}>
      <div className="hazard-stripe" aria-hidden />
      <header className="game-header">
        <div className="game-header__brand">
          <span className="brand-badge">BIM</span>
          <div><strong>BAD IDEA MACHINE</strong><small>ONE BUTTON. SEVERAL TERRIBLE DECISIONS.</small></div>
        </div>
        <div className="game-header__network">
          <span className="network-dot" />
          {demoMode ? 'STANDALONE DEMO' : `CHAIN ${snapshot?.integration.chainId ?? ''}`}
        </div>
      </header>

      <div className="game-layout">
        <MachineStage
          riskMode={displayMode}
          phase={machinePhase}
          route={round?.route ?? []}
          tier={round?.tier}
          multiplierBps={round?.multiplierBps}
        />

        <ControlPanel
          riskMode={riskMode}
          onRiskModeChange={setRiskMode}
          wagerInput={wagerInput}
          onWagerInputChange={setWagerInput}
          balanceText={balanceText}
          symbol={symbol}
          ctaLabel={roundInFlight ? 'BAD IDEA IN PROGRESS' : round?.status === 'done' ? 'PRESS AGAIN' : 'DO NOT PRESS'}
          disabled={!canPlay}
          reason={reason}
          demoMode={demoMode}
          muted={muted}
          onToggleMuted={toggleMuted}
          onPlay={handlePlay}
        />
      </div>

      {round?.status === 'done' && round.tier !== undefined && round.multiplierBps !== undefined && (
        <FairnessReceipt
          open={receiptOpen}
          onToggle={() => setReceiptOpen(current => !current)}
          riskMode={round.riskMode}
          tier={round.tier}
          route={round.route}
          wagerText={wagerText}
          payoutText={payoutText}
          multiplierText={multiplierText}
          symbol={symbol}
          sessionId={round.sessionId}
          requestId={round.requestId}
          settleTransactionHash={round.settleTransactionHash}
          verification={round.verification}
          demoMode={round.source === 'demo'}
        />
      )}

      <footer className="game-footer">
        <span>96.00% RTP</span>
        <span>CHAIN VRF</span>
        <span>NO MANUAL REQUIRED</span>
        <span>DO NOT EXPOSE TO REASONABLE DECISION MAKING</span>
      </footer>
    </main>
  );
}
