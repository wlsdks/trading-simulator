/**
 * App-wide design tokens. Dark, finance-app inspired palette.
 */
export const colors = {
  bg: '#0B0E11',
  card: '#161B22',
  cardAlt: '#1C232D',
  border: '#242C38',
  text: '#E6E8EB',
  subtext: '#8A94A6',
  muted: '#5B6472',
  up: '#16C784',
  down: '#EA3943',
  accent: '#3B82F6',
  accentDim: '#1E3A5F',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

/** Returns up/down/neutral color for a signed number. */
export function changeColor(value: number): string {
  if (value > 0) return colors.up;
  if (value < 0) return colors.down;
  return colors.subtext;
}
