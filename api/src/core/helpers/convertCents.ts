export function toCents(value: number): bigint {
  return BigInt(Math.round(value * 100));
}

export function fromCents(value: bigint): number {
  return Number(value) / 100;
}
