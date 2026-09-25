import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bytesToHex, formatUnits, parseUnits, type Hex } from 'viem';
import type { RandomnessVerificationV1 } from '@chain/casino-sdk';
import { computeMaxWager } from '@chain/casino-sdk/guest';

import type { EnvironmentPhase } from './components/EnvironmentStage';
import { FairnessReceipt } from './components/FairnessReceipt';
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
import { useCasinoHost } from './lib/useCasinoHost';
import { GameScreen } from './play/GameScreen';
import { buildSceneScript } from './scene/scene-script';
import type { EnvironmentId, SceneScript } from './scene/types';

const DEMO_DECIMALS = 2;
const DEMO_STARTING_BALANCE = 250_000n;
const ENVIRONMENT_STORAGE_KEY = 'bad-idea-machine:environment';

type RoundStatus = 'opening' | 'waiting' | 'revealing' | 'done';

type Round = {
  source: 'host' | 'demo';
  riskMode: RiskMode;
  environment: EnvironmentId;
  wager: bigint;
  status: RoundStatus;
  sessionKey?: string;
  sessionId?: string;
  tier?: OutcomeTier;
  randomness?: Hex;
  visualSeed?: Hex;
  script?: SceneScript;
  multiplierBps?: number;
  payout?: bigint;
  requestId?: string;
  settleTransactionHash?: string;
  verification?: RandomnessVerificationV1 | null;
};

type AppProps = Readonly<{
  onBackToGallery?: () => void;
}>;

function browserRandomness(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function initialEnvironment(): EnvironmentId {
  return 'kitchen';
}

function inferTierFromPayout(wager: bigint, payout: bigint, riskMode: RiskMode): OutcomeTier | null {
  for (let tier = 0; tier <= 4; tier += 1) {
    if (payoutFor(wager, riskMode, tier as OutcomeTier) === payout) return tier as OutcomeTier;
  }
  return null;
}

export function App({ onBackToGallery }: AppProps = {}) {
  const { hostApi, snapshot } = useCasinoHost();
  const standalone = useMemo(() => typeof window !== 'undefined' && window.self === window.top, []);

  const [riskMode, setRiskMode] = useState<RiskMode>(1);
  const [environment] = useState<EnvironmentId>(initialEnvironment);
  const [wagerInput, setWagerInput] = useState('10.00');
  const [round, setRound] = useState<Round | null>(null);
  const [demoBalance, setDemoBalance] = useState(DEMO_STARTING_BALANCE);
  const [error, setError] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [muted, setMuted] = useState(isMachineMuted);

  const liveHost = hostApi !== null && snapshot !== null;
  const demoMode = standalone && !liveHost;
  const ready = liveHost || demoMode;

  useEffect(() => {
    try {
      window.localStorage.setItem(ENVIRONMENT_STORAGE_KEY, environment);
    } catch {
      // Persistence is cosmetic only; storage denial must never block play.
    }
  }, [environment]);

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
  const platformMaxWagerValue = platformMaxWager?.kind === 'limit' ? platformMaxWager.maxWager : undefined;

  const maxAllowedReservedProfit = useMemo(() => {
    const raw = snapshot?.casino?.maxAllowedReservedProfit;
    return raw !== undefined ? BigInt(raw) : undefined;
  }, [snapshot?.casino?.maxAllowedReservedProfit]);

  const roundInFlight = round !== null && round.status !== 'done';
  const insufficientBalance = wager !== null && balance !== undefined && wager > balance;
  const exceedsPlatformMax = liveHost && wager !== null && platformMaxWagerValue !== undefined && wager > platformMaxWagerValue;
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
    ?? (exceedsPlatformMax || exceedsRiskLimit
      ? platformMaxWagerValue !== undefined
        ? `House risk limit reached. Max wager: ${formatUnits(platformMaxWagerValue, decimals)} ${symbol}.`
        : 'House risk limit reached for this volatility.'
      : null)
    ?? (liveHost && platformMaxWager?.kind === 'unknown'
      ? 'House limit data is still syncing; the Chain host remains authoritative.'
      : null);

  const canPlay =
    ready &&
    !roundInFlight &&
    wager !== null &&
    !insufficientBalance &&
    !exceedsPlatformMax &&
    !exceedsRiskLimit &&
    (!liveHost || snapshot.wallet.status === 'ready');

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
      environment,
      wager: BigInt(pending.wager),
      status: 'waiting',
      sessionKey: pending.sessionKey,
      sessionId: pending.sessionId,
      requestId: pending.raw.requestId,
      settleTransactionHash: pending.raw.settleTransactionHash,
    });
  }, [environment, liveHost, round, snapshot]);

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

    if (tier === undefined && randomness) tier = outcomeFromRandomness(settledMode, randomness).tier;

    const chainPayout = row.payout !== undefined ? BigInt(row.payout) : undefined;
    if (tier === undefined && chainPayout !== undefined) tier = inferTierFromPayout(round.wager, chainPayout, settledMode) ?? undefined;
    if (tier === undefined || !randomness) return;

    const visualSeed = visualSeedFromRandomness(randomness);
    const script = buildSceneScript(round.environment, tier, visualSeed);
    setRound(current => {
      if (!current || current.sessionKey !== round.sessionKey) return current;
      return {
        ...current,
        status: 'revealing',
        riskMode: settledMode,
        sessionId: row.sessionId,
        tier,
        randomness,
        visualSeed,
        script,
        multiplierBps: multiplierBpsForTier(settledMode, tier),
        payout: chainPayout ?? payoutFor(round.wager, settledMode, tier),
        requestId: row.raw.requestId,
        settleTransactionHash: row.raw.settleTransactionHash,
      };
    });
  }, [liveHost, round, snapshot]);

  const hostApiRef = useRef(hostApi);
  hostApiRef.current = hostApi;

  useEffect(() => {
    if (!round || round.status !== 'revealing' || round.tier === undefined || round.payout === undefined || !round.script) return;
    const timer = window.setTimeout(() => {
      setRound(current => {
        if (!current || current.status !== 'revealing') return current;
        return { ...current, status: 'done' };
      });

      if (round.source === 'demo') {
        setDemoBalance(current => current + round.payout!);
        return;
      }

      if (round.sessionId) {
        void hostApiRef.current?.revealOutcome({ sessionId: round.sessionId }).catch(() => {});
        if (hostApiRef.current?.getRandomnessVerification) {
          void hostApiRef.current.getRandomnessVerification({ sessionId: round.sessionId })
            .then(verification => {
              setRound(current => {
                if (!current || current.sessionId !== round.sessionId) return current;
                return { ...current, verification };
              });
            })
            .catch(() => {});
        }
      }
    }, round.script.durationMs);
    return () => window.clearTimeout(timer);
  }, [round]);

  const openHostRound = useCallback(async (mode: RiskMode, amount: bigint, roundEnvironment: EnvironmentId) => {
    if (!hostApi) return;
    const pendingKey = `pending:${Date.now()}`;
    setRound({
      source: 'host',
      riskMode: mode,
      environment: roundEnvironment,
      wager: amount,
      status: 'opening',
      sessionKey: pendingKey,
    });

    try {
      const { sessionKey } = await hostApi.openSession({
        wager: amount.toString(),
        gameData: encodeGameData(mode),
        randomnessRequestData: EMPTY_HEX,
      });
      setRound(current => {
        if (!current || current.sessionKey !== pendingKey) return current;
        return { ...current, sessionKey, status: 'waiting' };
      });
    } catch (cause) {
      setRound(null);
      setError(cause instanceof Error ? cause.message : 'The machine failed to accept the wager.');
    }
  }, [hostApi]);

  const openDemoRound = useCallback((mode: RiskMode, amount: bigint, roundEnvironment: EnvironmentId) => {
    setDemoBalance(current => current - amount);
    setRound({ source: 'demo', riskMode: mode, environment: roundEnvironment, wager: amount, status: 'opening' });

    window.setTimeout(() => {
      const randomness = browserRandomness();
      const outcome = outcomeFromRandomness(mode, randomness);
      const script = buildSceneScript(roundEnvironment, outcome.tier, outcome.visualSeed);
      setRound(current => {
        if (!current || current.source !== 'demo' || current.status !== 'opening') return current;
        return {
          ...current,
          status: 'revealing',
          tier: outcome.tier,
          randomness,
          visualSeed: outcome.visualSeed,
          script,
          multiplierBps: outcome.multiplierBps,
          payout: payoutFor(amount, mode, outcome.tier),
        };
      });
    }, 520);
  }, []);

  const clearFinishedPresentation = () => {
    if (round?.status !== 'done') return;
    setRound(null);
    setReceiptOpen(false);
  };

  const handleRiskModeChange = (next: RiskMode) => {
    clearFinishedPresentation();
    setRiskMode(next);
  };

  const handlePlay = () => {
    if (!canPlay || wager === null) return;
    primeAudio();
    setError(null);
    setReceiptOpen(false);
    if (demoMode) openDemoRound(riskMode, wager, environment);
    else void openHostRound(riskMode, wager, environment);
  };

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    setMachineMuted(next);
    if (!next) primeAudio();
  };

  const handleBackToGallery = () => {
    if (roundInFlight || !onBackToGallery) return;
    if (round?.status === 'done') clearFinishedPresentation();
    onBackToGallery();
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
  const displayEnvironment = round?.environment ?? environment;
  const environmentPhase: EnvironmentPhase = !round
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

  const receipt = round?.status === 'done' && round.tier !== undefined && round.multiplierBps !== undefined && round.script
    ? (
        <FairnessReceipt
          open={receiptOpen}
          onToggle={() => setReceiptOpen(current => !current)}
          riskMode={round.riskMode}
          environment={round.environment}
          script={round.script}
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
      )
    : undefined;

  return (
    <GameScreen
      networkLabel={demoMode ? 'STANDALONE DEMO' : `CHAIN ${snapshot?.integration.chainId ?? ''}`}
      displayEnvironment={displayEnvironment}
      displayMode={displayMode}
      environmentPhase={environmentPhase}
      script={round?.script}
      tier={round?.tier}
      multiplierBps={round?.multiplierBps}
      riskMode={riskMode}
      onRiskModeChange={handleRiskModeChange}
      environment={environment}
      onEnvironmentChange={() => {}}
      wagerInput={wagerInput}
      onWagerInputChange={setWagerInput}
      balanceText={balanceText}
      symbol={symbol}
      ctaLabel={roundInFlight ? 'BAD IDEA IN PROGRESS' : round?.status === 'done' ? 'DO IT AGAIN' : 'DO NOT PRESS'}
      disabled={!canPlay}
      reason={reason}
      demoMode={demoMode}
      muted={muted}
      onToggleMuted={toggleMuted}
      onPlay={handlePlay}
      settledTier={round?.status === 'done' ? round.tier : undefined}
      receipt={receipt}
      onBackToGallery={onBackToGallery ? handleBackToGallery : undefined}
      canLeave={!roundInFlight}
    />
  );
}
