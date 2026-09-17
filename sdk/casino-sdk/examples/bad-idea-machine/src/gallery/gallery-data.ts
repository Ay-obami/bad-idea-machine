import { getEnvironmentArt } from '../environments';
import type { EnvironmentId } from '../scene/types';

export type GalleryRow = Readonly<{
  environment: EnvironmentId;
  label: string;
  subtitle: string;
  image: string;
  action: string;
}>;

export const galleryRows: readonly GalleryRow[] = (['kitchen', 'garage'] as const).map(environment => {
  const art = getEnvironmentArt(environment);
  return {
    environment,
    label: art.label,
    subtitle: art.subtitle,
    image: art.gallery.before,
    action: environment === 'kitchen' ? 'Choose Kitchen' : 'Choose Garage',
  };
});
