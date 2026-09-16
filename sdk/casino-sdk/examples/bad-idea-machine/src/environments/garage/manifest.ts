import type { EnvironmentArtManifest, RoomObjectAsset } from '../types';

function object(
  id: string,
  x: number,
  y: number,
  pivotX: number,
  pivotY: number,
  originZone: string,
  zIndex: number,
  widthPct: number,
): RoomObjectAsset {
  return {
    id,
    src: `/rooms/garage/objects/${id}.webp`,
    home: { x, y },
    pivot: { x: pivotX, y: pivotY },
    originZone,
    zIndex,
    widthPct,
  };
}

export const garageArt: EnvironmentArtManifest = {
  id: 'garage',
  label: 'GARAGE MAYHEM',
  quote: 'Same garage. Bigger problems.',
  subtitle: 'Tools, toys and terrible decisions.',
  cleanPlate: '/rooms/garage/stage/clean.webp',
  gallery: {
    before: '/rooms/garage/gallery/before.webp',
    failure: '/rooms/garage/gallery/0x.webp',
    minor: '/rooms/garage/gallery/1_2x.webp',
    moderate: '/rooms/garage/gallery/3x.webp',
    severe: '/rooms/garage/gallery/10x.webp',
    legendary: '/rooms/garage/gallery/100x.webp',
  },
  aftermaths: {
    failure: '/rooms/garage/aftermath/0x.webp',
    minor: '/rooms/garage/aftermath/1_2x.webp',
    moderate: '/rooms/garage/aftermath/3x.webp',
    severe: '/rooms/garage/aftermath/10x.webp',
    legendary: '/rooms/garage/aftermath/100x.webp',
  },
  objects: [
    object('hammer', 165, 205, 165, 205, 'pegboard-left', 40, 7),
    object('wrench', 245, 180, 245, 180, 'pegboard-left', 39, 6),
    object('drill', 350, 355, 350, 355, 'workbench-left', 43, 9),
    object('saw', 470, 350, 470, 350, 'workbench-center', 42, 10),
    object('chain', 585, 135, 585, 72, 'tool-wall-chain-hook', 34, 7),
    object('tire', 115, 445, 115, 445, 'floor-left', 48, 12),
    object('toolbox', 525, 445, 525, 445, 'floor-center', 31, 13),
    object('shelf', 760, 155, 720, 155, 'rack-right', 22, 14),
    object('tank', 895, 420, 895, 420, 'utility-right', 33, 8),
    object('rocket', 825, 365, 825, 365, 'rocket-rack-right', 54, 8),
    object('safe', 865, 95, 865, 95, 'ceiling-right', 56, 10),
  ],
};
