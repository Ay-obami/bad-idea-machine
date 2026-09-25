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
    else files.push({ path: relative(distPath, full).replaceAll('\\', '/'), bytes: statSync(full).size });
  }
}
walk(distPath);

if (/\b(?:src|href)=["']\/assets\//.test(html)) {
  throw new Error('Production HTML contains root-absolute /assets references');
}
for (const file of files.filter(file => file.path.endsWith('.css'))) {
  const css = readFileSync(join(distPath, file.path), 'utf8');
  if (css.includes('url(/assets/')) {
    throw new Error(`Production CSS ${file.path} contains root-absolute /assets URLs`);
  }
}

if (files.some(file => file.path.startsWith('cinematic/'))) {
  throw new Error('Retired /cinematic production assets are still present');
}

const rebuildArt = files.filter(file => file.path.startsWith('rooms/kitchen/rebuild/'));
const roomArt = files.filter(file => file.path.startsWith('rooms/') && !file.path.startsWith('rooms/kitchen/rebuild/'));
const foley = files.filter(file => file.path.startsWith('audio/foley/'));
const runtime = files.filter(file =>
  !file.path.startsWith('rooms/') &&
  !file.path.startsWith('audio/foley/')
);
const sum = group => group.reduce((total, file) => total + file.bytes, 0);
const totalBytes = sum(files);
const roomBytes = sum(roomArt);
const rebuildBytes = sum(rebuildArt);
const foleyBytes = sum(foley);
const runtimeBytes = sum(runtime);

if (roomArt.length !== 44) throw new Error(`Production room-art count is ${roomArt.length}; expected 44`);
if (rebuildArt.length > 14) throw new Error(`Kitchen rebuild-art count is ${rebuildArt.length}; limit is 14`);
if (foley.length !== 17) throw new Error(`Production foley count is ${foley.length}; expected 17`);

const budgets = {
  total: 4_600_000,
  runtime: 1_100_000,
  roomArt: 2_100_000,
  foley: 1_150_000,
  rebuildArt: 435_000,
  javascript: 400_000,
  stylesheet: 100_000,
  font: 80_000,
  roomAsset: 150_000,
  rebuildAsset: 160_000,
  foleyAsset: 200_000,
};

function enforce(label, bytes, limit) {
  if (bytes > limit) throw new Error(`${label} is ${bytes} bytes; limit is ${limit}`);
}

enforce('Production bundle', totalBytes, budgets.total);
enforce('Runtime/code/font payload', runtimeBytes, budgets.runtime);
enforce('Authored room-art payload', roomBytes, budgets.roomArt);
enforce('Kitchen rebuild-art payload', rebuildBytes, budgets.rebuildArt);
enforce('Foley payload', foleyBytes, budgets.foley);

for (const file of files) {
  if (file.path.endsWith('.js')) enforce(`JavaScript asset ${file.path}`, file.bytes, budgets.javascript);
  if (file.path.endsWith('.css')) enforce(`Stylesheet ${file.path}`, file.bytes, budgets.stylesheet);
  if (/\.(?:woff2?|ttf|otf)$/.test(file.path)) enforce(`Font asset ${file.path}`, file.bytes, budgets.font);
}
for (const file of roomArt) enforce(`Room-art asset ${file.path}`, file.bytes, budgets.roomAsset);
for (const file of rebuildArt) enforce(`Kitchen rebuild asset ${file.path}`, file.bytes, budgets.rebuildAsset);
for (const file of foley) enforce(`Foley asset ${file.path}`, file.bytes, budgets.foleyAsset);

console.log(`PASS standalone bundle: ${files.length} files, ${totalBytes} bytes total`);
console.log(`  runtime/code/fonts: ${runtimeBytes} / ${budgets.runtime}`);
console.log(`  authored room art: ${roomBytes} / ${budgets.roomArt} (${roomArt.length} files)`);
console.log(`  kitchen rebuild art: ${rebuildBytes} / ${budgets.rebuildArt} (${rebuildArt.length} files)`);
console.log(`  foley: ${foleyBytes} / ${budgets.foley} (${foley.length} files)`);
console.log('PASS manifest + Chain Jam widget present in production output');
console.log('PASS production asset references are relative/subpath-safe');
console.log('PASS retired cinematic assets absent and category budgets enforced');
