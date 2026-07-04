# Trading Simulator — P1 Development Spec

> Date: 2026-07-04. Scope: Expo/React Native TypeScript mobile game with fictional companies, simulated prices, fake money, US-market P1.

## 1. Gap Resolutions

### GAP #1 — State Management

Pick: **Zustand** for client state. Use it for UI state, account/session mode, selected instruments, order-ticket drafts, local simulation controls, and hot derived portfolio snapshots.

Use **TanStack Query** as well for server/cache state once Supabase-backed accounts, contests, profiles, and leaderboards are enabled. Zustand keeps the game loop and local state simple under React 19/New Architecture because it does not require provider-heavy app wiring and it works well with selector-based subscriptions. TanStack Query should not own deterministic market state; it should own remote Supabase reads/writes, invalidation, retry, offline cache policy, and leaderboard/profile freshness.

Verification status: `npm view zustand version`, `npm view zustand peerDependencies`, `npm view @tanstack/react-query version`, and `npm view @tanstack/react-query peerDependencies` were attempted in this session, but the shell could not resolve `registry.npmjs.org` (`ENOTFOUND`). Verified 2026-07-04 (network shell): **zustand@5.0.14**, **@tanstack/react-query@5.101.2**. Install via `npx expo install` where possible so Expo can validate SDK-57 compatibility.

### GAP #2 — Charts

Pick: **custom Skia-based stock charts on `@shopify/react-native-skia`** rather than victory-native XL or react-native-wagmi-charts for P1. P1 needs deterministic, high-frequency line/candlestick/sparkline rendering, liquidation markers, event overlays, and compact ranking cards; a small internal chart renderer gives full control over draw cost, hit testing, visual semantics, and data decimation without waiting on a high-level chart library's RN 0.86/New Architecture support.

Implementation target: `src/features/charts/skia-stock-chart/`, backed by `@shopify/react-native-skia` primitives and pure data transforms. Keep the renderer limited to line, candle, volume bars, crosshair, event/liquidation markers, and sparkline variants for P1.

Verification status: `npm view @shopify/react-native-skia version peerDependencies engines --json` was attempted in this session, but failed with `ENOTFOUND`. Compatibility with Expo SDK 57/New Architecture is assumed from `docs/tech-stack.md` verified 2026-07-04: @shopify/react-native-skia@2.6.9; do not add a higher-level chart dependency without its own registry and README/changelog check.

### GAP #3 — Market Data Vendor

**Moot.** The universe is 100% fictional and every price is simulated in-app. The data source is the deterministic engine stack: price engine + synthetic-participant aggregate layer + hash-Poisson event engine + no-AI templated news. There is no external market-data API, ticker redistribution, exchange feed, or licensing dependency for P1.

## 2. P1 Module Architecture

```text
src/
  app/                          # expo-router routes
  domain/
    market/
      prng/
      price-engine/
      participants/
      events/
      instruments/
      options/
    accounting/
      money/
      ledger/
      margin/
    contests/
    profiles/
  features/
    charts/skia-stock-chart/
    order-ticket/
    portfolio/
    rankings/
    profile/
  state/
    stores/
    queries/
  persistence/
    mmkv/
    sqlite/
    migrations/
  services/
    supabase/
  test/
    property/
```

**Deterministic price engine (`src/domain/market/price-engine`)**: Owns pure, replayable price generation for fictional instruments. Inputs are root seed, instrument seed, market config version, and tick index; output includes base log price, last, mark, day open, and session metadata. Use a seeded PRNG based on SplitMix64 with isolated substreams so adding participants, charting, or news never changes canonical prices.

**Synthetic-participant aggregate layer (`src/domain/market/participants`)**: Generates simulated turnover, volume, trade count, order-flow imbalance, spread, and depth from price features. It is aggregate-only, with no 1,000- or 5,000-agent loop. It reads canonical prices and liquidity profiles but never writes price authority.

**Event engine (`src/domain/market/events`)**: Implements the hash-Poisson scheduler and log-price overlay. Events are deterministic by seed/window/instrument/type, then applied as additive log-price impacts with jump, decay, volatility-regime, and microstructure impulse outputs. News is a pure rendering layer over event envelopes, using reviewed templates only.

**Options Black-Scholes pricing (`src/domain/market/options`)**: Reserve the P2 pricing module now so schemas do not churn. Implement pure Black-Scholes price and Greeks, IV surface interfaces, expiry conventions, and property tests for arbitrage-free constraints; P1 can expose no UI while still keeping the domain contract ready.

**Margin/liquidation engine (`src/domain/accounting/margin`)**: Owns isolated margin, leverage up to 1000x, maintenance margin tiers, margin level, liquidation price, partial liquidation, liquidation fees, insurance-fund absorption, and account-equity clamp. All liquidation checks use mark price authority and produce idempotent ledger events.

**Accounting ledger (`src/domain/accounting/ledger`, `src/domain/accounting/money`)**: All money is integer minor units. Rounding is round-half-even and should happen once at transaction boundaries. CASH accounts preserve `cash >= 0`; MARGIN accounts use wallet balance, reserved margin, isolated margin, position equity, account equity, and insurance absorption invariants instead of the CASH invariant.

**State layer (`src/state`)**: Zustand stores hold local UI/game-loop state and MMKV-backed hot snapshots. TanStack Query hooks live under `src/state/queries` and are limited to Supabase server state: user account, profile, contests, leaderboard pages, follow graph, and sync status.

**Persistence (`src/persistence`)**: MMKV is the hot path for selected account, latest tick snapshots, UI/session flags, and cheap restart hydration. expo-sqlite plus Drizzle is the structured durable store for instruments, price checkpoints, orders, fills, ledger entries, positions, contest caches, and migration history.

**Supabase integration (`src/services/supabase`)**: Owns auth/session setup, account migration from guest to cloud user, contests, profiles, follows, moderation-safe profile surfaces, and leaderboard sync. P1 simulation and accounting remain client-deterministic for solo mode, while contests/leaderboards use server authority and replay/audit hashes.

**Navigation (`src/app`)**: expo-router owns file-based routing for tabs, stacks, modals, deep links, and profile/ranking share targets. Keep route files thin; route screens compose feature modules and never embed pricing, accounting, or persistence logic.

## 3. P1 Dependency Table

Registry verification was required for every exact version, but all `npm view` calls failed in this sandbox with:

```text
getaddrinfo ENOTFOUND registry.npmjs.org
```

Because of that, this table intentionally avoids unverified exact version claims. Run the listed commands in a network-enabled shell, then pin the returned versions with `npx expo install` where Expo owns compatibility.

| Area | Package | Install path | Verification command |
|---|---|---|---|
| Expo runtime | `expo` | `npx expo install expo` | `npm view expo version peerDependencies engines --json` |
| React | `react` | `npx expo install react` | `npm view react version peerDependencies engines --json` |
| React DOM/web option | `react-dom` | `npx expo install react-dom` | `npm view react-dom version peerDependencies engines --json` |
| React Native | `react-native` | `npx expo install react-native` | `npm view react-native version peerDependencies engines --json` |
| Routing | `expo-router` | `npx expo install expo-router` | `npm view expo-router version peerDependencies engines --json` |
| Native screens | `react-native-screens` | `npx expo install react-native-screens` | `npm view react-native-screens version peerDependencies engines --json` |
| Safe area | `react-native-safe-area-context` | `npx expo install react-native-safe-area-context` | `npm view react-native-safe-area-context version peerDependencies engines --json` |
| Gestures | `react-native-gesture-handler` | `npx expo install react-native-gesture-handler` | `npm view react-native-gesture-handler version peerDependencies engines --json` |
| Linking | `expo-linking` | `npx expo install expo-linking` | `npm view expo-linking version peerDependencies engines --json` |
| State | `zustand` | `npm install zustand` | `npm view zustand version peerDependencies engines --json` |
| Server state | `@tanstack/react-query` | `npm install @tanstack/react-query` | `npm view @tanstack/react-query version peerDependencies engines --json` |
| Hot KV | `react-native-mmkv` | `npx expo install react-native-mmkv` | `npm view react-native-mmkv version peerDependencies engines --json` |
| MMKV native peer | `react-native-nitro-modules` | `npx expo install react-native-nitro-modules` | `npm view react-native-nitro-modules version peerDependencies engines --json` |
| Structured DB | `expo-sqlite` | `npx expo install expo-sqlite` | `npm view expo-sqlite version peerDependencies engines --json` |
| ORM | `drizzle-orm` | `npm install drizzle-orm` | `npm view drizzle-orm version peerDependencies engines --json` |
| Migrations | `drizzle-kit` | `npm install -D drizzle-kit` | `npm view drizzle-kit version peerDependencies engines --json` |
| Supabase | `@supabase/supabase-js` | `npm install @supabase/supabase-js` | `npm view @supabase/supabase-js version peerDependencies engines --json` |
| Supabase URL polyfill | `react-native-url-polyfill` | `npm install react-native-url-polyfill` | `npm view react-native-url-polyfill version peerDependencies engines --json` |
| Supabase session storage | `@react-native-async-storage/async-storage` | `npx expo install @react-native-async-storage/async-storage` | `npm view @react-native-async-storage/async-storage version peerDependencies engines --json` |
| Secure token option | `expo-secure-store` | `npx expo install expo-secure-store` | `npm view expo-secure-store version peerDependencies engines --json` |
| Animation | `react-native-reanimated` | `npx expo install react-native-reanimated` | `npm view react-native-reanimated version peerDependencies engines --json` |
| Worklets | `react-native-worklets` | `npx expo install react-native-worklets` | `npm view react-native-worklets version peerDependencies engines --json` |
| Styling | `nativewind` | `npx expo install nativewind` | `npm view nativewind version peerDependencies engines --json` |
| Styling build peer | `tailwindcss` | `npm install -D tailwindcss` | `npm view tailwindcss version peerDependencies engines --json` |
| Charts | `@shopify/react-native-skia` | `npx expo install @shopify/react-native-skia` | `npm view @shopify/react-native-skia version peerDependencies engines --json` |
| Tests | `jest-expo` | `npx expo install jest-expo` | `npm view jest-expo version peerDependencies engines --json` |
| Test runner | `jest` | `npm install -D jest` | `npm view jest version peerDependencies engines --json` |
| RN tests | `@testing-library/react-native` | `npm install -D @testing-library/react-native` | `npm view @testing-library/react-native version peerDependencies engines --json` |
| Jest types | `@types/jest` | `npm install -D @types/jest` | `npm view @types/jest version peerDependencies engines --json` |
| Property tests | `fast-check` | `npm install -D fast-check` | `npm view fast-check version peerDependencies engines --json` |
| Lint | `eslint` | `npx expo install eslint` | `npm view eslint version peerDependencies engines --json` |
| Expo lint config | `eslint-config-expo` | `npx expo install eslint-config-expo` | `npm view eslint-config-expo version peerDependencies engines --json` |
| Format | `prettier` | `npm install -D prettier` | `npm view prettier version peerDependencies engines --json` |
| TypeScript | `typescript` | `npx expo install typescript` | `npm view typescript version peerDependencies engines --json` |
| React types | `@types/react` | `npx expo install @types/react` | `npm view @types/react version peerDependencies engines --json` |
| EAS | `eas-cli` | `npm install -D eas-cli` | `npm view eas-cli version peerDependencies engines --json` |

## 4. Implementation Gates

1. Rerun every `npm view` command above before adding dependencies; fill exact pins only from successful registry output.
2. Run `npx expo install --fix` after dependency installation to align Expo-owned native packages with SDK 57.
3. Add property tests for SplitMix64 stream isolation, deterministic event replay, CASH/MARGIN invariants, round-half-even ledger boundaries, and leverage/liquidation formulas before enabling contests.
4. Keep all fictional instrument identifiers behind a real-ticker denylist before any market/event UI ships.
