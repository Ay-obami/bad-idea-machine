import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const names = [
  'kitchen-toaster-pop',
  'kitchen-steam-hiss',
  'kitchen-ceramic-break',
  'kitchen-pan-hit',
  'garage-drill',
  'garage-saw',
  'garage-chain',
  'garage-tire',
  'metal-impact',
  'wood-crack',
  'heavy-crash',
  'rocket-whoosh',
  'sparks-burst',
  'debris-fall',
  'fire-crackle',
  'kitchen-aftermath',
  'garage-aftermath',
];

for (const name of names) {
  const relative = `public/audio/foley/${name}.wav`;
  const path = resolve(relative);
  const info = await stat(path);
  if (info.size < 8_000) throw new Error(`${relative} is suspiciously small (${info.size} bytes)`);

  const header = await readFile(path, { encoding: null });
  if (header.subarray(0, 4).toString('ascii') !== 'RIFF' || header.subarray(8, 12).toString('ascii') !== 'WAVE') {
    throw new Error(`${relative} is not a PCM WAV file`);
  }
}

console.log(`Verified ${names.length} production foley assets.`);
