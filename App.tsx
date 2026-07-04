import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TradeModal from './src/components/TradeModal';
import MarketScreen from './src/screens/MarketScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import { LineChart, Wallet, type LucideIcon } from 'lucide-react-native';
import { usePortfolioStore } from './src/state/stores/portfolioStore';
import { colors, spacing } from './src/theme';

type Tab = 'market' | 'portfolio';

const TABS: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: 'market', label: '마켓', Icon: LineChart },
  { key: 'portfolio', label: '내 자산', Icon: Wallet },
];

function Shell() {
  const ready = usePortfolioStore((state) => state.ready);
  const hydrate = usePortfolioStore((state) => state.hydrate);
  const startPriceTicker = usePortfolioStore((state) => state.startPriceTicker);
  const [tab, setTab] = useState<Tab>('market');
  const [tradeTicker, setTradeTicker] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    const stopTicker = startPriceTicker();
    return stopTicker;
  }, [hydrate, startPriceTicker]);

  if (!ready) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.screen}>
        {tab === 'market' ? (
          <MarketScreen onSelect={setTradeTicker} />
        ) : (
          <PortfolioScreen onSelect={setTradeTicker} />
        )}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
              <t.Icon
                size={22}
                strokeWidth={2}
                color={active ? colors.accent : colors.muted}
              />
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.muted }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TradeModal ticker={tradeTicker} onClose={() => setTradeTicker(null)} />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return <Shell />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12, fontWeight: '600' },
});
