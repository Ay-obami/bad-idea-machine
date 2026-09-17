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
  clipPath?: string;
  children?: ReactNode;
}>;

function MasterClip({ rect, source, className = '', style, clipPath, children }: ClipProps) {
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
        clipPath,
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

const doorRect = { x: 676, y: 0, width: 78, height: 160 } as const;
const toastRect = { x: 620, y: 239, width: 55, height: 25 } as const;
const plateRect = { x: 592, y: 136, width: 66, height: 11 } as const;
const plateStackRect = { x: 590, y: 134, width: 70, height: 32 } as const;

const doorMask = 'polygon(22% 0, 100% 0, 100% 100%, 0 89%)';
const toastMask = 'polygon(10% 38%, 18% 12%, 39% 3%, 72% 5%, 91% 25%, 96% 75%, 82% 94%, 17% 94%, 3% 72%)';
const plateMask = 'ellipse(50% 46% at 50% 50%)';

const marks = [
  ['Intact', 0],
  ['Toast launches', 760],
  ['Toast hits door', 1140],
  ['Hinge reacts', 1260],
  ['Door contacts plates', 2155],
  ['Plate cascade', 2600],
  ['Aftermath', 3850],
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
          <small>CHECKPOINT 2 · SILHOUETTE MOTION GATE</small>
          <h1>Approved Kitchen · Native Pixel Chain</h1>
          <p>Same approved master. Moving actors now use object silhouettes rather than rectangular image windows.</p>
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
            source={{ x: 620, y: 264 }}
            className="kitchen-native-proof__patch"
            clipPath={toastMask}
            style={{ opacity: frame.toast.patchOpacity }}
          />

          <div
            className="kitchen-native-proof__door-reveal"
            style={{
              left: `${doorRect.x / 10}%`,
              top: `${doorRect.y / 6}%`,
              width: `${doorRect.width / 10}%`,
              height: `${doorRect.height / 6}%`,
              clipPath: doorMask,
              opacity: frame.door.patchOpacity,
            }}
          />

          <div
            className="kitchen-native-proof__plate-reveal"
            style={{
              left: `${plateStackRect.x / 10}%`,
              top: `${plateStackRect.y / 6}%`,
              width: `${plateStackRect.width / 10}%`,
              height: `${plateStackRect.height / 6}%`,
              opacity: frame.platesPatchOpacity,
            }}
          />

          {frame.toast.opacity > 0 && (
            <MasterClip
              rect={toastRect}
              className="kitchen-native-proof__moving kitchen-native-proof__toast"
              clipPath={toastMask}
              style={{
                left: `${frame.toast.x / 10}%`,
                top: `${frame.toast.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${frame.toast.rotation}deg)`,
                transformOrigin: '50% 50%',
                opacity: frame.toast.opacity,
              }}
            />
          )}

          {frame.door.patchOpacity > 0 && (
            <MasterClip
              rect={doorRect}
              className="kitchen-native-proof__moving kitchen-native-proof__door"
              clipPath={doorMask}
              style={{
                left: `${frame.door.x / 10}%`,
                top: `${frame.door.y / 6}%`,
                transform: `rotate(${frame.door.rotation}deg)`,
                transformOrigin: '94% 6%',
                filter: `drop-shadow(${-3 * frame.door.load}px ${6 * frame.door.load}px ${6 + 5 * frame.door.load}px rgba(0,0,0,.30))`,
              }}
            />
          )}

          {frame.plates.map((plate, index) => plate.opacity > 0 && (
            <MasterClip
              key={index}
              rect={plateRect}
              className="kitchen-native-proof__moving kitchen-native-proof__plate"
              clipPath={plateMask}
              style={{
                left: `${plate.x / 10}%`,
                top: `${plate.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${plate.rotation}deg) scale(${plate.scale})`,
                opacity: plate.opacity,
                zIndex: 22 + index,
              }}
            />
          ))}

          <div
            className="kitchen-native-proof__contact"
            style={{ opacity: frame.contactOpacity, left: '66.2%', top: '25.8%' }}
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
          <button type="button" onClick={() => {
            if (time >= KITCHEN_NATIVE_DURATION) setTime(0);
            setPlaying(current => !current);
          }}>{playing ? 'Pause' : time >= KITCHEN_NATIVE_DURATION ? 'Replay' : 'Play proof'}</button>
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
          Gate: no rectangular background must travel with any actor; toast must be plainly visible; the door must remain attached and only sag;
          ceramic forms must stay broad and shallow; no plate starts before door contact; displacement persists until Reset.
        </p>
      </section>
    </main>
  );
}
