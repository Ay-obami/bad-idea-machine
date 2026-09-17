import type { EnvironmentId } from '../scene/types';
import type { GalleryRow } from './gallery-data';

type Props = Readonly<{ row: GalleryRow; onChoose: (environment: EnvironmentId) => void }>;

export function EnvironmentRow({ row, onChoose }: Props) {
  return (
    <section className="gallery-room" data-environment={row.environment}>
      <button type="button" className="gallery-room__heading room-choice"
        onClick={() => onChoose(row.environment)} aria-label={row.action}>
        <img src={row.image} alt={`Intact ${row.environment}`} className="room-choice__image" />
        <span className="room-choice__body">
          <strong className="room-choice__title">{row.label}</strong>
          <span className="room-choice__description">{row.subtitle}</span>
          <span className="room-choice__action">{row.action} <span aria-hidden="true">→</span></span>
        </span>
      </button>
    </section>
  );
}
