import {
  LedgerResult,
  LedgerState,
  applyBuy,
  applyExternalFlow,
  applySell,
  createLedger,
  projectLedger,
  resetLedger,
} from '../../domain/accounting/ledger';

function expectOk(result: LedgerResult): LedgerState {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

describe('Ledger', () => {
  it('keeps integer cents and rejects CASH buys that would go negative', () => {
    let state = createLedger(10_000);
    const rejected = applyBuy(state, {
      transactionId: 'too-expensive',
      instrumentId: 'NYX',
      qty: 2,
      priceCents: 6_000,
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.snapshot.cashCents).toBe(10_000);
    expect(projectLedger(state).cashCents).toBe(10_000);

    for (let index = 0; index < 25; index += 1) {
      const result = applyBuy(state, {
        transactionId: `buy-${index}`,
        instrumentId: 'NYX',
        qty: 1,
        priceCents: 100 + index,
        feeCents: index % 3,
      });
      if (result.ok) state = result.state;
      const snapshot = projectLedger(state, { NYX: 125 });
      expect(Number.isInteger(snapshot.cashCents)).toBe(true);
      expect(Number.isInteger(snapshot.holdingsValueCents)).toBe(true);
      expect(snapshot.cashCents).toBeGreaterThanOrEqual(0);
      for (const holding of Object.values(snapshot.holdings)) {
        expect(Number.isInteger(holding.costBasisCents)).toBe(true);
        expect(holding.qty).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('tracks realized P&L on full liquidation', () => {
    let state = createLedger(100_000);
    state = expectOk(applyBuy(state, {
      transactionId: 'buy-nyx',
      instrumentId: 'NYX',
      qty: 10,
      priceCents: 1_000,
    }));
    state = expectOk(applySell(state, {
      transactionId: 'sell-nyx',
      instrumentId: 'NYX',
      qty: 10,
      priceCents: 1_250,
    }));

    const snapshot = projectLedger(state, { NYX: 1_250 });
    expect(snapshot.realizedPnlCents).toBe(2_500);
    expect(snapshot.unrealizedPnlCents).toBe(0);
    expect(snapshot.holdings.NYX).toBeUndefined();
    expect(snapshot.cashCents).toBe(102_500);
  });

  it('tracks realized P&L through multiple buys and partial sells', () => {
    let state = createLedger(100_000);
    state = expectOk(applyBuy(state, {
      transactionId: 'lot-1',
      instrumentId: 'QBT',
      qty: 3,
      priceCents: 1_000,
    }));
    state = expectOk(applyBuy(state, {
      transactionId: 'lot-2',
      instrumentId: 'QBT',
      qty: 1,
      priceCents: 2_000,
    }));
    state = expectOk(applySell(state, {
      transactionId: 'sell-half',
      instrumentId: 'QBT',
      qty: 2,
      priceCents: 1_800,
    }));
    state = expectOk(applySell(state, {
      transactionId: 'sell-rest',
      instrumentId: 'QBT',
      qty: 2,
      priceCents: 1_200,
    }));

    const snapshot = projectLedger(state);
    expect(snapshot.realizedPnlCents).toBe(1_000);
    expect(snapshot.holdings.QBT).toBeUndefined();
    expect(snapshot.cashCents).toBe(101_000);
  });

  it('separates external flows from trade cash flow and is idempotent by transaction ID', () => {
    let state = createLedger(10_000);
    state = expectOk(applyExternalFlow(state, {
      transactionId: 'mission-credit',
      amountCents: 500,
      reason: 'MISSION',
    }));
    state = expectOk(applyBuy(state, {
      transactionId: 'buy-once',
      instrumentId: 'VLTA',
      qty: 5,
      priceCents: 1_000,
    }));
    state = expectOk(applyBuy(state, {
      transactionId: 'buy-once',
      instrumentId: 'VLTA',
      qty: 5,
      priceCents: 1_000,
    }));

    const snapshot = projectLedger(state, { VLTA: 1_100 });
    expect(snapshot.externalFlowsCents).toBe(500);
    expect(snapshot.tradeCashFlowCents).toBe(-5_000);
    expect(snapshot.holdings.VLTA.qty).toBe(5);
    expect(snapshot.cashCents).toBe(5_500);
  });

  it('reset restores a clean session without corrupting prior entries or invariants', () => {
    let state = createLedger(50_000);
    state = expectOk(applyExternalFlow(state, {
      transactionId: 'deposit',
      amountCents: 1_000,
      reason: 'DEPOSIT',
    }));
    state = expectOk(applyBuy(state, {
      transactionId: 'before-reset',
      instrumentId: 'NYX',
      qty: 10,
      priceCents: 1_000,
    }));
    state = expectOk(resetLedger(state, {
      transactionId: 'reset-1',
      startingCashCents: 50_000,
    }));

    const snapshot = projectLedger(state, { NYX: 2_000 });
    expect(snapshot.cashCents).toBe(50_000);
    expect(snapshot.holdings).toEqual({});
    expect(snapshot.realizedPnlCents).toBe(0);
    expect(snapshot.unrealizedPnlCents).toBe(0);
    expect(snapshot.externalFlowsCents).toBe(0);
    expect(snapshot.equityCents).toBe(50_000);
    expect(state.entries.length).toBe(3);
  });
});
