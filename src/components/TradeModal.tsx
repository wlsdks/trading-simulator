import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';
import { STOCKS_BY_TICKER } from '../data/stocks';
import { colors, radius, spacing } from '../theme';
import { formatCurrency, formatShares } from '../utils/format';

interface Props {
  ticker: string | null;
  onClose: () => void;
}

type Side = 'BUY' | 'SELL';

export default function TradeModal({ ticker, onClose }: Props) {
  const { prices, cash, holdings, buy, sell } = usePortfolio();
  const [side, setSide] = useState<Side>('BUY');
  const [qtyText, setQtyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset local state each time a new ticker is opened.
  useEffect(() => {
    setSide('BUY');
    setQtyText('');
    setError(null);
  }, [ticker]);

  const stock = ticker ? STOCKS_BY_TICKER[ticker] : null;
  const price = ticker ? prices[ticker] ?? 0 : 0;
  const held = ticker ? holdings[ticker]?.qty ?? 0 : 0;
  const qty = Number(qtyText) || 0;
  const estimated = price * qty;

  const maxQty = useMemo(() => {
    if (!ticker) return 0;
    if (side === 'BUY') return price > 0 ? Math.floor(cash / price) : 0;
    return held;
  }, [ticker, side, price, cash, held]);

  if (!ticker || !stock) return null;

  const submit = () => {
    setError(null);
    const result = side === 'BUY' ? buy(ticker, qty) : sell(ticker, qty);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error ?? 'Trade failed');
    }
  };

  const canSubmit = qty > 0 && (side === 'BUY' ? estimated <= cash : qty <= held);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.ticker}>{stock.ticker}</Text>
              <Text style={styles.name}>{stock.name}</Text>
            </View>
            <Text style={styles.price}>{formatCurrency(price)}</Text>
          </View>

          {/* Buy / Sell toggle */}
          <View style={styles.sideToggle}>
            {(['BUY', 'SELL'] as Side[]).map((s) => {
              const active = side === s;
              const activeColor = s === 'BUY' ? colors.up : colors.down;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSide(s)}
                  style={[
                    styles.sideBtn,
                    active && { backgroundColor: activeColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.sideBtnText,
                      { color: active ? colors.white : colors.subtext },
                    ]}
                  >
                    {s === 'BUY' ? '매수' : '매도'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.qtyRow}>
            <Text style={styles.label}>수량</Text>
            <Pressable onPress={() => setQtyText(String(maxQty))}>
              <Text style={styles.maxBtn}>MAX {maxQty}</Text>
            </Pressable>
          </View>
          <TextInput
            value={qtyText}
            onChangeText={(t) => setQtyText(t.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={styles.input}
          />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>예상 금액</Text>
            <Text style={styles.summaryValue}>{formatCurrency(estimated)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {side === 'BUY' ? '주문가능 현금' : '보유 수량'}
            </Text>
            <Text style={styles.summaryValue}>
              {side === 'BUY' ? formatCurrency(cash) : `${formatShares(held)} 주`}
            </Text>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[
              styles.submit,
              { backgroundColor: side === 'BUY' ? colors.up : colors.down },
              !canSubmit && styles.submitDisabled,
            ]}
          >
            <Text style={styles.submitText}>
              {side === 'BUY' ? '매수하기' : '매도하기'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ticker: { color: colors.text, fontSize: 22, fontWeight: '700' },
  name: { color: colors.subtext, fontSize: 13, marginTop: 2 },
  price: { color: colors.text, fontSize: 20, fontWeight: '600' },
  sideToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  sideBtnText: { fontSize: 15, fontWeight: '700' },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { color: colors.subtext, fontSize: 14 },
  maxBtn: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: { color: colors.subtext, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  error: { color: colors.down, fontSize: 13, marginTop: spacing.sm },
  submit: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
