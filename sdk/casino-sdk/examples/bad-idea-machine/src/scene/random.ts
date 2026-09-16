import { hexToBytes, type Hex } from 'viem';

function bytesFor(seed: Hex): Uint8Array {
  return hexToBytes(seed);
}

export function visualByte(seed: Hex, index: number): number {
  const bytes = bytesFor(seed);
  if (bytes.length === 0) throw new Error('visual seed must contain bytes');
  const wrapped = ((index % bytes.length) + bytes.length) % bytes.length;
  return bytes[wrapped];
}

export function visualU16(seed: Hex, index: number): number {
  return (visualByte(seed, index) << 8) | visualByte(seed, index + 1);
}
