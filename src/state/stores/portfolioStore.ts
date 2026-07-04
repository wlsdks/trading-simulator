import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  LedgerEntry,
  LedgerState,
  applyBuy,
  applySell,
  createLedger,
  projectLedger,
  resetLedger,
} from '../../domain/accounting/ledger';
import { fromDecimal } from '../../domain/accounting/money';
import { priceTick } from '../../domain/market/price-engine';
import { STARTING_CASH, STOCKS, STOCKS_BY_TICKER } from '../../data/stocks';

export interface Holding {
  qty: number;
  avgCost: number;
}

export interface HoldingDetail extends Holding {
  ticker: string;
  currentPrice: number;
  value: number;
  costBasis: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface Transaction {
  id: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  timestamp: number;
}

export interface TradeResult {
  ok: boolean;
  error?: string;
}

interface PersistedAccount {
  schemaVersion: 2;
  ledger: LedgerState;
}

interface LegacyAccount {
  cash?: number;
  holdings?: Record<string, Holding>;
  transactions?: Transaction[];
}

export interface PortfolioState {
  ready: boolean;
  ledger: LedgerState;
  tickIndex: number;
  pricesCents: Record<string, number>;
  dayOpenCents: Record<string, number>;
  prices: Record<string, number>;
  dayOpen: Record<string, number>;
  cash: number;
  holdings: Record<string, Holding>;
  holdingDetails: Record<string, HoldingDetail>;
  transactions: Transaction[];
  realizedPL: number;
  unrealizedPL: number;
  holdingsValue: number;
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  hydrate: () => Promise<void>;
  startPriceTicker: () => () => void;
  stopPriceTicker: () => void;
  getTradeEstimate: (ticker: string, qty: number) => number;
  getMaxBuyQty: (ticker: string) => number;
  buy: (ticker: string, qty: number) => TradeResult;
  sell: (ticker: string, qty: number) => TradeResult;
  reset: () => void;
}

const ACCOUNT_KEY = 'ts.account.v2';
const LEGACY_ACCOUNT_KEY = 'ts.account.v1';
const TICK_MS = 2000;
const PRICE_ROOT_SEED = 'trading-simulator-mvp-1';
const MARKET_CONFIG_VERSION = 'p1-v1';
const STARTING_CASH_CENTS = fromDecimal(String(STARTING_CASH)).cents;

let priceTimer: ReturnType<typeof setInterval> | null = null;
let transactionSequence = 0;

function centsToDollars(cents: number): number {
  return cents / 100;
}

function dollarsToCents(value: number): number {
  return fromDecimal(value.toFixed(2)).cents;
}

function createTransactionId(side: 'BUY' | 'SELL' | 'RESET', ticker?: string): string {
  transactionSequence += 1;
  return `${side.toLowerCase()}-${ticker ?? 'account'}-${Date.now()}-${transactionSequence}`;
}

function priceMapsForTick(tickIndex: number): {
  pricesCents: Record<string, number>;
  dayOpenCents: Record<string, number>;
} {
  const pricesCents: Record<string, number> = {};
  const dayOpenCents: Record<string, number> = {};

  for (const stock of STOCKS) {
    const tick = priceTick({
      rootSeed: PRICE_ROOT_SEED,
      instrumentSeed: stock.ticker,
      marketConfigVersion: MARKET_CONFIG_VERSION,
      tickIndex,
    });
    pricesCents[stock.ticker] = dollarsToCents(tick.mark);
    dayOpenCents[stock.ticker] = dollarsToCents(tick.dayOpen);
  }

  return { pricesCents, dayOpenCents };
}

function toDollarMap(values: Readonly<Record<string, number>>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(values).map(([ticker, cents]) => [ticker, centsToDollars(cents)]),
  );
}

function tradeEntriesNewestFirst(ledger: LedgerState): Transaction[] {
  return ledger.entries
    .filter((entry): entry is Extract<LedgerEntry, { type: 'TRADE' }> => entry.type === 'TRADE')
    .slice()
    .reverse()
    .map((entry) => ({
      id: entry.transactionId,
      ticker: entry.instrumentId,
      side: entry.side,
      qty: entry.qty,
      price: centsToDollars(entry.priceCents),
      timestamp: 0,
    }));
}

function deriveState(
  ledger: LedgerState,
  pricesCents: Record<string, number>,
  dayOpenCents: Record<string, number>,
): Pick<
  PortfolioState,
  | 'prices'
  | 'dayOpen'
  | 'cash'
  | 'holdings'
  | 'holdingDetails'
  | 'transactions'
  | 'realizedPL'
  | 'unrealizedPL'
  | 'holdingsValue'
  | 'totalValue'
  | 'totalCost'
  | 'totalPL'
  | 'totalPLPercent'
  | 'dayChange'
  | 'dayChangePercent'
> {
  const snapshot = projectLedger(ledger, pricesCents);
  const holdings: Record<string, Holding> = {};
  const holdingDetails: Record<string, HoldingDetail> = {};
  let totalCostCents = 0;
  let dayOpenValueCents = 0;

  for (const [ticker, holding] of Object.entries(snapshot.holdings)) {
    const markCents = pricesCents[ticker] ?? holding.avgCostCents;
    const openCents = dayOpenCents[ticker] ?? markCents;
    const valueCents = markCents * holding.qty;
    const openValueCents = openCents * holding.qty;
    const unrealizedCents = valueCents - holding.costBasisCents;
    const dayChangeCents = valueCents - openValueCents;

    totalCostCents += holding.costBasisCents;
    dayOpenValueCents += openValueCents;
    holdings[ticker] = {
      qty: holding.qty,
      avgCost: centsToDollars(holding.avgCostCents),
    };
    holdingDetails[ticker] = {
      ticker,
      qty: holding.qty,
      avgCost: centsToDollars(holding.avgCostCents),
      currentPrice: centsToDollars(markCents),
      value: centsToDollars(valueCents),
      costBasis: centsToDollars(holding.costBasisCents),
      unrealizedPL: centsToDollars(unrealizedCents),
      unrealizedPLPercent: holding.costBasisCents > 0
        ? (unrealizedCents / holding.costBasisCents) * 100
        : 0,
      dayChange: centsToDollars(dayChangeCents),
      dayChangePercent: openValueCents > 0 ? (dayChangeCents / openValueCents) * 100 : 0,
    };
  }

  const dayChangeCents = snapshot.holdingsValueCents - dayOpenValueCents;

  return {
    prices: toDollarMap(pricesCents),
    dayOpen: toDollarMap(dayOpenCents),
    cash: centsToDollars(snapshot.cashCents),
    holdings,
    holdingDetails,
    transactions: tradeEntriesNewestFirst(ledger),
    realizedPL: centsToDollars(snapshot.realizedPnlCents),
    unrealizedPL: centsToDollars(snapshot.unrealizedPnlCents),
    holdingsValue: centsToDollars(snapshot.holdingsValueCents),
    totalValue: centsToDollars(snapshot.equityCents),
    totalCost: centsToDollars(totalCostCents),
    totalPL: centsToDollars(snapshot.unrealizedPnlCents),
    totalPLPercent: totalCostCents > 0 ? (snapshot.unrealizedPnlCents / totalCostCents) * 100 : 0,
    dayChange: centsToDollars(dayChangeCents),
    dayChangePercent: dayOpenValueCents > 0 ? (dayChangeCents / dayOpenValueCents) * 100 : 0,
  };
}

function buildState(
  ledger: LedgerState,
  tickIndex: number,
): Pick<PortfolioState, 'ledger' | 'tickIndex' | 'pricesCents' | 'dayOpenCents'> &
  ReturnType<typeof deriveState> {
  const { pricesCents, dayOpenCents } = priceMapsForTick(tickIndex);
  return {
    ledger,
    tickIndex,
    pricesCents,
    dayOpenCents,
    ...deriveState(ledger, pricesCents, dayOpenCents),
  };
}

function parsePersistedLedger(raw: string | null): LedgerState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedAccount;
    if (parsed?.schemaVersion === 2 && parsed.ledger?.schemaVersion === 1) {
      return parsed.ledger;
    }
  } catch (error) {
    console.warn('Failed to parse account', error);
  }

  return null;
}

function migrateLegacyAccount(raw: string | null): LedgerState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as LegacyAccount;
    let ledger = createLedger(STARTING_CASH_CENTS);
    const legacyTransactions = Array.isArray(parsed.transactions) ? parsed.transactions.slice().reverse() : [];

    for (const tx of legacyTransactions) {
      if (!STOCKS_BY_TICKER[tx.ticker] || !Number.isSafeInteger(tx.qty) || tx.qty <= 0) continue;
      const input = {
        transactionId: `legacy-${tx.id}`,
        instrumentId: tx.ticker,
        qty: tx.qty,
        priceCents: dollarsToCents(tx.price),
      };
      const result = tx.side === 'BUY' ? applyBuy(ledger, input) : applySell(ledger, input);
      if (result.ok) ledger = result.state;
    }

    return ledger;
  } catch (error) {
    console.warn('Failed to migrate legacy account', error);
    return null;
  }
}

async function persistLedger(ledger: LedgerState): Promise<void> {
  const account: PersistedAccount = { schemaVersion: 2, ledger };
  await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

const initialLedger = createLedger(STARTING_CASH_CENTS);
const initialState = buildState(initialLedger, 0);

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  ready: false,
  ...initialState,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
      const legacyRaw = raw ? null : await AsyncStorage.getItem(LEGACY_ACCOUNT_KEY);
      const ledger = parsePersistedLedger(raw) ?? migrateLegacyAccount(legacyRaw) ?? createLedger(STARTING_CASH_CENTS);
      set({ ready: true, ...buildState(ledger, get().tickIndex) });
      if (!raw) {
        await persistLedger(ledger);
      }
    } catch (error) {
      console.warn('Failed to load account', error);
      set({ ready: true, ...buildState(createLedger(STARTING_CASH_CENTS), get().tickIndex) });
    }
  },

  startPriceTicker: () => {
    if (priceTimer) {
      return get().stopPriceTicker;
    }
    priceTimer = setInterval(() => {
      set((state) => buildState(state.ledger, state.tickIndex + 1));
    }, TICK_MS);
    return get().stopPriceTicker;
  },

  stopPriceTicker: () => {
    if (!priceTimer) return;
    clearInterval(priceTimer);
    priceTimer = null;
  },

  getTradeEstimate: (ticker, qty) => {
    if (!Number.isSafeInteger(qty) || qty <= 0) return 0;
    const priceCents = get().pricesCents[ticker] ?? 0;
    return centsToDollars(priceCents * qty);
  },

  getMaxBuyQty: (ticker) => {
    const priceCents = get().pricesCents[ticker] ?? 0;
    if (priceCents <= 0) return 0;
    return Math.floor(projectLedger(get().ledger, get().pricesCents).cashCents / priceCents);
  },

  buy: (ticker, qty) => {
    if (!STOCKS_BY_TICKER[ticker]) return { ok: false, error: 'Unknown ticker' };
    if (!Number.isSafeInteger(qty) || qty <= 0) return { ok: false, error: 'Enter a valid quantity' };

    const priceCents = get().pricesCents[ticker];
    if (!priceCents) return { ok: false, error: 'Price unavailable' };

    const result = applyBuy(get().ledger, {
      transactionId: createTransactionId('BUY', ticker),
      instrumentId: ticker,
      qty,
      priceCents,
    });

    if (!result.ok) return { ok: false, error: result.error };

    set((state) => buildState(result.state, state.tickIndex));
    persistLedger(result.state).catch((error) => console.warn('Failed to save account', error));
    return { ok: true };
  },

  sell: (ticker, qty) => {
    if (!STOCKS_BY_TICKER[ticker]) return { ok: false, error: 'Unknown ticker' };
    if (!Number.isSafeInteger(qty) || qty <= 0) return { ok: false, error: 'Enter a valid quantity' };

    const priceCents = get().pricesCents[ticker];
    if (!priceCents) return { ok: false, error: 'Price unavailable' };

    const result = applySell(get().ledger, {
      transactionId: createTransactionId('SELL', ticker),
      instrumentId: ticker,
      qty,
      priceCents,
    });

    if (!result.ok) return { ok: false, error: result.error };

    set((state) => buildState(result.state, state.tickIndex));
    persistLedger(result.state).catch((error) => console.warn('Failed to save account', error));
    return { ok: true };
  },

  reset: () => {
    const result = resetLedger(get().ledger, {
      transactionId: createTransactionId('RESET'),
      startingCashCents: STARTING_CASH_CENTS,
    });

    if (!result.ok) return;

    set((state) => buildState(result.state, state.tickIndex));
    persistLedger(result.state).catch((error) => console.warn('Failed to save account', error));
  },
}));
