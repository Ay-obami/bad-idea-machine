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

const doorRect = { x: 684, y: 0, width: 75, height: 159 } as const;
const toastRect = { x: 638, y: 236, width: 39, height: 25 } as const;
const plateRimRect = { x: 589, y: 139, width: 69, height: 14 } as const;

const doorMask = 'polygon(18% 0, 100% 0, 100% 100%, 2% 91%)';
const toastMask = 'polygon(8% 42%,15% 16%,34% 3%,73% 5%,92% 28%,95% 76%,80% 94%,17% 94%,3% 72%)';
const rimMask = 'ellipse(49% 44% at 50% 50%)';

const marks = [
  ['Intact', 0],
  ['Toast ejects', 520],
  ['Toast hits door', 750],
  ['Door swings', 920],
  ['Plate leaves stack', 1210],
  ['Plate hits counter', 1850],
  ['Ceramic fractures', 1940],
  ['Aftermath', 2650],
] as const;

function PlateFace({ frame }: Readonly<{ frame: ReturnType<typeof kitchenNativeFrameAt>['plate'] }>) {
  if (!frame.visible) return null;

  return (
    <div
      className="kitchen-native-proof__plate-body"
      style={{
        left: `${frame.x / 10}%`,
        top: `${frame.y / 6}%`,
        opacity: frame.bodyOpacity,
        transform: `translate(-50%, -50%) rotate(${frame.roll}deg) scaleY(${frame.scaleY})`,
      }}
      aria-hidden="true"
    >
      <i className="kitchen-native-proof__plate-well" />
      <i className="kitchen-native-proof__plate-crack kitchen-native-proof__plate-crack--a" style={{ opacity: frame.crackOpacity }} />
      <i className="kitchen-native-proof__plate-crack kitchen-native-proof__plate-crack--b" style={{ opacity: frame.crackOpacity }} />
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
          <small>CHECKPOINT 2 · CONTINUITY + MATERIAL GATE</small>
          <h1>Approved Kitchen · One Continuous Physical Chain</h1>
          <p>No copied object may appear while its original remains visible. One plate leaves the visible stack, tips under gravity, fractures on the counter, and remains as ceramic debris.</p>
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
            source={{ x: 612, y: 237 }}
            className="kitchen-native-proof__source-patch kitchen-native-proof__toast-source-patch"
            clipPath={toastMask}
            style={{ opacity: frame.toast.sourcePatchOpacity }}
          />

          <MasterClip
            rect={doorRect}
            source={{ x: 760, y: 0 }}
            className="kitchen-native-proof__source-patch kitchen-native-proof__door-source-patch"
            clipPath={doorMask}
            style={{ opacity: frame.door.patchOpacity }}
          />

          <MasterClip
            rect={plateRimRect}
            source={{ x: 589, y: 149 }}
            className="kitchen-native-proof__source-patch kitchen-native-proof__plate-origin-patch"
            clipPath={rimMask}
            style={{ opacity: frame.plate.originPatchOpacity }}
          />

          {frame.toast.visible && (
            <MasterClip
              rect={toastRect}
              className="kitchen-native-proof__moving kitchen-native-proof__toast"
              clipPath={toastMask}
              style={{
                left: `${frame.toast.x / 10}%`,
                top: `${frame.toast.y / 6}%`,
                transform: `translate(-50%, -50%) rotate(${frame.toast.rotation}deg) scaleY(${frame.toast.scaleY})`,
                transformOrigin: '50% 50%',
              }}
            />
          )}

          {frame.door.patchOpacity > 0 && (
            <MasterClip
              rect={doorRect}
              className="kitchen-native-proof__moving kitchen-native-proof__door"
              clipPath={doorMask}
              style={{
                transform: `perspective(700px) rotateY(${frame.door.yaw}deg)`,
                transformOrigin: '18% 50%',
              }}
            />
          )}

          {frame.plate.visible && frame.plate.rimOpacity > 0 && (
            <MasterClip
              rect={plateRimRect}
              className="kitchen-native-proof__moving kitchen-native-proof__plate-rim"
              clipPath={rimMask}
              style={{
                left: `${frame.plate.x / 10}%`,
                top: `${frame.plate.y / 6}%`,
                opacity: frame.plate.rimOpacity,
                transform: `translate(-50%, -50%) rotate(${frame.plate.roll}deg)`,
              }}
            />
          )}

          <PlateFace frame={frame.plate} />

          {frame.fragments.map((fragment, index) => fragment.opacity > 0 && (
            <div
              key={index}
              className={`kitchen-native-proof__fragment kitchen-native-proof__fragment--${index + 1}`}
              style={{
                left: `${fragment.x / 10}%`,
                top: `${fragment.y / 6}%`,
                opacity: fragment.opacity,
                transform: `translate(-50%, -50%) rotate(${fragment.rotation}deg) scale(${fragment.scale})`,
              }}
              aria-hidden="true"
            />
          ))}

          <div
            className="kitchen-native-proof__contact"
            style={{ opacity: frame.doorPlateContactOpacity, left: '65.1%', top: '23.7%' }}
            aria-hidden="true"
          />

          <div
            className="kitchen-native-proof__impact"
            style={{ opacity: frame.plateImpactOpacity, left: '60.4%', top: '51.1%' }}
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
          Pass only if the plate visibly departs the existing stack with no duplicate left behind, the cabinet reads as a hinged yaw rather than a rotating slab,
          toast settles flat after one bounce, ceramic fractures originate at counter impact, and the final debris remains on the counter until Reset.
        </p>
      </section>
    </main>
  );
}
