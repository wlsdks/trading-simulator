import { Flame, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STOCKS, type Stock } from '../data/stocks';
import { usePortfolioStore } from '../state/stores/portfolioStore';
import { changeColor, colors, radius, spacing, type as typography } from '../theme';
import { formatCurrency, formatPercent } from '../utils/format';

interface Props {
  onSelect: (ticker: string) => void;
}

type PulseMetric = 'gainers' | 'losers' | 'turnover' | 'volume' | 'popular';

interface MarketRow {
  stock: Stock;
  price: number;
  open: number;
  changePct: number;
  volume: number;
  turnover: number;
}

const PULSE_SEGMENTS: { key: PulseMetric; label: string }[] = [
  { key: 'gainers', label: '급등' },
  { key: 'losers', label: '급락' },
  { key: 'turnover', label: '거래대금' },
  { key: 'volume', label: '거래량' },
  { key: 'popular', label: '인기' },
];

export default function MarketScreen({ onSelect }: Props) {
  const [activeMetric, setActiveMetric] = useState<PulseMetric>('gainers');
  const prices = usePortfolioStore((state) => state.prices);
  const dayOpen = usePortfolioStore((state) => state.dayOpen);
  const volume = usePortfolioStore((state) => state.volume);
  const turnover = usePortfolioStore((state) => state.turnover);

  const rows = useMemo<MarketRow[]>(
    () =>
      STOCKS.map((stock) => {
        const price = prices[stock.ticker] ?? stock.seedPrice;
        const open = dayOpen[stock.ticker] ?? stock.seedPrice;
        const changePct = open > 0 ? ((price - open) / open) * 100 : 0;

        return {
          stock,
          price,
          open,
          changePct,
          volume: volume[stock.ticker] ?? 0,
          turnover: turnover[stock.ticker] ?? 0,
        };
      }),
    [dayOpen, prices, turnover, volume],
  );

  const pulseRows = useMemo(() => sortPulseRows(rows, activeMetric).slice(0, 5), [activeMetric, rows]);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>마켓</Text>
        <Text style={styles.subtitle}>시뮬레이션 시세 · 2초마다 갱신</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.pulseSection}>
          <View style={styles.pulseHeader}>
            <View>
              <Text style={styles.pulseEyebrow}>시장 디스커버리</Text>
              <Text style={styles.pulseTitle}>마켓 펄스</Text>
            </View>
            {activeMetric === 'popular' ? (
              <Flame size={20} color={colors.accent} strokeWidth={2.4} />
            ) : null}
          </View>

          <View style={styles.segmentedControl} accessibilityRole="tablist">
            {PULSE_SEGMENTS.map((segment) => {
              const active = segment.key === activeMetric;
              return (
                <Pressable
                  key={segment.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.segment,
                    active && styles.segmentActive,
                    pressed && styles.segmentPressed,
                  ]}
                  onPress={() => setActiveMetric(segment.key)}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{segment.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.pulseList}>
            {pulseRows.map((row, index) => (
              <PulseRow
                key={row.stock.ticker}
                row={row}
                rank={index + 1}
                activeMetric={activeMetric}
                onPress={() => onSelect(row.stock.ticker)}
              />
            ))}
          </View>
        </View>

        <Text style={styles.listTitle}>전체 종목</Text>
        {rows.map((row) => {
          const item = row.stock;
          const { price, changePct } = row;
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
                <View style={[styles.pill, { borderColor: c }]}>
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

function PulseRow({
  row,
  rank,
  activeMetric,
  onPress,
}: {
  row: MarketRow;
  rank: number;
  activeMetric: PulseMetric;
  onPress: () => void;
}) {
  const metric = getPulseMetric(row, activeMetric);
  const changeDirection = row.changePct > 0 ? 'up' : row.changePct < 0 ? 'down' : 'flat';
  const c = changeColor(row.changePct);
  const ChangeIcon = row.changePct < 0 ? TrendingDown : TrendingUp;

  return (
    <Pressable style={({ pressed }) => [styles.pulseRow, pressed && styles.rowPressed]} onPress={onPress}>
      <Text style={styles.rank}>{rank}</Text>
      <View style={styles.pulseNameBlock}>
        <Text style={styles.ticker}>{row.stock.ticker}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {row.stock.name}
        </Text>
      </View>
      <View style={styles.pulsePriceBlock}>
        <Text style={styles.price}>{formatCurrency(row.price)}</Text>
        <View style={styles.changeLine}>
          <ChangeIcon size={12} color={c} strokeWidth={2.4} />
          <Text style={[styles.changeText, { color: c }]}>
            {changeDirection === 'flat' ? '±0.00%' : formatPercent(row.changePct)}
          </Text>
        </View>
      </View>
      <View style={styles.metricBlock}>
        {activeMetric === 'popular' ? <Flame size={12} color={colors.accent} strokeWidth={2.2} /> : null}
        <Text style={styles.metricValue}>{metric.value}</Text>
        <Text style={styles.metricLabel}>{metric.label}</Text>
      </View>
    </Pressable>
  );
}

function sortPulseRows(rows: MarketRow[], metric: PulseMetric): MarketRow[] {
  return rows.slice().sort((a, b) => {
    if (metric === 'gainers') return b.changePct - a.changePct;
    if (metric === 'losers') return a.changePct - b.changePct;
    if (metric === 'turnover') return b.turnover - a.turnover;
    if (metric === 'volume') return b.volume - a.volume;
    return popularScore(b) - popularScore(a);
  });
}

function popularScore(row: MarketRow): number {
  return row.turnover * Math.abs(row.changePct);
}

function getPulseMetric(row: MarketRow, metric: PulseMetric): { label: string; value: string } {
  if (metric === 'gainers' || metric === 'losers') {
    return { label: '등락률', value: formatPercent(row.changePct) };
  }
  if (metric === 'turnover') {
    return { label: '거래대금', value: formatCompactCurrency(row.turnover) };
  }
  if (metric === 'volume') {
    return { label: '거래량', value: formatCompactNumber(row.volume) };
  }

  return { label: '인기', value: formatCompactCurrency(popularScore(row)) };
}

function formatCompactCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

function formatCompactNumber(value: number): string {
  return value.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBlock: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.subtext, fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  pulseSection: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pulseEyebrow: {
    color: colors.accent,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: '700',
  },
  pulseTitle: {
    color: colors.text,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
    fontWeight: '800',
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxs,
    marginBottom: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xs,
    borderBottomWidth: 2,
    borderBottomColor: colors.bg,
  },
  segmentActive: { backgroundColor: colors.cardAlt, borderBottomColor: colors.accent },
  segmentPressed: { backgroundColor: colors.cardAlt },
  segmentText: {
    color: colors.subtext,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
    fontWeight: '700',
  },
  segmentTextActive: { color: colors.text },
  pulseList: { gap: spacing.xs },
  pulseRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  rank: {
    width: 22,
    color: colors.subtext,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pulseNameBlock: { flex: 1, minWidth: 0 },
  pulsePriceBlock: { alignItems: 'flex-end', minWidth: 86 },
  changeLine: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  changeText: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricBlock: { width: 72, alignItems: 'flex-end' },
  metricValue: {
    color: colors.text,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: colors.subtext,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: 1,
  },
  listTitle: {
    color: colors.subtext,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
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
    borderWidth: 1,
    minWidth: 64,
    alignItems: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
