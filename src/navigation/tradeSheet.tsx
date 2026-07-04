import { createContext, useContext } from 'react';

export interface TradeSheetContextValue {
  openTradeSheet: (ticker: string) => void;
}

export const TradeSheetContext = createContext<TradeSheetContextValue | null>(null);

export function useTradeSheet() {
  const value = useContext(TradeSheetContext);
  if (!value) {
    throw new Error('useTradeSheet must be used within TradeSheetContext');
  }
  return value;
}
