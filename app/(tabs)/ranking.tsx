import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../src/theme';

export default function RankingRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>랭킹 · 곧 제공</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
