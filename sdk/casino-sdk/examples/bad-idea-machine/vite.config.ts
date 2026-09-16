import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

// The game runs inside the host's iframe on a different origin, and the host
// fetches /game.manifest.json cross-origin — CORS must stay open.
//
// Keep production assets relative so the exact verified dist can also be served
// from an immutable subpath/CDN during submission QA without breaking fonts or
// other generated assets.
export default defineConfig({
  base: './',
  plugins: [viteReact()],
  server: { port: 3100, cors: true },
  preview: { port: 3100, cors: true },
});
