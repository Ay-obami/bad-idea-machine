import type { EnvironmentId } from '../scene/types';
import { EnvironmentRow } from './EnvironmentRow';
import { galleryRows } from './gallery-data';

type Props = Readonly<{ onChoose: (environment: EnvironmentId) => void }>;

export function GalleryScreen({ onChoose }: Props) {
  return (
    <main className="reference-gallery">
      <header className="reference-gallery__header">
        <a className="reference-gallery__brand" href="#rooms" aria-label="Bad Idea Machine rooms">
          <span className="reference-gallery__badge" aria-hidden="true">BIM</span>
          <strong>BAD IDEA MACHINE</strong>
        </a>
        <span className="reference-gallery__demo">Playable demo · No real funds</span>
      </header>
      <section className="reference-gallery__intro" id="rooms" aria-labelledby="room-choice-title">
        <span className="reference-gallery__eyebrow">ONE BUTTON. TWO BAD IDEAS.</span>
        <h1 id="room-choice-title">Choose your chaos.</h1>
        <p>Pick a room. Set your wager. See what goes wrong.</p>
      </section>
      <div className="reference-gallery__content">
        {galleryRows.map(row => <EnvironmentRow key={row.environment} row={row} onChoose={onChoose} />)}
      </div>
      <details className="game-rules">
        <summary>How to play</summary>
        <ol>
          <li>Choose Kitchen or Garage. The room changes the scene, never the odds.</li>
          <li>Choose a risk profile and wager. Check its loss probability and payout table before playing.</li>
          <li>Press the button. The result is determined before the animation, with no mid-round cash-out.</li>
        </ol>
        <p>Returns include your stake. The theoretical RTP is 96% before rounding, not a guarantee for any session. You can lose the entire wager.</p>
        <p>This standalone demo uses browser randomness and demo credits. Chain-hosted play uses the casino contract and Chain VRF; wallet setup happens in the host.</p>
      </details>
      <footer className="reference-gallery__footer">Same button. Different disaster.</footer>
    </main>
  );
}
