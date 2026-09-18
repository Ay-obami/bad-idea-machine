import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_APPROVED_MASTER } from '../scene/kitchen-master';
import {
  KITCHEN_INTACT_ATLAS,
  KITCHEN_INTACT_DRAW_ORDER,
  propIdFromKitchenAtlasFrame,
  validateKitchenIntactAtlas,
} from '../scene/kitchen-intact-atlas';

const PROP_ORDER = [
  'pan',
  'toaster',
  'toast-stack',
  'toast',
  'kettle',
  'plate-stack',
  'hero-plate',
  'oven-towel',
] as const;

const LABELS: Readonly<Record<(typeof PROP_ORDER)[number], string>> = {
  pan: 'Pan',
  toaster: 'Toaster',
  'toast-stack': 'Remaining toast',
  toast: 'Hero toast',
  kettle: 'Kettle',
  'plate-stack': 'Remaining plates',
  'hero-plate': 'Hero plate',
  'oven-towel': 'Oven towel',
};

const button: CSSProperties = {
  minHeight: 40,
  padding: '8px 11px',
  border: '1px solid #42565c',
  background: '#101b1f',
  color: '#edf0e9',
  font: '700 11px Poppins, sans-serif',
  cursor: 'pointer',
};

function drawFrame(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  id: keyof typeof KITCHEN_INTACT_ATLAS.frames,
) {
  const frame = KITCHEN_INTACT_ATLAS.frames[id];
  context.drawImage(
    atlas,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    frame.destX,
    frame.destY,
    frame.width,
    frame.height,
  );
}

export function KitchenLayeredStaticProof() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);
  const [visibleProps, setVisibleProps] = useState<ReadonlySet<string>>(
    () => new Set(PROP_ORDER),
  );
  const errors = useMemo(() => validateKitchenIntactAtlas(), []);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setAtlasImage(image);
      setLoaded(true);
    };
    image.onerror = () => setLoaded(false);
    image.src = KITCHEN_INTACT_ATLAS.url;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !atlasImage) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const id of KITCHEN_INTACT_DRAW_ORDER) {
      const propId = propIdFromKitchenAtlasFrame(id);
      if (propId && !visibleProps.has(propId)) continue;
      drawFrame(context, atlasImage, id);
    }
  }, [atlasImage, visibleProps]);

  const toggle = (propId: string) => {
    setVisibleProps(current => {
      const next = new Set(current);
      if (next.has(propId)) next.delete(propId);
      else next.add(propId);
      return next;
    });
  };

  const card: CSSProperties = {
    border: '1px solid #32464b',
    background: '#071014',
    boxShadow: '0 16px 48px rgba(0,0,0,.34)',
  };

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(12px, 2vw, 26px)',
      background: 'radial-gradient(circle at 50% -10%, #203036, #071014 48%, #04080a)',
      color: '#edf0e9',
      fontFamily: 'Rubik, sans-serif',
    }}>
      <header style={{ width: 'min(1500px, 100%)', margin: '0 auto 15px' }}>
        <small style={{
          color: '#f4cb58',
          font: '800 11px Poppins, sans-serif',
          letterSpacing: '.13em',
        }}>
          CHECKPOINT 2A · STATIC LAYER RECONSTRUCTION
        </small>
        <h1 style={{
          margin: '7px 0 5px',
          font: '800 clamp(24px, 3vw, 39px)/1.04 Poppins, sans-serif',
        }}>
          Approved Kitchen → Destruction-aware layers
        </h1>
        <p style={{ maxWidth: 920, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          No motion is being judged here. The left frame is reconstructed from the permanent shell,
          clean architecture zones, contact imprints and independently controllable props. The right frame
          is the approved flattened reference.
        </p>
      </header>

      <section style={{
        width: 'min(1500px, 100%)',
        margin: '0 auto 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 7,
        alignItems: 'center',
      }}>
        {PROP_ORDER.map(propId => {
          const visible = visibleProps.has(propId);
          return (
            <button
              type="button"
              key={propId}
              onClick={() => toggle(propId)}
              style={{
                ...button,
                borderColor: visible ? '#77d39b' : '#a8574d',
                color: visible ? '#dff5e7' : '#f2b2a9',
              }}
            >
              {visible ? 'Hide' : 'Show'} {LABELS[propId]}
            </button>
          );
        })}
        <button type="button" style={button} onClick={() => setVisibleProps(new Set(PROP_ORDER))}>
          Restore all
        </button>
        <button type="button" style={button} onClick={() => setVisibleProps(new Set())}>
          Hide all props
        </button>
      </section>

      <section style={{
        width: 'min(1500px, 100%)',
        margin: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(560px, 100%), 1fr))',
        gap: 12,
      }}>
        <figure style={{ ...card, margin: 0 }}>
          <figcaption style={{ padding: '10px 12px', color: '#77d39b', fontWeight: 700 }}>
            Layered reconstruction {loaded ? '· atlas loaded' : '· loading atlas…'}
          </figcaption>
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            style={{ display: 'block', width: '100%', height: 'auto', background: '#020405' }}
          />
        </figure>

        <figure style={{ ...card, margin: 0 }}>
          <figcaption style={{ padding: '10px 12px', color: '#f4cb58', fontWeight: 700 }}>
            Approved reference
          </figcaption>
          <img
            src={KITCHEN_APPROVED_MASTER.sourceUrl}
            alt="Approved Kitchen visual reference"
            draggable={false}
            style={{ display: 'block', width: '100%', aspectRatio: '5 / 3', objectFit: 'fill' }}
          />
        </figure>
      </section>

      <section style={{
        width: 'min(1500px, 100%)',
        margin: '12px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 8,
      }}>
        <div style={{ ...card, padding: 12 }}>
          <strong>Atlas validation</strong>
          <p style={{ color: errors.length ? '#f29b8f' : '#9bd9b1', marginBottom: 0 }}>
            {errors.length ? errors.join(' · ') : 'Complete intact shell / zone / prop coverage.'}
          </p>
        </div>
        <div style={{ ...card, padding: 12 }}>
          <strong>Delivered reconstruction error</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0 }}>
            MAE {KITCHEN_INTACT_ATLAS.metrics.mae.toFixed(2)}/255 ·
            p99 {KITCHEN_INTACT_ATLAS.metrics.p99}/255.
            This records compression/resampling honestly; it is not claimed pixel-identical.
          </p>
        </div>
        <div style={{ ...card, padding: 12 }}>
          <strong>Gate</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0 }}>
            Hide each prop. The exposed stove, counter, cabinet shelf and oven front must look like real continuous
            surfaces. If any support patch looks fake, asset production stops there.
          </p>
        </div>
      </section>
    </main>
  );
}
