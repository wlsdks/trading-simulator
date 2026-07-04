# Trading Simulator — P1 Scope SSOT

> **목적:** P1이라는 용어가 상품 단계·로드맵·유즈케이스 우선순위에서 다르게 쓰이지 않도록, 실행 범위를 Phase 0 / MVP / P1-deferred로 고정한다. 최신 포지셔닝은 **fun-first, 100% fictional companies, 가짜 돈 주식 게임**이다.

## Phase 0 (IN)

- **Accounting hardening:** 실현손익 원장, 정수 센트 `Money` 값객체, round-half-even, 외부흐름 분리, `schemaVersion` 마이그레이션, UUID 거래 ID, buy/sell 원자화.
- **Deterministic fictional market:** 100% 가상 회사 유니버스, 시뮬레이션 가격 엔진, seed 주입, 체크포인트 앵커, 재기동/재계산 결정론.
- **Money/ledger correctness:** cash·holdings·realizedPL·unrealizedPL·externalFlows·equity 항등식, 저장/복원 무손실, reset 원자성.
- **CASH/MARGIN account invariants:** CASH 계좌 `cash >= 0`, MARGIN 계좌 `walletBalance >= 0`, `isolatedMargin >= 0`, `accountEquity >= 0`, 손실 상한·보험흡수 원장 분리.
- **Property-based tests:** 회계 불변식, 결정론 가격, 마이그레이션 round-trip, CASH/MARGIN 분기, 레버리지·부분청산 최소 property suite.

## MVP (IN)

- **Guest onboarding:** 30초 로컬 게스트 진입, 온보딩 미세 배너, 출생 연월 기반 연령 게이트, 첫 매수 가이드, 첫 배지.
- **Basic trade/portfolio loop:** 가상 US 주식 매수/매도, 포트폴리오·거래내역·손익 확인, reset, 기본 마켓/종목 상세.
- **Local progression:** 레벨, 배지, 미션/챌린지 v0, 로컬 스트릭·프리즈, 선택적 팁 카드.
- **One system-opponent contest primitive:** 소셜 그래프 없이 동작하는 로컬/비동기 시스템 상대 또는 고스트/벤치마크 대회 프리미티브 1개.

## First-playable milestone

첫 playable 빌드는 아래 단일 경로를 끊김 없이 통과해야 한다.

1. 게스트가 앱을 열고 계정 가입 없이 로컬 세션으로 진입한다.
2. 온보딩 미세 배너와 출생 연월 연령 게이트를 통과한다. 전면 면책 동의는 요구하지 않는다.
3. 가상 US 주식 1개를 시장가로 매수한다.
4. 체결 직후 현금, 보유수량, 평균단가, 미실현 P&L, 총 equity가 정수 센트 원장과 일치한다.
5. 첫 미션 1개를 완료하고 배지 또는 XP 보상을 받는다.
6. 다음 날 다시 열었을 때 결정론 가격 리플레이와 저장 상태가 일관되며, 일일 미션/스트릭 상태가 손상 없이 갱신된다.
7. reset을 실행해 현금·보유·거래내역·실현/미실현 P&L·외부흐름이 원자적으로 초기화되고, 이전 회계 값이 새 세션에 섞이지 않는다.

## Acceptance checklist

### Phase 0 modules

- `Money` 값객체: 정수 센트 저장, round-half-even, 통화 단위 변환.
- Ledger/accounting engine: 거래 원장, 외부흐름 분리, realized/unrealized P&L, equity 항등식.
- Order execution core: 시장가 매수/매도 원자 처리, 잔고·수량 검증, 멱등 transaction ID.
- Deterministic price engine: seed 주입, `(seed,ticker,tickIndex)` 리플레이, 체크포인트 앵커.
- Persistence/migration: `schemaVersion`, 저장/복원 round-trip, 손상 데이터 격리, reset 원자성.
- Account type invariants: CASH/MARGIN 분기와 각 계좌 유형별 불변식 검증.

### MVP modules

- Guest onboarding: 30초 로컬 진입, 미세 면책 배너, 출생 연월 연령 게이트, 첫 매수 코치마크.
- Portfolio UI: 현금, 보유, 평균단가, realized/unrealized P&L, 총 equity, 거래내역.
- Mission/progression v0: 첫 미션, 배지 또는 XP, 로컬 스트릭·프리즈.
- Reset flow: 새 연습 세션 생성, 대기 상태·원장·P&L 초기화, 이전 세션 격리.
- System-opponent contest primitive: 소셜 그래프 없이 동작하는 고스트/벤치마크 상대 1개.

### Required property tests

- **Integer-cents ledger:** 모든 거래·외부흐름·평가가 정수 센트로 닫히고 부동소수 오차가 원장에 유입되지 않는다.
- **Round-half-even rounding:** 수수료·평균단가·FX 예약 필드 등 반올림 경계값이 round-half-even으로 재현된다.
- **CASH invariant:** CASH 계좌는 모든 체결·복원·reset 후 `cash >= 0`, `qty >= 0`, `equity = cash + holdingsValue`를 만족한다.
- **MARGIN invariants:** MARGIN 계좌는 `walletBalance >= 0`, `isolatedMargin >= 0`, `accountEquity >= 0` 및 손실 상한·보험흡수 원장 분리를 만족한다.
- **Deterministic price replay:** 동일 `(seed,ticker,tickIndex)`는 재기동·재계산·기기 차이에도 동일 가격과 dayOpen을 산출한다.
- **Reset accounting safety:** reset은 보유·거래·P&L·외부흐름·대기상태를 원자적으로 초기화하고 이전 세션 값이 새 회계에 섞이지 않는다.

### Milestone acceptance criteria

- **Phase 0 complete:** 위 Phase 0 modules 구현, required property tests 전부 PASS, 마이그레이션 round-trip 무손실, 회계 assert 위반 0.
- **First-playable complete:** first-playable milestone 7단계가 한 세션과 다음 날 재방문 시나리오에서 모두 PASS, full disclaimer 없이 30초 게스트 첫 매수 가능.
- **MVP complete:** MVP modules 구현, 핵심 온보딩→매수→P&L→미션→다음날 복귀→reset E2E PASS, 시스템 상대/고스트 프리미티브 1개가 로컬 또는 비동기 결정론 경로로 동작.

## P1-deferred (OUT)

- **Full social graph:** 공개 프로필, 팔로우 그래프, 활동 피드, 다차원 공개 리더보드, UGC surface 전면 출시.
- **High-risk contest variants:** 하이롤러, 고배율, 초단기, 소규모 풀, 현금상금·참가비·rake가 걸린 대회.
- **Options/futures/crypto:** 옵션, 선물, 무기한, 크립토 현물/파생의 동작 구현. 스키마 예약은 가능하나 사용자 기능으로 출시하지 않는다.
- **KR/JP markets:** 한국·일본장, FX 멀티월렛, 다통화 순위·정산 동작 구현.
- **News/events at scale:** No-AI 뉴스, 루머, 자본거래, liveParticipants, 대규모 이벤트 기반 마켓 펄스.
