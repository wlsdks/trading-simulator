import { assertCents, roundHalfEvenQuotient } from '../money';

export const LEDGER_SCHEMA_VERSION = 1;

export type AccountType = 'CASH';
export type TradeSide = 'BUY' | 'SELL';
export type LedgerEntryType = 'TRADE' | 'EXTERNAL_FLOW' | 'RESET';

export interface LedgerState {
  readonly schemaVersion: number;
  readonly accountType: AccountType;
  readonly startingCashCents: number;
  readonly entries: readonly LedgerEntry[];
}

export interface TradeEntry {
  readonly type: 'TRADE';
  readonly transactionId: string;
  readonly instrumentId: string;
  readonly side: TradeSide;
  readonly qty: number;
  readonly priceCents: number;
  readonly feeCents: number;
}

export interface ExternalFlowEntry {
  readonly type: 'EXTERNAL_FLOW';
  readonly transactionId: string;
  readonly amountCents: number;
  readonly reason: 'DEPOSIT' | 'WITHDRAWAL' | 'MISSION' | 'ADJUSTMENT';
}

export interface ResetEntry {
  readonly type: 'RESET';
  readonly transactionId: string;
  readonly startingCashCents: number;
}

export type LedgerEntry = TradeEntry | ExternalFlowEntry | ResetEntry;

export interface HoldingSnapshot {
  readonly qty: number;
  readonly costBasisCents: number;
  readonly avgCostCents: number;
}

export interface LedgerSnapshot {
  readonly cashCents: number;
  readonly holdings: Readonly<Record<string, HoldingSnapshot>>;
  readonly realizedPnlCents: number;
  readonly unrealizedPnlCents: number;
  readonly externalFlowsCents: number;
  readonly tradeCashFlowCents: number;
  readonly holdingsValueCents: number;
  readonly equityCents: number;
  readonly entries: readonly LedgerEntry[];
}

export type LedgerResult =
  | { readonly ok: true; readonly state: LedgerState; readonly snapshot: LedgerSnapshot }
  | { readonly ok: false; readonly error: string; readonly state: LedgerState; readonly snapshot: LedgerSnapshot };

function assertPositiveQty(qty: number): void {
  if (!Number.isSafeInteger(qty) || qty <= 0) {
    throw new Error('Quantity must be a positive safe integer');
  }
}

function assertTradeInput(qty: number, priceCents: number, feeCents: number): void {
  assertPositiveQty(qty);
  assertCents(priceCents);
  assertCents(feeCents);
  if (priceCents <= 0) throw new Error('priceCents must be positive');
  if (feeCents < 0) throw new Error('feeCents must be non-negative');
}

function assertTransactionId(transactionId: string): void {
  if (transactionId.length === 0) throw new Error('transactionId is required');
}

function activeEntries(state: LedgerState): readonly LedgerEntry[] {
  let resetIndex = -1;
  for (let index = state.entries.length - 1; index >= 0; index -= 1) {
    if (state.entries[index].type === 'RESET') {
      resetIndex = index;
      break;
    }
  }
  return resetIndex === -1 ? state.entries : state.entries.slice(resetIndex + 1);
}

function activeStartingCash(state: LedgerState): number {
  for (let index = state.entries.length - 1; index >= 0; index -= 1) {
    const entry = state.entries[index];
    if (entry.type === 'RESET') return entry.startingCashCents;
  }
  return state.startingCashCents;
}

function deriveAvgCost(costBasisCents: number, qty: number): number {
  if (qty === 0) return 0;
  return Number(roundHalfEvenQuotient(BigInt(costBasisCents), BigInt(qty)));
}

export function createLedger(startingCashCents: number): LedgerState {
  assertCents(startingCashCents);
  if (startingCashCents < 0) throw new Error('startingCashCents must be non-negative');
  return {
    schemaVersion: LEDGER_SCHEMA_VERSION,
    accountType: 'CASH',
    startingCashCents,
    entries: [],
  };
}

export function projectLedger(
  state: LedgerState,
  marksCents: Readonly<Record<string, number>> = {},
): LedgerSnapshot {
  const holdings: Record<string, { qty: number; costBasisCents: number }> = {};
  let cashCents = activeStartingCash(state);
  let realizedPnlCents = 0;
  let externalFlowsCents = 0;
  let tradeCashFlowCents = 0;

  for (const entry of activeEntries(state)) {
    if (entry.type === 'EXTERNAL_FLOW') {
      cashCents += entry.amountCents;
      externalFlowsCents += entry.amountCents;
      continue;
    }

    if (entry.type !== 'TRADE') continue;

    const notionalCents = entry.priceCents * entry.qty;
    const holding = holdings[entry.instrumentId] ?? { qty: 0, costBasisCents: 0 };

    if (entry.side === 'BUY') {
      const cashOut = notionalCents + entry.feeCents;
      cashCents -= cashOut;
      tradeCashFlowCents -= cashOut;
      holdings[entry.instrumentId] = {
        qty: holding.qty + entry.qty,
        costBasisCents: holding.costBasisCents + cashOut,
      };
      continue;
    }

    const allocatedBasisCents = entry.qty === holding.qty
      ? holding.costBasisCents
      : Number(
          roundHalfEvenQuotient(
            BigInt(holding.costBasisCents) * BigInt(entry.qty),
            BigInt(holding.qty),
          ),
        );
    const proceedsAfterFees = notionalCents - entry.feeCents;
    cashCents += proceedsAfterFees;
    tradeCashFlowCents += proceedsAfterFees;
    realizedPnlCents += proceedsAfterFees - allocatedBasisCents;

    const nextQty = holding.qty - entry.qty;
    if (nextQty === 0) {
      delete holdings[entry.instrumentId];
    } else {
      holdings[entry.instrumentId] = {
        qty: nextQty,
        costBasisCents: holding.costBasisCents - allocatedBasisCents,
      };
    }
  }

  const holdingSnapshots: Record<string, HoldingSnapshot> = {};
  let holdingsValueCents = 0;
  let unrealizedPnlCents = 0;
  for (const [instrumentId, holding] of Object.entries(holdings)) {
    const markCents = marksCents[instrumentId] ?? deriveAvgCost(holding.costBasisCents, holding.qty);
    assertCents(markCents);
    const valueCents = markCents * holding.qty;
    holdingsValueCents += valueCents;
    unrealizedPnlCents += valueCents - holding.costBasisCents;
    holdingSnapshots[instrumentId] = {
      qty: holding.qty,
      costBasisCents: holding.costBasisCents,
      avgCostCents: deriveAvgCost(holding.costBasisCents, holding.qty),
    };
  }

  return {
    cashCents,
    holdings: holdingSnapshots,
    realizedPnlCents,
    unrealizedPnlCents,
    externalFlowsCents,
    tradeCashFlowCents,
    holdingsValueCents,
    equityCents: cashCents + holdingsValueCents,
    entries: activeEntries(state),
  };
}

function hasTransaction(state: LedgerState, transactionId: string): boolean {
  return state.entries.some((entry) => entry.transactionId === transactionId);
}

function appendEntry(state: LedgerState, entry: LedgerEntry): LedgerState {
  return {
    ...state,
    entries: [...state.entries, entry],
  };
}

export function applyBuy(
  state: LedgerState,
  input: {
    readonly transactionId: string;
    readonly instrumentId: string;
    readonly qty: number;
    readonly priceCents: number;
    readonly feeCents?: number;
  },
): LedgerResult {
  assertTransactionId(input.transactionId);
  assertTradeInput(input.qty, input.priceCents, input.feeCents ?? 0);
  if (hasTransaction(state, input.transactionId)) {
    return { ok: true, state, snapshot: projectLedger(state) };
  }

  const entry: TradeEntry = {
    type: 'TRADE',
    transactionId: input.transactionId,
    instrumentId: input.instrumentId,
    side: 'BUY',
    qty: input.qty,
    priceCents: input.priceCents,
    feeCents: input.feeCents ?? 0,
  };
  const nextState = appendEntry(state, entry);
  const nextSnapshot = projectLedger(nextState);
  if (nextSnapshot.cashCents < 0) {
    return { ok: false, error: 'CASH account cannot go negative', state, snapshot: projectLedger(state) };
  }
  return { ok: true, state: nextState, snapshot: nextSnapshot };
}

export function applySell(
  state: LedgerState,
  input: {
    readonly transactionId: string;
    readonly instrumentId: string;
    readonly qty: number;
    readonly priceCents: number;
    readonly feeCents?: number;
  },
): LedgerResult {
  assertTransactionId(input.transactionId);
  assertTradeInput(input.qty, input.priceCents, input.feeCents ?? 0);
  if (hasTransaction(state, input.transactionId)) {
    return { ok: true, state, snapshot: projectLedger(state) };
  }

  const current = projectLedger(state).holdings[input.instrumentId];
  if (!current || input.qty > current.qty) {
    return { ok: false, error: 'Not enough shares', state, snapshot: projectLedger(state) };
  }

  const entry: TradeEntry = {
    type: 'TRADE',
    transactionId: input.transactionId,
    instrumentId: input.instrumentId,
    side: 'SELL',
    qty: input.qty,
    priceCents: input.priceCents,
    feeCents: input.feeCents ?? 0,
  };
  const nextState = appendEntry(state, entry);
  return { ok: true, state: nextState, snapshot: projectLedger(nextState) };
}

export function applyExternalFlow(
  state: LedgerState,
  input: {
    readonly transactionId: string;
    readonly amountCents: number;
    readonly reason: ExternalFlowEntry['reason'];
  },
): LedgerResult {
  assertTransactionId(input.transactionId);
  assertCents(input.amountCents);
  if (hasTransaction(state, input.transactionId)) {
    return { ok: true, state, snapshot: projectLedger(state) };
  }
  const nextState = appendEntry(state, {
    type: 'EXTERNAL_FLOW',
    transactionId: input.transactionId,
    amountCents: input.amountCents,
    reason: input.reason,
  });
  const nextSnapshot = projectLedger(nextState);
  if (nextSnapshot.cashCents < 0) {
    return { ok: false, error: 'CASH account cannot go negative', state, snapshot: projectLedger(state) };
  }
  return { ok: true, state: nextState, snapshot: nextSnapshot };
}

export function resetLedger(
  state: LedgerState,
  input: {
    readonly transactionId: string;
    readonly startingCashCents?: number;
  },
): LedgerResult {
  assertTransactionId(input.transactionId);
  const startingCashCents = input.startingCashCents ?? state.startingCashCents;
  assertCents(startingCashCents);
  if (startingCashCents < 0) throw new Error('startingCashCents must be non-negative');
  if (hasTransaction(state, input.transactionId)) {
    return { ok: true, state, snapshot: projectLedger(state) };
  }
  const nextState = appendEntry(state, {
    type: 'RESET',
    transactionId: input.transactionId,
    startingCashCents,
  });
  return { ok: true, state: nextState, snapshot: projectLedger(nextState) };
}
