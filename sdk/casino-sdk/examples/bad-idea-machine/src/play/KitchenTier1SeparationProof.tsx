import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_AFTERMATH_AUTHORING } from '../scene/kitchen-aftermath-authoring';
import {
  KITCHEN_AFTERMATH_ZONE_ATLAS,
  kitchenAftermathZoneFrame,
} from '../scene/kitchen-aftermath-atlas';
import { KITCHEN_DESTRUCTION_BLUEPRINT } from '../scene/kitchen-destruction-blueprint';
import { KITCHEN_INTACT_ATLAS } from '../scene/kitchen-intact-atlas';
import {
  KITCHEN_TIER1_EXTRACTION_SPECS,
  type KitchenTier1ExtractionSpec,
} from '../scene/kitchen-tier1-extraction';

const button: CSSProperties = {
  minHeight: 40,
  padding: '7px 11px',
  border: '1px solid #42565c',
  background: '#101b1f',
  color: '#edf0e9',
  font: '700 11px Poppins, sans-serif',
  cursor: 'pointer',
};

function traceShape(context: CanvasRenderingContext2D, spec: KitchenTier1ExtractionSpec) {
  const { x, y, width, height } = spec.bounds;
  context.beginPath();

  switch (spec.shape.type) {
    case 'none':
      return false;
    case 'ellipse':
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      return true;
    case 'rect': {
      const radius = Math.max(0, Math.min(spec.shape.radius ?? 0, Math.min(width, height) / 2));
      if ('roundRect' in context && radius > 0) {
        context.roundRect(x, y, width, height, radius);
      } else {
        context.rect(x, y, width, height);
      }
      return true;
    }
    case 'polygon': {
      const [first, ...rest] = spec.shape.points;
      if (!first) return false;
      context.moveTo(x + first.x, y + first.y);
      rest.forEach(point => context.lineTo(x + point.x, y + point.y));
      context.closePath();
      return true;
    }
  }
}

function drawIntactFrame(
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

function drawIntactZone(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  zoneId: string,
) {
  const id = `zone/${zoneId}/intact` as keyof typeof KITCHEN_INTACT_ATLAS.frames;
  const frame = KITCHEN_INTACT_ATLAS.frames[id];
  if (!frame) return;

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

function drawAftermathZone(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  zoneId: Parameters<typeof kitchenAftermathZoneFrame>[1],
) {
  const frame = kitchenAftermathZoneFrame(1, zoneId);
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

function drawSpecSource(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  spec: KitchenTier1ExtractionSpec,
) {
  if (!spec.visible || !traceShape(context, spec)) return;
  context.save();
  context.clip();
  drawAftermathZone(context, atlas, spec.sourceZoneId);
  context.restore();
}

function restoreSpecSupport(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  spec: KitchenTier1ExtractionSpec,
) {
  if (!traceShape(context, spec)) return;
  context.save();
  context.clip();
  drawIntactZone(context, atlas, spec.sourceZoneId);
  context.restore();
}

export function KitchenTier1SeparationProof() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [intactAtlas, setIntactAtlas] = useState<HTMLImageElement | null>(null);
  const [aftermathAtlas, setAftermathAtlas] = useState<HTMLImageElement | null>(null);
  const [showProps, setShowProps] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [showDebris, setShowDebris] = useState(true);
  const [showMasks, setShowMasks] = useState(false);

  const authoring = KITCHEN_AFTERMATH_AUTHORING[1];
  const zones = useMemo(() => KITCHEN_DESTRUCTION_BLUEPRINT.zones, []);

  useEffect(() => {
    const intact = new Image();
    intact.onload = () => setIntactAtlas(intact);
    intact.src = KITCHEN_INTACT_ATLAS.url;

    const aftermath = new Image();
    aftermath.onload = () => setAftermathAtlas(aftermath);
    aftermath.src = KITCHEN_AFTERMATH_ZONE_ATLAS.url;

    return () => {
      intact.onload = null;
      aftermath.onload = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !intactAtlas || !aftermathAtlas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, 1000, 600);
    drawIntactFrame(context, intactAtlas, 'shell/permanent');

    for (const zone of zones) {
      drawAftermathZone(context, aftermathAtlas, zone.id);
    }

    // Strip terminal objects, their contact shadows and persistent debris back
    // out of the architecture using the genuine clean support surfaces.
    for (const spec of KITCHEN_TIER1_EXTRACTION_SPECS) {
      restoreSpecSupport(context, intactAtlas, spec);
    }

    if (showShadows) {
      KITCHEN_TIER1_EXTRACTION_SPECS
        .filter(spec => spec.kind === 'shadow')
        .forEach(spec => drawSpecSource(context, aftermathAtlas, spec));
    }

    if (showProps) {
      KITCHEN_TIER1_EXTRACTION_SPECS
        .filter(spec => spec.kind === 'prop')
        .forEach(spec => drawSpecSource(context, aftermathAtlas, spec));
    }

    if (showDebris) {
      KITCHEN_TIER1_EXTRACTION_SPECS
        .filter(spec => spec.kind === 'debris')
        .forEach(spec => drawSpecSource(context, aftermathAtlas, spec));
    }

    if (showMasks) {
      context.save();
      context.lineWidth = 1;
      for (const spec of KITCHEN_TIER1_EXTRACTION_SPECS) {
        if (!traceShape(context, spec)) continue;
        context.strokeStyle = spec.kind === 'prop'
          ? '#7ce2a5'
          : spec.kind === 'shadow'
            ? '#6bc8e6'
            : '#f3c45d';
        context.stroke();
      }
      context.restore();
    }
  }, [aftermathAtlas, intactAtlas, showDebris, showMasks, showProps, showShadows, zones]);

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
      <header style={{ width: 'min(1500px,100%)', margin: '0 auto 14px' }}>
        <small style={{ color: '#f4cb58', font: '800 11px Poppins,sans-serif', letterSpacing: '.13em' }}>
          CHECKPOINT 2C · TIER 1 TERMINAL SEPARATION
        </small>
        <h1 style={{ margin: '7px 0 5px', font: '800 clamp(24px,3vw,39px)/1.04 Poppins,sans-serif' }}>
          Architecture, props, shadows and debris must survive independently
        </h1>
        <p style={{ maxWidth: 980, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          The left frame first renders Tier 1 architecture, removes every terminal prop/shadow/debris footprint back to a clean support surface,
          then reapplies those terminal layers independently. Turning a family off must expose a believable surface with no ghost object left behind.
        </p>
      </header>

      <section style={{ width: 'min(1500px,100%)', margin: '0 auto 12px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        <button type="button" style={{ ...button, borderColor: showProps ? '#7ce2a5' : '#8b4c48' }} onClick={() => setShowProps(v => !v)}>
          {showProps ? 'Hide' : 'Show'} props
        </button>
        <button type="button" style={{ ...button, borderColor: showShadows ? '#6bc8e6' : '#8b4c48' }} onClick={() => setShowShadows(v => !v)}>
          {showShadows ? 'Hide' : 'Show'} contact shadows
        </button>
        <button type="button" style={{ ...button, borderColor: showDebris ? '#f3c45d' : '#8b4c48' }} onClick={() => setShowDebris(v => !v)}>
          {showDebris ? 'Hide' : 'Show'} debris
        </button>
        <button type="button" style={{ ...button, borderColor: showMasks ? '#f0a0ff' : '#42565c' }} onClick={() => setShowMasks(v => !v)}>
          {showMasks ? 'Hide' : 'Show'} ownership masks
        </button>
      </section>

      <section style={{
        width: 'min(1500px,100%)',
        margin: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(560px,100%),1fr))',
        gap: 12,
      }}>
        <figure style={{ ...card, margin: 0 }}>
          <figcaption style={{ padding: '10px 12px', color: '#7ce2a5', fontWeight: 700 }}>
            Separated Tier 1 composite
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
            Tier 1 authoring reference only
          </figcaption>
          <img
            src={authoring.url}
            alt="Tier 1 Kitchen aftermath authoring reference"
            draggable={false}
            style={{ display: 'block', width: '100%', aspectRatio: '5 / 3', objectFit: 'fill' }}
          />
        </figure>
      </section>

      <section style={{
        width: 'min(1500px,100%)',
        margin: '12px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
        gap: 8,
      }}>
        <div style={{ ...card, padding: 12 }}>
          <strong>What hiding Props must prove</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            Pan, toaster, toast, kettle, remaining plates and towel disappear without rectangular scars.
            The shattered hero plate has no whole-body layer; its physical remains belong to ceramic debris.
          </p>
        </div>
        <div style={{ ...card, padding: 12 }}>
          <strong>What hiding Shadows must prove</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            Support surfaces remain intact while only the contact integration disappears. This is what lets later moving props change height without dragging a baked shadow.
          </p>
        </div>
        <div style={{ ...card, padding: 12 }}>
          <strong>Current gate</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            Tier 1 is not accepted until the masks can be toggled without visible background contamination, duplicated objects or implausible support patches.
          </p>
        </div>
      </section>
    </main>
  );
}
