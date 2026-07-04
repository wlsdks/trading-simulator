import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { usePortfolioStore } from '../src/state/stores/portfolioStore';
import { colors } from '../src/theme';

export default function RootLayout() {
  const ready = usePortfolioStore((state) => state.ready);
  const hydrate = usePortfolioStore((state) => state.hydrate);
  const startPriceTicker = usePortfolioStore((state) => state.startPriceTicker);

  useEffect(() => {
    hydrate();
    const stopTicker = startPriceTicker();
    return stopTicker;
  }, [hydrate, startPriceTicker]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={[styles.root, styles.center]}>
          <ActivityIndicator color={colors.accent} size="large" />
          <StatusBar style="light" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.root}>
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.root }} />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
});
