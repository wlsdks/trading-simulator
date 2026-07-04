# Trading Simulator Design Tokens

> Status: buildable SSOT for the dark-first premium fintech UI. Grounded in `docs/design-decisions.md`: serious market density, deep charcoal surfaces, restrained motion, and game feel through microinteractions rather than neon styling.

## Token Tiers

The product must always be tokenized. UI code uses semantic or component tokens, not raw hex values or ad hoc spacing numbers. Primitive tokens are the raw material; semantic tokens express product meaning; component tokens capture repeated UI decisions.

## 1. Primitive Tokens

### Color Ramps

```ts
neutral.950 #0B0E11  app background
neutral.900 #11161D  raised base
neutral.850 #161B22  card/sheet
neutral.800 #1C232D  alternate surface
neutral.700 #242C38  border
neutral.600 #374151  strong border
neutral.500 #5B6472  muted icon/text
neutral.400 #8A94A6  secondary text
neutral.200 #C7CDD7  tertiary foreground
neutral.100 #E6E8EB  primary text
neutral.000 #FFFFFF  inverse text

blue.700    #1E3A5F  accent dim background
blue.500    #3B82F6  accent/focus base
blue.400    #60A5FA  dark-mode down color
blue.300    #93C5FD  hover/focus lift

red.600     #DC2626  negative/action red
red.500     #EA3943  dark-mode up color
red.400     #F87171  hover/focus lift

green.600   #059669  western up fallback
green.500   #16C784  positive/success
green.400   #34D399  success lift

amber.500   #F59E0B  warning
amber.400   #FBBF24  warning lift
black       #000000
white       #FFFFFF
```

### Type Scale

React Native font sizes are unitless dp values.

| Token | Size | Line height | Use |
|---|---:|---:|---|
| `caption` | 11 | 14 | Dense labels, table captions |
| `bodySm` | 12 | 16 | Metadata, secondary rows |
| `body` | 14 | 20 | Default UI text |
| `bodyLg` | 16 | 22 | Row titles, buttons |
| `title` | 20 | 26 | Sheet and card titles |
| `headline` | 24 | 30 | Screen section headline |
| `display` | 32 | 40 | Portfolio hero values |

Weights: `regular=400`, `medium=500`, `semibold=600`, `bold=700`, `black=800`.

### Spacing Scale

Use the existing compact RN spacing scale and extend only through tokens:

`none=0`, `xxs=2`, `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `xxl=32`, `xxxl=48`.

### Radius

`none=0`, `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `pill=999`.

Cards and repeated rows should generally stay at `sm` or `md`; use `lg` for sheets and portfolio hero surfaces.

### Elevation / Shadow

Dark UI should use subtle separation:

| Token | Shadow | Use |
|---|---|---|
| `none` | no shadow | Flat list rows |
| `sm` | black 18%, radius 8, y 2 | Pressable cards |
| `md` | black 24%, radius 16, y 8 | Bottom sheets, modals |
| `lg` | black 32%, radius 24, y 16 | Rare overlays |

### Motion

Durations: `instant=0ms`, `fast=120ms`, `base=180ms`, `slow=260ms`, `celebration=420ms`.

Easings: `standard=cubic-bezier(0.2, 0, 0, 1)`, `emphasized=cubic-bezier(0.2, 0, 0, 1.2)`, `exit=cubic-bezier(0.4, 0, 1, 1)`.

## 2. Semantic Tokens

Dark mode is primary. A future light theme may use the same semantic names with different primitives, but dark mode remains the quality bar.

| Semantic token | Dark value | Meaning |
|---|---|---|
| `bg` | `neutral.950` | App background |
| `surface` | `neutral.850` | Cards, rows, sheets |
| `surfaceAlt` | `neutral.800` | Pressed/alternate card |
| `border` | `neutral.700` | Standard divider/border |
| `text` | `neutral.100` | Primary foreground |
| `textMuted` | `neutral.400` | Secondary foreground |
| `textSubtle` | `neutral.500` | Tertiary/disabled foreground |
| `accent` | `blue.500` | Primary brand/action |
| `accentDim` | `blue.700` | Low-emphasis accent fill |
| `positive` | `green.500` | Success/completion states |
| `negative` | `red.500` | Errors/destructive states |
| `warning` | `amber.500` | Risk and caution |
| `focus` | `blue.400` | Focus ring/active outline |
| `overlay` | black at 64% | Modal scrim |
| `colorUp` | scheme-dependent | Price/PL movement up |
| `colorDown` | scheme-dependent | Price/PL movement down |

## Up / Down Color Schemes

Default scheme: `kr`.

| Scheme | `colorUp` | `colorDown` | Use |
|---|---|---|---|
| `kr` | red `#EA3943` | blue `#60A5FA` | Default for KR/JP market convention |
| `western` | green `#16C784` | red `#EA3943` | Alternate setting for western convention |

This scheme must be switchable at runtime via `colorScheme: 'kr' | 'western'`. Persisting the user setting belongs in state/persistence, but rendering code should only consume the resolved semantic tokens.

Accessibility rule: color must never be the only signal for market direction. Always pair up/down color with a signed value (`+1.2%`, `-0.8%`) and an arrow or equivalent icon (`↑`, `↓`) in price, PL, and ranking UI.

## 3. Component-ish Tokens

Use these for repeated UI decisions:

```ts
components.screen.bg = semantic.bg
components.card.bg = semantic.surface
components.card.pressedBg = semantic.surfaceAlt
components.card.border = semantic.border
components.sheet.bg = semantic.surface
components.input.bg = semantic.bg
components.input.border = semantic.border
components.button.primaryBg = semantic.accent
components.button.buyBg = semantic.colorUp
components.button.sellBg = semantic.colorDown
components.badge.accentBg = semantic.accentDim
components.badge.accentText = semantic.accent
components.market.up = semantic.colorUp
components.market.down = semantic.colorDown
components.market.neutral = semantic.textMuted
components.overlay.scrim = semantic.overlay
```

When creating a new component token, first check whether a semantic token is enough. Add component tokens only when a repeated component needs stable background, border, text, or state pairings.
