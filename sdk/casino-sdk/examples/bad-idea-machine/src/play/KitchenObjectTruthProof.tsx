import { useMemo, useState, type CSSProperties } from 'react';

import {
  KITCHEN_PAN_TRUTH,
  KITCHEN_TOAST_TRUTH,
  kitchenPanTruthLayers,
  kitchenToastTruthLayers,
  type KitchenTruthAtlasFrame,
} from '../scene/kitchen-object-truth-proof';

type TruthObject = 'pan' | 'toast';

const button: CSSProperties = {
  minHeight: 40,
  padding: '8px 12px',
  border: '1px solid #42565c',
  background: '#101b1f',
  color: '#edf0e9',
  font: '700 11px Poppins, sans-serif',
  cursor: 'pointer',
};

function LayeredPan({
  bodyVisible,
  shadowVisible,
  zoom = 1,
}: Readonly<{
  bodyVisible: boolean;
  shadowVisible: boolean;
  zoom?: number;
}>) {
  const layers = useMemo(
    () => kitchenPanTruthLayers(bodyVisible, shadowVisible),
    [bodyVisible, shadowVisible],
  );

  const urlFor = (layer: (typeof layers)[number]) => {
    if (layer === 'support') return KITCHEN_PAN_TRUTH.supportUrl;
    if (layer === 'shadow') return KITCHEN_PAN_TRUTH.shadowUrl;
    return KITCHEN_PAN_TRUTH.bodyUrl;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: KITCHEN_PAN_TRUTH.width * zoom,
        height: KITCHEN_PAN_TRUTH.height * zoom,
        overflow: 'hidden',
        background: '#020405',
      }}
    >
      {layers.map(layer => (
        <img
          key={layer}
          src={urlFor(layer)}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

function AtlasSprite({
  frame,
  width,
  height,
  left = 0,
  top = 0,
  zoom = 1,
}: Readonly<{
  frame: KitchenTruthAtlasFrame;
  width: number;
  height: number;
  left?: number;
  top?: number;
  zoom?: number;
}>) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: left * zoom,
        top: top * zoom,
        width: frame.width * zoom,
        height: frame.height * zoom,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <img
        src={KITCHEN_TOAST_TRUTH.atlasUrl}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: -frame.x * zoom,
          top: -frame.y * zoom,
          width: KITCHEN_TOAST_TRUTH.atlasWidth * zoom,
          height: KITCHEN_TOAST_TRUTH.atlasHeight * zoom,
          maxWidth: 'none',
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}

function LayeredToast({
  bodyVisible,
  shadowVisible,
  zoom = 1,
}: Readonly<{
  bodyVisible: boolean;
  shadowVisible: boolean;
  zoom?: number;
}>) {
  const layers = useMemo(
    () => kitchenToastTruthLayers(bodyVisible, shadowVisible),
    [bodyVisible, shadowVisible],
  );

  return (
    <div
      style={{
        position: 'relative',
        width: KITCHEN_TOAST_TRUTH.cropWidth * zoom,
        height: KITCHEN_TOAST_TRUTH.cropHeight * zoom,
        overflow: 'hidden',
        background: '#020405',
      }}
    >
      <AtlasSprite
        frame={KITCHEN_TOAST_TRUTH.frames.support}
        width={KITCHEN_TOAST_TRUTH.cropWidth}
        height={KITCHEN_TOAST_TRUTH.cropHeight}
        zoom={zoom}
      />
      {layers.includes('shadow') ? (
        <AtlasSprite
          frame={KITCHEN_TOAST_TRUTH.frames.shadow}
          width={KITCHEN_TOAST_TRUTH.frames.shadow.width}
          height={KITCHEN_TOAST_TRUTH.frames.shadow.height}
          left={KITCHEN_TOAST_TRUTH.restPlacement.shadow.x}
          top={KITCHEN_TOAST_TRUTH.restPlacement.shadow.y}
          zoom={zoom}
        />
      ) : null}
      {layers.includes('body') ? (
        <AtlasSprite
          frame={KITCHEN_TOAST_TRUTH.frames.body}
          width={KITCHEN_TOAST_TRUTH.frames.body.width}
          height={KITCHEN_TOAST_TRUTH.frames.body.height}
          left={KITCHEN_TOAST_TRUTH.restPlacement.body.x}
          top={KITCHEN_TOAST_TRUTH.restPlacement.body.y}
          zoom={zoom}
        />
      ) : null}
    </div>
  );
}

function ToastReference({ zoom = 1 }: Readonly<{ zoom?: number }>) {
  return (
    <div style={{
      position: 'relative',
      width: KITCHEN_TOAST_TRUTH.cropWidth * zoom,
      height: KITCHEN_TOAST_TRUTH.cropHeight * zoom,
      overflow: 'hidden',
    }}>
      <AtlasSprite
        frame={KITCHEN_TOAST_TRUTH.frames.reference}
        width={KITCHEN_TOAST_TRUTH.cropWidth}
        height={KITCHEN_TOAST_TRUTH.cropHeight}
        zoom={zoom}
      />
    </div>
  );
}

function AirborneToastFace({ zoom = 5 }: Readonly<{ zoom?: number }>) {
  const frame = KITCHEN_TOAST_TRUTH.frames.face;
  return (
    <div style={{
      position: 'relative',
      width: frame.width * zoom,
      height: frame.height * zoom,
      overflow: 'hidden',
      background: '#1b1d1d',
      border: '1px solid #314348',
    }}>
      <AtlasSprite frame={frame} width={frame.width} height={frame.height} zoom={zoom} />
    </div>
  );
}

export function KitchenObjectTruthProof() {
  const [object, setObject] = useState<TruthObject>('pan');
  const [bodyVisible, setBodyVisible] = useState(true);
  const [shadowVisible, setShadowVisible] = useState(true);
  const [blinkReference, setBlinkReference] = useState(false);

  const state = bodyVisible && shadowVisible
    ? 'body + shadow'
    : bodyVisible
      ? 'body only'
      : shadowVisible
        ? 'shadow only'
        : 'support only';

  const card: CSSProperties = {
    border: '1px solid #32464b',
    background: '#071014',
    boxShadow: '0 16px 48px rgba(0,0,0,.34)',
  };

  const resetLayers = (next: TruthObject) => {
    setObject(next);
    setBodyVisible(true);
    setShadowVisible(true);
    setBlinkReference(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(12px,2vw,26px)',
      background: 'radial-gradient(circle at 50% -10%, #203036, #071014 48%, #04080a)',
      color: '#edf0e9',
      fontFamily: 'Rubik, sans-serif',
    }}>
      <header style={{ width: 'min(1320px,100%)', margin: '0 auto 14px' }}>
        <small style={{ color: '#f4cb58', font: '800 11px Poppins,sans-serif', letterSpacing: '.13em' }}>
          CHECKPOINT 2C · SINGLE-OBJECT TRUTH GATES
        </small>
        <h1 style={{ margin: '7px 0 5px', font: '800 clamp(24px,3vw,39px)/1.04 Poppins,sans-serif' }}>
          One object at a time · repository-local only
        </h1>
        <p style={{ maxWidth: 980, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          Pan and hero toast are now isolated from the rejected multi-object mask proof. Every active asset on this page is repository-local and produced from the approved Kitchen pixels or deterministic local reconstruction. No Creative Claw asset or remote image is used.
        </p>
      </header>

      <section style={{ width: 'min(1320px,100%)', margin: '0 auto 10px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        <button
          type="button"
          style={{ ...button, borderColor: object === 'pan' ? '#f4cb58' : '#42565c' }}
          onClick={() => resetLayers('pan')}
        >
          Pan
        </button>
        <button
          type="button"
          style={{ ...button, borderColor: object === 'toast' ? '#f4cb58' : '#42565c' }}
          onClick={() => resetLayers('toast')}
        >
          Hero toast
        </button>
      </section>

      <section style={{ width: 'min(1320px,100%)', margin: '0 auto 12px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        <button
          type="button"
          style={{ ...button, borderColor: bodyVisible ? '#7ce2a5' : '#8b4c48' }}
          onClick={() => setBodyVisible(v => !v)}
        >
          {bodyVisible ? 'Hide' : 'Show'} body
        </button>
        <button
          type="button"
          style={{ ...button, borderColor: shadowVisible ? '#6bc8e6' : '#8b4c48' }}
          onClick={() => setShadowVisible(v => !v)}
        >
          {shadowVisible ? 'Hide' : 'Show'} shadow
        </button>
        <button
          type="button"
          style={{ ...button, borderColor: blinkReference ? '#f4cb58' : '#42565c' }}
          onClick={() => setBlinkReference(v => !v)}
        >
          {blinkReference ? 'Show reconstruction' : 'Show reference'}
        </button>
        <span style={{ alignSelf: 'center', color: '#a9b5b6', fontSize: 12 }}>
          Current: {object} · {state}
        </span>
      </section>

      <section style={{
        width: 'min(1320px,100%)',
        margin: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(520px,100%),1fr))',
        gap: 12,
      }}>
        <figure style={{ ...card, margin: 0, padding: 12 }}>
          <figcaption style={{ marginBottom: 10, color: '#7ce2a5', fontWeight: 700 }}>
            {blinkReference ? 'Approved reference crop' : `Reconstruction · ${state}`}
          </figcaption>

          <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
            {object === 'pan' ? (
              blinkReference ? (
                <img
                  src={KITCHEN_PAN_TRUTH.referenceUrl}
                  alt="Approved pan reference crop"
                  draggable={false}
                  style={{
                    width: KITCHEN_PAN_TRUTH.width * 2,
                    height: KITCHEN_PAN_TRUTH.height * 2,
                    objectFit: 'fill',
                  }}
                />
              ) : (
                <LayeredPan bodyVisible={bodyVisible} shadowVisible={shadowVisible} zoom={2} />
              )
            ) : blinkReference ? (
              <ToastReference zoom={2} />
            ) : (
              <LayeredToast bodyVisible={bodyVisible} shadowVisible={shadowVisible} zoom={2} />
            )}
          </div>
        </figure>

        <figure style={{ ...card, margin: 0, padding: 12 }}>
          <figcaption style={{ marginBottom: 10, color: '#6bc8e6', fontWeight: 700 }}>
            {object === 'toast' ? 'Airborne completeness diagnostic' : '1:1 diagnostic'}
          </figcaption>

          {object === 'pan' ? (
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <LayeredPan bodyVisible={bodyVisible} shadowVisible={shadowVisible} />
              <img
                src={KITCHEN_PAN_TRUTH.referenceUrl}
                alt="Approved pan reference at one-to-one scale"
                draggable={false}
                style={{
                  width: KITCHEN_PAN_TRUTH.width,
                  height: KITCHEN_PAN_TRUTH.height,
                  objectFit: 'fill',
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
              <AirborneToastFace />
              <p style={{ maxWidth: 420, margin: 0, color: '#9fabad', lineHeight: 1.45, textAlign: 'center' }}>
                The rest sprite above remains the exact visible photographed toast. This full face exists only so later rotation can reveal previously occluded bread instead of stretching the rest sprite or changing to a generated object.
              </p>
            </div>
          )}
        </figure>
      </section>

      <section style={{
        width: 'min(1320px,100%)',
        margin: '12px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
        gap: 8,
      }}>
        <div style={{ ...card, padding: 12 }}>
          <strong>Support-only pass rule</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            With body and shadow hidden, the real support must remain believable. For toast, the toaster and remaining slices stay in place while only the hero slice disappears.
          </p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Shadow-only pass rule</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            The shadow must be subtle and local. It cannot contain architecture pixels or read as a dark object-shaped patch.
          </p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Motion-readiness rule</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            A moving object is not accepted merely because its rest crop reconstructs correctly. It also needs complete hidden geometry before motion resumes. The toast face on this page is the first enforcement of that rule.
          </p>
        </div>
      </section>
    </main>
  );
}
