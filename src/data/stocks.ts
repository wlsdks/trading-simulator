/**
 * Seed universe of tradable instruments. Prices here are the simulation's
 * starting point; the price engine takes a random walk from these values.
 * `volatility` scales the per-tick move (roughly its std-dev in %).
 */
export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  seedPrice: number;
  volatility: number;
}

export const STOCKS: Stock[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', seedPrice: 212.4, volatility: 0.6 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', seedPrice: 448.9, volatility: 0.55 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', seedPrice: 128.3, volatility: 1.4 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', seedPrice: 246.7, volatility: 1.8 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer', seedPrice: 189.2, volatility: 0.8 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', seedPrice: 176.5, volatility: 0.7 },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', seedPrice: 512.1, volatility: 0.9 },
  { ticker: 'COIN', name: 'Coinbase Global', sector: 'Financials', seedPrice: 224.0, volatility: 2.4 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', seedPrice: 158.6, volatility: 1.5 },
  { ticker: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication', seedPrice: 678.4, volatility: 1.0 },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', seedPrice: 205.3, volatility: 0.5 },
  { ticker: 'DIS', name: 'Walt Disney Co.', sector: 'Communication', seedPrice: 98.7, volatility: 0.7 },
];

export const STOCKS_BY_TICKER: Record<string, Stock> = Object.fromEntries(
  STOCKS.map((s) => [s.ticker, s]),
);

export const STARTING_CASH = 100_000;
