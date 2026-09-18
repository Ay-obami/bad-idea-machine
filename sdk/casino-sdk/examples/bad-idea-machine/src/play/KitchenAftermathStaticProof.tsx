import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import type { OutcomeTier } from '../lib/badIdea';
import { KITCHEN_AFTERMATH_AUTHORING } from '../scene/kitchen-aftermath-authoring';
import {
  KITCHEN_AFTERMATH_ZONE_ATLAS,
  kitchenAftermathZoneFrame,
  validateKitchenAftermathZoneAtlas,
} from '../scene/kitchen-aftermath-atlas';
import { KITCHEN_DESTRUCTION_BLUEPRINT } from '../scene/kitchen-destruction-blueprint';
import { KITCHEN_INTACT_ATLAS } from '../scene/kitchen-intact-atlas';

const TIERS = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];

function drawAtlasFrame(
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

function drawRegisteredCrop(
  context: CanvasRenderingContext2D,
  source: HTMLImageElement,
  bounds: Readonly<{ x: number; y: number; width: number; height: number }>,
) {
  const sx = (bounds.x / 1000) * source.naturalWidth;
  const sy = (bounds.y / 600) * source.naturalHeight;
  const sw = (bounds.width / 1000) * source.naturalWidth;
  const sh = (bounds.height / 600) * source.naturalHeight;

  context.drawImage(
    source,
    sx,
    sy,
    sw,
    sh,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
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

export function KitchenAftermathStaticProof() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tier, setTier] = useState<OutcomeTier>(1);
  const [intactAtlasImage, setIntactAtlasImage] = useState<HTMLImageElement | null>(null);
  const [aftermathAtlasImage, setAftermathAtlasImage] = useState<HTMLImageElement | null>(null);
  const [showBounds, setShowBounds] = useState(false);

  const authoring = KITCHEN_AFTERMATH_AUTHORING[tier];
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];

  useEffect(() => {
    const intact = new Image();
    intact.onload = () => setIntactAtlasImage(intact);
    intact.src = KITCHEN_INTACT_ATLAS.url;

    const aftermath = new Image();
    aftermath.onload = () => setAftermathAtlasImage(aftermath);
    aftermath.src = KITCHEN_AFTERMATH_ZONE_ATLAS.url;

    return () => {
      intact.onload = null;
      aftermath.onload = null;
    };
  }, []);

  const orderedZones = useMemo(() => [
    ...KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'permanent'),
    ...KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible'),
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !intactAtlasImage || !aftermathAtlasImage) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, 1000, 600);
    drawAtlasFrame(context, intactAtlasImage, 'shell/permanent');

    for (const zone of orderedZones) {
      const frame = kitchenAftermathZoneFrame(tier, zone.id);
      context.drawImage(
        aftermathAtlasImage,
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

    if (showBounds) {
      context.save();
      context.lineWidth = 1;
      context.font = '11px sans-serif';

      for (const zone of orderedZones) {
        context.strokeStyle = zone.kind === 'permanent'
          ? 'rgba(117,198,222,.95)'
          : 'rgba(245,202,85,.95)';
        context.strokeRect(zone.bounds.x + .5, zone.bounds.y + .5, zone.bounds.width - 1, zone.bounds.height - 1);
        context.fillStyle = 'rgba(3,8,10,.78)';
        const labelWidth = Math.min(zone.bounds.width - 4, context.measureText(zone.label).width + 8);
        context.fillRect(zone.bounds.x + 2, zone.bounds.y + 2, labelWidth, 16);
        context.fillStyle = zone.kind === 'permanent' ? '#9bdff2' : '#f5d77c';
        context.fillText(zone.label, zone.bounds.x + 6, zone.bounds.y + 14);
      }

      context.restore();
    }
  }, [intactAtlasImage, aftermathAtlasImage, orderedZones, showBounds, tier]);

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
      <header style={{ width: 'min(1500px, 100%)', margin: '0 auto 14px' }}>
        <small style={{ color: '#f4cb58', font: '800 11px Poppins, sans-serif', letterSpacing: '.13em' }}>
          CHECKPOINT 2B · FIVE STATIC AFTERMATHS
        </small>
        <h1 style={{ margin: '7px 0 5px', font: '800 clamp(24px,3vw,39px)/1.04 Poppins,sans-serif' }}>
          Local destruction crops, not full-frame outcome swaps
        </h1>
        <p style={{ maxWidth: 980, margin: 0, color: '#a9b5b6', lineHeight: 1.48 }}>
          Left: clean layered Kitchen base plus only crops from the baked local-zone atlas. Right: the full authoring plate
          used to design those local states. The right image is explicitly forbidden as a runtime outcome and is not used
          to render the left composite.
        </p>
      </header>

      <section style={{ width: 'min(1500px,100%)', margin: '0 auto 12px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {TIERS.map(candidate => (
          <button
            type="button"
            key={candidate}
            onClick={() => setTier(candidate)}
            style={{
              ...button,
              borderColor: candidate === tier ? '#f4cb58' : '#42565c',
              color: candidate === tier ? '#f4cb58' : '#edf0e9',
            }}
          >
            Tier {candidate} · {KITCHEN_AFTERMATH_AUTHORING[candidate].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowBounds(current => !current)}
          style={{ ...button, borderColor: showBounds ? '#77d39b' : '#42565c' }}
        >
          {showBounds ? 'Hide' : 'Show'} crop boundaries
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
          <figcaption style={{ padding: '10px 12px', color: '#77d39b', fontWeight: 700 }}>
            Baked-atlas composite · Tier {tier}
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
            Authoring reference only · Tier {tier}
          </figcaption>
          <img
            src={authoring.url}
            alt={`Kitchen tier ${tier} authoring reference`}
            draggable={false}
            style={{ display: 'block', width: '100%', aspectRatio: '5 / 3', objectFit: 'fill' }}
          />
        </figure>
      </section>

      <section style={{
        width: 'min(1500px,100%)',
        margin: '12px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        gap: 8,
      }}>
        <div style={{ ...card, padding: 12 }}>
          <strong>Art direction</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>{authoring.artDirection}</p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Environmental state</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            Fire: {composition.hazards.fire} · Smoke: {composition.hazards.smoke} · Power: {composition.hazards.power}
          </p>
        </div>

        <div style={{ ...card, padding: 12 }}>
          <strong>Gate</strong>
          <p style={{ color: '#a9b5b6', marginBottom: 0, lineHeight: 1.45 }}>
            {validateKitchenAftermathZoneAtlas().length
              ? validateKitchenAftermathZoneAtlas().join(' · ')
              : '50 registered local crops present. Reject visually if the left composite shows camera drift, rectangular seams, impossible support, or destruction that no longer reads as this same Kitchen.'}
          </p>
        </div>
      </section>
    </main>
  );
}
