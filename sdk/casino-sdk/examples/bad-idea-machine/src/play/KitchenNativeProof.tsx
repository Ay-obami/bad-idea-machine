import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import {
  KITCHEN_NATIVE_DURATION,
  kitchenNativeFrameAt,
} from '../scene/kitchen-native-proof';
import {
  KITCHEN_NATIVE_MASTER,
  TOAST_SOURCE_PATCH,
  TOAST_SPRITE,
} from '../scene/kitchen-native-assets';
import '../styles/kitchen-native-proof.css';

type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;

function MasterClip({
  rect,
  className = '',
  style,
  clipPath,
}: Readonly<{
  rect: Rect;
  className?: string;
  style?: CSSProperties;
  clipPath?: string;
}>) {
  return (
    <div
      className={`kitchen-native-proof__master-clip ${className}`}
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
          left: `${(-rect.x / rect.width) * 100}%`,
          top: `${(-rect.y / rect.height) * 100}%`,
        }}
      />
    </div>
  );
}

const marks = [
  ['Intact', 0],
  ['Toast leaves slot', 520],
  ['Handle contact', 1000],
  ['Deflects to pan', 1200],
  ['Pan contact', 1480],
  ['Bounce / splash', 1650],
  ['Settled', 2050],
] as const;

const panLipRect = { x: 364, y: 289, width: 105, height: 34 } as const;

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
          <small>CHECKPOINT 2 · LAYERED SCENE PROOF</small>
          <h1>Approved Kitchen · Native Toast → Pan Chain</h1>
          <p>One photographic toast slice leaves the toaster, clips the real pan handle, enters the real pan and settles behind its photographic front lip.</p>
        </div>
        <div className="kitchen-native-proof__status">
          <span>{Math.round(time)} ms</span>
          <span>{frame.damageIds.length ? frame.damageIds.join(' · ') : 'room intact'}</span>
        </div>
      </header>

      <section className="kitchen-native-proof__stage-shell">
        <div className="kitchen-native-proof__canvas">
          <img className="kitchen-native-proof__master" src={KITCHEN_NATIVE_MASTER} alt="Approved intact Kitchen master" draggable={false} />

          <img
            className="kitchen-native-proof__toast-patch"
            src={TOAST_SOURCE_PATCH}
            alt=""
            draggable={false}
            style={{ opacity: frame.toastSourcePatchOpacity }}
          />

          {frame.toast.visible && (
            <>
              <div
                className="kitchen-native-proof__toast-shadow"
                style={{
                  left: `${frame.toast.x / 10}%`,
                  top: `${Math.max(257, frame.toast.y + 13) / 6}%`,
                  opacity: frame.toast.shadowOpacity,
                  transform: `translate(-50%, -50%) scale(${frame.toast.shadowScale})`,
                }}
                aria-hidden="true"
              />
              <img
                className="kitchen-native-proof__toast"
                src={TOAST_SPRITE}
                alt=""
                draggable={false}
                style={{
                  left: `${frame.toast.x / 10}%`,
                  top: `${frame.toast.y / 6}%`,
                  transform: `translate(-50%, -50%) rotate(${frame.toast.rotation}deg) scaleX(${frame.toast.scaleX}) scaleY(${frame.toast.scaleY})`,
                }}
              />
            </>
          )}

          <div
            className="kitchen-native-proof__contact kitchen-native-proof__contact--handle"
            style={{ left: '51.7%', top: '47.5%', opacity: frame.handleContactOpacity }}
            aria-hidden="true"
          />

          {frame.greaseDroplets.map((drop, index) => drop.opacity > 0 && (
            <i
              key={index}
              className="kitchen-native-proof__grease-drop"
              style={{
                left: `${drop.x / 10}%`,
                top: `${drop.y / 6}%`,
                opacity: drop.opacity,
                transform: `translate(-50%, -50%) scale(${drop.scale})`,
              }}
              aria-hidden="true"
            />
          ))}

          <div
            className="kitchen-native-proof__contact kitchen-native-proof__contact--pan"
            style={{ left: '42%', top: '48%', opacity: frame.panContactOpacity }}
            aria-hidden="true"
          />

          {frame.panLipOpacity > 0 && (
            <MasterClip
              rect={panLipRect}
              className="kitchen-native-proof__pan-lip"
              clipPath="polygon(0 18%, 68% 18%, 72% 41%, 67% 79%, 58% 100%, 12% 100%, 4% 78%)"
              style={{ opacity: frame.panLipOpacity }}
            />
          )}
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
          Pass only if the original toast visibly disappears from the toaster as the same photographic slice moves, the handle deflection is readable,
          the toast enters rather than floats over the pan, the pan lip occludes it naturally, the oil splash stays tiny, and the toast remains settled in the bowl until Reset.
        </p>
      </section>
    </main>
  );
}
