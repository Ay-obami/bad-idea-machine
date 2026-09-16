import { useEffect, useMemo, useState } from 'react';

import { playResultSound, playSceneEventSound } from '../lib/audio';
import type { OutcomeTier, RiskMode } from '../lib/badIdea';
import { AftermathController } from '../play/AftermathController';
import { ResultOverlay } from '../play/ResultOverlay';
import { RoomStage } from '../play/RoomStage';
import { getEnvironmentDefinition } from '../scene/environments';
import type { EnvironmentId, SceneEvent, SceneScript } from '../scene/types';
import '../styles/environment-stage.css';
import '../styles/environment-ui.css';
import '../styles/kitchen.css';
import '../styles/garage.css';
import '../styles/cinematic-stage.css';
import { SceneVfx } from './SceneVfx';

export type EnvironmentPhase = 'idle' | 'arming' | 'revealing' | 'result';
type AftermathStatus = 'pending' | 'visible' | 'error';

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
  const [aftermathStatus, setAftermathStatus] = useState<AftermathStatus>('pending');

  const definition = getEnvironmentDefinition(environment);
  const scriptEvents = script?.events ?? [];
  const startedEvents = useMemo(() => scriptEvents.filter(event => startedIds.has(event.id)), [scriptEvents, startedIds]);
  const activeEvents = useMemo(() => scriptEvents.filter(event => activeIds.has(event.id)), [scriptEvents, activeIds]);
  const startedByActor = useMemo(() => eventMap(startedEvents), [startedEvents]);
  const cameraImpact = activeEvents.reduce((max, event) => Math.max(max, event.intensity), 0);

  useEffect(() => {
    if (phase !== 'result') setAftermathStatus('pending');
  }, [environment, phase, script, tier]);

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
    if (phase === 'result' && aftermathStatus !== 'pending' && multiplierBps !== undefined) {
      playResultSound(multiplierBps);
    }
  }, [aftermathStatus, phase, multiplierBps]);

  const modeClass = riskMode === 0 ? 'controlled' : riskMode === 1 ? 'send-it' : 'absolutely-not';

  return (
    <section
      className={`environment-stage cinematic-stage environment-stage--${environment} environment-stage--${modeClass} environment-stage--${phase}`}
      data-environment={environment}
      data-phase={phase}
      data-camera-impact={cameraImpact}
      data-aftermath-status={aftermathStatus}
      aria-live="polite"
    >
      <RoomStage environment={environment} startedByActor={startedByActor} revision={revision} />

      <SceneVfx events={activeEvents} />

      <AftermathController
        environment={environment}
        tier={tier}
        phase={phase}
        onVisible={() => setAftermathStatus('visible')}
        onError={() => setAftermathStatus('error')}
      />

      <div className="environment-stage__hud cinematic-stage__hud" aria-hidden="true">
        <div className="environment-stage__name">
          <small>CHAOS ENVIRONMENT</small>
          <strong>{definition.label}</strong>
          <i>{environment === 'kitchen' ? 'EVERYDAY APPLIANCES. EXTRAORDINARILY BAD IDEAS.' : 'POWER TOOLS, HEAVY METAL, LOOSE TIRES AND INDUSTRIAL REGRET.'}</i>
        </div>
        <div className="environment-stage__status">
          {phase === 'revealing' && activeEvents.length > 0
            ? `${activeEvents.at(-1)?.hazard.toUpperCase()} / ${activeEvents.length} ACTIVE FAILURE${activeEvents.length === 1 ? '' : 'S'}`
            : phase === 'arming'
              ? 'BAD DECISIONS ARMING…'
              : phase === 'result'
                ? aftermathStatus === 'pending' ? 'DAMAGE ASSESSMENT LOADING…' : 'DAMAGE ASSESSMENT COMPLETE'
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
        <div className="environment-stage__idle-prompt cinematic-stage__idle-prompt">
          <span>{environment === 'kitchen' ? 'KITCHEN MELTDOWN READY' : 'GARAGE MAYHEM READY'}</span>
          <strong>PRESS THE BUTTON WHEN COMMON SENSE LEAVES.</strong>
        </div>
      )}

      {phase === 'result' && tier !== undefined && script && multiplierBps !== undefined && aftermathStatus !== 'pending' && (
        <ResultOverlay
          tier={tier}
          multiplierBps={multiplierBps}
          label={script.finalizer.label}
          flavor={script.finalizer.flavor}
          visualUnavailable={aftermathStatus === 'error'}
        />
      )}

      <div className="environment-stage__event-probe" aria-hidden="true">
        {startedEvents.map(event => (
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
