import { useEffect, useMemo, useState } from 'react';

import { playResultSound, playStationSound } from '../lib/audio';
import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import { failureCaption, type MachineStation, type RouteStep } from '../lib/route';

export type MachinePhase = 'idle' | 'arming' | 'revealing' | 'result';

type Props = {
  riskMode: RiskMode;
  phase: MachinePhase;
  route: readonly RouteStep[];
  tier?: OutcomeTier;
  multiplierBps?: number;
};

const ALL_STATIONS: readonly MachineStation[] = [
  'button',
  'toaster',
  'cat',
  'hammer',
  'ball',
  'fan',
  'dominoes',
  'rocket',
  'safe',
  'core',
];

const LABEL: Record<MachineStation, string> = {
  button: 'MAIN IGNITION',
  toaster: 'TOASTER',
  cat: 'CAT RELEASE',
  hammer: 'HAMMER',
  ball: 'BALLISTIC BALL',
  fan: 'FAN ARRAY',
  dominoes: 'DOMINO BUS',
  rocket: 'ROCKET',
  safe: 'SAFE',
  core: 'BAD IDEA CORE',
};

function StationGlyph({ station }: { station: MachineStation }) {
  if (station === 'button') return <span className="glyph glyph--button" />;
  if (station === 'toaster') return <span className="glyph glyph--toaster"><i /></span>;
  if (station === 'cat') return <span className="glyph glyph--cat"><i /><b /></span>;
  if (station === 'hammer') return <span className="glyph glyph--hammer"><i /></span>;
  if (station === 'ball') return <span className="glyph glyph--ball" />;
  if (station === 'fan') return <span className="glyph glyph--fan"><i /><i /><i /></span>;
  if (station === 'dominoes') return <span className="glyph glyph--dominoes"><i /><i /><i /><i /></span>;
  if (station === 'rocket') return <span className="glyph glyph--rocket"><i /></span>;
  if (station === 'safe') return <span className="glyph glyph--safe"><i /></span>;
  return <span className="glyph glyph--core"><i /></span>;
}

export function MachineStage({ riskMode, phase, route, tier, multiplierBps }: Props) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (phase !== 'revealing' || route.length === 0) {
      if (phase === 'idle' || phase === 'arming') setActiveIndex(-1);
      return;
    }

    let elapsed = 0;
    const timers: number[] = [];
    route.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setActiveIndex(index);
        playStationSound(step.station, step.variant);
      }, elapsed);
      timers.push(timer);
      elapsed += step.durationMs;
    });
    return () => timers.forEach(window.clearTimeout);
  }, [phase, route]);

  useEffect(() => {
    if (phase === 'result' && multiplierBps !== undefined) playResultSound(multiplierBps);
  }, [phase, multiplierBps]);

  const reached = useMemo(() => new Set(route.map(step => step.station)), [route]);
  const routeIndex = useMemo(
    () => new Map(route.map((step, index) => [step.station, index] as const)),
    [route],
  );

  const modeClass = riskMode === 0 ? 'controlled' : riskMode === 1 ? 'send-it' : 'absolutely-not';
  const resultText = multiplierBps === undefined ? '' : `${(multiplierBps / 10_000).toFixed(multiplierBps % 10_000 === 0 ? 0 : 1)}×`;
  const isFailure = tier === 0;

  return (
    <section className={`machine machine--${modeClass} machine--${phase}`} aria-live="polite">
      <div className="machine__header">
        <div>
          <span className="eyebrow">UNLICENSED DECISION ENGINE / MK.IV</span>
          <h1>BAD IDEA MACHINE</h1>
        </div>
        <div className="machine__status">
          <span className="status-light" />
          {riskMode === 0 ? 'STABILITY ONLINE' : riskMode === 1 ? 'LIMITERS BYPASSED' : 'WARRANTY VOID'}
        </div>
      </div>

      <div className="machine__rail" aria-label="Bad Idea Machine chain reaction">
        {ALL_STATIONS.map((station, index) => {
          const currentRouteIndex = routeIndex.get(station);
          const isReached = reached.has(station);
          const isActive = phase === 'revealing' && currentRouteIndex === activeIndex;
          const isComplete =
            (phase === 'revealing' && currentRouteIndex !== undefined && currentRouteIndex < activeIndex) ||
            (phase === 'result' && isReached);
          const variant = currentRouteIndex === undefined ? '' : route[currentRouteIndex]?.variant ?? '';
          return (
            <div className="machine__station-wrap" key={station}>
              <article
                className={`station ${isReached ? 'station--reached' : ''} ${isActive ? 'station--active' : ''} ${isComplete ? 'station--complete' : ''}`}
                data-station={station}
                data-variant={variant}
              >
                <div className="station__number">{String(index + 1).padStart(2, '0')}</div>
                <StationGlyph station={station} />
                <strong>{LABEL[station]}</strong>
                <small>{isActive ? variant.replaceAll('-', ' ') : 'STANDBY'}</small>
              </article>
              {index < ALL_STATIONS.length - 1 && <span className="machine__wire" aria-hidden />}
            </div>
          );
        })}
      </div>

      {phase === 'arming' && (
        <div className="machine__arming">
          <span>CALIBRATING CAT</span>
          <span>CHECKING GRAVITY</span>
          <span>IGNORING LEGAL ADVICE</span>
        </div>
      )}

      {phase === 'result' && tier !== undefined && (
        <div className={`result-card ${isFailure ? 'result-card--failure' : 'result-card--win'} ${tier === 4 ? 'result-card--huge' : ''}`}>
          <span>{isFailure ? failureCaption(route) : tier === 4 ? 'CATASTROPHIC SUCCESS' : 'SOMEHOW, IT WORKED'}</span>
          <strong>{resultText}</strong>
          <small>{isFailure ? 'THE MACHINE HAS LEARNED NOTHING.' : 'TOTAL RETURN'}</small>
        </div>
      )}

      {phase === 'idle' && (
        <div className="machine__instruction">
          <span className="machine__instruction-arrow">↘</span>
          HOW BAD AN IDEA?
        </div>
      )}
    </section>
  );
}
