import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { STARTING_CASH, STOCKS, STOCKS_BY_TICKER } from '../data/stocks';
import { TICK_MS, tickPrices } from '../engine/priceEngine';

export interface Holding {
  qty: number;
  avgCost: number;
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

interface PortfolioState {
  ready: boolean;
  cash: number;
  holdings: Record<string, Holding>;
  prices: Record<string, number>;
  dayOpen: Record<string, number>;
  transactions: Transaction[];
  buy: (ticker: string, qty: number) => TradeResult;
  sell: (ticker: string, qty: number) => TradeResult;
  reset: () => void;
  // Derived selectors
  holdingsValue: number;
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
}

const ACCOUNT_KEY = 'ts.account.v1';

function seedPrices(): Record<string, number> {
  return Object.fromEntries(STOCKS.map((s) => [s.ticker, s.seedPrice]));
}

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>(seedPrices);
  // Baseline for "today's" change — reset each launch so the ticker visibly moves.
  const dayOpenRef = useRef<Record<string, number>>(seedPrices());
  const [dayOpen] = useState<Record<string, number>>(() => dayOpenRef.current);

  // --- Load persisted account on mount -------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.cash === 'number') setCash(parsed.cash);
          if (parsed.holdings) setHoldings(parsed.holdings);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        }
      } catch (e) {
        console.warn('Failed to load account', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Persist account whenever it changes (after initial load) ------------
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(
      ACCOUNT_KEY,
      JSON.stringify({ cash, holdings, transactions }),
    ).catch((e) => console.warn('Failed to save account', e));
  }, [ready, cash, holdings, transactions]);

  // --- Price simulation loop ------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => tickPrices(prev, STOCKS));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // --- Trading actions ------------------------------------------------------
  const buy = useCallback(
    (ticker: string, qty: number): TradeResult => {
      if (!STOCKS_BY_TICKER[ticker]) return { ok: false, error: 'Unknown ticker' };
      if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: 'Enter a valid quantity' };
      const price = prices[ticker];
      const cost = price * qty;
      if (cost > cash) return { ok: false, error: 'Not enough cash' };

      setCash((c) => c - cost);
      setHoldings((h) => {
        const existing = h[ticker];
        const newQty = (existing?.qty ?? 0) + qty;
        const newAvg = existing
          ? (existing.qty * existing.avgCost + qty * price) / newQty
          : price;
        return { ...h, [ticker]: { qty: newQty, avgCost: newAvg } };
      });
      setTransactions((t) => [
        { id: `${Date.now()}-${ticker}`, ticker, side: 'BUY', qty, price, timestamp: Date.now() },
        ...t,
      ]);
      return { ok: true };
    },
    [prices, cash],
  );

  const sell = useCallback(
    (ticker: string, qty: number): TradeResult => {
      const existing = holdings[ticker];
      if (!existing || existing.qty <= 0) return { ok: false, error: 'No shares to sell' };
      if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: 'Enter a valid quantity' };
      if (qty > existing.qty) return { ok: false, error: 'Not enough shares' };
      const price = prices[ticker];
      const proceeds = price * qty;

      setCash((c) => c + proceeds);
      setHoldings((h) => {
        const cur = h[ticker];
        const newQty = cur.qty - qty;
        if (newQty <= 0) {
          const { [ticker]: _removed, ...rest } = h;
          return rest;
        }
        return { ...h, [ticker]: { qty: newQty, avgCost: cur.avgCost } };
      });
      setTransactions((t) => [
        { id: `${Date.now()}-${ticker}`, ticker, side: 'SELL', qty, price, timestamp: Date.now() },
        ...t,
      ]);
      return { ok: true };
    },
    [prices, holdings],
  );

  const reset = useCallback(() => {
    setCash(STARTING_CASH);
    setHoldings({});
    setTransactions([]);
  }, []);

  // --- Derived portfolio metrics -------------------------------------------
  const { holdingsValue, totalCost } = useMemo(() => {
    let value = 0;
    let cost = 0;
    for (const [ticker, h] of Object.entries(holdings)) {
      value += (prices[ticker] ?? h.avgCost) * h.qty;
      cost += h.avgCost * h.qty;
    }
    return { holdingsValue: value, totalCost: cost };
  }, [holdings, prices]);

  const totalValue = cash + holdingsValue;
  const totalPL = holdingsValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  const value: PortfolioState = {
    ready,
    cash,
    holdings,
    prices,
    dayOpen,
    transactions,
    buy,
    sell,
    reset,
    holdingsValue,
    totalValue,
    totalCost,
    totalPL,
    totalPLPercent,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioState {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return ctx;
}
