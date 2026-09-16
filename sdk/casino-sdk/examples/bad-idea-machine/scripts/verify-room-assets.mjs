import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const required = [
  ...['kitchen', 'garage'].flatMap(room => [
    ...['before', '0x', '1_2x', '3x', '10x', '100x'].map(name => `public/rooms/${room}/gallery/${name}.webp`),
    `public/rooms/${room}/stage/clean.webp`,
    ...['0x', '1_2x', '3x', '10x', '100x'].map(name => `public/rooms/${room}/aftermath/${name}.webp`),
  ]),
  ...['pan','toaster','toast','kettle','cabinet-right','plates','ball','rocket','safe'].map(name => `public/rooms/kitchen/objects/${name}.webp`),
  ...['hammer','wrench','drill','saw','chain','tire','toolbox','shelf','tank','rocket','safe'].map(name => `public/rooms/garage/objects/${name}.webp`),
];

for (const relative of required) {
  const path = resolve(relative);
  await access(path);
  const info = await stat(path);
  if (info.size < 8_000) throw new Error(`${relative} is suspiciously small (${info.size} bytes)`);
}

console.log(`Verified ${required.length} room assets.`);
