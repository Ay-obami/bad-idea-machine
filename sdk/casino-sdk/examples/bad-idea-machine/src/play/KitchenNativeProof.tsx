import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

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
}>;

function MasterClip({ rect, source, className = '', style, clipPath }: ClipProps) {
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
    </div>
  );
}

const doorRect = { x: 684, y: 0, width: 74, height: 150 } as const;
const toastRect = { x: 638, y: 237, width: 39, height: 24 } as const;

const doorMask = 'polygon(18% 0, 100% 0, 100% 100%, 2% 91%)';
const toastMask = 'polygon(8% 42%, 15% 16%, 34% 3%, 73% 5%, 92% 28%, 95% 76%, 80% 94%, 17% 94%, 3% 72%)';

const marks = [
  ['Intact', 0],
  ['Toast ejects', 540],
  ['Toast hits door', 830],
  ['Door sags', 1240],
  ['Door hits stack', 1505],
  ['First plate breaks', 2110],
  ['Second plate settles', 2760],
  ['Aftermath', 3350],
] as const;

function HeroPlate({ x, y, rotation, opacity = 1, broken = false }: Readonly<{
  x: number;
  y: number;
  rotation: number;
  opacity?: number;
  broken?: boolean;
}>) {
  return (
    <div
      className={`kitchen-native-proof__hero-plate${broken ? ' kitchen-native-proof__hero-plate--breaking' : ''}`}
      style={{
        left: `${x / 10}%`,
        top: `${y / 6}%`,
        opacity,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      aria-hidden="true"
    >
      <i />
    </div>
  );
}

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
  }, [playing, time]);

  const frame = useMemo(() => kitchenNativeFrameAt(time), [time]);

  const reset = () => {
    setPlaying(false);
    setTime(0);
  };

  return (
    <main className="kitchen-native-proof">
      <header className="kitchen-native-proof__header">
        <div>
          <small>CHECKPOINT 2 · CONTACT + BREAKAGE GATE</small>
          <h1>Approved Kitchen · One Physical Chain</h1>
          <p>Toast must land, the door must stay hinged, hero plates must come from the visible stack, and ceramic damage must persist on the counter.</p>
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
            source={{ x: 622, y: 238 }}
            className="kitchen-native-proof__toast-slot-patch"
            clipPath={toastMask}
            style={{ opacity: frame.toast.slotPatchOpacity }}
          />

          <div
            className="kitchen-native-proof__door-gap"
            style={{ opacity: frame.door.gapOpacity }}
            aria-hidden="true"
          />

          {frame.toast.visible && (
            <MasterClip
              rect={toastRect}
              className="kitchen-native-proof__moving kitchen-native-proof__toast"
              clipPath={toastMask}
              style={{
                left: `${frame.toast.x / 10}%`,
                top: `${frame.toast.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${frame.toast.rotation}deg)`,
              }}
            />
          )}

          {(frame.door.recoil > 0 || frame.door.sag > 0) && (
            <MasterClip
              rect={doorRect}
              className="kitchen-native-proof__moving kitchen-native-proof__door"
              clipPath={doorMask}
              style={{
                transform: `rotate(${frame.door.rotation}deg)`,
                transformOrigin: '81% 6%',
              }}
            />
          )}

          {frame.door.sag > 0 && (
            <div className="kitchen-native-proof__upper-hinge" aria-hidden="true">
              <span />
            </div>
          )}

          {frame.door.sag > 0 && (
            <div
              className="kitchen-native-proof__loose-screw"
              style={{
                opacity: Math.min(1, frame.door.sag * 1.8),
                transform: `translateY(${Math.round(frame.door.sag * 18)}px) rotate(${Math.round(frame.door.sag * 80)}deg)`,
              }}
              aria-hidden="true"
            />
          )}

          {frame.plate1.visible && (
            <HeroPlate
              x={frame.plate1.x}
              y={frame.plate1.y}
              rotation={frame.plate1.rotation}
              opacity={frame.plate1.opacity}
              broken={frame.plate1.broken}
            />
          )}

          {frame.plate2.visible && (
            <HeroPlate x={frame.plate2.x} y={frame.plate2.y} rotation={frame.plate2.rotation} />
          )}

          {frame.shards.map((shard, index) => shard.opacity > 0 && (
            <div
              key={index}
              className={`kitchen-native-proof__shard kitchen-native-proof__shard--${index + 1}`}
              style={{
                left: `${shard.x / 10}%`,
                top: `${shard.y / 6}%`,
                opacity: shard.opacity,
                transform: `translate(-50%, -50%) rotate(${shard.rotation}deg) scale(${shard.scale})`,
              }}
              aria-hidden="true"
            />
          ))}

          <div
            className="kitchen-native-proof__contact"
            style={{ opacity: frame.contactOpacity, left: '65.1%', top: '21%' }}
            aria-hidden="true"
          />

          <div
            className="kitchen-native-proof__break-flash"
            style={{ opacity: frame.breakFlashOpacity, left: '60.4%', top: '51%' }}
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="kitchen-native-proof__controls" aria-label="Kitchen proof controls">
        <div className="kitchen-native-proof__transport">
          <button
            type="button"
            onClick={() => {
              if (time >= KITCHEN_NATIVE_DURATION) setTime(0);
              setPlaying(current => !current);
            }}
          >
            {playing ? 'Pause' : time >= KITCHEN_NATIVE_DURATION ? 'Replay' : 'Play proof'}
          </button>
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
          Pass only if: toast visibly ejects and lands; the cabinet remains attached to its upper hinge; the first hero plate leaves the existing stack only after door contact;
          it breaks on the counter; the second plate settles there; shards and cabinet damage remain until Reset.
        </p>
      </section>
    </main>
  );
}
