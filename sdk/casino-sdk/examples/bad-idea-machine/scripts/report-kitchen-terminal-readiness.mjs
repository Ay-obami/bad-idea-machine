import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });

try {
  const { KITCHEN_TERMINAL_LAYER_PLAN } = await server.ssrLoadModule('/src/scene/kitchen-terminal-layer-plan.ts');
  const byTier = new Map();
  const uniqueSources = new Map();
  for (const layer of KITCHEN_TERMINAL_LAYER_PLAN) {
    const present = existsSync(fileURLToPath(new URL(`../public${layer.path}`, import.meta.url)));
    uniqueSources.set(layer.path, present);
    const tier = byTier.get(layer.tier) ?? { present: 0, missing: [] };
    if (present) tier.present++;
    else tier.missing.push(layer);
    byTier.set(layer.tier, tier);
  }

  for (const [tier, { present, missing }] of [...byTier].sort(([a], [b]) => a - b)) {
    const byKind = Object.groupBy(missing, layer => layer.kind);
    const counts = Object.entries(byKind).map(([kind, layers]) => `${kind} ${layers.length}`).join(', ');
    process.stdout.write(`Tier ${tier}: ${present}/${present + missing.length} terminal paths exist; missing ${counts}\n`);
    if (process.argv.includes('--details')) {
      for (const layer of missing) process.stdout.write(`  ${layer.path}\n`);
    }
  }
  const totalMissing = [...uniqueSources.values()].filter(present => !present).length;
  process.stdout.write(`Static terminal art gate: ${totalMissing === 0 ? 'sources present; visual approval still required' : `${totalMissing} unique sources missing across ${KITCHEN_TERMINAL_LAYER_PLAN.length} tier references; blocked`}\n`);
  if (process.argv.includes('--strict') && totalMissing > 0) process.exitCode = 1;
} finally {
  await server.close();
}
