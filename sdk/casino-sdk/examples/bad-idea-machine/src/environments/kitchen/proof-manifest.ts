import type { RoomObjectDefinition } from '../../scene/room-model';

const base = import.meta.env.BASE_URL;
export const kitchenProofArt = {
  background: `${base}rooms/kitchen/proof/room.webp`,
  atlas: `${base}rooms/kitchen/proof/objects.webp`,
  width: 1000,
  height: 600,
  objects: [
    { id: 'toaster', sprite: 'toaster', rest: { x: 535, y: 248 }, size: { width: 90, height: 69 }, pivot: { x: 580, y: 316 }, depth: 30, support: 'counter', material: 'metal' },
    { id: 'toast', sprite: 'toast', rest: { x: 550, y: 239 }, size: { width: 28, height: 34 }, pivot: { x: 564, y: 256 }, depth: 20, support: 'toaster-slot', material: 'bread' },
    { id: 'door', sprite: 'door', rest: { x: 500, y: 0 }, size: { width: 109, height: 174 }, pivot: { x: 606, y: 14 }, depth: 25, support: 'upper-right-hinge', material: 'wood' },
    { id: 'plates', sprite: 'plates', rest: { x: 438, y: 145 }, size: { width: 67, height: 20 }, pivot: { x: 471, y: 155 }, depth: 15, support: 'lower-cabinet-shelf', material: 'ceramic' },
  ] satisfies readonly RoomObjectDefinition[],
} as const;

export const kitchenProofObjects = Object.fromEntries(kitchenProofArt.objects.map(object => [object.id, object]));

// Authored silhouette masks in atlas coordinates. The generator supplied opaque RGB,
// so masking is explicit rather than pretending the exported sheet has alpha.
export const kitchenSprites = {
  door: { box: [47, 97, 461, 801], path: 'M48 98H506V897H48Z' },
  toaster: { box: [546, 100, 473, 373], path: 'M550 392L552 198Q555 127 638 106Q657 100 682 102L945 112Q978 116 986 160L987 192L1007 192Q1018 194 1016 211L1008 226L986 230L990 307Q1010 309 1009 337L997 371L986 375L981 433Q973 452 949 451L943 468L919 470L907 458L606 439L596 446L576 442L570 428Q547 423 550 392Z' },
  plates: { box: [1056, 216, 436, 207], path: 'M1058 271C1062 237 1160 217 1279 218C1409 219 1478 239 1488 270L1490 294L1487 305L1487 327L1481 343L1480 360L1468 381C1412 427 1162 438 1083 374L1072 355L1065 336L1063 315L1058 294Z' },
  toast: { box: [589, 554, 302, 335], path: 'M592 858L600 737Q601 704 623 694Q592 665 603 620Q618 577 669 562Q764 531 833 586Q880 617 876 654Q874 678 858 694Q881 706 881 746L889 866Q889 889 867 885L614 879Q590 878 592 858Z' },
  shard1: { box: [949, 580, 229, 186], path: 'M951 708Q1010 599 1175 582L1162 643L1123 762L1083 753Z' },
  shard2: { box: [1200, 602, 162, 151], path: 'M1203 644Q1263 609 1345 605L1358 633L1358 669L1337 708L1307 750L1268 730Z' },
  shard3: { box: [1389, 625, 100, 110], path: 'M1417 628L1442 660L1487 691L1410 733L1392 713L1392 678Z' },
  shard4: { box: [967, 762, 187, 128], path: 'M971 804L1020 765L1091 808L1151 849L1128 877Q1065 905 1005 859Z' },
  shard5: { box: [1141, 737, 119, 104], path: 'M1144 808L1185 742L1209 775L1255 826L1222 837L1183 831Z' },
  shard6: { box: [1250, 746, 240, 131], path: 'M1255 750L1311 776L1486 810L1469 834L1313 875L1300 857Z' },
} as const;
export type KitchenSprite = keyof typeof kitchenSprites;
