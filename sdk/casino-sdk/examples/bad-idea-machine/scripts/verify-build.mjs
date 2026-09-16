import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const distPath = dist.pathname;
const indexPath = join(distPath, 'index.html');
const manifestPath = join(distPath, 'game.manifest.json');

if (!existsSync(indexPath)) throw new Error('dist/index.html is missing');
if (!existsSync(manifestPath)) throw new Error('dist/game.manifest.json is missing');

const html = readFileSync(indexPath, 'utf8');
if (!html.includes('<title>Bad Idea Machine</title>')) {
  throw new Error('Production HTML lost the Bad Idea Machine title');
}
if (!html.includes('https://jam.chain.wtf/widget.js')) {
  throw new Error('Production HTML does not contain the Chain Jam widget');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.gameId !== 'BadIdeaMachineGame') throw new Error('Production manifest gameId mismatch');
if (manifest.locales?.en?.name !== 'Bad Idea Machine') throw new Error('Production manifest name mismatch');
if (manifest.capabilities?.openSession !== true) throw new Error('Production manifest cannot open sessions');

const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push({ path: relative(distPath, full), bytes: statSync(full).size });
  }
}
walk(distPath);

// The standalone artifact is also published from an immutable subpath/CDN during
// submission QA. Root-absolute asset references break there (notably font URLs
// such as /assets/*.woff2), so all generated bundle references must stay relative.
if (/\b(?:src|href)=["']\/assets\//.test(html)) {
  throw new Error('Production HTML contains root-absolute /assets references');
}
for (const file of files.filter(file => file.path.endsWith('.css'))) {
  const css = readFileSync(join(distPath, file.path), 'utf8');
  if (css.includes('url(/assets/')) {
    throw new Error(`Production CSS ${file.path} contains root-absolute /assets URLs`);
  }
}

const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const largest = [...files].sort((a, b) => b.bytes - a.bytes)[0];
const MAX_TOTAL_BYTES = 2_500_000;
const MAX_SINGLE_ASSET_BYTES = 800_000;

if (totalBytes > MAX_TOTAL_BYTES) {
  throw new Error(`Production bundle is ${totalBytes} bytes; limit is ${MAX_TOTAL_BYTES}`);
}
if (largest && largest.bytes > MAX_SINGLE_ASSET_BYTES) {
  throw new Error(`Largest production asset ${largest.path} is ${largest.bytes} bytes; limit is ${MAX_SINGLE_ASSET_BYTES}`);
}

console.log(`PASS standalone bundle: ${files.length} files, ${totalBytes} bytes total`);
if (largest) console.log(`Largest asset: ${largest.path} (${largest.bytes} bytes)`);
console.log('PASS manifest + Chain Jam widget present in production output');
console.log('PASS production asset references are relative/subpath-safe');
