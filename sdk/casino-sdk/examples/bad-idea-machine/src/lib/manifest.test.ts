import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { canonicalCasinoGameId, validateCasinoGameManifest } from '@chain/casino-sdk';

const manifestPath = fileURLToPath(new URL('../../public/game.manifest.json', import.meta.url));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;

describe('Bad Idea Machine manifest', () => {
  it('passes the SDK manifest validator', () => {
    const result = validateCasinoGameManifest(manifest);
    expect(result.ok).toBe(true);
  });

  it('canonicalizes to the deployed contract identity', () => {
    const result = validateCasinoGameManifest(manifest);
    if (!result.ok) throw new Error(result.reason);

    expect(canonicalCasinoGameId(result.manifest.gameId)).toBe(
      canonicalCasinoGameId('BadIdeaMachineGame'),
    );
    expect(canonicalCasinoGameId(result.manifest.gameId)).toBe('badideamachine');
  });

  it('declares only the capabilities this instant game actually uses', () => {
    const result = validateCasinoGameManifest(manifest);
    if (!result.ok) throw new Error(result.reason);

    expect(result.manifest.capabilities).toEqual({
      openSession: true,
      submitAction: false,
      forfeitExpiredSession: false,
      cancelStuckRandomness: true,
      resize: true,
    });
  });
});
