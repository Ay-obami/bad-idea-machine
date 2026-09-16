import { hexToBytes, type Hex } from 'viem';

const VISUAL_SEED_BYTES = 32;

function bytesFor(seed: Hex): Uint8Array {
  const bytes = hexToBytes(seed);
  if (bytes.length !== VISUAL_SEED_BYTES) {
    throw new Error(`visual seed must be exactly ${VISUAL_SEED_BYTES} bytes`);
  }
  return bytes;
}

export function visualByte(seed: Hex, index: number): number {
  const bytes = bytesFor(seed);
  const wrapped = ((index % VISUAL_SEED_BYTES) + VISUAL_SEED_BYTES) % VISUAL_SEED_BYTES;
  return bytes[wrapped];
}

export function visualU16(seed: Hex, index: number): number {
  return (visualByte(seed, index) << 8) | visualByte(seed, index + 1);
}
