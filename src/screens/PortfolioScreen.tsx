import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STOCKS_BY_TICKER } from '../data/stocks';
import { usePortfolioStore } from '../state/stores/portfolioStore';
import { changeColor, colors, radius, spacing } from '../theme';
import {
  formatCurrency,
  formatPercent,
  formatShares,
  formatSignedCurrency,
} from '../utils/format';

interface Props {
  onSelect: (ticker: string) => void;
}

export default function PortfolioScreen({ onSelect }: Props) {
  const cash = usePortfolioStore((state) => state.cash);
  const holdingDetails = usePortfolioStore((state) => state.holdingDetails);
  const totalValue = usePortfolioStore((state) => state.totalValue);
  const totalPL = usePortfolioStore((state) => state.totalPL);
  const totalPLPercent = usePortfolioStore((state) => state.totalPLPercent);
  const holdingsValue = usePortfolioStore((state) => state.holdingsValue);
  const transactions = usePortfolioStore((state) => state.transactions);
  const reset = usePortfolioStore((state) => state.reset);

  const plColor = changeColor(totalPL);
  const holdingEntries = Object.entries(holdingDetails);

  const confirmReset = () => {
    Alert.alert('포트폴리오 초기화', '현금과 보유 종목을 모두 초기 상태로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Total value hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>총 자산</Text>
        <Text style={styles.heroValue}>{formatCurrency(totalValue)}</Text>
        <View style={styles.heroPlRow}>
          <Text style={[styles.heroPl, { color: plColor }]}>
            {totalPL > 0 ? '↑ ' : totalPL < 0 ? '↓ ' : ''}
            {formatSignedCurrency(totalPL)} ({formatPercent(totalPLPercent)})
          </Text>
          <Text style={styles.heroPlCaption}>평가손익</Text>
        </View>
      </View>

      {/* Cash / invested breakdown */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>현금</Text>
          <Text style={styles.statValue}>{formatCurrency(cash)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>주식 평가액</Text>
          <Text style={styles.statValue}>{formatCurrency(holdingsValue)}</Text>
        </View>
      </View>

      {/* Holdings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>보유 종목</Text>
        <Text style={styles.sectionCount}>{holdingEntries.length}</Text>
      </View>

      {holdingEntries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 보유한 종목이 없어요.</Text>
          <Text style={styles.emptySub}>마켓 탭에서 첫 매수를 해보세요.</Text>
        </View>
      ) : (
        holdingEntries.map(([ticker, h]) => {
          const price = h.currentPrice;
          const pl = h.unrealizedPL;
          const plPct = h.unrealizedPLPercent;
          const c = changeColor(pl);
          const stock = STOCKS_BY_TICKER[ticker];
          return (
            <Pressable
              key={ticker}
              style={({ pressed }) => [styles.holding, pressed && styles.holdingPressed]}
              onPress={() => onSelect(ticker)}
            >
              <View style={styles.holdingTop}>
                <Text style={styles.holdingTicker}>{ticker}</Text>
                <Text style={styles.holdingValue}>{formatCurrency(h.value)}</Text>
              </View>
              <View style={styles.holdingBottom}>
                <Text style={styles.holdingMeta}>
                  {formatShares(h.qty)}주 · 평단 {formatCurrency(h.avgCost)}
                </Text>
                <Text style={[styles.holdingPl, { color: c }]}>
                  {pl > 0 ? '↑ ' : pl < 0 ? '↓ ' : ''}
                  {formatSignedCurrency(pl)} ({formatPercent(plPct)})
                </Text>
              </View>
              <Text style={styles.holdingName} numberOfLines={1}>
                {stock?.name} · 현재가 {formatCurrency(price)}
              </Text>
            </Pressable>
          );
        })
      )}

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 거래</Text>
          </View>
          {transactions.slice(0, 15).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View
                style={[
                  styles.txSide,
                  { backgroundColor: (tx.side === 'BUY' ? colors.up : colors.down) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.txSideText,
                    { color: tx.side === 'BUY' ? colors.up : colors.down },
                  ]}
                >
                  {tx.side === 'BUY' ? '매수' : '매도'}
                </Text>
              </View>
              <Text style={styles.txTicker}>{tx.ticker}</Text>
              <Text style={styles.txDetail}>
                {formatShares(tx.qty)}주 @ {formatCurrency(tx.price)}
              </Text>
            </View>
          ))}
        </>
      )}

      <Pressable style={styles.resetBtn} onPress={confirmReset}>
        <Text style={styles.resetText}>포트폴리오 초기화</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroLabel: { color: colors.subtext, fontSize: 14 },
  heroValue: { color: colors.text, fontSize: 36, fontWeight: '800', marginTop: spacing.sm },
  heroPlRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  heroPl: { fontSize: 16, fontWeight: '700' },
  heroPlCaption: { color: colors.subtext, fontSize: 12 },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.subtext, fontSize: 13 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionCount: {
    color: colors.subtext,
    fontSize: 13,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  emptySub: { color: colors.subtext, fontSize: 13, marginTop: 4 },
  holding: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  holdingPressed: { backgroundColor: colors.cardAlt },
  holdingTop: { flexDirection: 'row', justifyContent: 'space-between' },
  holdingTicker: { color: colors.text, fontSize: 16, fontWeight: '700' },
  holdingValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  holdingBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  holdingMeta: { color: colors.subtext, fontSize: 13 },
  holdingPl: { fontSize: 13, fontWeight: '600' },
  holdingName: { color: colors.muted, fontSize: 12, marginTop: 6 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txSide: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  txSideText: { fontSize: 12, fontWeight: '700' },
  txTicker: { color: colors.text, fontSize: 14, fontWeight: '700', width: 60 },
  txDetail: { color: colors.subtext, fontSize: 13, flex: 1 },
  resetBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetText: { color: colors.down, fontSize: 14, fontWeight: '600' },
});
