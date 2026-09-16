import { useEffect, useMemo, useState } from 'react';

import { playResultSound, playSceneEventSound } from '../lib/audio';
import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import { getEnvironmentDefinition } from '../scene/environments';
import type { EnvironmentId, SceneEvent, SceneScript } from '../scene/types';
import '../styles/environment-stage.css';
import '../styles/environment-ui.css';
import '../styles/kitchen.css';
import '../styles/garage.css';
import { SceneActor } from './SceneActor';
import { SceneVfx } from './SceneVfx';
import { GarageScene } from './scenes/GarageScene';
import { KitchenScene } from './scenes/KitchenScene';

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

  return (
    <section
      className={`environment-stage environment-stage--${environment} environment-stage--${modeClass} environment-stage--${phase}`}
      data-environment={environment}
      data-phase={phase}
      data-camera-impact={cameraImpact}
      aria-live="polite"
    >
      {environment === 'kitchen' ? <KitchenScene /> : <GarageScene />}

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
        </div>
        <div className="environment-stage__status">
          {phase === 'revealing' && activeEvents.length > 0
            ? `${activeEvents.at(-1)?.hazard.toUpperCase()} / ${activeEvents.length} ACTIVE FAILURE${activeEvents.length === 1 ? '' : 'S'}`
            : phase === 'arming'
              ? 'BAD DECISIONS ARMING…'
              : phase === 'result'
                ? 'DAMAGE ASSESSMENT COMPLETE'
                : 'ROOM CURRENTLY HABITABLE'}
        </div>
      </div>

      {phase === 'arming' && (
        <div className="environment-stage__arming">
          <span>{environment === 'kitchen' ? 'PREHEATING REGRETS' : 'REMOVING SAFETY GUARDS'}</span>
          <span>{environment === 'kitchen' ? 'IGNORING FIRE CODE' : 'LOOSENING EVERY BOLT'}</span>
          <span>CONSULTING NO PROFESSIONALS</span>
        </div>
      )}

      {phase === 'idle' && (
        <div className="environment-stage__idle-prompt">
          <span>{environment === 'kitchen' ? 'KITCHEN MELTDOWN READY' : 'GARAGE MAYHEM READY'}</span>
          <strong>PRESS THE BUTTON WHEN COMMON SENSE LEAVES.</strong>
        </div>
      )}

      {phase === 'result' && tier !== undefined && script && (
        <div className={`environment-result ${tier === 0 ? 'environment-result--failure' : 'environment-result--win'} ${tier === 4 ? 'environment-result--huge' : ''}`}>
          <span>{script.finalizer.label}</span>
          <strong>{multiplierText}</strong>
          <small>{script.finalizer.flavor}</small>
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
