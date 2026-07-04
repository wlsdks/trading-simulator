/**
 * Seed universe of tradable instruments.
 *
 * IMPORTANT — 100% FICTIONAL ISSUERS (living-market.md, LEG-16).
 * This is a price-simulation *game*: prices are fabricated. Attaching fabricated
 * prices / fake news / "N traders now" to REAL tickers would be false market
 * information (US 10b-5(b) / KR 자본시장법 §178 / JP 金商法 158), so every name
 * and symbol here is invented. No symbol may match a real listed security —
 * real-ticker clearance (LEG-16: denylist + phonetic/edit-distance check + legal
 * review) is a pre-launch gate. Do NOT reintroduce real tickers.
 *
 * `volatility` roughly scales the per-tick move (its std-dev in %). Liquidity
 * tiers (Mega/Large/Mid/Small/Meme/Crypto — see living-market.md §1.4) are
 * implied here by price + volatility and will be formalized in the price engine.
 */
export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  seedPrice: number;
  volatility: number;
}

export const STOCKS: Stock[] = [
  { ticker: 'NYX', name: 'Nyxor Systems', sector: 'Technology', seedPrice: 214.5, volatility: 0.6 },
  { ticker: 'QBT', name: 'Qubitron Semiconductor', sector: 'Semiconductors', seedPrice: 132.8, volatility: 1.5 },
  { ticker: 'VLTA', name: 'Voltaic Motors', sector: 'Automotive', seedPrice: 248.2, volatility: 1.9 },
  { ticker: 'NMBS', name: 'Nimbus Cloud', sector: 'Technology', seedPrice: 452.0, volatility: 0.55 },
  { ticker: 'ORBT', name: 'Orbital Retail Group', sector: 'Consumer', seedPrice: 191.4, volatility: 0.8 },
  { ticker: 'SABL', name: 'Sable Financial', sector: 'Financials', seedPrice: 207.6, volatility: 0.5 },
  { ticker: 'MRDN', name: 'Meridian Media', sector: 'Communication', seedPrice: 118.9, volatility: 0.9 },
  { ticker: 'CBLT', name: 'Cobalt Exchange', sector: 'Financials', seedPrice: 231.0, volatility: 2.4 },
  { ticker: 'PULS', name: 'Pulsar Micro', sector: 'Semiconductors', seedPrice: 164.3, volatility: 1.5 },
  { ticker: 'ZPHY', name: 'Zephyr Streaming', sector: 'Communication', seedPrice: 372.7, volatility: 1.0 },
  { ticker: 'IRNF', name: 'Ironforge Bank', sector: 'Financials', seedPrice: 96.4, volatility: 0.6 },
  { ticker: 'QOKA', name: 'Quokka Games', sector: 'Consumer', seedPrice: 27.8, volatility: 2.6 },
];

export const STOCKS_BY_TICKER: Record<string, Stock> = Object.fromEntries(
  STOCKS.map((s) => [s.ticker, s]),
);

export const STARTING_CASH = 100_000;
