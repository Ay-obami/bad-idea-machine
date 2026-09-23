import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_APPROVED_MASTER } from '../scene/kitchen-master';
import {
  KITCHEN_PAN_TRUTH, KITCHEN_TOAST_TRUTH, KITCHEN_TOWEL_TRUTH,
  KITCHEN_PLATE_TRUTH, KITCHEN_KETTLE_TRUTH,
  type KitchenTruthAtlasFrame,
} from '../scene/kitchen-object-truth-proof';

type Layer = 'pan' | 'pan shadow' | 'hero toast' | 'other toast' | 'toast shadow'
  | 'towel' | 'towel shadow' | 'hero plate' | 'hero plate shadow'
  | 'plate stack' | 'stack shadow' | 'kettle' | 'kettle shadow' | 'kettle reflection';

const layerGroups: readonly (readonly Layer[])[] = [
  ['pan', 'pan shadow'],
  ['hero toast', 'other toast', 'toast shadow'],
  ['towel', 'towel shadow'],
  ['hero plate', 'hero plate shadow', 'plate stack', 'stack shadow'],
  ['kettle', 'kettle shadow', 'kettle reflection'],
];
const allLayers = layerGroups.flat();
const assetUrls = {
  master: KITCHEN_APPROVED_MASTER.sourceUrl,
  panSupport: KITCHEN_PAN_TRUTH.supportUrl,
  panShadow: KITCHEN_PAN_TRUTH.shadowUrl,
  panBody: KITCHEN_PAN_TRUTH.bodyUrl,
  toast: KITCHEN_TOAST_TRUTH.atlasUrl,
  towel: KITCHEN_TOWEL_TRUTH.atlasUrl,
  plates: KITCHEN_PLATE_TRUTH.atlasUrl,
  kettle: KITCHEN_KETTLE_TRUTH.atlasUrl,
} as const;
type Asset = keyof typeof assetUrls;

function loadAssets(): Promise<Record<Asset, HTMLImageElement>> {
  return Promise.all(Object.entries(assetUrls).map(([key, url]) => new Promise<[Asset, HTMLImageElement]>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve([key as Asset, image]);
    image.onerror = () => reject(new Error(`Could not load ${key}: ${url}`));
    image.src = url;
  }))).then(entries => Object.fromEntries(entries) as Record<Asset, HTMLImageElement>);
}

function drawRoom(context: CanvasRenderingContext2D, assets: Record<Asset, HTMLImageElement>, visible: ReadonlySet<Layer>, reference: boolean) {
  context.clearRect(0, 0, 1000, 600);
  context.drawImage(assets.master, 0, 0);
  if (reference) return;

  const drawCrop = (asset: Asset, frame: KitchenTruthAtlasFrame, x: number, y: number) => {
    context.drawImage(assets[asset], frame.x, frame.y, frame.width, frame.height, x, y, frame.width, frame.height);
  };
  const drawLayer = (layer: Layer, asset: Asset, frame: KitchenTruthAtlasFrame, x: number, y: number) => {
    if (visible.has(layer)) drawCrop(asset, frame, x, y);
  };
  const toast = KITCHEN_TOAST_TRUTH;
  const towel = KITCHEN_TOWEL_TRUTH;
  const plates = KITCHEN_PLATE_TRUTH;
  const kettle = KITCHEN_KETTLE_TRUTH;

  // Replace the photographed objects with their clean local supports first.
  context.drawImage(assets.panSupport, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  drawCrop('toast', toast.frames.support, toast.logicalBounds.x, toast.logicalBounds.y);
  drawCrop('towel', towel.frames.support, towel.logicalBounds.x, towel.logicalBounds.y);
  drawCrop('plates', plates.frames.support, plates.logicalBounds.x, plates.logicalBounds.y);
  drawCrop('kettle', kettle.frames.support, kettle.logicalBounds.x, kettle.logicalBounds.y);

  const at = (bounds: { x: number; y: number }, placement: { x: number; y: number }) =>
    [bounds.x + placement.x, bounds.y + placement.y] as const;
  const drawPlaced = (layer: Layer, asset: Asset, truth: typeof toast | typeof towel | typeof plates | typeof kettle, frame: KitchenTruthAtlasFrame, placement: { x: number; y: number }) => {
    const [x, y] = at(truth.logicalBounds, placement);
    drawLayer(layer, asset, frame, x, y);
  };

  if (visible.has('pan shadow')) context.drawImage(assets.panShadow, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  drawPlaced('toast shadow', 'toast', toast, toast.frames.shadow, toast.restPlacement.shadow);
  drawPlaced('towel shadow', 'towel', towel, towel.frames.shadow, towel.restPlacement.shadow);
  drawPlaced('stack shadow', 'plates', plates, plates.frames.stackShadow, plates.restPlacement.stackShadow);
  drawPlaced('hero plate shadow', 'plates', plates, plates.frames.heroShadow, plates.restPlacement.heroShadow);
  drawPlaced('kettle shadow', 'kettle', kettle, kettle.frames.shadow, kettle.restPlacement.shadow);
  drawPlaced('kettle reflection', 'kettle', kettle, kettle.frames.reflection, kettle.restPlacement.reflection);

  if (visible.has('pan')) context.drawImage(assets.panBody, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  drawPlaced('other toast', 'toast', toast, toast.frames.remainingBody, toast.restPlacement.remainingBody);
  drawPlaced('hero toast', 'toast', toast, toast.frames.body, toast.restPlacement.body);
  drawPlaced('towel', 'towel', towel, towel.frames.body, towel.restPlacement.body);
  drawPlaced('plate stack', 'plates', plates, plates.frames.stackBody, plates.restPlacement.stackBody);
  drawPlaced('hero plate', 'plates', plates, plates.frames.heroBody, plates.restPlacement.heroBody);
  drawPlaced('kettle', 'kettle', kettle, kettle.frames.body, kettle.restPlacement.body);
}

const controlStyle: CSSProperties = {
  padding: '7px 10px', minHeight: 36, borderRadius: 4, cursor: 'pointer',
  background: '#142327', color: '#edf0e9', font: '600 12px Rubik, sans-serif',
};

export function KitchenLocalIntactProof() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [assets, setAssets] = useState<Record<Asset, HTMLImageElement> | null>(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState<ReadonlySet<Layer>>(() => new Set(allLayers));
  const [reference, setReference] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadAssets().then(images => { if (mounted) setAssets(images); }).catch(cause => { if (mounted) setError(String(cause)); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (context && assets) drawRoom(context, assets, visible, reference);
  }, [assets, visible, reference]);

  const toggle = (layer: Layer) => setVisible(previous => {
    const next = new Set(previous);
    if (next.has(layer)) next.delete(layer); else next.add(layer);
    return next;
  });

  return <main style={{ minHeight: '100vh', background: '#071014', color: '#edf0e9', padding: 20, fontFamily: 'Rubik, sans-serif' }}>
    <div style={{ maxWidth: 1100, margin: 'auto' }}>
      <small style={{ color: '#f4cb58' }}>CHECKPOINT 2D · LOCAL INTACT ASSEMBLY</small>
      <h1 style={{ margin: '8px 0', font: '800 clamp(22px,3vw,34px) Poppins, sans-serif' }}>Approved Kitchen · stationary room proof</h1>
      <p style={{ color: '#b5c3c5', lineHeight: 1.5 }}>
        One 1000×600 camera. The room and all active crops use the repository-local approved master. Toggle the extracted objects and their contacts, then compare the intact assembly with the reference.
      </p>
      <button type="button" style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12 }} onClick={() => setReference(value => !value)}>
        {reference ? 'Show layered assembly' : 'Show approved master'}
      </button>
      <div style={{ width: '100%', aspectRatio: '5 / 3', background: '#020405' }}>
        <canvas ref={canvas} width={1000} height={600} role="img" aria-label={reference ? 'Approved Kitchen master' : 'Layered Kitchen intact reconstruction'} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {!assets && !error ? <p>Loading approved local assets…</p> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
        <button type="button" style={{ ...controlStyle, border: '1px solid #7ce2a5' }} onClick={() => setVisible(new Set(allLayers))}>Show all</button>
        <button type="button" style={{ ...controlStyle, border: '1px solid #8b4c48' }} onClick={() => setVisible(new Set())}>Hide extracted layers</button>
      </div>
      {layerGroups.map((group, index) => <section key={group[0]} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 10 }}>
        <strong style={{ width: 92, fontSize: 12 }}>{['Pan', 'Toast', 'Towel', 'Plates', 'Kettle'][index]}</strong>
        {group.map(layer => <button key={layer} type="button" aria-pressed={visible.has(layer)} onClick={() => toggle(layer)}
          style={{ ...controlStyle, border: `1px solid ${visible.has(layer) ? '#7ce2a5' : '#8b4c48'}` }}>
          {visible.has(layer) ? 'Hide' : 'Show'} {layer}
        </button>)}
      </section>)}
      <p style={{ color: '#b5c3c5', marginTop: 18, lineHeight: 1.5 }}>
        This is a stationary assembly check. The toaster housing and its cord are still in the toast support; the rest of the destructible architecture and all aftermath states need their own approved local assets. No motion or terminal frame is approved here.
      </p>
    </div>
  </main>;
}
