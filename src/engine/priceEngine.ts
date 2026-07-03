import { Stock } from '../data/stocks';

/**
 * Simulated price engine — a lightly mean-reverting random walk.
 *
 * Each tick nudges the price by a random percentage scaled by the stock's
 * volatility, plus a gentle pull back toward the seed price so values don't
 * drift off to zero or infinity over a long session.
 */

const MEAN_REVERSION = 0.02; // strength of pull back toward seed price

export function nextPrice(current: number, stock: Stock): number {
  // Random move in [-1, 1] scaled to a per-tick percentage.
  const shock = (Math.random() * 2 - 1) * (stock.volatility / 100);
  // Mean reversion toward the seed price.
  const drift = ((stock.seedPrice - current) / stock.seedPrice) * MEAN_REVERSION;
  const next = current * (1 + shock + drift);
  // Never let a price go non-positive.
  return Math.max(0.01, Number(next.toFixed(2)));
}

/** Advances an entire price map one tick. Returns a new object. */
export function tickPrices(
  prices: Record<string, number>,
  stocks: Stock[],
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const stock of stocks) {
    const cur = prices[stock.ticker] ?? stock.seedPrice;
    next[stock.ticker] = nextPrice(cur, stock);
  }
  return next;
}

export const TICK_MS = 2000;
