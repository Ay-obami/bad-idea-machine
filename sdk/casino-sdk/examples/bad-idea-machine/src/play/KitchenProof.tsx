import { useEffect, useRef, useState } from 'react';
import { kitchenProofArt } from '../environments/kitchen/proof-manifest';
import { kitchenFrame, KITCHEN_PROOF_DURATION } from '../scene/kitchen-proof';
import { KitchenRoom } from './KitchenRoom';
import '../styles/kitchen-proof.css';

export default function KitchenProof() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [width, setWidth] = useState('100%');
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const clock = useRef(0);
  const frame = kitchenFrame(elapsed);

  useEffect(() => {
    let active = true;
    setAssetStatus('loading');
    const timeout = window.setTimeout(() => { if (active) setAssetStatus('error'); }, 12000);
    Promise.all([
      kitchenProofArt.background,
      kitchenProofArt.atlas,
      `${import.meta.env.BASE_URL}rooms/kitchen/objects/pan.webp`,
    ].map(src => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Kitchen art unavailable'));
      image.src = src;
    }))).then(() => { if (active) { clearTimeout(timeout); setAssetStatus('ready'); } })
      .catch(() => { if (active) { clearTimeout(timeout); setAssetStatus('error'); } });
    return () => { active = false; clearTimeout(timeout); };
  }, [retry]);

  useEffect(() => {
    if (!running) return;
    let request = 0;
    const tick = (now: number) => {
      const time = Math.min(KITCHEN_PROOF_DURATION, now - clock.current);
      setElapsed(time);
      if (time < KITCHEN_PROOF_DURATION) request = requestAnimationFrame(tick);
      else setRunning(false);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [running]);

  function seek(time: number) { setRunning(false); setElapsed(time); }
  function play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { seek(KITCHEN_PROOF_DURATION); return; }
    setElapsed(0);
    clock.current = performance.now();
    setRunning(true);
  }

  return <main className="kitchen-proof">
    <header><a href={import.meta.env.BASE_URL}>← Back to game</a><span>CHECKPOINT 3A · PHYSICAL CHAIN 1</span></header>
    <div className="kitchen-proof__intro"><div><p className="kitchen-proof__eyebrow">KITCHEN MELTDOWN</p><h1>One accident keeps going.</h1></div><p>The accepted hinge-and-plate sequence now continues into one grounded stove interaction. No second destruction renderer and no tier art yet.</p></div>
    <div className="kitchen-proof__frame" style={{ width, maxWidth: '100%' }}>
      <KitchenRoom elapsedMs={elapsed} />
    </div>
    <div className="kitchen-proof__caption" role="status">{assetStatus === 'loading' ? 'Loading kitchen artwork…' : assetStatus === 'error' ? 'Kitchen artwork could not load.' : frame.label}</div>
    <div className="kitchen-proof__controls">
      <button className="kitchen-proof__play" onClick={play} disabled={assetStatus !== 'ready' || running}>{running ? 'Accident in progress…' : elapsed > 0 ? 'Replay the accident' : 'Start the accident'}</button>
      <button onClick={() => seek(0)}>Reset room</button>
      {assetStatus === 'error' && <button onClick={() => setRetry(value => value + 1)}>Retry artwork</button>}
      <label>Preview width<select value={width} onChange={event => setWidth(event.target.value)}><option value="100%">Fit screen</option><option value="390px">390 px</option><option value="360px">360 px</option></select></label>
    </div>
    <div className="kitchen-proof__inspection">
      <label htmlFor="proof-time">Inspect motion <output>{(elapsed / 1000).toFixed(2)} s</output></label>
      <input id="proof-time" type="range" min="0" max={KITCHEN_PROOF_DURATION} step="10" value={elapsed} onChange={event => seek(Number(event.target.value))} />
      <div>{[
        [0, 'Intact'],
        [1050, 'Toast contact'],
        [1500, 'Door hanging'],
        [1660, 'Door hits plate'],
        [2395, 'Shard launches'],
        [3295, 'Shard hits pan'],
        [3700, 'Pan tips / grease starts'],
        [4450, 'Grease reaches burner'],
        [5200, 'Localized fire'],
        [6000, 'Persistent aftermath'],
      ].map(([time, label]) => <button key={time} onClick={() => seek(Number(time))}>{label}</button>)}</div>
    </div>
    <p className="kitchen-proof__note">Checkpoint 3A visual prototype · Intentionally one chain only. The approved hinge/door/plate physics remain the foundation. The pan is present from frame zero; motion starts only after visible ceramic contact; grease stays on the stove surface; fire begins only where grease reaches the hot burner. No payout/tier reveal is being judged in this gate.</p>
  </main>;
}
