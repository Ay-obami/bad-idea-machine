// Offline art inspection from the actual React renderer. This does not replace browser QA.
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.argv[2] ?? 'visual-regression/kitchen-proof');
await mkdir(output, { recursive: true });
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { KitchenRoom } = await server.ssrLoadModule('/src/play/KitchenRoom.tsx');
  const data = async path => `data:image/webp;base64,${(await readFile(path)).toString('base64')}`;
  const backgroundSource = await data('public/rooms/kitchen/proof/room.webp');
  const atlasSource = await data('public/rooms/kitchen/proof/objects.webp');
  for (const [name, elapsedMs] of [['intact', 0], ['launch', 900], ['toast-contact', 1050], ['door-contact', 1500], ['plate-fall', 1900], ['aftermath', 4000]]) {
    const svg = renderToStaticMarkup(React.createElement(KitchenRoom, { elapsedMs, backgroundSource, atlasSource }))
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" ');
    await writeFile(resolve(output, `${name}.svg`), svg);
  }
  if (process.argv.includes('--frames')) {
    for (let frame = 0; frame <= 96; frame++) {
      const svg = renderToStaticMarkup(React.createElement(KitchenRoom, { elapsedMs: frame * 1000 / 24, backgroundSource, atlasSource }))
        .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" ');
      await writeFile(resolve(output, `frame-${String(frame).padStart(3, '0')}.svg`), svg);
    }
  }
  console.log(`Rendered kitchen inspection SVGs to ${output}`);
} finally { await server.close(); }
