# Trading Simulator — Planning Quality Evaluation

## 1. Overall Maturity Score: 7/10

The planning is unusually mature in domain depth, risk awareness, and engineering specificity. The strongest evidence is the amount of hard policy work already done: `policies.md` now declares **16 domains / 215 policies** in `개요`; `PRD.md` has explicit Phase 0 correctness gates in `§19.7.1 Phase 0 완료`; `instruments-and-markets.md` gives concrete formulas for margin, liquidation, options, futures, perps, FX, and accounting in `§4` through `§7`; and `game-modes.md` closes several real contest-integrity holes in `§3.5 시드 무결성` and `§6.5 어뷰징 매트릭스`.

The score is not higher because the planning is no longer a clean single-source plan. It is an accreted planning system with several generations of truth. Newer docs say "fun-first stock game" and 100% fictional companies, while older or index docs still say education/game hybrid, 12 domains / 152 policies, and 45 use cases. More importantly, the P1 scope has expanded from a buildable mobile game slice into a combined trading-engine, social, moderation, synthetic-market, event/news, and compliance platform. That is impressive planning, but it is not yet a build-ready execution plan for full P1.

## 2. Completeness

### Product

Adequately covered:
- Positioning is clear in current primary docs: `README.md` `포지셔닝 (2026-07 확정)` and `PRD.md §1.1` define this as a fake-money, fun-first trading game, not education or real investing.
- Core user loops are covered: onboarding and first buy in `PRD.md §7.2`, game progression in `PRD.md §8`, personal vs contest mode in `game-modes.md §2` and `§3`, social/profiles/rankings in `social-profiles.md §5` through `§11`, and "living market" discovery in `living-market.md §1` through `§4`.

Missing or weak:
- There is no ruthlessly prioritized P1 product slice. `PRD.md §5.0` and `instruments-and-markets.md §9` define P1 as US long/short, 1000x leverage, liquidation, ETF, profiles, rankings, and social; `living-market.md §9` then adds synthetic participants, events, market pulse, No-AI news, capital actions, and new GRF/NWS policies. This is too broad to execute as one P1.
- UX deliverables are described at flow level, but not at screen/state acceptance level. For example, `PRD.md §7.1` defines 5 tabs and progressive disclosure, but there is no screen inventory with MVP/P1 ownership, empty/error/loading states per screen, or navigation acceptance criteria.
- Content operations are under-scoped for a fictional-company game. `living-market.md §11` explicitly asks for virtual-company roster scale and season-arc investment, but that is still an owner decision rather than a production plan.

### Trading Domain / Accounting

Adequately covered:
- This is the strongest area. `PRD.md §6.1`, `PRD.md §19.4`, `policies.md §13 LEV`, and `instruments-and-markets.md §7` define the accounting invariants, cent precision, realized P&L, external-flow separation, margin account invariants, and property-test gates.
- The product correctly separates cost-basis instruments from margin-MTM instruments in `PRD.md §5.0` and `instruments-and-markets.md §0.1`.
- Liquidation and negative-equity handling are explicitly resolved in `PRD.md §18 O13`, `policies.md LEV-05`, and `instruments-and-markets.md §4.5`.

Missing or weak:
- The formulas are specified, but the executable domain contract is not yet reduced to a P1 test matrix. `PRD.md §19.4 NFR-C06` lists broad property-test categories, but P1 needs a concrete, minimal "must pass before UI work" list for US spot, short, isolated leverage, liquidation, and ranking eligibility.
- Several advanced domains are reserved in P1 even when not implemented until P2/P3/P4. Schema reservation is sensible, but the current docs do not clearly separate "field exists" from "business behavior is implemented" across all screens and APIs.

### Tech

Adequately covered:
- `tech-stack.md §2` and `dev-spec.md §2` give a concrete Expo/React Native + TypeScript stack, state approach, persistence split, Skia chart direction, Supabase integration, and module architecture.
- `PRD.md §10.3` correctly identifies that Supabase Edge/Realtime alone cannot host the required stateful market fanout, and introduces a separate real-time plane.

Missing or weak:
- The stack docs have stale unresolved notes. `tech-stack.md §6` and `§245 보강 필요` say state management and chart libraries require follow-up; `dev-spec.md §1 GAP #1` and `GAP #2` resolve them with Zustand/TanStack Query and custom Skia charts. The plan needs one current tech SSOT.
- There is no migration plan from the current AsyncStorage single local account described in `PRD.md §1.2` to the SQLite/Drizzle/MMKV/domain architecture described in `dev-spec.md §2`.
- Backend sequencing is still overloaded. `PRD.md MVP` says server/auth/cloud sync are out; `PRD.md §17 Q4 2026` brings them in; `dev-spec.md §2` includes Supabase modules in P1 architecture. That is manageable only if "P1" is split into local Phase 0, MVP, and server P1.

### UX

Adequately covered:
- High-level IA, onboarding, daily return, trade flow, accessibility, locale rules, and mode badges are covered in `PRD.md §7`.
- Social/profiles have strong safety-oriented UX rules in `social-profiles.md §7` and `§10`.
- Contest discovery and participation flows are detailed in `game-modes.md §4`.

Missing or weak:
- No tangible UX artifact set is defined: no wireframe list, component/state inventory, copy deck, or first playable scenario spec.
- Notification UX remains incomplete. `PRD.md §7.4` and `living-market.md §3.6` define push caps and loss-chasing suppression, but `planning-review-r3.md §8` still flags push opt-in, win-back, and lifecycle notifications as missing.
- The onboarding legal flow is inconsistent across docs, which directly affects UX implementation.

### Legal / Compliance

Adequately covered:
- The high-level redlines are clear: no real money, no actual brokerage/advice, no cash prize contests, no unlicensed real-time redistribution. See `PRD.md §1.4`, `§13.1`, `game-modes.md §5`, and `reference-research.md §6.2`.
- The move to 100% fictional issuers is correctly identified as a hard gate in `living-market.md §6` and `PRD.md §13.4`.

Missing or weak:
- Legal planning is strong at issue spotting but not equivalent to legal clearance. `planning-review-r3.md 총평` and `§10` explicitly say the law/multi-jurisdiction review was thin or effectively not executed.
- The plan still lacks a single compliance release checklist that resolves age gate, consent, App Store declarations, fictional-issuer clearance, UGC moderation, privacy signals, sanctions, and country-specific prize rules into one launch gate.

### Ops

Adequately covered:
- `PRD.md §19` gives unusually concrete NFRs, release gates, crash-free targets, accounting zero-tolerance, RLS coverage, and phase exit criteria.
- `policies.md §12 OPS` exists as an operations/release/QA policy domain.

Missing or weak:
- Incident response, moderation staffing, admin tooling, and support workflows are still thin relative to the social scope. `social-profiles.md §10` requires moderation before social launch, but the actual resourcing and SLA model are not developed beyond policy level.
- P1 has no delivery plan with owner, dependency, estimate, and critical path. `planning-review.md §18` previously requested an assumptions/dependencies/constraints register; that remains a gap.

### Analytics

Adequately covered:
- `tracking-plan.md` covers event naming, consent tiers, WAP, activation, K-factor, anti-metrics, offline queueing, and governance.
- `monetization-model.md` is a good financial SSOT with net/gross labels, BEP math, CAC/LTV discipline, and update triggers.

Missing or weak:
- `tracking-plan.md §2` says events are classified into 7 categories aligned 1:1 with policy domains, but `policies.md 개요` has 16 domains. That taxonomy is now stale.
- The living-market expansion is not fully represented in tracking. `living-market.md §7` adds event-after-chase, news-to-trade, and liveParticipants exposure anti-metrics, but `tracking-plan.md §5` remains too coarse for market pulse/news/event-loop analysis.
- Guest identity is still an execution risk. `tracking-plan.md §8` proposes an offline anonymous path, while `planning-review-r3.md §7` flags MVP identity spine issues.

## 3. Internal Consistency

1. **Policy/domain counts are inconsistent across docs.**
   - `README.md 문서` says `policies.md` has **12 domains / 152 policies**.
   - `PRD.md §14 정책 요약` says **about 15 domains / about 192 policies** after LEV/CRY/SOC expansion.
   - `policies.md 개요` says **16 domains / 215 policies** after the living-market/NWS expansion.
   - Evaluation: `policies.md` appears most current; README and PRD summary are stale.

2. **Use-case count is inconsistent.**
   - `README.md 문서` says `use-cases.md` has **45 use cases**.
   - `use-cases.md 한줄요약` says **49 use cases**.
   - `use-cases.md §4 유즈케이스 목록 및 ID 체계` lists UC-A01~A14 and UC-B01~B35, which totals 49.
   - Evaluation: README is stale.

3. **Current product positioning conflicts with older research framing.**
   - `README.md 포지셔닝` says the product is "재미로 하는 주식 게임" and explicitly says the initial education frame was discarded.
   - `PRD.md §1.1` says differentiation is not learning/discipline but fun, social, collection, and seasonal content.
   - `reference-research.md 한줄요약` and `§1` still position the app as an education/game hybrid, and `§7.1` says the reward function should be learning/risk-management.
   - Evaluation: `reference-research.md` is useful historical input, but it is not clearly marked as superseded in the parts that still recommend education-first positioning.

4. **P1/MVP terminology is overloaded and creates scope ambiguity.**
   - `PRD.md MVP (Q3 2026)` excludes server/auth/cloud sync and says MVP remains local.
   - `PRD.md §5.0` says P1 includes US spot long/short, 1000x leverage/liquidation, ETF, profiles, rankings, and social policy.
   - `PRD.md §17` says P1 starts in Q3 MVP but is completed in Q4 v1 with server/profile/ranking.
   - `use-cases.md §7 우선순위 표` labels UC-B32~B35 profiles/follow/leaderboard as P1, while UC-B29~B31 moderation is P2, even though `social-profiles.md §11` says T&S is a P1 hard gate for social.
   - Evaluation: "P1" means at least three different things: product phase, roadmap overlay, and use-case priority. This is build-confusing.

5. **Consent timing conflicts inside the PRD.**
   - `PRD.md §7.2 온보딩` says onboarding shows only a micro-banner; full disclaimer consent is delayed until social/payment/contest entry.
   - `PRD.md §13.2 면책 3단계 + 동의 원장` says step 1 is onboarding full-screen notice with checkbox, timestamp, and version.
   - Evaluation: this directly affects onboarding implementation and the claimed 30-second guest flow.

6. **Age-data minimization conflicts with use-case wording.**
   - `PRD.md §7.2` and `§13.3` say collect only birth year/month.
   - `use-cases.md UC-B02` says age gate is based on "생년월일" and the flow asks the user to input birth date.
   - Evaluation: use-cases should be changed to birth year/month if data minimization is the intended rule.

7. **Liquidation-history visibility conflicts across docs.**
   - `instruments-and-markets.md §7.10` says liquidation count and max leverage are exposed on profile risk indicators and cannot be hidden on public profiles.
   - `social-profiles.md §7 프로필 필드 공개범위 매트릭스` says liquidation history / max leverage defaults to private, with only risk summary opt-in.
   - `policies.md SOC-05` says liquidation history is default private and public display is count/risk-summary only.
   - Evaluation: social/privacy docs and instruments docs disagree on whether liquidation history is mandatory public risk transparency or a private/opt-in field.

8. **Tech stack SSOT is split.**
   - `tech-stack.md §245 보강 필요` says state management and chart library decisions still need follow-up.
   - `dev-spec.md §1 GAP #1` chooses Zustand + TanStack Query, and `GAP #2` chooses custom Skia charts.
   - Evaluation: the newer dev spec likely resolves the gap, but the stack document still tells engineers the topic is unresolved.

9. **Tracking taxonomy is stale against the policy model.**
   - `tracking-plan.md §2 명명 규약` says event categories are 7 domains and aligned 1:1 with policy domain codes.
   - `policies.md 개요` has 16 policy domains, including LEV, CRY, SOC, NWS, OPS, A11Y, I18N, and SEC.
   - Evaluation: analytics taxonomy no longer matches the policy surface it claims to mirror.

10. **Living-market owner decisions are partly treated as both decided and undecided.**
    - `PRD.md §13.4` says 100% fictional issuer universe is confirmed as an owner decision.
    - `living-market.md §11 오너 결정 필요 사항` still asks whether option A, 100% fictional issuers, is confirmed.
    - Evaluation: either the decision was made after `living-market.md` or the docs disagree; the owner-decision section should be updated to completed status.

## 4. Top Risks

1. **P1 is too large to ship coherently.** Full P1 combines trading-accounting correctness, 1000x leverage, shorting, liquidation, social profiles, rankings, moderation, synthetic participants, events/news, and fictional-universe legal gates. That is multiple products and engines, not one MVP.

2. **The plan lacks a single current source of truth.** README, PRD, policies, reference research, tech-stack, tracking, and domain docs disagree on counts, positioning, P1 scope, consent, age data, analytics categories, and some visibility rules.

3. **Regulatory/app-store risk is still high because the riskiest fun features are also core differentiation.** 1000x leverage, liquidation, high-risk leagues, news/events, live activity indicators, and social sharing all have guardrails, but they need legal review and implementation discipline, not just policy language. `planning-review-r3.md §10` explicitly says legal/multi-jurisdiction re-audit was weak.

4. **Engineering critical path is underplanned.** Phase 0 accounting and deterministic pricing gates are excellent, but there is no task-level build plan that maps current code to the new domain architecture, persistence, tests, and UI delivery.

5. **Social scope is blocked by trust-and-safety infrastructure.** `social-profiles.md §11` correctly requires UC-B29~B31 before social launch, but moderation/admin tooling and staffing are not planned deeply enough for profiles, UGC, handles, avatars, leaderboards, reports, sanctions, and appeals.

6. **Synthetic-market/event/news correctness can undermine contest fairness.** `living-market.md §8` identifies eight P0 determinism gates. If these are included in P1, they become launch blockers; if they are deferred, the P1 scope and product promise must say so clearly.

7. **Business viability depends on organic/viral scale that is not yet planned.** `monetization-model.md §3` says paid UA is not viable under current LTV/CAC; `planning-review.md §19` previously flags lack of UA/GTM planning. The product relies on virality and B2B before it has a concrete go-to-market plan.

## 5. Over-Engineering / Cut-for-P1 List

Cut or defer from P1:
- **1000x leverage in public/social/ranked contexts.** Keep margin schema reservation and maybe an internal sandbox, but do not put 1000x ranked gameplay into P1 until Phase 0, moderation, and legal review pass.
- **Full social graph.** Defer follow graph and public profiles. For P1, use local profile + server-verified contest identity only if moderation is ready.
- **Public leaderboards beyond one official, low-risk contest view.** Avoid multidimensional leaderboard axes until GRF scoring, privacy, and abuse controls are implemented.
- **Living-market news/event engine.** Start with fictional static companies and deterministic prices. Defer No-AI news, rumors, capital actions, liveParticipants, and event-driven market pulse unless they are the explicit P1 product bet.
- **Options, futures, perps, KR/JP, FX, crypto.** Keep schema reservations only. Do not implement behavior in P1.
- **B2B console, Pro/Max tiers, season pass, AI helper, real/delayed market data.** These are v2+ or post-retention-validation features.
- **High-risk contest variants.** No high-roller, short-duration, high-leverage, small-pool contests in P1. `game-modes.md §6.1` already identifies these as roulette-like combinations.
- **Advanced charting beyond the necessary price view.** `dev-spec.md §1 GAP #2` defines a custom Skia chart surface; P1 should keep it to line/candle/volume/markers only.

Keep for the build-ready P1 slice:
- Phase 0 accounting correctness from `PRD.md §6.1` and `§19.7.1`.
- Fictional issuer migration and CI gate from `living-market.md §6.5`.
- Deterministic local price engine with checkpoint anchors from `PRD.md §10.3.2` and `§11.1`.
- 30-second guest onboarding, first buy, basic portfolio, realized P&L, reset, mission/badge loop, and one low-risk asynchronous "system opponent" contest primitive from `game-modes.md §4.6` and `§8.1`.
- Analytics spine sufficient for WAP, activation, first buy, retention, reset, mission completion, and anti-chase metrics.

## 6. Verdict

**NOT BUILD-READY for full P1 as currently documented.**

It is build-ready only for a narrower Phase 0 / MVP foundation: accounting hardening, deterministic fictional market, guest onboarding, basic trade/portfolio loop, local progression, and possibly a non-social system-opponent contest primitive. The full P1 scope is too broad and internally inconsistent to hand directly to engineering.

Shortest path to build-ready:

1. Create a single `docs/p1-scope.md` or update `PRD.md §5/§17` to define one P1 slice with explicit IN/OUT. Separate `Phase 0`, `MVP`, `P1-server/social`, and `P1-deferred`.
2. Update stale SSOT references: README counts, PRD policy count, tech-stack resolved gaps, tracking taxonomy, reference-research superseded education framing, and living-market completed owner decisions.
3. Resolve the hard contradictions: consent timing, birth year/month vs birth date, liquidation-history visibility, use-case priority for moderation vs social, and P1 terminology.
4. Convert Phase 0 into an implementation checklist with modules, tests, migration steps, and acceptance criteria.
5. Require legal/app-store review before enabling high-leverage, social, news/events, or any contest reward surface.
6. Define the first playable milestone: guest opens app, buys a fictional US stock, sees correct P&L, completes one mission, returns next day, and can reset without corrupting accounting.
