import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { KITCHEN_APPROVED_MASTER } from '../scene/kitchen-master';
import { KITCHEN_CABINET_ARCHITECTURE, KITCHEN_CABINET_DOOR, KITCHEN_TIER1_CERAMIC, KITCHEN_TIER1_FLOOR_CERAMIC_STUDY, KITCHEN_TIER1_PROP_POSE, KITCHEN_TIER2_SOOT_STUDY, KITCHEN_TIER2_CABINET_SOOT_STUDY, KITCHEN_TIER2_GREASE_STUDY, kitchenCabinetDoorPose, kitchenCabinetHasTerminalProps, kitchenCabinetHeroFace, kitchenCabinetStackOffset, kitchenCabinetSurface, type KitchenCabinetMode } from '../scene/kitchen-cabinet-architecture';
import {
  KITCHEN_PAN_TRUTH, KITCHEN_TOAST_TRUTH, KITCHEN_TOWEL_TRUTH,
  KITCHEN_PLATE_TRUTH, KITCHEN_KETTLE_TRUTH, KITCHEN_TOASTER_TRUTH,
  kitchenToasterTruthLayers,
  type KitchenTruthAtlasFrame,
} from '../scene/kitchen-object-truth-proof';

type Layer = 'pan' | 'pan shadow' | 'toaster' | 'toaster cord' | 'toaster wall shadow'
  | 'toaster contact shadow' | 'toaster reflection' | 'hero toast' | 'other toast' | 'toast shadow'
  | 'towel' | 'towel shadow' | 'hero plate' | 'hero plate shadow'
  | 'plate stack' | 'stack shadow' | 'kettle' | 'kettle shadow' | 'kettle reflection' | 'cabinet door'
  | 'ceramic debris' | 'ceramic debris contact' | 'floor ceramic study' | 'floor ceramic contact' | 'cabinet soot study' | 'backsplash soot study' | 'stove grease study';

const layerGroups: readonly (readonly Layer[])[] = [
  ['pan', 'pan shadow'],
  ['toaster', 'toaster cord', 'toaster wall shadow', 'toaster contact shadow', 'toaster reflection'],
  ['hero toast', 'other toast', 'toast shadow'],
  ['towel', 'towel shadow'],
  ['hero plate', 'hero plate shadow', 'plate stack', 'stack shadow'],
  ['kettle', 'kettle shadow', 'kettle reflection'],
  ['cabinet door'],
  ['ceramic debris', 'ceramic debris contact'],
  ['floor ceramic study', 'floor ceramic contact'],
  ['cabinet soot study'],
  ['backsplash soot study'],
  ['stove grease study'],
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
  ceramic: KITCHEN_TIER1_CERAMIC.url,
  floorCeramic: KITCHEN_TIER1_FLOOR_CERAMIC_STUDY.url,
  soot: KITCHEN_TIER2_SOOT_STUDY.url,
  grease: KITCHEN_TIER2_GREASE_STUDY.url,
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

function drawRoom(context: CanvasRenderingContext2D, assets: Record<Asset, HTMLImageElement>, visible: ReadonlySet<Layer>, reference: boolean, cabinetMode: KitchenCabinetMode) {
  context.clearRect(0, 0, 1000, 600);
  context.drawImage(assets.master, 0, 0);
  const cabinetSurface = kitchenCabinetSurface(cabinetMode, reference);
  if (reference) return;
  if (cabinetMode === 'tier2-study' && visible.has('cabinet soot study')) {
    const { x, y, width, height } = KITCHEN_TIER2_CABINET_SOOT_STUDY.bounds;
    context.save();
    context.globalAlpha = KITCHEN_TIER2_CABINET_SOOT_STUDY.opacity;
    context.drawImage(assets.soot, x, y, width, height);
    context.restore();
  }
  if (cabinetMode === 'tier2-study' && visible.has('backsplash soot study')) {
    const { x, y, width, height } = KITCHEN_TIER2_SOOT_STUDY.bounds;
    context.save();
    context.globalAlpha = KITCHEN_TIER2_SOOT_STUDY.opacity;
    context.drawImage(assets.soot, x, y, width, height);
    context.restore();
  }
  const cabinetVisible = cabinetMode !== 'backing-diagnostic';

  // The exact photographed cabinet and the proposed unseen wall are separate
  // local layers; the approved full-room master is never modified.
  const cabinet = KITCHEN_CABINET_ARCHITECTURE.bounds;
  context.clearRect(cabinet.x, cabinet.y, cabinet.width, cabinet.height);
  context.drawImage(assets[cabinetSurface], cabinet.x, cabinet.y);
  if (cabinetVisible) {
    const separated = cabinetDoorLayers(assets.cabinet, assets.master);
    context.drawImage(separated.support, cabinet.x, cabinet.y);
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
  if (cabinetMode === 'tier2-study' && visible.has('stove grease study')) {
    const { x, y, width, height } = KITCHEN_TIER2_GREASE_STUDY.bounds;
    context.save();
    context.globalAlpha = KITCHEN_TIER2_GREASE_STUDY.opacity;
    context.drawImage(assets.grease, x, y, width, height);
    context.restore();
  }
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
    const [x, y] = at(plates.logicalBounds, placement);
    drawCrop('plates', frame, x, y);
  };

  const terminal = kitchenCabinetHasTerminalProps(cabinetMode);
  const panOffset = terminal ? KITCHEN_TIER1_PROP_POSE.pan : { x: 0, y: 0 };
  const panContactOffset = terminal ? KITCHEN_TIER1_PROP_POSE.panContact : { x: 0, y: 0 };
  if (visible.has('pan shadow')) context.drawImage(assets.panShadow, KITCHEN_PAN_TRUTH.logicalBounds.x + panContactOffset.x, KITCHEN_PAN_TRUTH.logicalBounds.y + panContactOffset.y);
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
  if (terminal) drawLayer('toast shadow', 'toast', toast.frames.shadow, KITCHEN_TIER1_PROP_POSE.toastContact.x, KITCHEN_TIER1_PROP_POSE.toastContact.y);
  else drawPlaced('toast shadow', 'toast', toast, toast.frames.shadow, toast.restPlacement.shadow);
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

  if (terminal && visible.has('ceramic debris contact')) {
    const { x, y, width, height } = KITCHEN_TIER1_CERAMIC.bounds;
    context.save();
    context.filter = 'brightness(0) blur(1px)';
    context.globalAlpha = .34;
    context.drawImage(assets.ceramic, x, y + 2, width, height);
    context.restore();
  }
  if (terminal && visible.has('floor ceramic contact')) {
    const { x, y, width, height } = KITCHEN_TIER1_FLOOR_CERAMIC_STUDY.bounds;
    context.save();
    context.filter = 'brightness(0) blur(1px)';
    context.globalAlpha = .27;
    context.drawImage(assets.floorCeramic, x, y + 1, width, height);
    context.restore();
  }

  if (visible.has('pan')) context.drawImage(assets.panBody, KITCHEN_PAN_TRUTH.logicalBounds.x + panOffset.x, KITCHEN_PAN_TRUTH.logicalBounds.y + panOffset.y);
  drawPlaced('other toast', 'toast', toast, toast.frames.remainingBody, toast.restPlacement.remainingBody);
  if (terminal) drawLayer('hero toast', 'toast', toast.frames.body, KITCHEN_TIER1_PROP_POSE.toast.x, KITCHEN_TIER1_PROP_POSE.toast.y);
  else drawPlaced('hero toast', 'toast', toast, toast.frames.body, toast.restPlacement.body);
  drawPlaced('towel', 'towel', towel, towel.frames.body, towel.restPlacement.body);
  if (cabinetVisible) {
    drawPlaced('plate stack', 'plates', plates, plates.frames.stackBody, {
      x: plates.restPlacement.stackBody.x + stackOffset.x,
      y: plates.restPlacement.stackBody.y + stackOffset.y,
    });
    drawHeroPlate('hero plate', plates.frames.heroBody, plates.restPlacement.heroBody);
    if (cabinetMode === 'hinge-stressed' || cabinetMode === 'hinge-dropped' || cabinetMode === 'tier1-terminal') {
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
  if (terminal && visible.has('ceramic debris')) {
    const { x, y, width, height } = KITCHEN_TIER1_CERAMIC.bounds;
    context.drawImage(assets.ceramic, x, y, width, height);
  }
  if (terminal && visible.has('floor ceramic study')) {
    const { x, y, width, height } = KITCHEN_TIER1_FLOOR_CERAMIC_STUDY.bounds;
    context.drawImage(assets.floorCeramic, x, y, width, height);
  }
}

const controlStyle: CSSProperties = {
  padding: '7px 10px', minHeight: 36, borderRadius: 4, cursor: 'pointer',
  background: '#142327', color: '#edf0e9', font: '600 12px Rubik, sans-serif',
};

export function KitchenLocalIntactProof({ initialMode = 'intact' }: { initialMode?: KitchenCabinetMode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cabinetDetail = useRef<HTMLCanvasElement>(null);
  const [assets, setAssets] = useState<Record<Asset, HTMLImageElement> | null>(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState<ReadonlySet<Layer>>(() => new Set(allLayers));
  const [reference, setReference] = useState(false);
  const [showCabinetDetail, setShowCabinetDetail] = useState(false);
  const [cabinetMode, setCabinetMode] = useState<KitchenCabinetMode>(initialMode);
  const cabinetVisible = cabinetMode !== 'backing-diagnostic';

  useEffect(() => {
    let mounted = true;
    loadAssets().then(images => { if (mounted) setAssets(images); }).catch(cause => { if (mounted) setError(String(cause)); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (context && assets) {
      drawRoom(context, assets, visible, reference, cabinetMode);
      const detail = cabinetDetail.current?.getContext('2d');
      if (detail && canvas.current) {
        const { x, y, width, height } = KITCHEN_CABINET_ARCHITECTURE.bounds;
        detail.clearRect(0, 0, width, height);
        detail.drawImage(canvas.current, x, y, width, height, 0, 0, width, height);
      }
    }
  }, [assets, visible, reference, cabinetMode, showCabinetDetail]);

  const toggle = (layer: Layer) => setVisible(previous => {
    const next = new Set(previous);
    if (next.has(layer)) next.delete(layer); else next.add(layer);
    return next;
  });

  return <main style={{ minHeight: '100vh', background: '#071014', color: '#edf0e9', padding: 20, fontFamily: 'Rubik, sans-serif' }}>
    <div style={{ maxWidth: 1100, margin: 'auto' }}>
      <small style={{ color: '#f4cb58' }}>CHECKPOINT 2D · LOCAL STATIONARY ASSEMBLY</small>
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
      <button type="button" aria-pressed={cabinetMode === 'hinge-stressed'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'hinge-stressed' ? 'intact' : 'hinge-stressed')}>
        {cabinetMode === 'hinge-stressed' ? 'Restore intact cabinet' : 'Preview stressed hinge'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'tier1-terminal'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'tier1-terminal' ? 'intact' : 'tier1-terminal')}>
        {cabinetMode === 'tier1-terminal' ? 'Restore intact room' : 'Preview local Tier 1 proposal'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'tier2-study'} style={{ ...controlStyle, border: '1px solid #f4cb58', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'tier2-study' ? 'intact' : 'tier2-study')}>
        {cabinetMode === 'tier2-study' ? 'Restore intact room' : 'Preview Tier 2 residue study'}
      </button>
      <button type="button" aria-pressed={cabinetMode === 'backing-diagnostic'} style={{ ...controlStyle, border: '1px solid #7ce2a5', marginBottom: 12, marginLeft: 8 }} onClick={() => setCabinetMode(mode => mode === 'backing-diagnostic' ? 'intact' : 'backing-diagnostic')}>
        {cabinetMode === 'backing-diagnostic' ? 'Restore cabinet from diagnostic' : 'Isolate backing (diagnostic only)'}
      </button>
      <div style={{ width: '100%', aspectRatio: '5 / 3', background: '#020405' }}>
        <canvas ref={canvas} width={1000} height={600} role="img" aria-label={reference ? 'Approved Kitchen master' : cabinetMode === 'tier2-study' ? 'Kitchen Tier 2 residue visual study' : cabinetMode === 'tier1-terminal' ? 'Local Kitchen Tier 1 stationary proposal' : 'Layered Kitchen intact reconstruction'} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <button type="button" aria-pressed={showCabinetDetail} style={{ ...controlStyle, border: '1px solid #f4cb58', marginTop: 12 }} onClick={() => setShowCabinetDetail(value => !value)}>
        {showCabinetDetail ? 'Close cabinet detail' : 'Inspect cabinet close-up'}
      </button>
      {showCabinetDetail ? <div style={{ marginTop: 10, maxWidth: 615 }}>
        <canvas ref={cabinetDetail} width={KITCHEN_CABINET_ARCHITECTURE.bounds.width} height={KITCHEN_CABINET_ARCHITECTURE.bounds.height}
          role="img" aria-label={reference ? 'Approved cabinet detail' : 'Layered cabinet detail'}
          style={{ display: 'block', width: '100%', height: 'auto' }} />
        <small style={{ color: '#b5c3c5' }}>The same cabinet pixels enlarged three times; the room above remains at its original camera.</small>
      </div> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!assets && !error ? <p>Loading approved local assets…</p> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
        <button type="button" style={{ ...controlStyle, border: '1px solid #7ce2a5' }} onClick={() => setVisible(new Set(allLayers))}>Show all</button>
        <button type="button" style={{ ...controlStyle, border: '1px solid #8b4c48' }} onClick={() => setVisible(kitchenCabinetHasTerminalProps(cabinetMode) ? new Set<Layer>(['cabinet door']) : new Set<Layer>())}>
          {kitchenCabinetHasTerminalProps(cabinetMode) ? 'Hide props, contacts, and damage' : 'Hide extracted layers'}
        </button>
      </div>
      {layerGroups.map((group, index) => <section key={group[0]} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 10 }}>
        <strong style={{ width: 92, fontSize: 12 }}>{['Pan', 'Toaster', 'Toast', 'Towel', 'Plates', 'Kettle', 'Cabinet', 'Debris', 'Floor', 'Upper soot', 'Backsplash', 'Stove'][index]}</strong>
        {group.map(layer => { const disabled = ((index === 4 || index === 6) && !cabinetVisible) ||
          ((layer === 'hero plate' || layer === 'hero plate shadow') && kitchenCabinetHasTerminalProps(cabinetMode)) ||
          ((index === 7 || index === 8) && !kitchenCabinetHasTerminalProps(cabinetMode)) ||
          ((index === 9 || index === 10 || index === 11) && cabinetMode !== 'tier2-study');
          const absent = kitchenCabinetHasTerminalProps(cabinetMode) && (layer === 'hero plate' || layer === 'hero plate shadow');
          return <button key={layer} type="button" aria-pressed={absent ? false : visible.has(layer)} disabled={disabled} onClick={() => toggle(layer)}
          style={{ ...controlStyle, opacity: disabled ? .5 : 1, border: `1px solid ${!absent && visible.has(layer) ? '#7ce2a5' : '#8b4c48'}` }}>
          {absent ? layer === 'hero plate' ? 'Hero plate absent (broken)' : 'Hero plate contact absent' : `${visible.has(layer) ? 'Hide' : 'Show'} ${layer}`}
        </button>; })}
      </section>)}
      <p style={{ color: '#b5c3c5', marginTop: 18, lineHeight: 1.5 }}>
        This is a stationary assembly check. The photographed cabinet and clean shelf stay in their approved positions while the independent door, hero plate, remaining stack, and their contact shadows can be inspected. The local Tier 1 pose replaces the whole hero plate with proposed stove ceramic and separately controlled wood-floor ceramic and contacts. These are bounded static studies, not a finished ending or a gameplay frame. The shelf-fascia extraction and loose-shelf trial failed visual review and are withdrawn. Hiding the door exposes an inferred cabinet-face support sampled from the neighboring approved photograph; this remains a diagnostic. Isolating the backing removes the entire cabinet only to inspect layer ownership; its rectangle is not accepted damage art. No motion is approved here.
      </p>
    </div>
  </main>;
}
