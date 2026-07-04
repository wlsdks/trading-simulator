import { SeedInput, deriveSeed, signedUnitAt, substreamSeed, unitIntervalAt } from '../prng';

const TICKS_PER_SESSION = 390;
const MIN_PRICE_CENTS = 1;

export interface PriceTickInput {
  readonly rootSeed: SeedInput;
  readonly instrumentSeed: SeedInput;
  readonly marketConfigVersion: SeedInput;
  readonly tickIndex: number;
}

export interface MarketSession {
  readonly sessionIndex: number;
  readonly tickInSession: number;
  readonly ticksPerSession: number;
  readonly isOpen: boolean;
}

export interface PriceTick {
  readonly logPrice: number;
  readonly last: number;
  readonly mark: number;
  readonly dayOpen: number;
  readonly session: MarketSession;
}

function assertTickIndex(tickIndex: number): void {
  if (!Number.isSafeInteger(tickIndex) || tickIndex < 0) {
    throw new Error('tickIndex must be a non-negative safe integer');
  }
}

function roundToCents(value: number): number {
  const cents = Math.max(MIN_PRICE_CENTS, Math.round(value * 100));
  return cents / 100;
}

function normalShock(seed: SeedInput, pairIndex: number): number {
  const u1 = Math.max(Number.MIN_VALUE, unitIntervalAt(seed, pairIndex * 2));
  const u2 = unitIntervalAt(seed, pairIndex * 2 + 1);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function logPriceAt(
  baseLogPrice: number,
  driftPerTick: number,
  volatilityPerTick: number,
  meanReversion: number,
  streamSeed: SeedInput,
  tickIndex: number,
): number {
  let logPrice = baseLogPrice;
  for (let tick = 1; tick <= tickIndex; tick += 1) {
    const shock = normalShock(streamSeed, tick);
    const reversion = (baseLogPrice - logPrice) * meanReversion;
    logPrice += driftPerTick + reversion + shock * volatilityPerTick;
  }
  return logPrice;
}

export function priceTick(input: PriceTickInput): PriceTick {
  assertTickIndex(input.tickIndex);

  const configSeed = deriveSeed(
    input.rootSeed,
    input.instrumentSeed,
    input.marketConfigVersion,
    'price-engine',
  );
  const basePrice = 10 + unitIntervalAt(configSeed, 0) * 490;
  const baseLogPrice = Math.log(basePrice);
  const driftPerTick = (signedUnitAt(configSeed, 1) * 0.08) / TICKS_PER_SESSION;
  const volatilityPerTick = 0.003 + unitIntervalAt(configSeed, 2) * 0.018;
  const meanReversion = 0.0008 + unitIntervalAt(configSeed, 3) * 0.0015;
  const canonicalStreamSeed = substreamSeed(configSeed, 'canonical-price');

  const sessionIndex = Math.floor(input.tickIndex / TICKS_PER_SESSION);
  const sessionStartTick = sessionIndex * TICKS_PER_SESSION;
  const tickInSession = input.tickIndex - sessionStartTick;
  const dayOpenLog = logPriceAt(
    baseLogPrice,
    driftPerTick,
    volatilityPerTick,
    meanReversion,
    canonicalStreamSeed,
    sessionStartTick,
  );
  const logPrice = tickInSession === 0
    ? dayOpenLog
    : logPriceAt(
        baseLogPrice,
        driftPerTick,
        volatilityPerTick,
        meanReversion,
        canonicalStreamSeed,
        input.tickIndex,
      );
  const microstructure = signedUnitAt(substreamSeed(configSeed, 'microstructure'), input.tickIndex) * 0.0007;

  return {
    logPrice,
    last: roundToCents(Math.exp(logPrice + microstructure)),
    mark: roundToCents(Math.exp(logPrice)),
    dayOpen: roundToCents(Math.exp(dayOpenLog)),
    session: {
      sessionIndex,
      tickInSession,
      ticksPerSession: TICKS_PER_SESSION,
      isOpen: true,
    },
  };
}
