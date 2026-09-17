import { getEnvironmentArt } from '../environments';
import type { GalleryStateKey } from '../environments/types';
import type { EnvironmentId } from '../scene/types';

export type GalleryCard = Readonly<{
  key: GalleryStateKey;
  multiplier: string;
  title: string;
  image: string;
}>;

export type GalleryRow = Readonly<{
  environment: EnvironmentId;
  label: string;
  subtitle: string;
  quote: string;
  cards: readonly GalleryCard[];
}>;

const cardDefinitions: readonly Readonly<{
  key: GalleryStateKey;
  multiplier: string;
  title: string;
}>[] = [
  { key: 'before', multiplier: 'BEFORE', title: 'ROOM INTACT' },
  { key: 'failure', multiplier: '0.00×', title: 'TOTAL FAILURE' },
  { key: 'minor', multiplier: '1.20×', title: 'MINOR SUCCESS' },
  { key: 'moderate', multiplier: '3.00×', title: 'CONTROLLED CHAOS' },
  { key: 'severe', multiplier: '10.00×', title: 'MAJOR JACKPOT' },
  { key: 'legendary', multiplier: '100.00×', title: 'LEGENDARY CHAOS' },
] as const;

function buildRow(environment: EnvironmentId): GalleryRow {
  const art = getEnvironmentArt(environment);
  return {
    environment,
    label: art.label,
    subtitle: art.subtitle,
    quote: art.quote,
    cards: cardDefinitions.map(definition => ({
      ...definition,
      image: art.gallery[definition.key],
    })),
  };
}

export const galleryRows: readonly GalleryRow[] = [buildRow('kitchen'), buildRow('garage')];
