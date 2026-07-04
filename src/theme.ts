import {
  type ColorScheme,
  createThemeTokens,
  defaultThemeTokens,
  primitives,
} from './theme/tokens';

export {
  type ColorScheme,
  type ComponentTokens,
  type SemanticTokens,
  type ThemeTokens,
  createComponentTokens,
  createSemanticTokens,
  createThemeTokens,
  defaultColorScheme,
  defaultThemeTokens,
  primitives,
  upDownPalettes,
} from './theme/tokens';

/**
 * Backward-compatible app-wide tokens.
 *
 * Existing screens can keep importing colors/spacing/radius from this file.
 * The default up/down convention is Korean: up=red, down=blue.
 */
export const tokens = defaultThemeTokens;
export const semantic = tokens.semantic;
export const componentTokens = tokens.components;
export const colors = tokens.compat.colors;
export const spacing = tokens.compat.spacing;
export const radius = tokens.compat.radius;

export function getThemeTokens(colorScheme: ColorScheme = defaultThemeTokens.colorScheme) {
  return createThemeTokens(colorScheme);
}

/** Returns up/down/neutral color for a signed number. */
export function changeColor(value: number, colorScheme: ColorScheme = defaultThemeTokens.colorScheme): string {
  const selectedColors =
    colorScheme === defaultThemeTokens.colorScheme ? colors : createThemeTokens(colorScheme).compat.colors;

  if (value > 0) return selectedColors.up;
  if (value < 0) return selectedColors.down;
  return selectedColors.subtext;
}

export const type = primitives.type;
export const elevation = primitives.elevation;
export const motion = primitives.motion;
