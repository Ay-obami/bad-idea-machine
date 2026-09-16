import type { EnvironmentId } from '../scene/types';
import { garageArt } from './garage/manifest';
import { kitchenArt } from './kitchen/manifest';
import type { EnvironmentArtManifest } from './types';

export { garageArt } from './garage/manifest';
export { kitchenArt } from './kitchen/manifest';
export type {
  AftermathKey,
  EnvironmentArtManifest,
  GalleryStateKey,
  RoomObjectAsset,
} from './types';

export function getEnvironmentArt(environment: EnvironmentId): EnvironmentArtManifest {
  return environment === 'kitchen' ? kitchenArt : garageArt;
}
