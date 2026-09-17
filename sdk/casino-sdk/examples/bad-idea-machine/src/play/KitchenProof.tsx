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
    Promise.all([kitchenProofArt.background, kitchenProofArt.atlas].map(src => new Promise<void>((resolve, reject) => {
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
    <header><a href={import.meta.env.BASE_URL}>← Back to game</a><span>CHECKPOINT 2 · MOTION REVISION</span></header>
    <div className="kitchen-proof__intro"><div><p className="kitchen-proof__eyebrow">KITCHEN MELTDOWN</p><h1>One very loose hinge.</h1></div><p>A toaster, a loose cabinet door, and a stack of plates. One connected accident in the same room.</p></div>
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
      <div>{[[0, 'Intact'], [1050, 'Toast contact'], [1230, 'Hinge releases'], [1500, 'Door contact'], [2005, 'First plate impact'], [2295, 'Last plate impact'], [4000, 'Aftermath']].map(([time, label]) => <button key={time} onClick={() => seek(Number(time))}>{label}</button>)}</div>
    </div>
    <p className="kitchen-proof__note">Visual prototype · Intentionally silent. No wager or payout. The complete outcome sequences and contact sound are the next checkpoint. Reduced motion shows the final state; use the frame controls to inspect each contact.</p>
  </main>;
}
