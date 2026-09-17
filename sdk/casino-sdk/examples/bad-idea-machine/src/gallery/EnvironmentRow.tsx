import type { EnvironmentId } from '../scene/types';
import type { GalleryRow } from './gallery-data';
import { OutcomePreviewCard } from './OutcomePreviewCard';

type Props = Readonly<{
  row: GalleryRow;
  onChoose: (environment: EnvironmentId) => void;
}>;

export function EnvironmentRow({ row, onChoose }: Props) {
  return (
    <section className="gallery-room" data-environment={row.environment}>
      <div className="gallery-room__heading-line">
        <button type="button" className="gallery-room__heading" onClick={() => onChoose(row.environment)}>
          <span className="gallery-room__title">{row.label}</span>
          <span className="gallery-room__subtitle">{row.subtitle}</span>
        </button>
        <p className="gallery-room__quote">“{row.quote}”</p>
      </div>

      <div className="gallery-room__rail" role="list" aria-label={`${row.label} outcomes`}>
        {row.cards.map(card => (
          <div role="listitem" key={card.key} className="gallery-room__rail-item">
            <OutcomePreviewCard card={card} onChoose={() => onChoose(row.environment)} />
          </div>
        ))}
      </div>
    </section>
  );
}
