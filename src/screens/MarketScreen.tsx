import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STOCKS } from '../data/stocks';
import { usePortfolioStore } from '../state/stores/portfolioStore';
import { changeColor, colors, radius, spacing } from '../theme';
import { formatCurrency, formatPercent } from '../utils/format';

interface Props {
  onSelect: (ticker: string) => void;
}

export default function MarketScreen({ onSelect }: Props) {
  const prices = usePortfolioStore((state) => state.prices);
  const dayOpen = usePortfolioStore((state) => state.dayOpen);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>마켓</Text>
        <Text style={styles.subtitle}>시뮬레이션 시세 · 2초마다 갱신</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {STOCKS.map((item) => {
          const price = prices[item.ticker] ?? item.seedPrice;
          const open = dayOpen[item.ticker] ?? item.seedPrice;
          const changePct = open > 0 ? ((price - open) / open) * 100 : 0;
          const c = changeColor(changePct);
          return (
            <Pressable
              key={item.ticker}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => onSelect(item.ticker)}
            >
              <View style={styles.left}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.ticker.slice(0, 2)}</Text>
                </View>
                <View>
                  <Text style={styles.ticker}>{item.ticker}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.price}>{formatCurrency(price)}</Text>
                <View style={[styles.pill, { backgroundColor: c + '22' }]}>
                  <Text style={[styles.pillText, { color: c }]}>
                    {changePct > 0 ? '↑ ' : changePct < 0 ? '↓ ' : ''}
                    {formatPercent(changePct)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBlock: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.subtext, fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.cardAlt },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  ticker: { color: colors.text, fontSize: 16, fontWeight: '700' },
  name: { color: colors.subtext, fontSize: 12, marginTop: 2, maxWidth: 160 },
  right: { alignItems: 'flex-end', gap: 6 },
  price: { color: colors.text, fontSize: 16, fontWeight: '700' },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
