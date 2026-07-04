export const DEFAULT_CURRENCY = 'USD';

export interface Money {
  readonly cents: number;
  readonly currency: string;
}

export function assertCents(cents: number): void {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('Money cents must be a safe integer');
  }
}

function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new Error(`Currency mismatch: ${left.currency} !== ${right.currency}`);
  }
}

export function money(cents: number, currency = DEFAULT_CURRENCY): Money {
  assertCents(cents);
  return { cents, currency };
}

export function add(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return money(left.cents + right.cents, left.currency);
}

export function subtract(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return money(left.cents - right.cents, left.currency);
}

export function negate(value: Money): Money {
  return money(-value.cents, value.currency);
}

export function compare(left: Money, right: Money): number {
  assertSameCurrency(left, right);
  return Math.sign(left.cents - right.cents);
}

export function roundHalfEvenQuotient(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error('Denominator must be positive');
  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  const twiceRemainder = remainder * 2n;

  if (twiceRemainder < denominator) return quotient * sign;
  if (twiceRemainder > denominator) return (quotient + 1n) * sign;
  return (quotient % 2n === 0n ? quotient : quotient + 1n) * sign;
}

export function roundHalfEven(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Value must be finite');
  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);
  const floor = Math.floor(absolute);
  const fraction = absolute - floor;
  const epsilon = Number.EPSILON * Math.max(1, absolute);

  if (fraction < 0.5 - epsilon) return floor * sign;
  if (fraction > 0.5 + epsilon) return (floor + 1) * sign;
  return (floor % 2 === 0 ? floor : floor + 1) * sign;
}

export function fromDecimal(value: string | number, currency = DEFAULT_CURRENCY): Money {
  const text = typeof value === 'number' ? value.toString() : value.trim();
  const match = text.match(/^([+-])?(\d+)(?:\.(\d+))?$/);
  if (!match) throw new Error(`Invalid decimal money value: ${text}`);

  const sign = match[1] === '-' ? -1n : 1n;
  const whole = BigInt(match[2]);
  const fraction = match[3] ?? '';
  const scale = 10n ** BigInt(fraction.length);
  const numerator = (whole * scale + BigInt(fraction || '0')) * 100n;
  const cents = Number(roundHalfEvenQuotient(sign * numerator, scale));
  return money(cents, currency);
}

export function multiplyRatio(value: Money, numerator: number, denominator: number): Money {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new Error('Ratio must use safe integer numerator and positive denominator');
  }
  const cents = Number(roundHalfEvenQuotient(BigInt(value.cents) * BigInt(numerator), BigInt(denominator)));
  return money(cents, value.currency);
}

export function formatMoney(value: Money): string {
  const sign = value.cents < 0 ? '-' : '';
  const absolute = Math.abs(value.cents);
  const dollars = Math.floor(absolute / 100);
  const cents = (absolute % 100).toString().padStart(2, '0');
  return `${sign}${value.currency} ${dollars}.${cents}`;
}
