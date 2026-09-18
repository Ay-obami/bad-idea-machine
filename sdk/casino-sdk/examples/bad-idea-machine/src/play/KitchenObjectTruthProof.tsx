import { useMemo, useState, type CSSProperties } from 'react';

import {
  KITCHEN_PAN_TRUTH,
  kitchenPanTruthLayers,
} from '../scene/kitchen-object-truth-proof';

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

export function KitchenObjectTruthProof() {
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
          CHECKPOINT 2C · PAN SINGLE-OBJECT TRUTH GATE
        </small>
        <h1 style={{ margin: '7px 0 5px', font: '800 clamp(24px,3vw,39px)/1.04 Poppins,sans-serif' }}>
          One object, four repository-local assets
        </h1>
        <p style={{ maxWidth: 980, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          This gate tests only the photographed pan. The support plate, pan body, contact shadow and approved reference crop are all stored in the repository.
          No Creative Claw asset, remote master or Tier 1 ownership mask is used here.
        </p>
      </header>

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
          Current: {state}
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
            {blinkReference ? (
              <img
                src={KITCHEN_PAN_TRUTH.referenceUrl}
                alt="Approved pan reference crop"
                draggable={false}
                style={{
                  width: KITCHEN_PAN_TRUTH.width * 2,
                  height: KITCHEN_PAN_TRUTH.height * 2,
                  objectFit: 'fill',
                  imageRendering: 'auto',
                }}
              />
            ) : (
              <LayeredPan
                bodyVisible={bodyVisible}
                shadowVisible={shadowVisible}
                zoom={2}
              />
            )}
          </div>
        </figure>

        <figure style={{ ...card, margin: 0, padding: 12 }}>
          <figcaption style={{ marginBottom: 10, color: '#6bc8e6', fontWeight: 700 }}>
            1:1 diagnostic
          </figcaption>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <LayeredPan
              bodyVisible={bodyVisible}
              shadowVisible={shadowVisible}
            />
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
            With body and shadow hidden, the burner/grate area must remain believable and continuous. No smeared rectangle, ghost pan or missing stove geometry.
          </p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Shadow-only pass rule</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            The shadow must be subtle and local. It must not read as a black pan-shaped patch or contain background pixels.
          </p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Complete pass rule</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            Support + shadow + body must converge on the approved crop closely enough that switching to the reference does not expose a registration jump.
          </p>
        </div>
      </section>
    </main>
  );
}
