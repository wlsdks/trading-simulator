export type ColorScheme = 'kr' | 'western';

export const defaultColorScheme: ColorScheme = 'kr';

export const primitives = {
  color: {
    neutral: {
      950: '#0B0E11',
      900: '#11161D',
      850: '#161B22',
      800: '#1C232D',
      700: '#242C38',
      600: '#374151',
      500: '#5B6472',
      400: '#8A94A6',
      200: '#C7CDD7',
      100: '#E6E8EB',
      0: '#FFFFFF',
    },
    blue: {
      700: '#1E3A5F',
      500: '#3B82F6',
      400: '#60A5FA',
      300: '#93C5FD',
    },
    red: {
      600: '#DC2626',
      500: '#EA3943',
      400: '#F87171',
    },
    green: {
      600: '#059669',
      500: '#16C784',
      400: '#34D399',
    },
    amber: {
      500: '#F59E0B',
      400: '#FBBF24',
    },
    black: '#000000',
    white: '#FFFFFF',
  },
  type: {
    size: {
      caption: 11,
      bodySm: 12,
      body: 14,
      bodyLg: 16,
      title: 20,
      headline: 24,
      display: 32,
    },
    lineHeight: {
      caption: 14,
      bodySm: 16,
      body: 20,
      bodyLg: 22,
      title: 26,
      headline: 30,
      display: 40,
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '800',
    },
  },
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    lg: {
      shadowColor: '#000000',
      shadowOpacity: 0.32,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      elevation: 12,
    },
  },
  motion: {
    duration: {
      instant: 0,
      fast: 120,
      base: 180,
      slow: 260,
      celebration: 420,
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
} as const;

export const upDownPalettes = {
  kr: {
    colorUp: primitives.color.red[500],
    colorDown: primitives.color.blue[400],
  },
  western: {
    colorUp: primitives.color.green[500],
    colorDown: primitives.color.red[500],
  },
} as const satisfies Record<ColorScheme, { colorUp: string; colorDown: string }>;

export function createSemanticTokens(colorScheme: ColorScheme = defaultColorScheme) {
  const direction = upDownPalettes[colorScheme];

  return {
    bg: primitives.color.neutral[950],
    surface: primitives.color.neutral[850],
    surfaceAlt: primitives.color.neutral[800],
    border: primitives.color.neutral[700],
    text: primitives.color.neutral[100],
    textMuted: primitives.color.neutral[400],
    textSubtle: primitives.color.neutral[500],
    accent: primitives.color.blue[500],
    accentDim: primitives.color.blue[700],
    colorUp: direction.colorUp,
    colorDown: direction.colorDown,
    positive: primitives.color.green[500],
    negative: primitives.color.red[500],
    warning: primitives.color.amber[500],
    focus: primitives.color.blue[400],
    overlay: 'rgba(0, 0, 0, 0.64)',
    inverseText: primitives.color.white,
  } as const;
}

export type SemanticTokens = ReturnType<typeof createSemanticTokens>;

export function createComponentTokens(semantic: SemanticTokens) {
  return {
    screen: {
      bg: semantic.bg,
    },
    card: {
      bg: semantic.surface,
      pressedBg: semantic.surfaceAlt,
      border: semantic.border,
    },
    sheet: {
      bg: semantic.surface,
      border: semantic.border,
    },
    input: {
      bg: semantic.bg,
      border: semantic.border,
      text: semantic.text,
      placeholder: semantic.textSubtle,
    },
    button: {
      primaryBg: semantic.accent,
      buyBg: semantic.colorUp,
      sellBg: semantic.colorDown,
      text: semantic.inverseText,
    },
    badge: {
      accentBg: semantic.accentDim,
      accentText: semantic.accent,
    },
    market: {
      up: semantic.colorUp,
      down: semantic.colorDown,
      neutral: semantic.textMuted,
    },
    overlay: {
      scrim: semantic.overlay,
    },
  } as const;
}

export type ComponentTokens = ReturnType<typeof createComponentTokens>;

export function createThemeTokens(colorScheme: ColorScheme = defaultColorScheme) {
  const semantic = createSemanticTokens(colorScheme);

  return {
    colorScheme,
    primitives,
    semantic,
    components: createComponentTokens(semantic),
    compat: {
      colors: {
        bg: semantic.bg,
        card: semantic.surface,
        cardAlt: semantic.surfaceAlt,
        border: semantic.border,
        text: semantic.text,
        subtext: semantic.textMuted,
        muted: semantic.textSubtle,
        up: semantic.colorUp,
        down: semantic.colorDown,
        accent: semantic.accent,
        accentDim: semantic.accentDim,
        white: semantic.inverseText,
      },
      spacing: primitives.spacing,
      radius: primitives.radius,
    },
  } as const;
}

export type ThemeTokens = ReturnType<typeof createThemeTokens>;

export const defaultThemeTokens = createThemeTokens(defaultColorScheme);
