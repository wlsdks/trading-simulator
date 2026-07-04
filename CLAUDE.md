# CLAUDE.md

Guidance for Claude Code in this repo. This file is the Claude-Code superset; shared,
tool-agnostic rules live in `AGENTS.md` (read it too). When they overlap, they agree —
edit both. Keep this file short: if a line wouldn't change your behavior, cut it.

## What this is

A **fun-first fake-money stock GAME** (not an education app, not investment advice). Everything
is **100% fictional companies** with **deterministic simulated prices** — no real market data, no
external feed. Expo (React Native) + TypeScript, iOS/Android first, web optional.
P1 = US spot trading + leverage + rankings. See `docs/` for the source of truth.

## Commands

```bash
npm start                 # Expo dev server (then press i / a / w, or scan)
npm run ios               # open iOS simulator
npm run android           # open Android emulator
npm run web               # open web
npx tsc --noEmit          # typecheck — run after any change (primary check today)
npx expo export           # validate the bundle builds (no test suite yet)
npx expo-doctor           # verify SDK/native dependency alignment
npx expo lint             # eslint (eslint-config-expo)
```

Tests: `jest` (jest-expo) is planned but **not wired up yet** — once it is, `npm test` and
`npx jest path/to/file.test.ts` are the checks. Until then, **`npx tsc --noEmit` is the
verification gate** — run it before declaring work done.

**Install deps with `npx expo install <pkg>`, never `npm install <pkg>` for anything Expo owns.**
Expo pins SDK-57-compatible versions; hand-pinning breaks New Architecture / native pairing
(e.g. reanimated↔worklets). Run `npx expo install --fix` after installs.

## Stack (pinned — don't upgrade the core)

Expo SDK **57**, React Native **0.86**, React **19.2**, TypeScript **6** (strict), Hermes,
**New Architecture is forced** (no opt-out) → every native dep must support it. State: Zustand
(client/game loop) + TanStack Query (Supabase server state only). Charts: custom Skia renderer.
Full matrix + rationale: `docs/tech-stack.md`; P1 pins + install commands: `docs/dev-spec.md §3`.

## Conventions (project-specific — these differ from defaults)

- **Money is integer minor units (cents).** Never floats for money. A `Money` value object owns
  arithmetic; round **half-even**, once, at transaction boundaries only. `docs/dev-spec.md §2`.
- **The domain is deterministic and pure.** `NO Date.now()` and `NO Math.random()` inside
  `src/domain/**`. Prices/events come from a seeded SplitMix64 PRNG with isolated substreams keyed
  by `(seed, instrument, tickIndex)` — same inputs must replay identical outputs across restarts
  and devices. Adding participants/charts/news must never perturb canonical prices.
- **Accounting invariants hold after every fill, restore, and reset.** CASH: `cash >= 0`,
  `qty >= 0`, `equity = cash + holdingsValue`. MARGIN: `walletBalance/isolatedMargin/accountEquity
  >= 0` with loss cap + insurance-fund ledger separation. Buy/sell are atomic and idempotent
  (UUID transaction IDs). Reset is atomic — old accounting must not bleed into a new session.
- **No hardcoded colors.** Use semantic tokens (`src/theme.ts`). Up/down uses `colorUp`/`colorDown`
  (default is **Korean-style: up=red, down=blue**, user-toggleable) — never literal hex, and always
  pair color with a sign/arrow for accessibility. `docs/design-decisions.md`.
- **Fictional tickers only.** All instrument identifiers must pass a real-ticker denylist before any
  market/event UI ships. Never introduce a real company or symbol (AAPL, TSLA, …).
- TypeScript strict; keep route files (`src/app/**`) thin — screens compose feature modules and
  contain no pricing/accounting/persistence logic.

## Architecture

Target layout (`docs/dev-spec.md §2` is the SSOT):

- `src/domain/**` — pure, testable engine + accounting. `market/{prng,price-engine,participants,
  events,instruments,options}`, `accounting/{money,ledger,margin}`, `contests`, `profiles`. No RN
  imports, no I/O, no clock/randomness.
- `src/features/**` — UI feature modules: `charts/skia-stock-chart`, `order-ticket`, `portfolio`,
  `rankings`, `profile`.
- `src/state/**` — `stores/` (Zustand), `queries/` (TanStack Query → Supabase only).
- `src/persistence/**` — `mmkv/` (hot path), `sqlite/` + Drizzle (durable), `migrations/`.
- `src/services/supabase/**` — auth, contests, leaderboards (server authority for competition).

> The current tree (`src/{components,screens,engine,context,data,utils,theme}`) is the legacy MVP
> being migrated toward the layout above. New domain/accounting code goes in `src/domain/**`.

## Docs SSOT map

- `docs/PRD.md` — vision, personas, scope, features (top-level product truth)
- `docs/p1-scope.md` — **what is IN/OUT for Phase 0 / MVP / P1-deferred** (scope SSOT)
- `docs/dev-spec.md` — module architecture, pins, implementation gates
- `docs/tech-stack.md` — confirmed stack + compatibility matrix
- `docs/design-decisions.md` — visual/theme SSOT (dark fintech, up/down colors)
- `docs/instruments-and-markets.md`, `docs/living-market.md` — market/instrument/event model
- `docs/policies.md`, `docs/use-cases.md` — 215 policies, 49 use cases
- Module **rules & dependency discipline**: `docs/architecture.md`. Module **layout**: `dev-spec.md §2`.

## Hard guardrails (do not cross)

1. **No real cash prizes, entry fees, or rake.** Fake money only; contest rewards are non-cash.
2. **No real tickers / no real companies.** 100% fictional universe, enforced by denylist.
3. **Fun-first, not education, not advice.** No personalized buy/sell recommendations. Keep the
   "simulated / not real investing" disclaimer. If real-time real data is ever added, it needs a
   license — but P1 is fully simulated.
4. Don't weaken accounting invariants or determinism to make a feature easier — fix the design.
