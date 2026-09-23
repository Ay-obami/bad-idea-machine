import { useMemo, useState, type CSSProperties } from 'react';

import {
  KITCHEN_PAN_TRUTH,
  KITCHEN_TOAST_TRUTH,
  KITCHEN_TOWEL_TRUTH,
  KITCHEN_PLATE_TRUTH,
  kitchenPanTruthLayers,
  kitchenToastTruthLayers,
  kitchenTowelTruthLayers,
  kitchenPlateTruthLayers,
  type KitchenTruthAtlasFrame,
} from '../scene/kitchen-object-truth-proof';

type TruthObject = 'pan' | 'toast' | 'towel' | 'plates';

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
  atlasUrl,
  atlasWidth,
  atlasHeight,
  frame,
  left = 0,
  top = 0,
  zoom = 1,
}: Readonly<{
  atlasUrl: string;
  atlasWidth: number;
  atlasHeight: number;
  frame: KitchenTruthAtlasFrame;
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
        src={atlasUrl}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: -frame.x * zoom,
          top: -frame.y * zoom,
          width: atlasWidth * zoom,
          height: atlasHeight * zoom,
          maxWidth: 'none',
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}

function ToastSprite({
  frame,
  left = 0,
  top = 0,
  zoom = 1,
}: Readonly<{
  frame: KitchenTruthAtlasFrame;
  left?: number;
  top?: number;
  zoom?: number;
}>) {
  return (
    <AtlasSprite
      atlasUrl={KITCHEN_TOAST_TRUTH.atlasUrl}
      atlasWidth={KITCHEN_TOAST_TRUTH.atlasWidth}
      atlasHeight={KITCHEN_TOAST_TRUTH.atlasHeight}
      frame={frame}
      left={left}
      top={top}
      zoom={zoom}
    />
  );
}

function TowelSprite({
  frame,
  left = 0,
  top = 0,
  zoom = 1,
}: Readonly<{
  frame: KitchenTruthAtlasFrame;
  left?: number;
  top?: number;
  zoom?: number;
}>) {
  return (
    <AtlasSprite
      atlasUrl={KITCHEN_TOWEL_TRUTH.atlasUrl}
      atlasWidth={KITCHEN_TOWEL_TRUTH.atlasWidth}
      atlasHeight={KITCHEN_TOWEL_TRUTH.atlasHeight}
      frame={frame}
      left={left}
      top={top}
      zoom={zoom}
    />
  );
}

function PlateSprite({
  frame,
  left = 0,
  top = 0,
  zoom = 1,
}: Readonly<{
  frame: KitchenTruthAtlasFrame;
  left?: number;
  top?: number;
  zoom?: number;
}>) {
  return (
    <AtlasSprite
      atlasUrl={KITCHEN_PLATE_TRUTH.atlasUrl}
      atlasWidth={KITCHEN_PLATE_TRUTH.atlasWidth}
      atlasHeight={KITCHEN_PLATE_TRUTH.atlasHeight}
      frame={frame}
      left={left}
      top={top}
      zoom={zoom}
    />
  );
}

function LayeredPlates({
  stackBodyVisible,
  stackShadowVisible,
  heroBodyVisible,
  heroShadowVisible,
  zoom = 1,
}: Readonly<{
  stackBodyVisible: boolean;
  stackShadowVisible: boolean;
  heroBodyVisible: boolean;
  heroShadowVisible: boolean;
  zoom?: number;
}>) {
  const layers = kitchenPlateTruthLayers(
    stackBodyVisible, stackShadowVisible, heroBodyVisible, heroShadowVisible,
  );
  return (
    <div style={{
      position: 'relative',
      width: KITCHEN_PLATE_TRUTH.cropWidth * zoom,
      height: KITCHEN_PLATE_TRUTH.cropHeight * zoom,
      overflow: 'hidden',
    }}>
      {layers.map(id => (
        <PlateSprite
          key={id}
          frame={KITCHEN_PLATE_TRUTH.frames[id]}
          left={id === 'support' ? 0 : KITCHEN_PLATE_TRUTH.restPlacement[id].x}
          top={id === 'support' ? 0 : KITCHEN_PLATE_TRUTH.restPlacement[id].y}
          zoom={zoom}
        />
      ))}
    </div>
  );
}

function PlateReference({ zoom = 1 }: Readonly<{ zoom?: number }>) {
  return (
    <div style={{
      position: 'relative',
      width: KITCHEN_PLATE_TRUTH.cropWidth * zoom,
      height: KITCHEN_PLATE_TRUTH.cropHeight * zoom,
      overflow: 'hidden',
    }}>
      <PlateSprite frame={KITCHEN_PLATE_TRUTH.frames.reference} zoom={zoom} />
    </div>
  );
}

function LayeredToast({
  bodyVisible,
  shadowVisible,
  remainingVisible,
  zoom = 1,
}: Readonly<{
  bodyVisible: boolean;
  shadowVisible: boolean;
  remainingVisible: boolean;
  zoom?: number;
}>) {
  const layers = useMemo(
    () => kitchenToastTruthLayers(bodyVisible, shadowVisible, remainingVisible),
    [bodyVisible, shadowVisible, remainingVisible],
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
      <ToastSprite frame={KITCHEN_TOAST_TRUTH.frames.support} zoom={zoom} />
      {layers.includes('remainingBody') ? (
        <ToastSprite
          frame={KITCHEN_TOAST_TRUTH.frames.remainingBody}
          left={KITCHEN_TOAST_TRUTH.restPlacement.remainingBody.x}
          top={KITCHEN_TOAST_TRUTH.restPlacement.remainingBody.y}
          zoom={zoom}
        />
      ) : null}
      {layers.includes('shadow') ? (
        <ToastSprite
          frame={KITCHEN_TOAST_TRUTH.frames.shadow}
          left={KITCHEN_TOAST_TRUTH.restPlacement.shadow.x}
          top={KITCHEN_TOAST_TRUTH.restPlacement.shadow.y}
          zoom={zoom}
        />
      ) : null}
      {layers.includes('body') ? (
        <ToastSprite
          frame={KITCHEN_TOAST_TRUTH.frames.body}
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
      <ToastSprite frame={KITCHEN_TOAST_TRUTH.frames.reference} zoom={zoom} />
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
      <ToastSprite frame={frame} zoom={zoom} />
    </div>
  );
}

function LayeredTowel({
  bodyVisible,
  shadowVisible,
  zoom = 1,
}: Readonly<{
  bodyVisible: boolean;
  shadowVisible: boolean;
  zoom?: number;
}>) {
  const layers = useMemo(
    () => kitchenTowelTruthLayers(bodyVisible, shadowVisible),
    [bodyVisible, shadowVisible],
  );

  return (
    <div
      style={{
        position: 'relative',
        width: KITCHEN_TOWEL_TRUTH.cropWidth * zoom,
        height: KITCHEN_TOWEL_TRUTH.cropHeight * zoom,
        overflow: 'hidden',
        background: '#020405',
      }}
    >
      <TowelSprite frame={KITCHEN_TOWEL_TRUTH.frames.support} zoom={zoom} />
      {layers.includes('shadow') ? (
        <TowelSprite
          frame={KITCHEN_TOWEL_TRUTH.frames.shadow}
          left={KITCHEN_TOWEL_TRUTH.restPlacement.shadow.x}
          top={KITCHEN_TOWEL_TRUTH.restPlacement.shadow.y}
          zoom={zoom}
        />
      ) : null}
      {layers.includes('body') ? (
        <TowelSprite
          frame={KITCHEN_TOWEL_TRUTH.frames.body}
          left={KITCHEN_TOWEL_TRUTH.restPlacement.body.x}
          top={KITCHEN_TOWEL_TRUTH.restPlacement.body.y}
          zoom={zoom}
        />
      ) : null}
    </div>
  );
}

function TowelReference({ zoom = 1 }: Readonly<{ zoom?: number }>) {
  return (
    <div style={{
      position: 'relative',
      width: KITCHEN_TOWEL_TRUTH.cropWidth * zoom,
      height: KITCHEN_TOWEL_TRUTH.cropHeight * zoom,
      overflow: 'hidden',
    }}>
      <TowelSprite frame={KITCHEN_TOWEL_TRUTH.frames.reference} zoom={zoom} />
    </div>
  );
}

export function KitchenObjectTruthProof() {
  const [object, setObject] = useState<TruthObject>('pan');
  const [bodyVisible, setBodyVisible] = useState(true);
  const [shadowVisible, setShadowVisible] = useState(true);
  const [remainingToastVisible, setRemainingToastVisible] = useState(true);
  const [blinkReference, setBlinkReference] = useState(false);
  const [stackBodyVisible, setStackBodyVisible] = useState(true);
  const [stackShadowVisible, setStackShadowVisible] = useState(true);
  const [heroBodyVisible, setHeroBodyVisible] = useState(true);
  const [heroShadowVisible, setHeroShadowVisible] = useState(true);

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
    setRemainingToastVisible(true);
    setBlinkReference(false);
    setStackBodyVisible(true);
    setStackShadowVisible(true);
    setHeroBodyVisible(true);
    setHeroShadowVisible(true);
  };

  const primary = () => {
    if (object === 'pan') {
      return blinkReference ? (
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
      );
    }

    if (object === 'toast') {
      return blinkReference ? (
        <ToastReference zoom={2} />
      ) : (
        <LayeredToast bodyVisible={bodyVisible} shadowVisible={shadowVisible} remainingVisible={remainingToastVisible} zoom={2} />
      );
    }

    if (object === 'plates') {
      return blinkReference ? <PlateReference zoom={2} /> : (
        <LayeredPlates
          stackBodyVisible={stackBodyVisible}
          stackShadowVisible={stackShadowVisible}
          heroBodyVisible={heroBodyVisible}
          heroShadowVisible={heroShadowVisible}
          zoom={2}
        />
      );
    }

    return blinkReference ? (
      <TowelReference zoom={2} />
    ) : (
      <LayeredTowel bodyVisible={bodyVisible} shadowVisible={shadowVisible} zoom={2} />
    );
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
          Pan, hero toast, oven towel and independent cabinet plates have local truth gates. Every active asset on this page comes from approved Kitchen pixels or deterministic local reconstruction.
        </p>
      </header>

      <section style={{ width: 'min(1320px,100%)', margin: '0 auto 10px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {([
          ['pan', 'Pan'],
          ['toast', 'Hero toast'],
          ['towel', 'Oven towel'],
          ['plates', 'Hero plate + remaining stack'],
        ] as const).map(([id, label]) => (
          <button
            type="button"
            key={id}
            style={{ ...button, borderColor: object === id ? '#f4cb58' : '#42565c' }}
            onClick={() => resetLayers(id)}
          >
            {label}
          </button>
        ))}
      </section>

      <section style={{ width: 'min(1320px,100%)', margin: '0 auto 12px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {object === 'plates' ? (
          <>
            {([
              ['Hero plate', heroBodyVisible, setHeroBodyVisible],
              ['Hero contact shadow', heroShadowVisible, setHeroShadowVisible],
              ['Remaining stack', stackBodyVisible, setStackBodyVisible],
              ['Stack contact shadow', stackShadowVisible, setStackShadowVisible],
            ] as const).map(([label, shown, toggle]) => (
              <button key={label} type="button"
                style={{ ...button, borderColor: shown ? '#7ce2a5' : '#8b4c48' }}
                onClick={() => toggle(!shown)}>
                {shown ? 'Hide' : 'Show'} {label}
              </button>
            ))}
          </>
        ) : object === 'toast' ? (
          <>
            <button type="button" style={{ ...button, borderColor: bodyVisible ? '#7ce2a5' : '#8b4c48' }}
              onClick={() => setBodyVisible(v => !v)}>
              {bodyVisible ? 'Hide' : 'Show'} hero toast
            </button>
            <button type="button" style={{ ...button, borderColor: remainingToastVisible ? '#7ce2a5' : '#8b4c48' }}
              onClick={() => setRemainingToastVisible(v => !v)}>
              {remainingToastVisible ? 'Hide' : 'Show'} remaining slice
            </button>
            <button type="button" style={{ ...button, borderColor: shadowVisible ? '#6bc8e6' : '#8b4c48' }}
              onClick={() => setShadowVisible(v => !v)}>
              {shadowVisible ? 'Hide' : 'Show'} hero shadow
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
        <button
          type="button"
          style={{ ...button, borderColor: blinkReference ? '#f4cb58' : '#42565c' }}
          onClick={() => setBlinkReference(v => !v)}
        >
          {blinkReference ? 'Show reconstruction' : 'Show reference'}
        </button>
        <span style={{ alignSelf: 'center', color: '#a9b5b6', fontSize: 12 }}>
          Current: {object} · {object === 'plates' ? 'four independent toggles' : object === 'toast'
            ? `${bodyVisible ? 'hero visible' : 'hero hidden'} · ${remainingToastVisible ? 'other slice visible' : 'other slice hidden'}`
            : state}
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
            {blinkReference ? 'Approved reference crop' : object === 'plates' ? 'Independent plate reconstruction' : `Reconstruction · ${state}`}
          </figcaption>

          <div style={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
            {primary()}
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
          ) : object === 'toast' ? (
            <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
              <AirborneToastFace />
              <p style={{ maxWidth: 420, margin: 0, color: '#9fabad', lineHeight: 1.45, textAlign: 'center' }}>
                The launched toast and the slice left in the toaster are separate. Hide both to inspect the empty slot. This full face is only a diagnostic for bread hidden at rest; rotation is still blocked.
              </p>
            </div>
          ) : object === 'plates' ? (
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <small style={{ color: '#a9b5b6' }}>Current toggles</small>
              <LayeredPlates
                stackBodyVisible={stackBodyVisible}
                stackShadowVisible={stackShadowVisible}
                heroBodyVisible={heroBodyVisible}
                heroShadowVisible={heroShadowVisible}
              />
              <small style={{ color: '#a9b5b6' }}>Approved intact reference</small>
              <PlateReference />
              <p style={{ maxWidth: 420, margin: 0, color: '#9fabad', lineHeight: 1.45, textAlign: 'center' }}>
                The hero is only the thin top plate of the upper pile. The remaining stack is the upper plates beneath it. The cabinet wood, lower bowl and plates, and mugs stay in the support. Hide both plate bodies to see that support alone. Motion and the hidden plate face are outside this static gate.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <LayeredTowel bodyVisible={bodyVisible} shadowVisible={shadowVisible} />
              <TowelReference />
              <p style={{ maxWidth: 420, margin: 0, color: '#9fabad', lineHeight: 1.45, textAlign: 'center' }}>
                Hiding the towel must reveal the complete oven handle and door. No oven pixels are allowed inside the towel body layer.
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
            With objects and shadows hidden, the real support must remain believable. Hiding both toast slices reveals an empty toaster slot; hiding the towel reveals a clean oven handle and door.
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
            A moving object is not accepted merely because its rest crop reconstructs correctly. Hidden geometry/support must also be valid before motion resumes.
          </p>
        </div>
      </section>
    </main>
  );
}
