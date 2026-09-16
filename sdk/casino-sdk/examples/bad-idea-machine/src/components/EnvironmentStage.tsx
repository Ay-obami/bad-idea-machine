import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { playResultSound, playSceneEventSound } from '../lib/audio';
import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import { getEnvironmentDefinition } from '../scene/environments';
import { getOutcomePresentation, getScenePlate, SCENE_ATLAS_FRAMES } from '../scene/presentation';
import type { EnvironmentId, SceneEvent, SceneScript } from '../scene/types';
import '../styles/environment-stage.css';
import '../styles/environment-ui.css';
import { SceneActor } from './SceneActor';
import { SceneVfx } from './SceneVfx';

export type EnvironmentPhase = 'idle' | 'arming' | 'revealing' | 'result';

type Props = {
  environment: EnvironmentId;
  riskMode: RiskMode;
  phase: EnvironmentPhase;
  script?: SceneScript;
  tier?: OutcomeTier;
  multiplierBps?: number;
};

function eventMap(events: readonly SceneEvent[]): ReadonlyMap<string, SceneEvent> {
  return new Map(events.map(event => [event.actorId, event] as const));
}

export function EnvironmentStage({ environment, riskMode, phase, script, tier, multiplierBps }: Props) {
  const [startedIds, setStartedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [activeIds, setActiveIds] = useState<ReadonlySet<string>>(() => new Set());
  const [revision, setRevision] = useState(0);

  const definition = getEnvironmentDefinition(environment);
  const scriptEvents = script?.events ?? [];
  const startedEvents = useMemo(() => scriptEvents.filter(event => startedIds.has(event.id)), [scriptEvents, startedIds]);
  const activeEvents = useMemo(() => scriptEvents.filter(event => activeIds.has(event.id)), [scriptEvents, activeIds]);
  const startedByActor = useMemo(() => eventMap(startedEvents), [startedEvents]);
  const cameraImpact = activeEvents.reduce((max, event) => Math.max(max, event.intensity), 0);
  const plate = getScenePlate(environment, phase, tier);
  const outcome = tier === undefined ? undefined : getOutcomePresentation(tier);

  useEffect(() => {
    if (phase !== 'revealing' || !script || script.environment !== environment) {
      if (phase === 'idle' || phase === 'arming') {
        setStartedIds(new Set());
        setActiveIds(new Set());
      }
      return;
    }

    setStartedIds(new Set());
    setActiveIds(new Set());
    setRevision(current => current + 1);

    const timers: number[] = [];
    for (const event of script.events) {
      timers.push(window.setTimeout(() => {
        setStartedIds(current => new Set([...current, event.id]));
        setActiveIds(current => new Set([...current, event.id]));
        playSceneEventSound(environment, event);
      }, event.startMs));

      timers.push(window.setTimeout(() => {
        setActiveIds(current => {
          const next = new Set(current);
          next.delete(event.id);
          return next;
        });
      }, event.startMs + event.durationMs));
    }

    return () => timers.forEach(window.clearTimeout);
  }, [environment, phase, script]);

  useEffect(() => {
    if (phase === 'result' && multiplierBps !== undefined) playResultSound(multiplierBps);
  }, [phase, multiplierBps]);

  const modeClass = riskMode === 0 ? 'controlled' : riskMode === 1 ? 'send-it' : 'absolutely-not';
  const multiplierText = multiplierBps === undefined
    ? ''
    : `${(multiplierBps / 10_000).toFixed(multiplierBps % 10_000 === 0 ? 0 : 1)}×`;
  const plateStyle: CSSProperties = {
    backgroundImage: `url(${plate.src})`,
    backgroundSize: `100% ${SCENE_ATLAS_FRAMES * 100}%`,
    backgroundPosition: `center ${plate.frame * 100 / (SCENE_ATLAS_FRAMES - 1)}%`,
  };

  return (
    <section
      className={`environment-stage environment-stage--${environment} environment-stage--${modeClass} environment-stage--${phase}`}
      data-environment={environment}
      data-phase={phase}
      data-camera-impact={cameraImpact}
      aria-live="polite"
    >
      <div
        key={`${environment}-${plate.frame}`}
        className="environment-stage__plate"
        data-scene-frame={plate.frame}
        role="img"
        aria-label={plate.label}
        style={plateStyle}
      />
      <div className="environment-stage__cinematic-grade" aria-hidden="true" />

      <div className="scene-actor-layer" aria-label={`${definition.label} interactive scene`}>
        {definition.actors.map(actor => (
          <SceneActor key={actor.id} actor={actor} event={startedByActor.get(actor.id)} revision={revision} />
        ))}
      </div>

      <SceneVfx events={activeEvents} />

      <div className="environment-stage__hud" aria-hidden="true">
        <div className="environment-stage__name">
          <small>CHAOS ENVIRONMENT</small>
          <strong>{definition.label}</strong>
          <span>{environment === 'kitchen'
            ? 'Everyday appliances. Extraordinary bad ideas.'
            : 'Power tools, heavy metal, loose tires and industrial regret.'}</span>
        </div>
        <div className="environment-stage__status">
          {phase === 'revealing' && activeEvents.length > 0
            ? `${activeEvents.at(-1)?.hazard.toUpperCase()} / ${activeEvents.length} ACTIVE FAILURE${activeEvents.length === 1 ? '' : 'S'}`
            : phase === 'arming'
              ? 'BAD DECISIONS ARMING…'
              : phase === 'result'
                ? 'DAMAGE ASSESSMENT COMPLETE'
                : 'AWAITING TERRIBLE JUDGMENT'}
        </div>
      </div>

      {phase === 'arming' && (
        <div className="environment-stage__arming">
          <span>{environment === 'kitchen' ? 'PREHEATING REGRETS' : 'REMOVING SAFETY GUARDS'}</span>
          <span>CONSULTING NO PROFESSIONALS</span>
        </div>
      )}

      {phase === 'result' && tier !== undefined && script && outcome && (
        <div className={`environment-result environment-result--${outcome.tone} ${tier === 4 ? 'environment-result--huge' : ''}`}>
          <span>{outcome.title}</span>
          <strong>{multiplierText}</strong>
          <small>{environment === 'kitchen' ? outcome.kitchenCopy : outcome.garageCopy}</small>
        </div>
      )}

      <div className="environment-stage__event-probe" aria-hidden="true">
        {activeEvents.map(event => (
          <i
            key={event.id}
            data-event-actor={event.actorId}
            data-event-hazard={event.hazard}
            data-event-intensity={event.intensity}
            data-event-decoy={event.decoy ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  );
}
