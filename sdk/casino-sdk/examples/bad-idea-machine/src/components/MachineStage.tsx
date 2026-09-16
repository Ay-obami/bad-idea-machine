import { useEffect, useMemo, useState, type CSSProperties } from 'react';

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

type ParticleKind = 'spark' | 'ember' | 'smoke' | 'debris';
type ChaosStyle = CSSProperties & { [key: `--${string}`]: string };

type ParticleSpec = Readonly<{
  kind: ParticleKind;
  style: ChaosStyle;
}>;

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

function seededRandom(seed: number) {
  let state = (seed || 0x51f15e) >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function particleKindsFor(step: RouteStep): readonly ParticleKind[] {
  if (step.hazard === 'fire') return ['ember', 'spark', 'ember', 'smoke'];
  if (step.hazard === 'smoke') return ['smoke', 'smoke', 'ember', 'debris'];
  if (step.hazard === 'debris') return ['debris', 'spark', 'debris', 'ember'];
  if (step.hazard === 'blast') return ['spark', 'debris', 'ember', 'smoke'];
  if (step.hazard === 'alarm') return ['spark', 'ember', 'debris'];
  return ['spark', 'spark', 'ember', 'debris'];
}

function buildParticles(step: RouteStep): readonly ParticleSpec[] {
  const random = seededRandom(step.effectSeed);
  const kinds = particleKindsFor(step);
  const count = 18 + step.intensity * 14 + (step.hazard === 'blast' ? 12 : 0);

  return Array.from({ length: count }, (_, index) => {
    const kind = kinds[index % kinds.length];
    const smoke = kind === 'smoke';
    const x = 4 + random() * 92;
    const y = 8 + random() * 82;
    const dx = (random() - .5) * (smoke ? 180 : 520);
    const dy = smoke ? -(100 + random() * 230) : (random() - .64) * 390;
    const size = smoke ? 28 + random() * 58 : 8 + random() * (step.intensity * 7 + 12);
    const rotation = (random() - .5) * 1_080;

    return {
      kind,
      style: {
        '--particle-x': `${x}%`,
        '--particle-y': `${y}%`,
        '--particle-dx': `${dx}px`,
        '--particle-dy': `${dy}px`,
        '--particle-size': `${size}px`,
        '--particle-rot': `${rotation}deg`,
      },
    };
  });
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
        playStationSound(step);
      }, elapsed);
      timers.push(timer);
      elapsed += step.durationMs;
    });
    return () => timers.forEach(window.clearTimeout);
  }, [phase, route]);

  useEffect(() => {
    if (phase === 'result' && multiplierBps !== undefined) playResultSound(multiplierBps);
  }, [phase, multiplierBps]);

  const routeIndex = useMemo(
    () => new Map(route.map((step, index) => [step.station, index] as const)),
    [route],
  );
  const activeStep = activeIndex >= 0 ? route[activeIndex] : undefined;
  const decoys = useMemo(() => new Set(activeStep?.decoys ?? []), [activeStep]);
  const particles = useMemo(() => activeStep ? buildParticles(activeStep) : [], [activeStep]);

  const modeClass = riskMode === 0 ? 'controlled' : riskMode === 1 ? 'send-it' : 'absolutely-not';
  const resultText = multiplierBps === undefined ? '' : `${(multiplierBps / 10_000).toFixed(multiplierBps % 10_000 === 0 ? 0 : 1)}×`;
  const isFailure = tier === 0;
  const machineIntensity = phase === 'revealing' && activeStep ? `machine--intensity-${activeStep.intensity}` : '';
  const burstX = activeStep ? 12 + (activeStep.effectSeed % 76) : 50;
  const burstY = activeStep ? 12 + ((activeStep.effectSeed >>> 7) % 68) : 50;

  return (
    <section className={`machine machine--${modeClass} machine--${phase} ${machineIntensity}`} aria-live="polite">
      <div className="machine__header">
        <div>
          <span className="eyebrow">UNLICENSED DECISION ENGINE / MK.IV</span>
          <h1>BAD IDEA MACHINE</h1>
        </div>
        <div className="machine__status">
          <span className="status-light" />
          {phase === 'revealing' && activeStep
            ? `${activeStep.hazard.toUpperCase()} CASCADE / LEVEL ${activeStep.intensity}`
            : riskMode === 0 ? 'STABILITY ONLINE' : riskMode === 1 ? 'LIMITERS BYPASSED' : 'WARRANTY VOID'}
        </div>
      </div>

      <div className="machine__rail" aria-label="Bad Idea Machine chain reaction">
        {ALL_STATIONS.map((station, index) => {
          const currentRouteIndex = routeIndex.get(station);
          const isActive = phase === 'revealing' && currentRouteIndex === activeIndex;
          const isDecoy = phase === 'revealing' && decoys.has(station) && !isActive;
          const isReached =
            phase === 'result'
              ? currentRouteIndex !== undefined
              : phase === 'revealing' && currentRouteIndex !== undefined && currentRouteIndex <= activeIndex;
          const isComplete =
            (phase === 'revealing' && currentRouteIndex !== undefined && currentRouteIndex < activeIndex) ||
            (phase === 'result' && currentRouteIndex !== undefined);
          const variant = currentRouteIndex === undefined ? '' : route[currentRouteIndex]?.variant ?? '';
          const dangerousDecoy = isDecoy && (activeStep?.intensity ?? 0) >= 2;
          const decoyFire = dangerousDecoy && (((activeStep?.effectSeed ?? 0) + index) % 2 === 0);
          const showFire = isActive
            ? activeStep?.hazard === 'fire' || activeStep?.hazard === 'blast' || activeStep?.intensity === 3
            : decoyFire;
          const showSmoke = isActive || dangerousDecoy;

          return (
            <div className="machine__station-wrap" key={station}>
              <article
                className={`station ${isReached ? 'station--reached' : ''} ${isActive ? 'station--active' : ''} ${isComplete ? 'station--complete' : ''} ${isDecoy ? 'station--decoy' : ''} ${dangerousDecoy ? 'station--danger' : ''}`}
                data-station={station}
                data-variant={isActive ? variant : undefined}
                data-hazard={isActive ? activeStep?.hazard : undefined}
                style={isActive ? ({ '--chaos-tilt': `${((activeStep?.effectSeed ?? 0) % 7) - 3}deg` } as ChaosStyle) : undefined}
              >
                <div className="station__number">{String(index + 1).padStart(2, '0')}</div>
                <StationGlyph station={station} />
                <strong>{LABEL[station]}</strong>
                <small>{isActive ? variant.replaceAll('-', ' ') : isDecoy ? 'FALSE ALARM' : 'STANDBY'}</small>
                {showFire && <i className="station__fire" aria-hidden />}
                {showSmoke && <i className="station__smoke" aria-hidden />}
              </article>
              {index < ALL_STATIONS.length - 1 && <span className="machine__wire" aria-hidden />}
            </div>
          );
        })}
      </div>

      {phase === 'revealing' && activeStep && (
        <div className={`chaos-layer chaos-layer--${activeStep.hazard}`} aria-hidden>
          <span
            className="chaos-flash"
            key={`flash-${activeIndex}-${activeStep.effectSeed}`}
            style={{ '--burst-x': `${burstX}%`, '--burst-y': `${burstY}%` } as ChaosStyle}
          />
          {particles.map((particle, index) => (
            <span
              className={`chaos-particle chaos-particle--${particle.kind}`}
              key={`${activeStep.effectSeed}-${activeIndex}-${index}`}
              style={particle.style}
            />
          ))}
        </div>
      )}

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
