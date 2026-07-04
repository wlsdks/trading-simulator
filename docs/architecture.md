# Trading Simulator Architecture Rulebook

> Practical engineering rules for the P1 Expo/React Native TypeScript app. This follows `docs/dev-spec.md` and the target module layout under `src/domain`, `src/features`, `src/state`, `src/persistence`, `src/services`, and `src/app`.

## Layer Boundaries

Allowed dependency direction:

```text
src/app -> src/features -> src/state -> src/services
        -> src/features -> src/domain
        -> src/state -> src/domain
        -> src/persistence -> src/domain
```

Rules:

- `domain` is pure, deterministic, framework-free TypeScript. It must not import React, React Native, Zustand, TanStack Query, Expo, MMKV, SQLite, Supabase, or feature modules.
- `features` own user-facing screens/components for one product area. They may import `domain`, `state`, and shared theme tokens, but must not embed pricing, ledger, margin, or persistence algorithms.
- `state` owns Zustand stores and TanStack Query hooks. Stores coordinate UI/game-loop state and call pure domain functions; query hooks own remote Supabase cache state.
- `persistence` owns MMKV, SQLite, Drizzle schemas, migrations, and hydration adapters. It serializes domain outputs but does not change accounting or price meaning.
- `services` owns external integrations such as Supabase auth, contests, profiles, follows, moderation surfaces, and leaderboard sync.
- `app` owns expo-router route files only. Routes compose feature modules, set navigation options, and pass route params. Keep routes thin.

## Module Ownership and Naming

Use the P1 layout from `docs/dev-spec.md`:

```text
src/domain/market/price-engine
src/domain/market/participants
src/domain/market/events
src/domain/market/instruments
src/domain/market/options
src/domain/accounting/money
src/domain/accounting/ledger
src/domain/accounting/margin
src/features/charts/skia-stock-chart
src/features/order-ticket
src/features/portfolio
src/features/rankings
src/features/profile
src/state/stores
src/state/queries
src/persistence/mmkv
src/persistence/sqlite
src/persistence/migrations
src/services/supabase
src/app
```

Naming conventions:

- Domain files use nouns for models (`Money`, `LedgerEntry`) and verbs for pure operations (`priceTick`, `applyFill`, `roundHalfEven`).
- Feature components use PascalCase and stay inside their feature folder unless shared by at least two features.
- Zustand stores are named `useXStore` and live under `src/state/stores`.
- TanStack Query hooks are named `useXQuery` or `useXMutation` and live under `src/state/queries`.
- Persistence adapters are named by storage and purpose, for example `mmkvSessionStore` or `sqliteLedgerRepository`.
- Services expose narrow clients or functions, not global mutable SDK objects from feature code.

## Money, Accounting, Pricing

Money/accounting/pricing logic must live in `src/domain` only.

- All money is integer minor units, named as cents or another explicit minor unit. No floating-point dollars in ledger, balances, margin, fees, fills, or persisted account state.
- Rounding is round-half-even and happens once at transaction boundaries.
- Ledger entries are append-only domain records. Corrections are new entries, not mutation of prior entries.
- CASH accounts preserve `cash >= 0`.
- MARGIN accounts use wallet balance, reserved margin, isolated margin, position equity, account equity, insurance absorption, and liquidation invariants instead of the CASH invariant.
- Price authority is the deterministic price engine mark/last output. Participants, charts, and news may derive from prices but never write canonical prices.
- Options pricing, margin checks, liquidations, fees, and insurance-fund absorption are pure functions with explicit inputs and outputs.

## Testing Discipline

- Domain modules get unit tests for examples and edge cases.
- Ledger, money rounding, pricing, margin, liquidation, PRNG streams, and event scheduling require property-based tests under `src/test/property`.
- Feature modules get component tests for user-visible states, interactions, loading/error states, and accessibility cues.
- State modules get tests for store transitions, selector stability where relevant, and hydration boundaries.
- Persistence modules get migration/serialization tests with fixture data.
- Services get integration-style tests against mocked network boundaries unless a local Supabase test harness is explicitly configured.

## Design Token Rule

UI code must use tokens from `src/theme.ts` and `src/theme/tokens.ts`.

- Do not hardcode raw hex values in components.
- Do not invent one-off spacing, radius, shadow, or motion values in UI code when a token exists.
- Use semantic tokens for meaning (`surface`, `textMuted`, `colorUp`) and component tokens for repeated component pairings.
- Market movement uses `colorUp` and `colorDown`, never direct red/blue/green primitives.
- Color is never the only signal. Price and PL UI must include signed values and direction indicators in addition to color.

## Determinism

Domain code must be replayable.

- Use seeded PRNG only. SplitMix64 substreams are the default design from `docs/dev-spec.md`.
- No `Date.now()`, `new Date()`, `Math.random()`, timers, locale formatting, network calls, storage calls, or global mutable state inside `src/domain`.
- Domain functions receive tick index, seed, market config version, timestamps, and instrument identifiers as explicit inputs.
- Adding charting, participants, news, or UI must not change canonical price streams.

## Definition of Done

### Domain

- Pure TypeScript with no framework imports.
- Explicit input/output types.
- Integer minor units for money.
- Round-half-even at transaction boundaries.
- Unit tests and property tests for invariants.
- Deterministic with seeded inputs only.

### Features

- Composes domain/state without owning business algorithms.
- Uses design tokens only.
- Shows non-color direction cues for market movement.
- Handles empty, loading, error, and pressed/disabled states where applicable.
- Component tests cover primary user paths.

### State

- Zustand stores are narrowly scoped and selector-friendly.
- TanStack Query owns only server/cache state.
- Hydration and persistence boundaries are explicit.
- No domain invariant is enforced only in state code.
- Store transition tests cover critical flows.

### Persistence

- Schema and migration changes are versioned.
- Serialized data maps cleanly to domain types.
- Migrations are backward compatible or have a documented reset path.
- No hidden accounting or pricing calculations in repositories.
- Fixture tests cover read/write and migration behavior.

### Services

- External SDK setup is isolated.
- Functions expose typed app-level operations.
- Retries, auth/session behavior, and error mapping are explicit.
- No solo-mode deterministic simulation logic depends on services.
- Network boundaries are mockable in tests.

### App

- Route files stay thin.
- Navigation params are typed and validated.
- Routes compose feature modules rather than implementing product logic.
- Deep links and share targets enter through route boundaries.
- App shell uses tokens and shared providers only.
