import { getEnvironmentArt } from '../environments';
import type { AftermathKey, GalleryStateKey } from '../environments/types';
import type { EnvironmentId } from '../scene/types';

export type GalleryCard = Readonly<{
  key: GalleryStateKey;
  multiplier: string;
  title: string;
  copy: string;
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
  copy: string;
}>[] = [
  { key: 'before', multiplier: 'BEFORE', title: 'ROOM INTACT', copy: 'This is the last good decision you will make.' },
  { key: 'failure', multiplier: '0.00×', title: 'TOTAL FAILURE', copy: 'Maximum regret. Zero payout.' },
  { key: 'minor', multiplier: '1.20×', title: 'MINOR SUCCESS', copy: 'Localized damage. Technically a win.' },
  { key: 'moderate', multiplier: '3.00×', title: 'CONTROLLED CHAOS', copy: 'Several things have stopped being where they belong.' },
  { key: 'severe', multiplier: '10.00×', title: 'MAJOR JACKPOT', copy: 'The room is no longer fit for purpose.' },
  { key: 'legendary', multiplier: '100.00×', title: 'LEGENDARY CHAOS', copy: 'The architecture has joined the incident.' },
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

export const outcomeAccentKeys: readonly AftermathKey[] = ['failure', 'minor', 'moderate', 'severe', 'legendary'];
