declare module '@kenshi.io/node-ecvrf' {
  interface EcvrfPoint {
    x: { toString(): string };
    y: { toString(): string };
  }

  type EcvrfScalar = { toString(): string };

  interface FastVerifyComponents {
    uX: string;
    uY: string;
    sHX: string;
    sHY: string;
    cGX: string;
    cGY: string;
  }

  export function decode(proof: string): [EcvrfPoint, EcvrfScalar, EcvrfScalar];
  export function prove(secretKey: string, alpha: string): string;
  export function proofToHash(proof: string): Buffer;
  export function getFastVerifyComponents(
    publicKeyHex: string,
    proofHex: string,
    alpha: string | Buffer,
  ): FastVerifyComponents | 'INVALID';
}
