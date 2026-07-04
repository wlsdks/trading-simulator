# AGENTS.md

Instructions for any AI coding agent working in this repo (the tool-agnostic standard).
Claude Code additionally reads `CLAUDE.md`, which is a superset of this file — the shared rules
below are authoritative for every tool; keep the two in sync.

## Project

A **fun-first fake-money stock game** — 100% fictional companies, deterministic **simulated**
prices, fake money. Not an education app and not investment advice. Expo (React Native) +
TypeScript, iOS/Android first (web optional). P1 = US spot + leverage + rankings.
Product source of truth lives in `docs/` (`docs/p1-scope.md` for scope, `docs/dev-spec.md` for
architecture).

## Setup & commands

```bash
npx expo install            # install deps — ALWAYS use this, not `npm install`, for Expo packages
npm start                   # dev server (i = iOS, a = Android, w = web)
npm run ios | android | web # open a specific platform
npx tsc --noEmit            # typecheck — the primary check; run before you finish
npx expo export             # validate the JS bundle builds
npx expo-doctor             # verify native dependency / SDK alignment
npx expo lint               # eslint
```

`jest` (jest-expo) is planned but not yet configured; once it is, run `npm test` /
`npx jest <file>`. Until then **`npx tsc --noEmit` is the verification gate** — do not report a
change as done without it passing. After adding packages, run `npx expo install --fix`.

## Stack

Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript 6 (strict) · Hermes · New Architecture
(forced — every native dep must support it). State: Zustand + TanStack Query. Charts: custom Skia.
Don't upgrade core runtime versions; pin via `npx expo install`. Details: `docs/tech-stack.md`.

## Code style

- TypeScript strict. No `any` escapes without a reason. Prefer pure functions in the domain.
- **Money = integer minor units (cents)**, never floats. Round **half-even**, once, at transaction
  boundaries. Use the `Money` value object.
- **Domain code is deterministic & pure:** no `Date.now()` / `Math.random()` in `src/domain/**`.
  Randomness comes only from the seeded SplitMix64 PRNG keyed by `(seed, instrument, tickIndex)`;
  identical inputs must replay identical outputs.
- **No hardcoded colors** — use semantic theme tokens (`src/theme.ts`); up/down = `colorUp` /
  `colorDown`, and always pair color with a +/− sign or arrow (accessibility).
- **Fictional tickers only** — no real company/symbol; instrument IDs pass a real-ticker denylist.
- Keep `src/app/**` route files thin; screens compose feature modules, no business logic inside.

## Architecture (`docs/dev-spec.md §2` is the SSOT)

- `src/domain/**` — pure engine + accounting (`market/*`, `accounting/{money,ledger,margin}`); no
  RN imports, no I/O, no clock/randomness.
- `src/features/**` — UI modules (charts, order-ticket, portfolio, rankings, profile).
- `src/state/**` — `stores/` (Zustand), `queries/` (TanStack Query → Supabase only).
- `src/persistence/**` — MMKV (hot) + expo-sqlite/Drizzle (durable) + migrations.
- `src/services/supabase/**` — auth, contests, leaderboards.

The existing `src/{components,screens,engine,…}` tree is the legacy MVP being migrated to the above;
put new domain/accounting code under `src/domain/**`.

## Testing expectations

Accounting and determinism are correctness-critical. When the test harness lands, add property
tests (fast-check) for: integer-cents ledger closure, round-half-even boundaries, CASH & MARGIN
invariants, deterministic price/event replay, and leverage/liquidation formulas — before enabling
contests. Invariants must hold after every fill, restore, and reset.

## Guardrails (must not cross)

1. **No real cash prizes / entry fees / rake.** Fake money; contest rewards are non-cash.
2. **No real tickers or companies.** 100% fictional, enforced by denylist.
3. **Fun-first, not education, not advice.** No personalized buy/sell recommendations; keep the
   "simulated, not real investing" disclaimer. Real-time real data would require a license (out of
   P1 — P1 is fully simulated).
4. Never weaken accounting invariants or engine determinism to ship a feature faster.

## PR / commit

Do not commit or push unless asked. Branch off the default branch before committing. Keep commits
scoped; run `npx tsc --noEmit` (and `npx expo lint`) before proposing a commit.
