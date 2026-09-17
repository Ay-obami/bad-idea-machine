import type { EnvironmentId } from '../scene/types';
import { EnvironmentRow } from './EnvironmentRow';
import { galleryRows } from './gallery-data';

type Props = Readonly<{
  onChoose: (environment: EnvironmentId) => void;
}>;

export function GalleryScreen({ onChoose }: Props) {
  const scrollToRooms = () => {
    document.querySelector('[data-environment="kitchen"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="reference-gallery">
      <header className="reference-gallery__header">
        <div className="reference-gallery__brand">
          <span className="reference-gallery__badge">BIM</span>
          <span className="reference-gallery__brand-copy">
            <strong>BAD IDEA MACHINE</strong>
            <small>CHOOSE YOUR ROOM. DESTROY IT RESPONSIBLY.</small>
          </span>
        </div>
        <nav className="reference-gallery__nav" aria-label="Bad Idea Machine">
          <a href="#how-it-works">HOW IT WORKS</a>
          <a href="#provably-fair">PROVABLY FAIR</a>
          <a href="#leaderboard">LEADERBOARD</a>
          <button type="button" className="reference-gallery__wallet" aria-label="Wallet status">WALLET</button>
        </nav>
      </header>

      <div className="reference-gallery__content">
        {galleryRows.map(row => (
          <EnvironmentRow key={row.environment} row={row} onChoose={onChoose} />
        ))}
      </div>

      <footer className="reference-gallery__footer">
        <div className="reference-gallery__footer-brand">
          <span className="reference-gallery__badge reference-gallery__badge--footer">BIM</span>
          <div>
            <strong>BAD IDEA MACHINE</strong>
            <span>SAME BUTTON. DIFFERENT DISASTER.</span>
          </div>
        </div>
        <button type="button" className="reference-gallery__cta" onClick={scrollToRooms}>
          CHOOSE YOUR CHAOS <span aria-hidden>→</span>
        </button>
      </footer>
    </main>
  );
}
