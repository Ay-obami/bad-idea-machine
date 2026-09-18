import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_APPROVED_MASTER } from '../scene/kitchen-master';
import { KITCHEN_INTACT_ATLAS } from '../scene/kitchen-intact-atlas';
import {
  KITCHEN_OBJECT_TRUTH_OBJECTS,
  kitchenObjectTruthDrawOrder,
  type KitchenObjectTruthId,
} from '../scene/kitchen-object-truth-proof';

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

const button: CSSProperties = {
  minHeight: 40,
  padding: '7px 11px',
  border: '1px solid #42565c',
  background: '#101b1f',
  color: '#edf0e9',
  font: '700 11px Poppins, sans-serif',
  cursor: 'pointer',
};

export function KitchenObjectTruthProof() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusCanvasRef = useRef<HTMLCanvasElement>(null);
  const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
  const [objectId, setObjectId] = useState<KitchenObjectTruthId>('pan');
  const [bodyVisible, setBodyVisible] = useState(true);
  const [shadowVisible, setShadowVisible] = useState(true);

  const object = KITCHEN_OBJECT_TRUTH_OBJECTS.find(item => item.id === objectId)!;

  useEffect(() => {
    const image = new Image();
    image.onload = () => setAtlas(image);
    image.src = KITCHEN_INTACT_ATLAS.url;
    return () => { image.onload = null; };
  }, []);

  useEffect(() => {
    if (!atlas) return;
    const canvas = canvasRef.current;
    const focusCanvas = focusCanvasRef.current;
    if (!canvas || !focusCanvas) return;

    const context = canvas.getContext('2d');
    const focus = focusCanvas.getContext('2d');
    if (!context || !focus) return;

    context.clearRect(0, 0, 1000, 600);
    for (const id of kitchenObjectTruthDrawOrder(objectId, bodyVisible, shadowVisible)) {
      drawFrame(context, atlas, id);
    }

    const area = object.focus;
    focus.clearRect(0, 0, area.width, area.height);
    focus.drawImage(
      canvas,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      area.width,
      area.height,
    );
  }, [atlas, bodyVisible, object, objectId, shadowVisible]);

  const state = bodyVisible && shadowVisible
    ? 'body + shadow'
    : bodyVisible
      ? 'body only'
      : shadowVisible
        ? 'shadow only'
        : 'clean support only';

  return (
    <main style={{
      minHeight: '100vh',
      padding: 'clamp(12px,2vw,26px)',
      background: 'radial-gradient(circle at 50% -10%, #203036, #071014 48%, #04080a)',
      color: '#edf0e9',
      fontFamily: 'Rubik, sans-serif',
    }}>
      <header style={{ width: 'min(1500px,100%)', margin: '0 auto 14px' }}>
        <small style={{ color: '#f4cb58', font: '800 11px Poppins,sans-serif', letterSpacing: '.13em' }}>
          CHECKPOINT 2C · SINGLE-OBJECT TRUTH GATE
        </small>
        <h1 style={{ margin: '7px 0 5px', font: '800 clamp(24px,3vw,39px)/1.04 Poppins,sans-serif' }}>
          Exact object layer, independent shadow, clean support
        </h1>
        <p style={{ maxWidth: 980, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          No browser polygon masks and no Tier 1 debris are involved here. This proof uses only the already-approved intact layered atlas.
          Hide an object and its shadow: the genuine architectural support beneath it must remain visually believable.
        </p>
      </header>

      <section style={{ width: 'min(1500px,100%)', margin: '0 auto 12px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {KITCHEN_OBJECT_TRUTH_OBJECTS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setObjectId(item.id);
              setBodyVisible(true);
              setShadowVisible(true);
            }}
            style={{ ...button, borderColor: item.id === objectId ? '#f4cb58' : '#42565c' }}
          >
            {item.label}
          </button>
        ))}
        <button type="button" style={{ ...button, borderColor: bodyVisible ? '#7ce2a5' : '#8b4c48' }} onClick={() => setBodyVisible(v => !v)}>
          {bodyVisible ? 'Hide' : 'Show'} body
        </button>
        <button type="button" style={{ ...button, borderColor: shadowVisible ? '#6bc8e6' : '#8b4c48' }} onClick={() => setShadowVisible(v => !v)}>
          {shadowVisible ? 'Hide' : 'Show'} shadow
        </button>
        <span style={{ alignSelf: 'center', color: '#a9b5b6', fontSize: 12 }}>Current: {state}</span>
      </section>

      <section style={{
        width: 'min(1500px,100%)',
        margin: 'auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.5fr) minmax(320px,.8fr)',
        gap: 12,
      }}>
        <figure style={{ margin: 0, border: '1px solid #32464b', background: '#071014' }}>
          <figcaption style={{ padding: '10px 12px', color: '#7ce2a5', fontWeight: 700 }}>
            Layered reconstruction · {object.label}
          </figcaption>
          <canvas ref={canvasRef} width={1000} height={600} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </figure>

        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <figure style={{ margin: 0, border: '1px solid #32464b', background: '#071014' }}>
            <figcaption style={{ padding: '10px 12px', color: '#6bc8e6', fontWeight: 700 }}>
              1:1 focus · {state}
            </figcaption>
            <canvas
              ref={focusCanvasRef}
              width={object.focus.width}
              height={object.focus.height}
              style={{ display: 'block', width: '100%', imageRendering: 'auto' }}
            />
          </figure>

          <figure style={{ margin: 0, border: '1px solid #32464b', background: '#071014' }}>
            <figcaption style={{ padding: '10px 12px', color: '#f4cb58', fontWeight: 700 }}>
              Approved master reference
            </figcaption>
            <div style={{ overflow: 'hidden', aspectRatio: `${object.focus.width} / ${object.focus.height}` }}>
              <img
                src={KITCHEN_APPROVED_MASTER.sourceUrl}
                alt={`Approved master ${object.label} reference`}
                draggable={false}
                style={{
                  display: 'block',
                  width: `${(1000 / object.focus.width) * 100}%`,
                  height: `${(600 / object.focus.height) * 100}%`,
                  maxWidth: 'none',
                  transform: `translate(${(-object.focus.x / 1000) * 100}%, ${(-object.focus.y / 600) * 100}%)`,
                  transformOrigin: '0 0',
                }}
              />
            </div>
          </figure>
        </div>
      </section>

      <section style={{ width: 'min(1500px,100%)', margin: '12px auto 0', color: '#a9b5b6', lineHeight: 1.5, fontSize: 12 }}>
        <strong style={{ color: '#edf0e9' }}>Pass rule:</strong> with both body and shadow hidden, the support must read as an uninterrupted stove/counter surface.
        With body visible and shadow hidden, only grounding should change. With shadow visible and body hidden, there must be no black geometric patch or object silhouette masquerading as a shadow.
      </section>
    </main>
  );
}
