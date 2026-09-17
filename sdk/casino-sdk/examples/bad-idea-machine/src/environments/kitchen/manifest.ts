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
    src: `/rooms/kitchen/objects/${id}.webp`,
    home: { x, y },
    pivot: { x: pivotX, y: pivotY },
    originZone,
    zIndex,
    widthPct,
  };
}

export const kitchenArt: EnvironmentArtManifest = {
  id: 'kitchen',
  label: 'KITCHEN MELTDOWN',
  quote: 'Same kitchen. Different levels of regret.',
  subtitle: 'Everyday appliances. Extraordinarily bad ideas.',
  cleanPlate: '/rooms/kitchen/stage/clean.webp',
  gallery: {
    before: '/rooms/kitchen/gallery/before.webp',
    failure: '/rooms/kitchen/gallery/0x.webp',
    minor: '/rooms/kitchen/gallery/1_2x.webp',
    moderate: '/rooms/kitchen/gallery/3x.webp',
    severe: '/rooms/kitchen/gallery/10x.webp',
    legendary: '/rooms/kitchen/gallery/100x.webp',
  },
  aftermaths: {
    failure: '/rooms/kitchen/aftermath/0x.webp',
    minor: '/rooms/kitchen/aftermath/1_2x.webp',
    moderate: '/rooms/kitchen/aftermath/3x.webp',
    severe: '/rooms/kitchen/aftermath/10x.webp',
    legendary: '/rooms/kitchen/aftermath/100x.webp',
  },
  objects: [
    object('toaster', 150, 355, 150, 355, 'left-counter', 32, 9),
    object('toast', 160, 305, 160, 305, 'toaster-slot', 38, 5),
    object('pan', 470, 285, 470, 285, 'stove', 36, 11),
    object('kettle', 615, 350, 615, 350, 'right-counter', 35, 8),
    object('cabinet-right', 320, 145, 278, 145, 'upper-cabinet-right', 18, 11),
    object('plates', 435, 155, 435, 155, 'upper-storage', 24, 8),
    object('ball', 790, 115, 790, 115, 'upper-storage', 42, 7),
    object('rocket', 835, 425, 835, 425, 'rocket-crate-right', 52, 8),
    object('safe', 690, 95, 690, 95, 'ceiling-right', 55, 10),
  ],
};
