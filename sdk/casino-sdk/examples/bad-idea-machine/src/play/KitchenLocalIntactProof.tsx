import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_APPROVED_MASTER } from '../scene/kitchen-master';
import { KITCHEN_CABINET_ARCHITECTURE, KITCHEN_CABINET_DOOR, KITCHEN_CABINET_SHELF_FASCIA, KITCHEN_PLATE_TILT, kitchenCabinetDoorPose, kitchenCabinetHeroFace, kitchenCabinetShelfPose, kitchenCabinetStackOffset, kitchenCabinetSurface, type KitchenCabinetMode } from '../scene/kitchen-cabinet-architecture';
import {
  KITCHEN_PAN_TRUTH, KITCHEN_TOAST_TRUTH, KITCHEN_TOWEL_TRUTH,
  KITCHEN_PLATE_TRUTH, KITCHEN_KETTLE_TRUTH, KITCHEN_TOASTER_TRUTH,
  kitchenToasterTruthLayers,
  type KitchenTruthAtlasFrame,
} from '../scene/kitchen-object-truth-proof';

type Layer = 'pan' | 'pan shadow' | 'toaster' | 'toaster cord' | 'toaster wall shadow'
  | 'toaster contact shadow' | 'toaster reflection' | 'hero toast' | 'other toast' | 'toast shadow'
  | 'towel' | 'towel shadow' | 'hero plate' | 'hero plate shadow'
  | 'plate stack' | 'stack shadow' | 'kettle' | 'kettle shadow' | 'kettle reflection' | 'cabinet door' | 'shelf fascia';

const layerGroups: readonly (readonly Layer[])[] = [
  ['pan', 'pan shadow'],
  ['toaster', 'toaster cord', 'toaster wall shadow', 'toaster contact shadow', 'toaster reflection'],
  ['hero toast', 'other toast', 'toast shadow'],
  ['towel', 'towel shadow'],
  ['hero plate', 'hero plate shadow', 'plate stack', 'stack shadow'],
  ['kettle', 'kettle shadow', 'kettle reflection'],
  ['cabinet door', 'shelf fascia'],
];
const allLayers = layerGroups.flat();
const assetUrls = {
  master: KITCHEN_APPROVED_MASTER.sourceUrl,
  cabinet: KITCHEN_CABINET_ARCHITECTURE.intactUrl,
  backing: KITCHEN_CABINET_ARCHITECTURE.backingUrl,
  panSupport: KITCHEN_PAN_TRUTH.supportUrl,
  panShadow: KITCHEN_PAN_TRUTH.shadowUrl,
  panBody: KITCHEN_PAN_TRUTH.bodyUrl,
  toast: KITCHEN_TOAST_TRUTH.atlasUrl,
  toaster: KITCHEN_TOASTER_TRUTH.atlasUrl,
  towel: KITCHEN_TOWEL_TRUTH.atlasUrl,
  plates: KITCHEN_PLATE_TRUTH.atlasUrl,
  plateTilt: KITCHEN_PLATE_TILT.atlasUrl,
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

function doorSilhouette(x: number, y: number) {
  if (y < 0 || y >= KITCHEN_CABINET_DOOR.bounds.height) return false;
  // The stationary jamb and hinge anchor stay with the cabinet. The door
  // body includes its bright photographed free edge through x = 769.
  return x >= KITCHEN_CABINET_DOOR.bounds.x &&
    x < KITCHEN_CABINET_DOOR.bounds.x + KITCHEN_CABINET_DOOR.bounds.width;
}

function cabinetDoorLayers(cabinet: HTMLImageElement, master: HTMLImageElement) {
  const { bounds } = KITCHEN_CABINET_ARCHITECTURE;
  const { bounds: doorBounds, hiddenSupportSample } = KITCHEN_CABINET_DOOR;
  const source = document.createElement('canvas');
  source.width = bounds.width;
  source.height = bounds.height;
  const sourceContext = source.getContext('2d', { willReadFrequently: true });
  if (!sourceContext) throw new Error('Could not inspect approved cabinet pixels');
  sourceContext.drawImage(cabinet, 0, 0);
  const original = sourceContext.getImageData(0, 0, bounds.width, bounds.height);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = hiddenSupportSample.width;
  sampleCanvas.height = hiddenSupportSample.height;
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) throw new Error('Could not inspect adjoining approved cabinet pixels');
  sampleContext.drawImage(master, hiddenSupportSample.x, hiddenSupportSample.y,
    hiddenSupportSample.width, hiddenSupportSample.height, 0, 0,
    hiddenSupportSample.width, hiddenSupportSample.height);
  const neighbor = sampleContext.getImageData(0, 0, hiddenSupportSample.width, hiddenSupportSample.height);
  const door = sourceContext.createImageData(bounds.width, bounds.height);
  const support = sourceContext.createImageData(bounds.width, bounds.height);
  support.data.set(original.data);
  for (let y = 0; y < bounds.height; y++) {
    for (let x = 0; x < bounds.width; x++) {
      const globalX = bounds.x + x;
      if (!doorSilhouette(globalX, y)) continue;
      const destination = (y * bounds.width + x) * 4;
      door.data.set(original.data.subarray(destination, destination + 4), destination);
      // Continue the neighboring photographed cabinet face behind the open
      // door. This is proposed unseen support, never a replacement master.
      const sampleX = Math.round((globalX - doorBounds.x) /
        (doorBounds.width - 1) * (hiddenSupportSample.width - 1));
      const sample = (y * hiddenSupportSample.width + sampleX) * 4;
      support.data.set(neighbor.data.subarray(sample, sample + 4), destination);
    }
  }
  sourceContext.putImageData(door, 0, 0);
  const doorCanvas = document.createElement('canvas');
  doorCanvas.width = bounds.width;
  doorCanvas.height = bounds.height;
  doorCanvas.getContext('2d')?.putImageData(door, 0, 0);
  sourceContext.putImageData(support, 0, 0);
  return { door: doorCanvas, support: source };
}

function cabinetShelfLayers(cabinetSupport: HTMLCanvasElement) {
  const { bounds: cabinet } = KITCHEN_CABINET_ARCHITECTURE;
  const { bounds: fascia, backingSampleOffsetY } = KITCHEN_CABINET_SHELF_FASCIA;
  const context = cabinetSupport.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Could not inspect photographed shelf');
  const original = context.getImageData(0, 0, cabinet.width, cabinet.height);
  const fragment = context.createImageData(cabinet.width, cabinet.height);
  const backing = context.createImageData(cabinet.width, cabinet.height);
  backing.data.set(original.data);
  for (let y = fascia.y; y < fascia.y + fascia.height; y++) {
    for (let x = fascia.x; x < fascia.x + fascia.width; x++) {
      const destination = ((y - cabinet.y) * cabinet.width + x - cabinet.x) * 4;
      const sample = ((y + backingSampleOffsetY - cabinet.y) * cabinet.width + x - cabinet.x) * 4;
      fragment.data.set(original.data.subarray(destination, destination + 4), destination);
      backing.data.set(original.data.subarray(sample, sample + 4), destination);
    }
  }
  const fasciaCanvas = document.createElement('canvas');
  fasciaCanvas.width = cabinet.width;
  fasciaCanvas.height = cabinet.height;
  fasciaCanvas.getContext('2d')?.putImageData(fragment, 0, 0);
  const supportCanvas = document.createElement('canvas');
  supportCanvas.width = cabinet.width;
  supportCanvas.height = cabinet.height;
  supportCanvas.getContext('2d')?.putImageData(backing, 0, 0);
  return { fascia: fasciaCanvas, support: supportCanvas };
}

function drawRoom(context: CanvasRenderingContext2D, assets: Record<Asset, HTMLImageElement>, visible: ReadonlySet<Layer>, reference: boolean, cabinetMode: KitchenCabinetMode) {
  context.clearRect(0, 0, 1000, 600);
  context.drawImage(assets.master, 0, 0);
  const cabinetSurface = kitchenCabinetSurface(cabinetMode, reference);
  if (reference) return;
  const cabinetVisible = cabinetMode !== 'backing-diagnostic';

  // The exact photographed cabinet and the proposed unseen wall are separate
  // local layers; the approved full-room master is never modified.
  const cabinet = KITCHEN_CABINET_ARCHITECTURE.bounds;
  context.clearRect(cabinet.x, cabinet.y, cabinet.width, cabinet.height);
  context.drawImage(assets[cabinetSurface], cabinet.x, cabinet.y);
  if (cabinetVisible) {
    const separated = cabinetDoorLayers(assets.cabinet, assets.master);
    const shelf = cabinetShelfLayers(separated.support);
    context.drawImage(shelf.support, cabinet.x, cabinet.y);
    if (visible.has('shelf fascia')) {
      if (kitchenCabinetShelfPose(cabinetMode) === 'loose') {
        const { bounds: fascia, freeEdgeDrop } = KITCHEN_CABINET_SHELF_FASCIA;
        // Only the photographed front strip drops; the bowl-bearing shelf
        // surface and the cabinet's outer frame remain in their rest positions.
        for (let x = fascia.x; x < fascia.x + fascia.width; x++) {
          const drop = Math.round(freeEdgeDrop * (x - fascia.x) / (fascia.width - 1));
          context.drawImage(shelf.fascia, x - cabinet.x, fascia.y - cabinet.y, 1, fascia.height,
            x, fascia.y + drop, 1, fascia.height);
        }
      } else {
        context.drawImage(shelf.fascia, cabinet.x, cabinet.y);
      }
    }
    if (visible.has('cabinet door')) {
      if (kitchenCabinetDoorPose(cabinetMode) === 'dropped') {
        const { bounds: door, freeEdgeDrop } = KITCHEN_CABINET_DOOR;
        // One static perspective pose: the upper wood and hinge stay at their
        // photographed positions while only the free lower corner sags.
        for (let x = door.x; x < door.x + door.width; x++) {
          const drop = freeEdgeDrop * (x - door.x) / (door.width - 1);
          context.drawImage(separated.door, x - cabinet.x, 0, 1, door.height,
            x, door.y, 1, door.height + drop);
        }
      } else {
        context.drawImage(separated.door, cabinet.x, cabinet.y);
      }
    }
  }

  const drawCrop = (asset: Asset, frame: KitchenTruthAtlasFrame, x: number, y: number) => {
    context.drawImage(assets[asset], frame.x, frame.y, frame.width, frame.height, x, y, frame.width, frame.height);
  };
  const drawLayer = (layer: Layer, asset: Asset, frame: KitchenTruthAtlasFrame, x: number, y: number) => {
    if (visible.has(layer)) drawCrop(asset, frame, x, y);
  };
  const toast = KITCHEN_TOAST_TRUTH;
  const toaster = KITCHEN_TOASTER_TRUTH;
  const towel = KITCHEN_TOWEL_TRUTH;
  const plates = KITCHEN_PLATE_TRUTH;
  const stackOffset = kitchenCabinetStackOffset(cabinetMode);
  const kettle = KITCHEN_KETTLE_TRUTH;

  // Replace the photographed objects with their clean local supports first.
  context.drawImage(assets.panSupport, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  drawCrop('toaster', toaster.frames.support, toaster.logicalBounds.x, toaster.logicalBounds.y);
  drawCrop('towel', towel.frames.support, towel.logicalBounds.x, towel.logicalBounds.y);
  if (cabinetVisible) drawCrop('plates', plates.frames.support, plates.logicalBounds.x, plates.logicalBounds.y);
  drawCrop('kettle', kettle.frames.support, kettle.logicalBounds.x, kettle.logicalBounds.y);

  const at = (bounds: { x: number; y: number }, placement: { x: number; y: number }) =>
    [bounds.x + placement.x, bounds.y + placement.y] as const;
  const drawPlaced = (layer: Layer, asset: Asset, truth: typeof toaster | typeof toast | typeof towel | typeof plates | typeof kettle, frame: KitchenTruthAtlasFrame, placement: { x: number; y: number }) => {
    const [x, y] = at(truth.logicalBounds, placement);
    drawLayer(layer, asset, frame, x, y);
  };
  const drawHeroPlate = (layer: 'hero plate' | 'hero plate shadow', frame: KitchenTruthAtlasFrame, placement: { x: number; y: number }) => {
    if (!visible.has(layer)) return;
    const face = kitchenCabinetHeroFace(cabinetMode);
    if (face === 'none') return;
    if (face === 'tilted') {
      const tiltFrame = layer === 'hero plate' ? KITCHEN_PLATE_TILT.frames.face : KITCHEN_PLATE_TILT.frames.contact;
      drawCrop('plateTilt', tiltFrame, KITCHEN_PLATE_TILT.placement.x, KITCHEN_PLATE_TILT.placement.y);
      return;
    }
    const [x, y] = at(plates.logicalBounds, placement);
    drawCrop('plates', frame, x, y);
  };

  if (visible.has('pan shadow')) context.drawImage(assets.panShadow, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  const toasterLayers = kitchenToasterTruthLayers(
    visible.has('toaster'), visible.has('toaster cord'), visible.has('toaster wall shadow'),
    visible.has('toaster contact shadow'), visible.has('toaster reflection'),
  );
  for (const id of toasterLayers) {
    if (id === 'support') continue;
    const frame = toaster.frames[id];
    const placement = toaster.restPlacement[id];
    drawCrop('toaster', frame, toaster.logicalBounds.x + placement.x, toaster.logicalBounds.y + placement.y);
  }
  drawPlaced('toast shadow', 'toast', toast, toast.frames.shadow, toast.restPlacement.shadow);
  drawPlaced('towel shadow', 'towel', towel, towel.frames.shadow, towel.restPlacement.shadow);
  if (cabinetVisible) {
    drawPlaced('stack shadow', 'plates', plates, plates.frames.stackShadow, {
      x: plates.restPlacement.stackShadow.x + stackOffset.x,
      y: plates.restPlacement.stackShadow.y + stackOffset.y,
    });
    drawHeroPlate('hero plate shadow', plates.frames.heroShadow, plates.restPlacement.heroShadow);
  }
  drawPlaced('kettle shadow', 'kettle', kettle, kettle.frames.shadow, kettle.restPlacement.shadow);
  drawPlaced('kettle reflection', 'kettle', kettle, kettle.frames.reflection, kettle.restPlacement.reflection);

  if (visible.has('pan')) context.drawImage(assets.panBody, KITCHEN_PAN_TRUTH.logicalBounds.x, KITCHEN_PAN_TRUTH.logicalBounds.y);
  drawPlaced('other toast', 'toast', toast, toast.frames.remainingBody, toast.restPlacement.remainingBody);
  drawPlaced('hero toast', 'toast', toast, toast.frames.body, toast.restPlacement.body);
  drawPlaced('towel', 'towel', towel, towel.frames.body, towel.restPlacement.body);
  if (cabinetVisible) {
    drawPlaced('plate stack', 'plates', plates, plates.frames.stackBody, {
      x: plates.restPlacement.stackBody.x + stackOffset.x,
      y: plates.restPlacement.stackBody.y + stackOffset.y,
    });
    drawHeroPlate('hero plate', plates.frames.heroBody, plates.restPlacement.heroBody);
    if (cabinetMode === 'hinge-stressed' || cabinetMode === 'hinge-dropped' || cabinetMode === 'shelf-loose') {
      // Local hinge stress, with the approved door and carcass still in place.
      context.save();
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = .8;
      context.strokeStyle = 'rgba(58, 31, 18, .45)';
      context.beginPath();
      context.moveTo(700, 71);
      context.lineTo(702, 76);
      context.lineTo(700, 79);
      context.lineTo(703, 84);
      context.stroke();
      context.restore();
    }
  }
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
  const [cabinetMode, setCabinetMode] = useState<KitchenCabinetMode>('intact');
  const cabinetVisible = cabinetMode !== 'backing-diagnostic';

  useEffect(() => {
    let mounted = true;
    loadAssets().then(images => { if (mounted) setAssets(images); }).catch(cause => { if (mounted) setError(String(cause)); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (context && assets) drawRoom(context, assets, visible, reference, cabinetMode);
  }, [assets, visible, reference, cabinetMode]);

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
      <button type="button" aria-pressed={cabinetMode === 'hinge-dropped'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'hinge-dropped' ? 'intact' : 'hinge-dropped')}>
        {cabinetMode === 'hinge-dropped' ? 'Restore door on hinge' : 'Preview hanging door'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'shelf-loose'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'shelf-loose' ? 'intact' : 'shelf-loose')}>
        {cabinetMode === 'shelf-loose' ? 'Restore upper shelf fascia' : 'Preview loose shelf fascia'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'hinge-stressed'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'hinge-stressed' ? 'intact' : 'hinge-stressed')}>
        {cabinetMode === 'hinge-stressed' ? 'Restore intact cabinet' : 'Preview stressed hinge'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'backing-diagnostic'} style={{ ...controlStyle, border: '1px solid #7ce2a5', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'backing-diagnostic' ? 'intact' : 'backing-diagnostic')}>
        {cabinetMode === 'backing-diagnostic' ? 'Restore cabinet from diagnostic' : 'Isolate backing (diagnostic only)'}
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
        <strong style={{ width: 92, fontSize: 12 }}>{['Pan', 'Toaster', 'Toast', 'Towel', 'Plates', 'Kettle', 'Cabinet'][index]}</strong>
        {group.map(layer => <button key={layer} type="button" aria-pressed={visible.has(layer)} disabled={(index === 4 || index === 6) && !cabinetVisible} onClick={() => toggle(layer)}
          style={{ ...controlStyle, opacity: (index === 4 || index === 6) && !cabinetVisible ? .5 : 1, border: `1px solid ${visible.has(layer) ? '#7ce2a5' : '#8b4c48'}` }}>
          {visible.has(layer) ? 'Hide' : 'Show'} {layer}
        </button>)}
      </section>)}
      <p style={{ color: '#b5c3c5', marginTop: 18, lineHeight: 1.5 }}>
        This is a stationary assembly check. The photographed cabinet and shelf surface stay in place while the independent door, upper shelf fascia, hero plate, and remaining stack show proposed static states. Hiding the door exposes an inferred cabinet-face support sampled from the neighboring approved photograph; this remains a diagnostic. Isolating the backing removes the entire cabinet only to inspect layer ownership; its rectangle is not a game frame or accepted damage art. No motion or terminal frame is approved here.
      </p>
    </div>
  </main>;
}
