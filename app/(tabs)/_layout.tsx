import { Tabs } from 'expo-router';
import { LineChart, Trophy, User, Wallet } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import TradeModal from '../../src/components/TradeModal';
import { TradeSheetContext } from '../../src/navigation/tradeSheet';
import { colors, spacing } from '../../src/theme';

export default function TabsLayout() {
  const [tradeTicker, setTradeTicker] = useState<string | null>(null);
  const tradeSheet = useMemo(
    () => ({
      openTradeSheet: setTradeTicker,
    }),
    [],
  );

  return (
    <TradeSheetContext.Provider value={tradeSheet}>
      <Tabs
        initialRouteName="market"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          sceneStyle: {
            backgroundColor: colors.bg,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: '마켓',
            tabBarIcon: ({ color }) => (
              <LineChart color={color as string} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: '랭킹',
            tabBarIcon: ({ color }) => (
              <Trophy color={color as string} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: '내 자산',
            tabBarIcon: ({ color }) => (
              <Wallet color={color as string} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '프로필',
            tabBarIcon: ({ color }) => (
              <User color={color as string} size={22} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
      <TradeModal ticker={tradeTicker} onClose={() => setTradeTicker(null)} />
    </TradeSheetContext.Provider>
  );
}
