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

## Re-evaluation v2 (2026-07-04)

### Previously cited issues

1. **Stale SSOT counts — RESOLVED.** Checked `README.md` lines 19-23, `docs/README.md` lines 11-13, `docs/PRD.md` §14 lines 744-746, `docs/policies.md` §개요 lines 9-36, and `docs/use-cases.md` lines 1-5 plus §7 lines 1401-1450. The README and docs index now both state **16 domains / 215 policies** and **49 use cases**; I also counted 16 policy-domain table rows summing to 215 and 49 `UC-A/UC-B` headings.

2. **Reference research education framing — PARTIAL.** Checked `docs/reference-research.md` top notice lines 3-9 and §1 lines 26-39. The document now clearly marks the education-first/hybrid recommendation as superseded and points to PRD §1.1, but the live one-line summary and section body still carry the old education×game recommendation; because `docs/README.md` still recommends reading this file for rationale at lines 36-38, the historical framing can still leak into execution unless treated as archived input.

3. **P1 terminology overloaded — PARTIAL.** Checked `docs/p1-scope.md` lines 1-26, `docs/use-cases.md` §7 lines 1390-1399, `docs/instruments-and-markets.md` §9 lines 478-489, `docs/living-market.md` §9 lines 281-294, and `docs/PRD.md` §17 lines 826-838. Several docs now add "P1 용어 주의" warnings and point to `p1-scope.md` as SSOT, which helps, but PRD §17 still says P1 starts in MVP and completes in v1 with leverage, server, profiles, rankings, and social, while `p1-scope.md` defers full social and high-risk variants out of the build-ready slice.

4. **Consent timing contradiction — PARTIAL.** Checked `docs/PRD.md` §7.2 lines 279-287 and §13.2 lines 721-723. The direct PRD contradiction is fixed: both sections now say onboarding shows only a micro-banner and full checkbox consent is delayed until social/payment/contest entry; however `docs/use-cases.md` UC-B01 still has alternative flow 3a at lines 596-599 saying first buy is locked without full disclaimer consent, so the implementation-facing flow remains inconsistent.

5. **Birth date vs birth year/month — RESOLVED.** Checked `docs/PRD.md` §7.2 lines 285-287, §13.3 lines 724-727, `docs/use-cases.md` UC-B02 lines 610-628, and `docs/p1-scope.md` MVP lines 13-16. The current docs consistently specify **출생 연월 / 연·월만, 일 미수집** for the age gate, and UC-B02 no longer asks for full birth date.

6. **Liquidation-history visibility contradiction — RESOLVED.** Checked `docs/instruments-and-markets.md` §7.10/§8 lines 455-456 and 464-469, `docs/social-profiles.md` principles and SOC-05 lines 59-62 and 192-197 plus §7 matrix lines 373-374, and `docs/policies.md` SOC-05/LEV references lines 5558, 5716, and 5929-5934. The current rule is coherent: public profiles cannot hide the **risk summary** such as liquidation count/max leverage, while detailed liquidation history defaults private and is not broadcast.

7. **Moderation vs social UC priority conflict — RESOLVED.** Checked `docs/social-profiles.md` principles lines 56-62 and UC-B32 lines 405-409, `docs/use-cases.md` §7 priority table lines 1426-1429 and 1445-1447, and `docs/PRD.md` §17 lines 834-838. UC-B29/B30/B31 are now P1 and explicitly marked hard gates before social profile/follow/leaderboard surfaces.

### p1-scope.md assessment

`docs/p1-scope.md` is a useful new SSOT and does define a tighter slice: Phase 0 IN at lines 5-11, MVP IN at lines 13-18, and P1-deferred OUT at lines 20-26. It is broadly aligned with PRD §5 MVP scope in `docs/PRD.md` lines 171-188: both include accounting hardening, deterministic fictional market, 30-second guest onboarding, local progression, and one system-opponent/ghost contest primitive.

It is not yet a complete build-ready scope contract. It does not define the requested first-playable milestone or acceptance criteria; the MVP contest primitive at line 18 is still a loose "system 상대 or ghost/benchmark" option rather than a chosen implementation; and it conflicts with remaining PRD roadmap language at `docs/PRD.md` lines 826-838, where P1 still includes leverage/forced liquidation, server, moderation, profiles, rankings, and social completion. Domain docs reduce ambiguity by pointing to `p1-scope.md`, but the PRD roadmap still needs to be reconciled or explicitly labeled as non-SSOT domain phasing.

### Final score and verdict

**Overall maturity score: 8/10.**

**Verdict: NOT BUILD-READY for the Phase 0/MVP slice defined in `docs/p1-scope.md`.**

The fix pass materially improved the docs: counts are corrected, age collection is consistent, liquidation privacy is coherent, and moderation is now correctly before social. The remaining blockers are narrower but still execution-relevant: consent flow inconsistency in UC-B01, unresolved P1 roadmap terminology across PRD/domain docs, and the absence of a concrete first-playable acceptance contract in `p1-scope.md`.

Shortest remaining path:

1. Fix `docs/use-cases.md` UC-B01 alternative flow 3a so first buy is not blocked by full consent in the pure local guest flow.
2. Update PRD §17, or add an explicit note there, so the Phase 0/MVP build-ready slice in `p1-scope.md` is not contradicted by "P1 complete" leverage/server/social roadmap language.
3. Extend `docs/p1-scope.md` with a first-playable milestone and measurable acceptance checklist: open app, pass age gate with birth year/month, buy a fictional US stock, see correct realized/unrealized P&L, complete one mission/badge, return next day, and reset without ledger corruption.

## Re-evaluation v3 (2026-07-04)

### Previously PARTIAL items

1. **Consent flow — RESOLVED.** Checked `docs/use-cases.md` `UC-B01 · 최초 게스트 온보딩(30초 첫 매수 + 보장된 첫 배지)` lines 587-606. The current main flow says onboarding shows a bottom micro-disclaimer banner and defers full disclaimer consent to social/payment/contest entry, and alternative flow 3a now explicitly says pure local guest first buy is not locked by missing full consent.

2. **P1 terminology / roadmap reconciliation — PARTIAL.** Checked `docs/PRD.md` `§5. 스코프`, `§5.0 상품·시장 확장 스코프`, `§17 로드맵` lines 149-165 and 826-850, plus `docs/p1-scope.md` `Trading Simulator — P1 Scope SSOT` lines 1-18 and `P1-deferred (OUT)` lines 66-72. PRD §17 now correctly states `p1-scope.md` is the build-ready SSOT and limits Phase 0/MVP to local fictional US stocks, accounting, deterministic engine, onboarding, progression, and one system-opponent/ghost primitive; however PRD §5.0 still uses a separate product-phasing `P1` for shorting, 1000x leverage, ETF, profiles, rankings, and social, and the v2 roadmap note still says leverage/shorting were "P1에서 이미 확정", so the docs are disambiguated but not reduced to one unambiguous P1 meaning.

3. **First-playable / Phase 0-MVP acceptance contract — RESOLVED.** Checked `docs/p1-scope.md` `First-playable milestone`, `Acceptance checklist`, and `Milestone acceptance criteria` lines 20-64. The doc now defines a seven-step first playable path from guest entry through age gate, no full consent, market buy, cent-accurate P&L/equity, mission reward, next-day replay, and reset, then backs it with Phase 0 modules, MVP modules, required property tests, and explicit Phase 0 / first-playable / MVP completion criteria.

4. **Reference research education-first wording — RESOLVED.** Checked `docs/reference-research.md` top notices and `§1. 조사 범위와 시장 지형` lines 5-9 and 26-38, plus `§7.9 실행 우선순위 요약` lines 335-346. The education-first and learning/risk-management recommendations still remain as historical research text, but they are explicitly marked superseded at the top, before section 1, and before the old priority table, with the current source of truth pointing to PRD §1.1 and `p1-scope.md`; I did not find an unmarked current instruction that overrides the fun-first fictional-company direction.

### p1-scope.md assessment

Yes: `docs/p1-scope.md` now has a coherent first-playable milestone plus Phase 0/MVP acceptance checklist. Evidence: `First-playable milestone` lines 20-30 gives the full playable path, `Acceptance checklist` lines 32-58 lists Phase 0 modules, MVP modules, and required property tests, and `Milestone acceptance criteria` lines 60-64 defines Phase 0 complete, first-playable complete, and MVP complete.

### Final score and verdict

**Overall maturity score: 8.5/10.**

**Verdict: BUILD-READY for the Phase-0/MVP slice defined in `docs/p1-scope.md`.**

The Phase-0/MVP slice is now concrete enough to start implementation because `docs/p1-scope.md` defines the included modules, first playable path, property tests, and completion gates. The remaining issue is a documentation clarity blocker for broader P1 planning, not a blocker to starting the narrower Phase-0/MVP build.

Remaining blocker:

1. **P1 label still has two meanings in the PRD.** `docs/PRD.md` `§17 로드맵` lines 826-838 points Phase 0/MVP and P1-deferred to `docs/p1-scope.md`, but `docs/PRD.md` `§5.0 상품·시장 확장 스코프` lines 155-161 still labels shorting, 1000x leverage, ETF, profiles, rankings, and social as product-phasing `P1`, and `docs/PRD.md` `Q2 2027 — v2` line 850 says shorting/leverage/liquidation/margin interest were already settled in P1. This is now mostly explained by overlay language, but it still leaves a second active `P1` label that can confuse full-scope planning.

## Re-evaluation v4 (2026-07-04)

### Final score

**9/10.**

### Verdict

**BUILD-READY for the Phase-0/MVP slice defined in `docs/p1-scope.md`.**

### Dual-P1 ambiguity

**Resolved: yes.** `docs/PRD.md` §5.0 now labels instrument phasing as **IP1~IP4**, and the §5.0 note explicitly separates instrument phasing (`IP1~IP4`) from the build slice (`Phase 0 / MVP`, `docs/p1-scope.md`). `docs/PRD.md` §17 now repeats that `p1-scope.md` is the build-ready SSOT, keeps Phase 0/MVP limited to the local fictional-US-stock/accounting/engine/onboarding/progression/system-opponent slice, and puts later instruments under **IP2**, **IP3**, and **IP4**. The previous v3 problem phrase in Q2 2027 has been relabeled to say shorting/leverage/liquidation/margin interest were already settled in **IP1**, not P1.

I also scanned the rest of `docs/PRD.md` and `docs/p1-scope.md` for remaining `P1` references. The remaining relevant uses are build-slice/SSOT terms (`P1 Scope SSOT`, `P1-deferred`), a problem-table ID (`PRD.md` §2.1 `P1`), and unrelated roadmap/data/legal shorthand such as `P1(베타)` or "P1 착수 전"; I did not find any remaining unrelabeled instrument-phasing reference that uses `P1` instead of `IP1`.

### Remaining material blockers

None. No material documentation blockers remain for starting the Phase-0/MVP build slice.

## Fun re-check v5 (2026-07-04)

### Scope actually checked

I independently opened and read the eight edited docs named in the request: `docs/PRD.md`, `docs/policies.md`, `docs/use-cases.md`, `docs/game-modes.md`, `docs/living-market.md`, `docs/design-decisions.md`, `docs/design-tokens.md`, and `docs/tracking-plan.md`. I also opened and read this file, `docs/plan-evaluation.md`, before appending this section.

### Gap-by-gap verdicts

| Gap | Verdict | Evidence |
|---|---|---|
| rank1 — win-feel / confetti SSOT decoupled from realized P&L | **RESOLVED** | `PRD.md §7.2` lines 279-288 gives the first-win feel as the `'입성 / 플레이어 탄생'` identity badge and says trade/P&L itself gets no confetti. `PRD.md §8.3` line 342 is now a clear "축하 연출 SSOT" that allows celebration only for P&L-independent channels and forbids buy/sell fills, profit realization, and loss recovery confetti. `policies.md LEG-07` lines 3228-3234 repeats the rule and routes fill feedback to plain toast/state feedback. `use-cases.md UC-A01` lines 255-266 and `UC-B01` lines 696-708 also attach the first moment to identity, not P&L. |
| rank2 — judgment-quality XP, not trade-volume XP | **RESOLVED** | `PRD.md §8.2` lines 332-337 says XP comes from judgment quality, scenarios, new fictional-company first trade, stop adherence, collection, badges, and contests, while `거래량 XP=0` and P&L/trade count/profit realization XP are forbidden. `policies.md GRF 공통 부록` lines 2263-2281 makes this a hard invariant and lists the same source tiers. `game-modes.md §2.4` lines 108-120 repeats `거래량 XP=0` and says simple profit realization, trade count, and trade value earn 0 XP. `living-market.md §7.1` lines 256-267 defines positive-EV skill play and says the reward is for expected-good judgment, not whether the event was profitable. `tracking-plan.md §5.3` lines 116-121 rejects `xp_earned.source=trading_volume` at schema lint. |
| rank3 — fictional-company collection 도감 system | **RESOLVED** | `game-modes.md §2.4.1` lines 122-130 defines the 도감/dex with `discovered` to `collected`, sector/country/season/event-arc tracks, and non-cash rewards. `policies.md` lines 2287-2290 repeats the two-stage entry and non-cash-only set rewards. `use-cases.md UC-B36` lines 1505-1518 gives the user flow, idempotent first-trade unlock, `collection_entry_unlocked` / `collection_set_completed` events, and no P&L sharing. `tracking-plan.md §5.3` lines 118-119 registers collection events. Naming is consistent enough: "도감/컬렉션" is the product label, `collection_*` is the analytics/schema prefix, and `dex` appears only as an explanatory English alias in `game-modes.md`. |
| rank4 — push/notification lifecycle and tracking | **RESOLVED** | `policies.md NWS-05` lines 6144-6154 defines the unified 1-2/day cap, quiet hours, permission priming after first value moment, D1/D3/D7/D14/D30 policy table, dormant win-back, no P&L/loss-recovery/buy-sell CTA, and event tracking. `use-cases.md UC-B37` lines 1520-1544 turns that into a user flow with soft ask, OS prompt, inbox fallback, cohort table, suppression events, and win-back constraints. `PRD.md §7.4` lines 298-305 aligns daily return, push cap, loss-position bad-news suppression, and no buy-sheet prefill. `tracking-plan.md §5.3.1` lines 123-132 registers permission, sent/opened, inbox, quiet-hours, and cap suppression events. |
| rank5 — headline fun-surface UCs for derivatives/leverage/chart/news/market-pulse screens | **PARTIAL** | The fun surfaces are present, but most are still deferred rather than build-detailed. `use-cases.md §4` lines 188-200 lists `UC-A15` to `UC-A20` for derivative/margin surfaces and `UC-A21` to `UC-A27` for advanced chart, microstructure, news, market pulse, breaking-news landing, event reaction, and rights-offering decisions. `use-cases.md §5` lines 678-690 adds a compact table for `UC-A21~A27`, but labels them "Deferred / lower-priority fun-surface UCs." `use-cases.md §7` lines 1576-1581 rates derivative/margin UCs P2/P3, and line 1617 rates `UC-A21~A27` P3. `PRD.md §7.1` line 274 and `living-market.md §4` lines 161-181 give much stronger market-pulse detail, so the surface exists conceptually, but it is not yet a first-build screen/state acceptance spec. |
| rank6 — moment-to-moment juice/haptics tokens labeled NOT R4 state feedback | **RESOLVED** | `living-market.md §7.2` lines 269-276 explicitly labels always-on number, chart, pulse, and haptic feedback as "NOT R4" state feedback, not celebration, and forbids success notification for P&L realization/loss recovery. `docs/design-tokens.md §State Feedback Tokens — NOT R4` lines 90-114 defines number count, market pulse, sparkline tween, haptic map, `haptics.plRealized = "none"`, and reduced-motion/reduced-haptics behavior. `design-decisions.md §1` and `§4` lines 7-8 and 22-26 repeat the separation between state feedback and confetti/pomp. `policies.md LEG-07` line 3231 references the design-tokens NOT R4 rule. |

### Contradiction and collision check

No new hard contradictions or ID collisions found in the eight-file fun-boost pass.

- **Confetti/R4 consistency:** consistent across `PRD.md` (`§7.2` lines 279-288, `§8.3` line 342, redline table line 717), `policies.md LEG-07` lines 3228-3234, and `use-cases.md` (`UC-A01` lines 255-266, `UC-B01` lines 696-708, R4 appendix line 1642). All say trade fill, realized/unrealized P&L, profit realization, and loss recovery do not get confetti; identity, badges, levels, good-judgment streaks, collection/set completion, scenarios, and official tier moments can.
- **Collection/badge naming:** unified enough for implementation. The first-onboarding badge is consistently `'입성 / 플레이어 탄생'` in `PRD.md` lines 279-288, `policies.md` line 3233, `use-cases.md` lines 201, 255, 696-708, and `tracking-plan.md` line 91. The collection system uses "도감/컬렉션" in product docs and `collection_*` in event names. I did not find a conflicting alternate collection name.
- **XP coherence:** coherent across `PRD.md §8.2`, `policies.md GRF 공통 부록`, `game-modes.md §2.4`, `living-market.md §7.1`, `use-cases.md UC-B11/UC-B36`, and `tracking-plan.md §5.3`. Minor omissions are not blockers: for example `use-cases.md UC-B11` line 940 lists sector/country 도감 XP but does not restate season +500; `UC-B36` line 1513 says season sets pay XP without naming the amount. Since progression balance numbers are expected to tune during build, this is not a doc contradiction.
- **Notification consistency:** coherent across `PRD.md §7.4`, `policies.md NWS-05/NWS-06`, `use-cases.md UC-B37`, `living-market.md §3.6`, and `tracking-plan.md §5.3.1`. The common constants are 1-2/day, quiet hours 22-08, minimum 20 minutes where specified, inbox fallback, no buy/sell CTA for win-back/loss contexts, and D1/D3/D7/D14/D30 lifecycle.
- **UC ID collisions:** none found in the canonical `use-cases.md §4` list. The list now has 64 rows (`UC-A01` through `UC-A27`, `UC-B01` through `UC-B37`) with no duplicate row IDs. Detail headings have no duplicate IDs; `UC-A21~A27` are intentionally consolidated under one deferred heading, which explains why there are fewer detail headings than list rows.
- **New number collisions:** none found that block implementation. The only live "numbers" in the fun boost are XP balance values, notification caps, and haptic durations/intensities. XP values match across the main XP tables; notification caps match across PRD/policies/living-market/use-cases/tracking; haptic/state tokens are contained in `design-tokens.md` and referenced by policy/design docs.

### Updated scores and build-readiness

**FUN score: 8/10.** The pass materially improves fun from the prior 6/10: first-session win feel, progression, collection, notification lifecycle, and moment-to-moment feedback are now specified and compliance-safe. I am not scoring higher because the richest headline surfaces (advanced chart, microstructure, news, market-pulse landing, event reaction, derivatives depth) are mostly deferred/P2/P3 or table-level, not yet first-build acceptance specs.

**Functional score: 9/10.** The docs remain build-ready for the Phase-0/MVP slice already assessed in v4. The fun boost did not weaken accounting, determinism, R4, notification, or use-case structure. It also improves implementation clarity through tracking events and design tokens.

**Build-readiness verdict: BUILD-READY for the Phase-0/MVP slice.** Phase 0/MVP can start with the current docs. The fun boost adds useful product targets for the slice without introducing a new doc blocker. The richer deferred fun-surface screens should be designed as follow-on build/playtest work, not as a prerequisite to starting Phase 0.

### Remaining blockers

**Must fix before build**

None from this fun-boost re-check. Existing implementation gates still apply during build: Phase 0 accounting/determinism tests, fictional ticker migration/denylist, R4 enforcement, and notification consent implementation must pass before release, but the docs now state those constraints clearly enough to start.

**Tune during build/playtest**

1. Progression balance: per-action XP amounts, level curve, rarity distribution, collection set sizes, and cosmetic reward cadence.
2. Notification tuning: copy, topic mix, exact D1/D3/D7/D14/D30 thresholds, suppression heuristics, and inbox prominence under the fixed 1-2/day cap.
3. Moment-to-moment juice: haptic strength, count-up duration, pulse intensity, sparkline tween, and reduced-motion/reduced-haptics behavior on real devices.
4. 도감 content operations: fictional-company roster depth, sector/country/season set taxonomy, art/card style, and duplicate/legacy company migration handling.
5. Deferred fun surfaces: promote `UC-A21~A27` from compact deferred table to screen/state acceptance specs when they move into a build milestone.
6. Positive-EV skill detection: calibrate earnings pre-positioning, overshoot-fade, DENY-rumor distrust, and good-judgment streak classifiers against playtest behavior so they reward judgment without becoming hidden chores.
