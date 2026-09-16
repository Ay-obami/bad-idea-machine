import type { EnvironmentId, ScenePoint } from '../scene/types';

export type AftermathKey = 'failure' | 'minor' | 'moderate' | 'severe' | 'legendary';
export type GalleryStateKey = 'before' | AftermathKey;

export type RoomObjectAsset = Readonly<{
  id: string;
  src: string;
  home: ScenePoint;
  pivot: ScenePoint;
  originZone: string;
  zIndex: number;
  widthPct: number;
}>;

export type EnvironmentArtManifest = Readonly<{
  id: EnvironmentId;
  label: string;
  quote: string;
  subtitle: string;
  cleanPlate: string;
  gallery: Readonly<Record<GalleryStateKey, string>>;
  aftermaths: Readonly<Record<AftermathKey, string>>;
  objects: readonly RoomObjectAsset[];
}>;
