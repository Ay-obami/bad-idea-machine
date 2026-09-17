import type { GalleryCard } from './gallery-data';

type Props = Readonly<{
  card: GalleryCard;
  onChoose: () => void;
}>;

export function OutcomePreviewCard({ card, onChoose }: Props) {
  return (
    <button
      type="button"
      className={`gallery-card gallery-card--${card.key}`}
      data-gallery-state={card.key}
      onClick={onChoose}
      aria-label={`${card.multiplier} ${card.title}`}
    >
      <span className="gallery-card__image-wrap">
        <img src={card.image} alt="" className="gallery-card__image" loading="lazy" />
      </span>
      <span className="gallery-card__body">
        <strong className="gallery-card__multiplier">{card.multiplier}</strong>
        <span className="gallery-card__title">{card.title}</span>
      </span>
    </button>
  );
}
