import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import {
  KITCHEN_NATIVE_DURATION,
  KITCHEN_NATIVE_MASTER,
  kitchenNativeFrameAt,
} from '../scene/kitchen-native-proof';
import '../styles/kitchen-native-proof.css';

type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;

type ClipProps = Readonly<{
  rect: Rect;
  source?: Readonly<{ x: number; y: number }>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}>;

function MasterClip({ rect, source, className = '', style, children }: ClipProps) {
  const sourceX = source?.x ?? rect.x;
  const sourceY = source?.y ?? rect.y;
  return (
    <div
      className={`kitchen-native-proof__clip ${className}`}
      style={{
        left: `${rect.x / 10}%`,
        top: `${rect.y / 6}%`,
        width: `${rect.width / 10}%`,
        height: `${rect.height / 6}%`,
        ...style,
      }}
    >
      <img
        src={KITCHEN_NATIVE_MASTER}
        alt=""
        draggable={false}
        style={{
          width: `${(1000 / rect.width) * 100}%`,
          height: `${(600 / rect.height) * 100}%`,
          left: `${(-sourceX / rect.width) * 100}%`,
          top: `${(-sourceY / rect.height) * 100}%`,
        }}
      />
      {children}
    </div>
  );
}

const doorRect = { x: 673, y: 0, width: 96, height: 161 } as const;
const toastRect = { x: 642, y: 222, width: 34, height: 24 } as const;
const plateRect = { x: 593, y: 114, width: 73, height: 16 } as const;

const marks = [
  ['Intact', 0],
  ['Toast launches', 690],
  ['Toast hits door', 1070],
  ['Hinge reacts', 1180],
  ['Door contacts plates', 1940],
  ['Plate cascade', 2380],
  ['Aftermath', 3450],
] as const;

export function KitchenNativeProof() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const startedAt = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (!playing) return;
    startedAt.current = performance.now();
    startTime.current = time;
    let raf = 0;

    const tick = (now: number) => {
      const next = Math.min(KITCHEN_NATIVE_DURATION, startTime.current + now - startedAt.current);
      setTime(next);
      if (next >= KITCHEN_NATIVE_DURATION) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const frame = useMemo(() => kitchenNativeFrameAt(time), [time]);

  const reset = () => {
    setPlaying(false);
    setTime(0);
  };

  return (
    <main className="kitchen-native-proof">
      <header className="kitchen-native-proof__header">
        <div>
          <small>CHECKPOINT 2 · MASTER-FIRST MOTION PROOF</small>
          <h1>Approved Kitchen · Native Pixel Chain</h1>
          <p>The room is the approved master. Moving layers sample that same master; no separately generated prop art is used.</p>
        </div>
        <div className="kitchen-native-proof__status">
          <span>{Math.round(time)} ms</span>
          <span>{frame.damageIds.length ? frame.damageIds.join(' · ') : 'room intact'}</span>
        </div>
      </header>

      <section className="kitchen-native-proof__stage-shell">
        <div className="kitchen-native-proof__canvas">
          <img className="kitchen-native-proof__master" src={KITCHEN_NATIVE_MASTER} alt="Approved intact Kitchen master" draggable={false} />

          <MasterClip
            rect={toastRect}
            source={{ x: 642, y: 255 }}
            className="kitchen-native-proof__patch"
            style={{ opacity: frame.toast.patchOpacity }}
          />

          <MasterClip
            rect={doorRect}
            source={{ x: 570, y: 0 }}
            className="kitchen-native-proof__patch kitchen-native-proof__door-patch"
            style={{ opacity: frame.door.patchOpacity }}
          />

          <MasterClip
            rect={plateRect}
            source={{ x: 593, y: 88 }}
            className="kitchen-native-proof__patch"
            style={{ opacity: frame.platesPatchOpacity }}
          />

          {frame.toast.opacity > 0 && (
            <MasterClip
              rect={toastRect}
              className="kitchen-native-proof__moving kitchen-native-proof__toast"
              style={{
                left: `${frame.toast.x / 10}%`,
                top: `${frame.toast.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${frame.toast.rotation}deg)`,
                transformOrigin: '50% 50%',
                opacity: frame.toast.opacity,
              }}
            />
          )}

          {(frame.door.patchOpacity > 0) && (
            <MasterClip
              rect={doorRect}
              className="kitchen-native-proof__moving kitchen-native-proof__door"
              style={{
                left: `${frame.door.x / 10}%`,
                top: `${frame.door.y / 6}%`,
                transform: `rotate(${frame.door.rotation}deg)`,
                transformOrigin: '94% 8%',
                filter: `drop-shadow(${-7 * frame.door.load}px ${10 * frame.door.load}px ${8 + 8 * frame.door.load}px rgba(0,0,0,.34))`,
              }}
            />
          )}

          {frame.plates.map((plate, index) => plate.opacity > 0 && (
            <MasterClip
              key={index}
              rect={plateRect}
              className="kitchen-native-proof__moving kitchen-native-proof__plate"
              style={{
                left: `${plate.x / 10}%`,
                top: `${plate.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${plate.rotation}deg)`,
                opacity: plate.opacity,
                zIndex: 22 + index,
              }}
            />
          ))}

          <div
            className="kitchen-native-proof__contact"
            style={{ opacity: frame.contactOpacity, left: '64.6%', top: '21.3%' }}
            aria-hidden="true"
          />

          {frame.damageIds.includes('lower-hinge-failed') && (
            <div className="kitchen-native-proof__hinge-damage" aria-hidden="true">
              <i />
              <i />
            </div>
          )}
        </div>
      </section>

      <section className="kitchen-native-proof__controls" aria-label="Kitchen proof controls">
        <div className="kitchen-native-proof__transport">
          <button type="button" onClick={() => setPlaying(current => !current)}>{playing ? 'Pause' : time >= KITCHEN_NATIVE_DURATION ? 'Replay' : 'Play proof'}</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
        <div className="kitchen-native-proof__marks">
          {marks.map(([label, value]) => (
            <button
              type="button"
              key={label}
              onClick={() => {
                setPlaying(false);
                setTime(value);
              }}
            >
              <span>{label}</span>
              <small>{value} ms</small>
            </button>
          ))}
        </div>
        <p>
          Review gate: the approved master must remain visually unchanged at rest; toast must visibly cause the door reaction;
          the door must reach the lower plate stack before any plate moves; final displacement persists until Reset.
        </p>
      </section>
    </main>
  );
}
