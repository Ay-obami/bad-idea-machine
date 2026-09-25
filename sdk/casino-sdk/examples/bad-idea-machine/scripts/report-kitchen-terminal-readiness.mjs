import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });

try {
  const { KITCHEN_TERMINAL_LAYER_PLAN } = await server.ssrLoadModule('/src/scene/kitchen-terminal-layer-plan.ts');
  const { kitchenTerminalSourceEvidence } = await server.ssrLoadModule('/src/scene/kitchen-terminal-source-coverage.ts');
  const byTier = new Map();
  const uniqueSources = new Map();
  for (const layer of KITCHEN_TERMINAL_LAYER_PLAN) {
    const present = existsSync(fileURLToPath(new URL(`../public${layer.path}`, import.meta.url)));
    uniqueSources.set(layer.path, present);
    const tier = byTier.get(layer.tier) ?? { present: 0, missing: [], direct: 0, composition: 0, study: 0, unmapped: 0 };
    if (present) tier.present++;
    else tier.missing.push(layer);
    const evidence = kitchenTerminalSourceEvidence(layer);
    if (!present) {
      if (evidence && existsSync(fileURLToPath(new URL(`../public${evidence.url}`, import.meta.url)))) tier[evidence.status]++;
      else tier.unmapped++;
    }
    byTier.set(layer.tier, tier);
  }

  for (const [tier, { present, missing, direct, composition, study, unmapped }] of [...byTier].sort(([a], [b]) => a - b)) {
    const byKind = Object.groupBy(missing, layer => layer.kind);
    const counts = Object.entries(byKind).map(([kind, layers]) => `${kind} ${layers.length}`).join(', ');
    process.stdout.write(`Tier ${tier}: ${present}/${present + missing.length} terminal paths exist; missing ${counts}\n`);
    process.stdout.write(`  Local evidence: ${direct} direct, ${composition} need composition, ${study} visual studies; no evidence for ${unmapped}\n`);
    if (process.argv.includes('--details')) {
      for (const layer of missing) {
        const evidence = kitchenTerminalSourceEvidence(layer);
        process.stdout.write(`  ${layer.path}${evidence ? ` [${evidence.status}: ${evidence.url}${evidence.frame ? `#${evidence.frame}` : ''}]` : ' [new art required]'}\n`);
      }
    }
  }
  const totalMissing = [...uniqueSources.values()].filter(present => !present).length;
  process.stdout.write(`Static terminal art gate: ${totalMissing === 0 ? 'sources present; visual approval still required' : `${totalMissing} unique sources missing across ${KITCHEN_TERMINAL_LAYER_PLAN.length} tier references; blocked`}\n`);
  if (process.argv.includes('--strict') && totalMissing > 0) process.exitCode = 1;
} finally {
  await server.close();
}
