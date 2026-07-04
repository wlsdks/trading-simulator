const MASK_64 = (1n << 64n) - 1n;
const GOLDEN_GAMMA = 0x9e3779b97f4a7c15n;

export type SeedInput = bigint | number | string;

export interface SplitMix64State {
  readonly state: bigint;
}

export interface SplitMix64Step {
  readonly state: SplitMix64State;
  readonly value: bigint;
}

function asUint64(value: bigint): bigint {
  return value & MASK_64;
}

function mix64(value: bigint): bigint {
  let z = asUint64(value);
  z = asUint64((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n);
  z = asUint64((z ^ (z >> 27n)) * 0x94d049bb133111ebn);
  return asUint64(z ^ (z >> 31n));
}

export function hashSeed(input: SeedInput): bigint {
  if (typeof input === 'bigint') return asUint64(input);
  if (typeof input === 'number') {
    if (!Number.isSafeInteger(input)) {
      throw new Error('Seed number must be a safe integer');
    }
    return asUint64(BigInt(input));
  }

  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= BigInt(input.charCodeAt(index));
    hash = asUint64(hash * 0x100000001b3n);
  }
  return mix64(hash);
}

export function deriveSeed(rootSeed: SeedInput, ...labels: readonly SeedInput[]): bigint {
  let seed = hashSeed(rootSeed);
  for (const label of labels) {
    seed = mix64(seed ^ hashSeed(label));
  }
  return seed;
}

export function splitMix64(seed: SeedInput): SplitMix64State {
  return { state: hashSeed(seed) };
}

export function nextUint64(prng: SplitMix64State): SplitMix64Step {
  const nextState = asUint64(prng.state + GOLDEN_GAMMA);
  return {
    state: { state: nextState },
    value: mix64(nextState),
  };
}

export function uint64At(seed: SeedInput, index: number): bigint {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new Error('PRNG index must be a non-negative safe integer');
  }
  return mix64(asUint64(hashSeed(seed) + GOLDEN_GAMMA * BigInt(index + 1)));
}

export function substreamSeed(rootSeed: SeedInput, ...labels: readonly SeedInput[]): bigint {
  return deriveSeed(rootSeed, 'substream', ...labels);
}

export function substream(rootSeed: SeedInput, ...labels: readonly SeedInput[]): SplitMix64State {
  return splitMix64(substreamSeed(rootSeed, ...labels));
}

export function unitIntervalFromUint64(value: bigint): number {
  const top53Bits = Number((value >> 11n) & ((1n << 53n) - 1n));
  return top53Bits / 0x20000000000000;
}

export function unitIntervalAt(seed: SeedInput, index: number): number {
  return unitIntervalFromUint64(uint64At(seed, index));
}

export function signedUnitAt(seed: SeedInput, index: number): number {
  return unitIntervalAt(seed, index) * 2 - 1;
}
