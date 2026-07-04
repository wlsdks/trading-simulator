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

## P1-deferred (OUT)

- **Full social graph:** 공개 프로필, 팔로우 그래프, 활동 피드, 다차원 공개 리더보드, UGC surface 전면 출시.
- **High-risk contest variants:** 하이롤러, 고배율, 초단기, 소규모 풀, 현금상금·참가비·rake가 걸린 대회.
- **Options/futures/crypto:** 옵션, 선물, 무기한, 크립토 현물/파생의 동작 구현. 스키마 예약은 가능하나 사용자 기능으로 출시하지 않는다.
- **KR/JP markets:** 한국·일본장, FX 멀티월렛, 다통화 순위·정산 동작 구현.
- **News/events at scale:** No-AI 뉴스, 루머, 자본거래, liveParticipants, 대규모 이벤트 기반 마켓 펄스.
