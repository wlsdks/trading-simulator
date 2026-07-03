/** Formatting helpers for money, percentages and share counts. */

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Compact currency for large totals, e.g. $1.2M. Falls back to full for small values. */
export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    });
  }
  return formatCurrency(value);
}

/** Signed percent, e.g. +1.24% / -0.30%. */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** Signed currency, e.g. +$12.30 / -$4.00. */
export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
}

export function formatShares(qty: number): string {
  return qty.toLocaleString('en-US', { maximumFractionDigits: 4 });
}
