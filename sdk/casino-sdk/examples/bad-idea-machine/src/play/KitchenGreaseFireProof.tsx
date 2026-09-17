import { useEffect, useRef, useState } from 'react';
import { kitchenProofArt } from '../environments/kitchen/proof-manifest';
import { greaseFireFrame, KITCHEN_GREASE_FIRE_DURATION } from '../scene/kitchen-grease-fire';
import { KitchenRoom } from './KitchenRoom';
import '../styles/kitchen-proof.css';

const panSource = `${import.meta.env.BASE_URL}rooms/kitchen/objects/pan.webp`;

export default function KitchenGreaseFireProof() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [width, setWidth] = useState('100%');
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const clock = useRef(0);
  const frame = greaseFireFrame(elapsed);

  useEffect(() => {
    let active = true;
    setAssetStatus('loading');
    const timeout = window.setTimeout(() => { if (active) setAssetStatus('error'); }, 12000);
    Promise.all([kitchenProofArt.background, kitchenProofArt.atlas, panSource].map(src => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Kitchen art unavailable'));
      image.src = src;
    }))).then(() => {
      if (active) {
        clearTimeout(timeout);
        setAssetStatus('ready');
      }
    }).catch(() => {
      if (active) {
        clearTimeout(timeout);
        setAssetStatus('error');
      }
    });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [retry]);

  useEffect(() => {
    if (!running) return;
    let request = 0;
    const tick = (now: number) => {
      const time = Math.min(KITCHEN_GREASE_FIRE_DURATION, now - clock.current);
      setElapsed(time);
      if (time < KITCHEN_GREASE_FIRE_DURATION) request = requestAnimationFrame(tick);
      else setRunning(false);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [running]);

  function seek(time: number) {
    setRunning(false);
    setElapsed(time);
  }

  function play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      seek(KITCHEN_GREASE_FIRE_DURATION);
      return;
    }
    setElapsed(0);
    clock.current = performance.now();
    setRunning(true);
  }

  return <main className="kitchen-proof">
    <header><a href={import.meta.env.BASE_URL}>← Back to game</a><span>CHECKPOINT 3A · SINGLE-CHAIN REALISM GATE</span></header>
    <div className="kitchen-proof__intro">
      <div><p className="kitchen-proof__eyebrow">KITCHEN MELTDOWN REBUILD</p><h1>One accident. One physical world.</h1></div>
      <p>The accepted hinge-and-plate sequence is untouched. One real ceramic fragment must physically knock a supported pan before oil can reach the burner and ignite.</p>
    </div>
    <div className="kitchen-proof__frame" style={{ width, maxWidth: '100%' }}>
      <KitchenRoom elapsedMs={elapsed} chain="grease-fire" />
    </div>
    <div className="kitchen-proof__caption" role="status">
      {assetStatus === 'loading' ? 'Loading kitchen artwork…' : assetStatus === 'error' ? 'Kitchen artwork could not load.' : frame.label}
    </div>
    <div className="kitchen-proof__controls">
      <button className="kitchen-proof__play" onClick={play} disabled={assetStatus !== 'ready' || running}>{running ? 'Accident in progress…' : elapsed > 0 ? 'Replay the chain' : 'Start the chain'}</button>
      <button onClick={() => seek(0)}>Reset room</button>
      {assetStatus === 'error' && <button onClick={() => setRetry(value => value + 1)}>Retry artwork</button>}
      <label>Preview width<select value={width} onChange={event => setWidth(event.target.value)}><option value="100%">Fit screen</option><option value="390px">390 px</option><option value="360px">360 px</option></select></label>
    </div>
    <div className="kitchen-proof__inspection">
      <label htmlFor="grease-proof-time">Inspect motion <output>{(elapsed / 1000).toFixed(2)} s</output></label>
      <input id="grease-proof-time" type="range" min="0" max={KITCHEN_GREASE_FIRE_DURATION} step="10" value={elapsed} onChange={event => seek(Number(event.target.value))} />
      <div>{[
        [0, 'Intact room'],
        [2215, 'Plate impact'],
        [2500, 'Shard crossing'],
        [2820, 'Shard hits handle'],
        [3500, 'Pan settles tipped'],
        [4180, 'Oil almost at burner'],
        [4480, 'Ignition begins'],
        [5600, 'Localized fire'],
        [7200, 'Persistent aftermath'],
      ].map(([time, label]) => <button key={time} onClick={() => seek(Number(time))}>{label}</button>)}</div>
    </div>
    <p className="kitchen-proof__note">Visual rebuild gate · Intentionally isolated from wagers, tiers and the production Kitchen path. No second overlay renderer and no full-frame aftermath replacement. This chain must pass deployed motion review before any second Kitchen chain is added.</p>
  </main>;
}
