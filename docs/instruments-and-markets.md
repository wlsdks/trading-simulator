# Trading Simulator — 상품·시장 명세 (Instruments & Markets)

> **본 문서는 모의투자 시뮬레이션 게임의 기획 문서이며 실제 투자자문이 아닙니다.** 모든 상품·시세·청산은 가짜 자산·시뮬레이션 가격을 전제로 하며, "재미로 하는 주식 게임"(가짜 돈) 포지셔닝과 법적 가드레일 4개(현금상금 X·모의 면책·개인 매수추천 X·실데이터시 라이선스)를 최우선으로 한다.

관련 문서: [PRD.md](./PRD.md) · [policies.md](./policies.md) · [use-cases.md](./use-cases.md) · [tech-stack.md](./tech-stack.md) · [tracking-plan.md](./tracking-plan.md)

본 문서는 오너 확정 신규 스코프(레버리지 롱/인버스 1000배·ETF/ETN·옵션·선물·무기한·코인·3개 시장·소셜)를 현재 policies.md(**16도메인·215정책**)의 톤·번호체계·회계 불변식과 정합하게 **상품/시장/엔진 레이어**로 종합한다. 정책 상세 규칙·사이드이펙트·엣지케이스는 policies.md에 편입되며, 본 문서는 **계약명세·공식·엔진·MVP 배선**을 단일 진실로 제공한다.

---

## 0. 설계 대전제 — "메커니즘은 진짜처럼, 손실은 가짜 돈처럼"

현실성 수준은 오너 확정 **현실적/정교**: 실제 마진·유지증거금·청산가·부분청산·펀딩레이트·블랙숄즈/그릭스까지 정교하게 재현하되, **유저 지갑은 절대 음수가 되지 않는다**(가짜 돈). 두 목표의 충돌은 **보험기금(Insurance Fund)·손실 상한(clamp)·ADL**로 해소한다(§4.5, PRD 오픈이슈 O13 확정).

### 0.1 상품의 2대 회계 엔진 환원
모든 신규 자산군은 **두 개의 회계 엔진**으로 환원된다. 이 이분법이 문서 전체의 뼈대다.

| 엔진 | 대상 상품 | 개시 시 cash | 자기자본 기여 | 계좌유형 | 불변식 |
|---|---|---|---|---|---|
| **(A) costBasis 엔진**(ACC-02) | 현물 EQUITY·CRYPTO·ETF·ETN·FX현물 **+ 롱 옵션** | 매수대금 차감 | `mark×qty`(≥0) | CASH 가능 | `cash≥0` 유지 |
| **(B) margin-MTM 엔진**(ACC-18) | 현물 SHORT·레버리지 LONG·인버스·FUTURES·PERP·**숏 옵션** | 미차감, 개시증거금만 구속 | `initialMargin + unrealized` | MARGIN 전용 | `cash≥0` 면제, `equity≥0` |

**핵심 통찰:** 레버리지/인버스 **ETF·ETN은 (A)군**이다 — 레버리지가 상품가격 내부(일일리셋)에 있으므로 마진·청산이 없다. 반면 오너의 "인버스 1000배"는 **상품이 아니라 계좌레버리지**((B)군)다. 이 경계 확정이 "레버리지=cash≥0 붕괴"라는 오해를 원천 차단한다.

### 0.2 깨지는 불변식과 확장 모델 (요약)

| 현행 불변식 | 확장 |
|---|---|
| `cash ≥ 0` (ACC-09 I1, ACT-05) | CASH 계좌만 유지. MARGIN 계좌는 **`reservedMargin ≤ cash`** + **`walletBalance ≥ 0`(IM1)** + 포지션별 **`isolatedMargin ≥ 0`(IM2)** + **`equity ≥ 0`(IM4)**로 대체 |
| `equity = cash + Σ mark×qty` (ACC-05) | 통합 항등식(§7.1): `equity = cash + Σspot(mark×qty·부호) + Σderiv((mark−avgEntry)×qty×mult) + ΣoptLong(MV) − ΣoptShort(MV)` |
| 시작자산 $100k 고정분모 (ACT-01) | **불변.** baseCurrency(USD) $100k 단일, 크로스마켓/다통화도 FX 환산 후 분모는 baseCcy 고정 |
| 실현/미실현 손익 원장 | 청산손익·청산수수료·보험흡수를 신규 type(`LIQUIDATION_FEE`·`INSURANCE_ABSORB`·`ADL`)으로 스탬프 |
| round-half-even (ACC-19) | 전 신규 금액연산에 단일 `Money` 값객체 경유, 반올림은 "체결/정산 확정 시 1회" |

---

## 1. 신규 정책 인덱스 (충돌 조정된 통합 번호체계)

여러 저자가 독립 제안한 번호 충돌(MKT-15·ACC-20·ORD-24 3중복 등)을 **단일 전역 번호로 재배열**한다. 기존 최댓값(ACT-14·ORD-23·MKT-14·ACC-19·GRF-15) 다음부터 연속 배정.

### 신규 도메인 #13 — 레버리지·마진·청산 엔진 (LEV)
| # | 정책 | MVP |
|---|---|---|
| LEV-01 | 마진 계좌 모델·자산 확장 (Wallet–Margin–Equity 4층 모델) | P1 |
| LEV-02 | 개시·유지증거금·리스크 리밋 티어 | P1 |
| LEV-03 | 청산가·마진레벨·마진콜 (정석 폐형식) | P1 |
| LEV-04 | 강제청산·부분청산·청산수수료 엔진 | P1 |
| LEV-05 | 손실 상한·보험기금·계좌 음수 방지 (O13 확정) | P1 |
| LEV-06 | 자동디레버리징 (ADL) | 골격 P1 / 활성 P2 |
| LEV-07 | 마진이자·자본비용 회계 (Cost of Carry) | P1 |
| LEV-08 | 레버리지 리그 격리·리스크 고지·사전 게이트 | P1 |

### 신규 도메인 #14 — 크립토 (CRY)
| # | 정책 | MVP |
|---|---|---|
| CRY-01 | 24/7 거래·거래일 경계·유지보수 (UTC 00:00 단일시계) | P4 |
| CRY-02 | 크립토 시세 시뮬·3층 가격(인덱스/마크/라스트)·고변동 | P4 |
| CRY-03 | 소수점 수량·최소명목·먼지(dust) | P4 |
| CRY-04 | 무기한 펀딩·마크가격 청산·리스크리밋 티어·부분청산 | 엔진 P2 / 크립토 배선 P4 |
| CRY-05 | 24/7 리더보드·결정론 앵커 공정성·야간 리스크 | P4 |
| CRY-06 | 김치프리미엄·크로스베뉴 평가·차익 학습 (기능플래그) | P3 이후 옵션 |

### 신규 도메인 #15 — 소셜·프로필·랭킹 (SOC)
| # | 정책 | MVP |
|---|---|---|
| SOC-01 | 유저 프로필 표면 표준 | P1 |
| SOC-02 | 프로필 공개범위·프라이버시 티어 (공개/팔로워/비공개/부분) | P1 |
| SOC-03 | 팔로우 그래프 (비대칭 팔로우 vs 상호 친구·순위 중립) | P1 |
| SOC-04 | 다차원 리더보드 (시장×상품×레버리지×기간×리스크조정) | 축 점진 개방 P1~P4 |
| SOC-05 | 프로필 성과 지표 표시 표준 (리스크 투명·청산 이력) | P1 |
| SOC-06 | 카피/herding/시세유도 방지 (실시간 포지션 기본 비공개) | P1 |
| SOC-07 | 프로필 어뷰징·사칭·가짜 팔로워 방지 | P1 |
| SOC-08 | 미성년·프라이버시 안전 프로필 | P1 |
| SOC-09 | 크로스마켓·다통화 프로필 표시 | P3 |

### 기존 도메인 확장 — 시세·시장 (MKT-15~22)
| # | 정책 | MVP |
|---|---|---|
| MKT-15 | 옵션 프라이싱·그릭스·IV 서피스·무위험이자율 엔진 (**옵션 중심축**) | P2 (필드 예약 P1) |
| MKT-16 | 무기한 인덱스·마크·펀딩레이트 산출 | P2 |
| MKT-17 | 선물 계약명세·일일정산가·베이시스·롤오버 | P2 (KR/JP 카탈로그 P3) |
| MKT-18 | ETF·ETN 추종·괴리·지표가치·일일리셋 | 현물 ETF P1 / 레버리지·ETN P2 |
| MKT-19 | 멀티거래소 레지스트리·세션 캘린더·휴장/반일장/DST | P3 (US 단일 P1 관통) |
| MKT-20 | 세션 상태머신·동시호가·시간외·갭 | P3 |
| MKT-21 | 거래소별 가격제한·VI/LULD·서킷브레이커 | P3 (US LULD P1) |
| MKT-22 | FX 시세 엔진·통화쌍·환율세션 (24/5) | P3 (FxProvider 예약 P1) |

### 기존 도메인 확장 — 주문·체결 (ORD-24~26)
| # | 정책 | MVP |
|---|---|---|
| ORD-24 | 옵션 주문·만기·행사·자동행사·배정 (4방향) | P2 |
| ORD-25 | 현물 공매도 차입·로케이트·리콜·강제환매(buy-in) | P1 |
| ORD-26 | FX 환전 주문·자동환전(auto-FX)·크로스마켓 통화 게이팅 | P3 |

### 기존 도메인 확장 — 계좌·회계·랭킹 (ACT-15 · ACC-20~25 · GRF-16)
| # | 정책 | MVP |
|---|---|---|
| ACT-15 | 계좌 거래유형·불변식 분기 (CASH vs MARGIN) | P1 |
| ACC-20 | 옵션 회계 (프리미엄·블랙숄즈 MTM·그릭스·행사/배정/만기) | P2 (필드 예약 P1) |
| ACC-21 | 통합 자기자본·마진잔고 3버킷 모델 | P1 |
| ACC-22 | 초고배율(≤1000x) 청산·보험기금·ADL·음의 자기자본 흡수 (O13) | P1 |
| ACC-23 | 부분청산·강제청산 원장·청산수수료 회계 | P1 |
| ACC-24 | 멀티월렛 다통화 현금원장·기준통화 정규화·FX 타이밍 공정성 | P3 (스키마 예약 P1) |
| ACC-25 | ETF/ETN·발행사신용·조기상환 회계 및 상품군 회계분기 불변식 | ETF P1 / ETN P2 |
| GRF-16 | 레버리지·파생 계층 리더보드 형평 | P1 |

> **기존 정책 개정 연계:** ACC-15는 '**1배 현물 공매도(대차)**' 전용으로 축소하고 레버리지·인버스·청산 파트는 LEV 도메인으로 승격(supersede). ACC-07 개정(class=CAPITAL/CARRY/INCOME/SETTLEMENT)·ACC-14 개정(FX 골격)·ACC-18(파생 MTM 코어)은 신규 정책의 회계 하부구조로 재사용된다.

---

## 2. 상품 카탈로그 — 계약명세·메커니즘·공식

### 표기 규약 (전 상품 공통)
- `s` = side(롱=+1, 숏/인버스=−1), `Q` = |계약수량|, `E` = 평균진입가(avgEntry), `P` = 마크가격(mark), `L` = 레버리지(≤1000)
- `IMR` = 개시증거금률 = 1/L, `MMR` = 유지증거금률(티어별)
- 모든 금액은 정수 최소단위(ACC-01)·round-half-even(ACC-19). 마크가격은 ACC-04 정의(EASY=last, REAL=청산가측 bid/ask) 준용, 파생은 인덱스앵커 `mark`(ACC-04 확장)

### 2.1 현물 롱 (Spot Long) — costBasis 엔진 (A군)
가장 단순한 기준 상품. 기존 ACC-02 평균원가 스키마 그대로.
- 매수: `cash −= round(P×Q) + fees`, `costBasis += 그 값`, `qty>0`
- equity 기여 = `mark×qty`(항상 ≥0), 미실현 = `(mark−avgCost)×qty`
- 계좌유형: **CASH** 가능. `cash≥0` 유지.

### 2.2 현물 숏 (Spot Short / 공매도) — margin-MTM 엔진 (B군), ORD-25
1배 공매도(대차). 회계는 ACC-15(축소판)·ACC-18 패턴, **차입 계약 메커니즘**은 ORD-25 신설.
- **로케이트 게이트(진입 전 필수):** `availableToBorrow` 확인 → 부족 시 `REJECT(NO_LOCATE)`
- **HTB(하드투보로우) 등급:** GC(일반, annualBorrowRate≈5%) ~ HTB(밈/희소, 20~50%)
- **대차수수료:** `borrowFee = −round(base × annualRate × elapsedDays/365)`, `class:CARRY`(절대시각 ACT/365, 수익률 분모 미차감)
- **리콜·강제환매(buy-in):** 대여자 리콜/차입소진 시 시장가 매수로 숏 청산·realizedPL 확정(`reason=BUY_IN`)
- **숏 배당 지급:** ex-date 스냅샷 `qty<0` → `−round(D×|qty|)`, `class:CARRY`(롱 수취와 제로섬, ACC-12 개정)
- 계좌유형: **MARGIN**. `cash≥0` 면제.

### 2.3 레버리지 롱 / 인버스(숏) 1000배 — margin-MTM 엔진 (B군), LEV 엔진
오너 핵심 스코프. **§4 마진/청산 엔진**에서 전면 명세. 요약:
- 개시증거금 `M0 = round(E×Q / L)`, 명목 `notional_entry = E×Q`, 매수여력 = `availableWallet × L`
- 미실현 `u = s×(P−E)×Q`, 포지션자산 `positionEquity_iso = max(0, M0 + u − accruedCost)`
- 1000배 물리학: 청산 ≈ −0.05% 역행, 파산 ≈ −0.10% 역행 (§4.4)

### 2.4 ETF (상장지수펀드) — costBasis 엔진 (A군), MKT-18 / ACC-25
현물처럼 평균원가로 회계. 추종·괴리·지표가치를 정교 모델링.
- **NAV** = Σ바스켓/좌수. **iNAV**(장중지표가치, 15초 산출)
- **괴리(Premium/Discount)** = `(Price − iNAV)/iNAV` — 유동↑=소, 해외/저유동=대(스테일NAV)
- **추종오차 TrackingError** = `stdev(ETF수익 − 지수수익)`
- **레버리지/인버스 ETF 일일리셋:** `NAV_t = NAV_{t−1}×(1 + L×r_underlying_daily) − dailyExpenseDrag`, `L∈{+2,+3,−1,−2,−3}` (현실 상한 ±3x — **1000x는 계좌레버리지지 ETF 아님**). 일일리셋→경로의존→횡보장 **변동성감쇠(volatility decay)** 재현. **마진 없음·계좌청산 없음**(A군)
- **운용보수 = NAV 드래그(현금흐름 아님):** `dailyExpenseDrag = NAV×expenseRatio/365`를 mark에 일별 잠식 → 현물 평균원가 무오염(숏 대차수수료가 CARRY 현금흐름인 것과 대조 — ETF 보유자는 NAV에 녹은 비용을 별도 지급하지 않음)

### 2.5 ETN (상장지수증권) — costBasis 엔진 (A군), MKT-18 / ACC-25
발행사 무담보채권(바스켓자산 없음) → **발행사 신용리스크**.
- **지표가치(IndicativeValue)** = 지수 − 일별 투자자수수료 누적
- **발행사 신용/창설중단:** 발행 중단 시 시장가↔iNAV 괴리 폭증(TVIX 2012 유형)
- **조기상환(acceleration):** 장중지표가치 임계(예 −80% intraday, XIV 2018 유형) 하회 시 자동 조기상환 → 지표가치로 강제환매 → realizedLoss 확정
- **만기/발행사콜/상장폐지:** 지표가치 현금정산(ACC-12 delisting 패턴, `reason=ACCELERATION|DELISTING|ISSUER_CALL`) — 파생 CASH_SETTLE이 아니라 **현물 매도 회계**(A군)로 처리

### 2.6 옵션 (콜/풋) — 롱=costBasis(A), 숏=margin-MTM(B), MKT-15/ACC-20/ORD-24
**§5 옵션 프라이싱 엔진**에서 전면 명세. 계약명세:
- `optionType(CALL/PUT)`, `strikeCents`, `expiryTs`, `exerciseStyle(EUROPEAN/AMERICAN)`, `settleType(CASH/PHYSICAL)`, `underlyingId`, `ivSurfaceId`, `contractMultiplier`(주식·지수옵션 = 100)
- **게임 MVP 기본 = 유럽식 · CASH_SETTLE**(무한손실·기초 마진 연쇄 회피)
- **롱 옵션:** 선불·최대손실=프리미엄 → `cash≥0` 유지(A군). 4방향 중 BUY_TO_OPEN/SELL_TO_CLOSE
- **숏 옵션:** 프리미엄 수취+증거금 구속(Reg-T 준용) → MARGIN 분기(B군). SELL_TO_OPEN/BUY_TO_CLOSE

### 2.7 선물 (Futures) — margin-MTM 엔진 (B군), MKT-17 / ACC-18
계약명세 카탈로그(3개 시장):

| 상품 | 거래소 | 통화 | contractMultiplier(점가치) | 세션 |
|---|---|---|---|---|
| ES / MES | CME | USD | $50/pt · $5/pt | 준24h |
| MNQ | CME | USD | $2/pt | 준24h |
| KOSPI200 선물 | KRX | KRW | ₩250,000/pt | KRX 세션(P3) |
| Nikkei225 선물 | OSE | JPY | ¥1,000/pt | OSE 세션(P3) |

- 계약명세: `{contractMultiplier, tickSize/tickValue, contractMonth(H·M·U·Z), lastTradeTs/expiryTs, settleType(sim=전량 현금정산), initialMargin·maintenanceMargin, priceLimit, quoteCurrency, exchange}`
- **일일정산가(DailySettle):** 종가윈도 VWAP/단일정산가(시뮬=결정론 mark를 UTC 세션정산시각 확정). `VM = (settle_t − settle_{t−1})×qty×mult`, `avgEntry ← settle_t` 리셋
- **최종결제·SQ:** expiryTs 최종결제가 = 인덱스 특별기준가(SQ; KOSPI200·Nikkei225는 만기일 아침 SQ). CASH_SETTLE → realizedPL 확정 → 포지션 제거 → 대기주문 CANCELLED(`INSTRUMENT_EXPIRED`)
- **베이시스·기간구조:** `Basis = F − S`. Contango(F>S)/Backwardation(F<S). 시뮬은 캐리비용(무위험금리−배당수익률)에 평균회귀하는 basis 확률과정으로 월물 간 기간구조 생성
- **롤오버:** 사용자개시 캘린더스프레드(근월 청산+차월 개설 원자체결), 만기 N일전 알림, 미롤 시 자동 현금정산. 차트는 백조정(back-adjusted) 연속월물

### 2.8 무기한 스왑 (Perpetual) — margin-MTM 엔진 (B군), MKT-16 / CRY-04 / ACC-18
만기 없는 파생. 인덱스·마크·펀딩 3층 산출식이 핵심.
- **인덱스가격** `I_t` = 기초 현물 바스켓 가중중앙값(시뮬은 결정론 현물엔진 mid 단일소스)
- **프리미엄인덱스** `P_t` = `TWAP[(max(0, ImpactBid−I) − max(0, I−ImpactAsk))/I]`
- **펀딩레이트(8h, fundingInterval=28800s, 00·08·16 UTC):**
  `F = P_t + clamp(i − P_t, −0.05%, +0.05%)`, i=이자성분(기본 0.01%/8h), 최종 `clamp(|F| ≤ 0.75%)`
- **마크가격(median-guard):** `M_t = median(Price1, Price2, Price3)` — Price1=`I_t×(1+LastFunding×τ/interval)`(fair-basis 앵커), Price2=ImpactMid, Price3=LastPrice. **미실현·VM·펀딩·청산 모두 M_t 사용**(단일체결 조작 방어)
- **펀딩 현금흐름(제로섬):** `fundingCashFlow = −signedNotional×F`, `signedNotional = M×qty×mult`(부호). F>0이면 롱 지급(−)/숏 수취(+), 동일시각 Σ롱+Σ숏=0. `class:CARRY`

### 2.9 코인 (크립토) — 현물(A) + 무기한(B), CRY-01~06
24/7 자산군. 기존 파생 엔진(ACC-18·LEV·MKT-16)을 재사용하고 크립토 고유 규칙을 overlay.
- **시세:** 결정론 순수함수 `f(seed, instrument, tickIndex)` = GBM(로그정규) + Poisson 점프(팻테일). annualVol: BTC≈0.6, ETH≈0.8, 알트/밈≈1.2~2.0. `tickIndex = floor((now−epochAnchor)/TICK_MS)` 무갭 연속(주말 프리즈 없음)
- **거래일 경계:** dayOpen = **UTC 00:00** 스냅샷. '오늘 변동'=vs dayOpen, '24h 변동'=`vs f@(now−24h)` O(1) 재계산
- **수량·명목:** `lotSize=1e-8(사토시)`, `minNotionalCents`(예 $1~$10) 미만 REJECT(`BELOW_MIN_NOTIONAL`), dust(<lotSize)는 '전량' 플래그
- **김치프리미엄:** `kimchiPremium_t = (priceKRW / fxRate(KRW→USD)) / priceUSD − 1` — 시드 OU(평시 0~+5%, 수요폭발 +15~20%, 역프 포함). BTC-USD·BTC-KRW는 별 instrumentId(§6 FX 환산)
- **스테이블코인:** USDT/USDC는 quoteCurrency로 USD 1:1 페그(기본, 페그붕괴는 시나리오 옵션)

---

## 3. 시세·마크가격 권위 (전 파생 공통 규약)

**마크가격 권위(Mark-price authority):** PERP/FUTURES의 미실현손익·VM·펀딩·청산은 **모두 `last`가 아니라 인덱스앵커 `mark`로 계산**한다(ACC-04 확장). 크립토 고변동에서 단일틱 위크(wick)로 부당청산되지 않도록 **인덱스 → 마크(공정가) → 라스트(체결가) 3층 분리**:
- **청산 판정 = 마크가격**, **체결 = 라스트가격** (`execPrice = mark ± halfSpread + √규모충격`, ORD-06)
- 인덱스 결측 폴백: 마지막 유효 인덱스로 VM 0·'가격대기' 라벨(avgEntry 폴백 금지)
- **결정론·서버 권위:** 인덱스·마크·펀딩·정산가·SQ·basis·ETN 지표가치는 모두 결정론 시드(솔로) 또는 서버 권위(대회) 산출, 클라 임의값 금지(MKT-01·MKT-12·ACC-10)

---

## 4. 마진·청산 엔진 (LEV) — 레버리지 롱/인버스 1000배

### 4.1 4층 마진 계좌 모델 (LEV-01)
현물 cash 모델을 폐기하고 지갑·구속증거금·포지션자산·계좌자산의 4층으로 확장(ACT-08 모드 격리와 동형):
```
walletBalance   (가용 지갑잔고, IM1: ≥ 0)
isolatedMargin  (포지션별 구속 증거금, IM2: ≥ 0)
positionEquity  (M0 + u − accruedCost, 격리는 max(0, ·) 하한)
accountEquity   = walletBalance + Σ positionEquity_i   (IM4: ≥ 0)
```

### 4.2 개시·유지증거금·리스크 리밋 티어 (LEV-02)
- 개시증거금률 `IMR = 1/L`(1000배 → **0.1%**), 유지증거금률 `MMR ≈ 0.05%대`(티어 최상단)
- **리스크 리밋 티어**(명목 구간별 maxLeverage↓·MMR↑, 고래 청산불능 방지), 예시(USD):

| 명목 구간 | maxLeverage | MMR | maintenanceAmount |
|---|---|---|---|
| ≤ $50k | 1000x | 0.05% | 누적 오프셋 |
| ≤ $250k | 200x | 0.25% | 티어 연속성 |
| ≤ $1M | 50x | 1.0% | (Binance식) |
| ≤ $5M | 20x | 2.5% | ⋯ |

진입/증액 시 명목가치로 티어 재산정. `MM = round(notional_mark × MMR) − maintenanceAmount`(티어 연속성 오프셋).

### 4.3 청산가·마진레벨·마진콜 (LEV-03)
- **마진레벨** `marginLevel = positionEquity / MM`, **청산 발동** `marginLevel ≤ 1`
- **청산가(정석 폐형식, 마크기준):**
  - 롱: `P_liq = E×(1 − IMR)/(1 − MMR)`
  - 숏(인버스): `P_liq = E×(1 + IMR)/(1 + MMR)`
  - `accruedCost` 있으면 `M0 → (M0 − accruedCost)`로 치환해 청산가 불리하게 이동
  - (기존 ACC-15 근사식 `entry×(1−(1−mm)/lev)`를 이 정석식으로 **대체·정정**)
- **파산가(positionEquity=0):** 롱 `P_bk = E×(1−IMR)`, 숏 `P_bk = E×(1+IMR)`. **청산가는 항상 파산가보다 앞**(롱: P_liq>P_bk) → 그 사이 버퍼가 청산수수료+잔손실 흡수 재원
- **마진콜:** `marginLevel ≤ marginCallLevel`(예 1.3~2.0). 1000배는 창이 순간이라 '청산 임박 플래시'+사후 리포트로 표현 + **사전 리스크 고지 게이트**(LEV-08) 필수

### 4.4 강제청산·부분청산·청산수수료 (LEV-04, ACC-23)
- **강제청산:** `marginLevel ≤ 1` → ORD 시장가 청산주문(ORD-05 체결가·ORD-06 슬리피지 적용). 서버 권위·결정론(MKT-12), 멱등키·원자커밋(ACC-09)
- **부분청산(표준 경로):** 전량이 아니라 `marginLevel`을 목표(예 targetLevel 1.3) 이상으로 회복시키는 최소 수량만 단계 축소(20%→재평가→50%→100%). 회복 실패 시 전량 에스컬레이션. 필요최소 노티널 근사: `close_notional ≈ (MM_req − equity)/(mmr − liqSlippage − feeRate)`. (1000배는 버퍼 미세해 대개 전량으로 귀결되나 엔진은 부분청산을 표준으로 구현.) 각 Fill은 개별 원자 트랜잭션
- **청산수수료:** `liqFee = round(notional_mark × liqFeeRate)`, `liqFeeRate`는 일반 taker보다 높게(0.5~1.0%). 유지증거금 버퍼에서 차감, `insuranceFund += liqFee`

### 4.5 손실 상한·보험기금·계좌 음수 방지 (LEV-05, ACC-22) — O13 확정
PRD 오픈이슈 O13("강제청산 원금초과손실 시 equity 음수 화해")을 **단일 규칙**으로 확정:
1. **격리 손실 상한:** 한 포지션 실현손실 ≤ `M0`(구속 증거금) — IM5
2. **보험기금 흡수:** 청산 체결가가 파산가를 관통(갭)해 M0 초과 잔손실 발생 시 `residual = max(0, −(체결시 positionEquity))`를 **시뮬 보험기금**이 흡수, 지갑 불변
3. **음의 자기자본 클램프:** `accountEquity`를 0으로 clamp, 초과분은 `INSURANCE_ABSORB` type으로 유저 원장 **밖**(`insuranceFundAbsorbedCents` 별도 카운터)에 상각 → 유저 tradingPL의 포지션당 최대손실이 정확히 `−M0` → equity≥0에서 항등식 유지, 보험기금은 유저 equity 구성요소 아님(오염 차단)
- 정상장에서는 보험기금 무부담, 갭장에서만 흡수·ADL

### 4.6 자동디레버리징 (LEV-06, ADL) — P2 활성
보험기금 고갈 또는 파산가 미체결(갭/무유동성)로 손실 미흡수 시, 반대측 '수익×실효레버리지' 랭크 상위 포지션을 **파산가로 부분 강제감축**해 손실 사회화.
- **ADL 큐 지표** = `|unrealizedPnlRate| × effectiveLeverage` 내림차순, 결정론·투명
- 실동작은 무기한/선물(공유 보험기금) 붙는 **P2에서 활성**(엔진 골격은 P1)

### 4.7 교차마진 (LEV-04, 고위험 리그 옵션)
- 지갑 전체가 공유 증거금. `accountEquity ≤ clearanceLevel` → 전 포지션 청산; 청산 후에도 음수면 0으로 clamp + residual→보험기금 + 파산 처리(ACC-16)
- 지갑 음수 금지는 격리·교차 공통. 교차 실동작은 P2(펀딩/선물과 함께)

### 4.8 마진이자·자본비용 (LEV-07)
- **롱 차입원금** = `notional_entry×(1−IMR)`, 일별 `accrued = round(차입원금 × dailyRate)`를 절대시각(UTC) 기준 `accruedCost`에 누적(숏 대차수수료 ACC-15와 대칭)
- `accruedCost`는 positionEquity를 갉아 청산가를 밀어냄. `class:CARRY`(수익률 분모 미차감)
- **무기한 펀딩(§2.8)은 별도 엔진** — 여기 이자와 **이중부과 금지**

### 4.9 레버리지 리그 격리·리스크 고지 (LEV-08)
- 레버리지 포지션 계좌는 **하이롤러/고위험 리그로만**(GRF-07) 순위 집계
- 복합 리스크조정 점수(GRF-01)+|비중| 기반 HHI로 풀레버리지 도박의 1등 등극 무력화
- 진입 전 **원금 소진 가능성 고지 게이트**(2스텝 확인)+가상 라벨+소셜 프로필 청산 이력 노출 강제(현실성·교육가치)

---

## 5. 옵션 프라이싱·그릭스 엔진 (MKT-15)

### 5.1 핵심 설계 결정
1. **IV는 역산이 아니라 생성이 권위.** 기초자산 가격은 결정론 GBM(MKT-02)에서 나오고 σ가 이미 알려져 있으므로, 옵션 시장가는 **결정론 IV 서피스**에서 BSM으로 **생성**한다. '가격→IV 역산'은 교육 표시용, 생성-역산 왕복 무손실. → 실데이터 옵션체인 라이선스 없이 스큐·그릭스를 안전하게 재현
2. **시간가치 감소(세타)는 mark에 내재.** 선물 펀딩·대차수수료 같은 절대시각 CARRY 현금흐름 **불필요** — 옵션 세타는 매 틱 재프라이싱된 mark 변화로 자연 흡수(옵션과 선물/무기한의 회계상 결정적 차이)
3. **롱=현물형, 숏=파생형 분기**(§0.1)
4. **결정론·서버 권위:** 모든 입력(S=GBM, IV=서피스, r=RateProvider, q=배당스케줄, T=서버 UTC)이 순수함수 → 재현 가능

### 5.2 Black-Scholes-Merton 폐형식 (유럽식, 연속배당 q)
```
d1 = [ln(S/K) + (r − q + σ²/2)·T] / (σ·√T)
d2 = d1 − σ·√T
Call = S·e^(−qT)·N(d1) − K·e^(−rT)·N(d2)
Put  = K·e^(−rT)·N(−d2) − S·e^(−qT)·N(−d1)
```
`N(·)`=표준정규 CDF(Hart 또는 Abramowitz-Stegun 7.1.26, 절대오차<7.5e-8), `φ(·)`=표준정규 PDF.

### 5.3 그릭스 (단위기초 1당; 포지션값 = ×contractMultiplier×qty(부호))
| 그릭 | 공식 | 표시 스케일 |
|---|---|---|
| Delta_call | `e^(−qT)·N(d1)` | — |
| Delta_put | `−e^(−qT)·N(−d1)` | — |
| Gamma | `e^(−qT)·φ(d1)/(S·σ·√T)` (콜·풋 동일) | — |
| Vega | `S·e^(−qT)·φ(d1)·√T` | vol 1% = ÷100 |
| Theta_call | `−(S·φ(d1)·σ·e^(−qT))/(2√T) − r·K·e^(−rT)·N(d2) + q·S·e^(−qT)·N(d1)` | 1캘린더일 = ÷365 |
| Rho_call | `K·T·e^(−rT)·N(d2)` | rate 1% = ÷100 |

(Theta_put·Rho_put은 부호 대칭항.) **그릭스는 표시·마진 전용, 원장 아님** — 세타 소멸은 optMark 하락으로 MTM에 이미 반영.

### 5.4 미국식(단일종목 주식옵션) 조기행사
- **CRR 이항트리** (Cox-Ross-Rubinstein, N=128 스텝, 이산배당 반영): `u=e^(σ√Δt)`, `d=1/u`, `p=(e^((r−q)Δt)−d)/(u−d)`. 각 노드 `max(내재가치, 할인기대값)`로 조기행사 프리미엄 포착
- 고속경로: Bjerksund-Stensland 2002 폐형식. 그릭스는 트리 bump(유한차분) 또는 BSM 프록시
- 지수옵션·게임 기본은 **유럽식 폐형식으로 단순화**

### 5.5 만기·시간 클램프
- `T = (expiryTs − nowUtc)/YEAR` (ACT/365, 서버 UTC 시계). `T≤0`은 프라이싱 금지·만기 라이프사이클(ORD-24) 이관
- `T→0` 근처 `σ√T→0` 분모 발산: 최소 T 하한(예 1e-6yr)+내재가치 폴백으로 클램프

### 5.6 결정론 IV 서피스 (권위 입력)
```
IV(K,T) = σ_base(기초 MKT-02 캘리브레이션 변동성) × skew(moneyness=ln(K/S)) × term(T)
```
- 소수 파라미터(ATM vol, 25Δ 리스크리버설, 버터플라이, term slope)로 압축
- **arbitrage-free 제약:** 총분산 `w=σ²·T`가 T에 단조↑(캘린더 no-arb)·나비 비음수 하에 파라미터화, property test로 강제

### 5.7 무위험이자율 r 소싱
- 통화별 **RateProvider** 인터페이스: USD≈4.5%, KRW, JPY≈−0.1%~0.5%(정책금리). 세션 내 상수 또는 완만 변동, 결정론 시드(솔로)/서버 권위(대회)
- 배당수익률 q: 코퍼레이트액션 스케줄(MKT-11)의 이산배당을 연속수익률 환산
- **음의 r(JPY 국면)도 폐형식 그대로 성립**

### 5.8 IV 역산 (교육 표시용)
- Newton-Raphson(vega 도함수, 초기치 Brenner-Subrahmanyam `σ₀≈√(2π/T)·price/S`) 5~10회 → 미수렴 시 이분법(IV∈[0.001, 5.0]) 폴백
- 깊은 ITM·극저 vega 실패 시 '**IV N/A**' 라벨(가짜값 금지, ACC-04 폴백 정신)

### 5.9 포트폴리오 net 그릭스·정밀도
- `netDelta = Σ posDelta×mult×qty(부호)`, netGamma·netVega·netTheta 동일 합산 → 리스크 대시보드·헤지 교육 노출. 방향성 노출($) = `netDelta×S`
- 프리미엄·페이오프는 정수센트 round-half-even(ACC-19), 호가는 옵션 tickSize 스냅($0.01/$0.05). **중간 재반올림 금지**(원통화 정수→환산 1회→기준통화 반올림)

---

## 6. 3개 시장 (KR/US/JP) — 운영·통화·FX

### 6.1 핵심 결정 — "시작자산 단일 기준통화($100k USD), 운영은 멀티월렛"
- 신규 실전 계좌는 **USD 월렛에만 $100,000**, KRW·JPY 월렛은 0으로 시작 → ACT-01 고정분모 불변식 보존(리더보드 공정성 무손상)
- 한국주/일본주 매수: ① 명시적 환전(FX 주문)으로 KRW/JPY 월렛 충전, 또는 ② 체결 시 **자동환전(auto-FX)**
- **쉬운 모드 = auto-FX ON**(단일월렛 체감, 초보 무마찰) / **리얼 모드 = auto-FX OFF**(명시적 월렛 관리·환리스크 학습) — 이 토글 하나로 '단일 vs 멀티월렛' 논쟁을 UX 레이어에서 해소
- **왜 순수 멀티통화 시작자산을 안 쓰나:** 시작 환율로 분모가 유저·시즌마다 달라져 고정분모가 깨짐. 시작은 단일 USD, 이후 환전은 유저의 트레이딩 결정(환베팅)

### 6.2 거래소 레지스트리 (ExchangeSpec, MKT-19)

| 거래소 | tz(IANA) | 통화 | 정규장 | 특이사항 | 상하한 | 결제 |
|---|---|---|---|---|---|---|
| **US**(NYSE/NASDAQ) | America/New_York | USD | 09:30–16:00 ET | **DST 준수**, 프리 04:00–09:30·애프터 16:00–20:00 | LULD 밴드(±5/10/20%) + MWCB 7/13/20% | T+1 |
| **KRX** | Asia/Seoul | KRW | 09:00–15:30 KST | DST 없음, 08:30–09:00 개장동시호가·15:20–15:30 종가동시호가, 시간외단일가 15:40–16:00 | **±30% 상하한가**(기준가=전일종가), **VI** | T+2 |
| **JP**(TSE/JPX) | Asia/Tokyo | JPY | 09:00–11:30(前場)·12:30–15:00(後場) | DST 없음, **점심 휴장 11:30–12:30** | **値幅制限**(고정 엔화 밴드) ストップ高/安 | T+2 |

세션 상태·휴장·반일장은 **데이터(캘린더) 주도**, 판정은 거래소 tz 로컬시각으로 매핑하되 **저장·비교는 서버 UTC**(기기시각 불신).

### 6.3 세션 상태머신 (MKT-20)
```
state(exch, tsUtc):
  localT ← toZone(tsUtc, exch.tz)
  if isHoliday(exch, localDate) → CLOSED_HOLIDAY
  halfDay override 적용
  localT를 세션창에 매칭 → PRE / OPEN / LUNCH(JP) /
    OPENING_AUCTION / CLOSING_AUCTION / POST / CLOSED
```
- HALTED(MKT-09)는 직교 오버레이
- **DST(US):** 개장 09:30 'ET 로컬'을 IANA로 변환 → 3월 둘째 일요일~11월 첫째 일요일은 UTC 13:30, 그 외 UTC 14:30. **자체 오프셋 계산 금지**(IANA tz DB 위임), 전환일 property test로 1시간 오차 방지. KRX·JP는 고정 UTC+9
- **동시호가(call auction):** '접수→개장가 결정론 산출→일괄 체결'로 근사, 이 구간 시장가는 개장가 대기
- **갭 체결(ORD-19 연계):** 세션 재개(개장·後場 개장) 시 오버나이트/런치 갭 결정론 주입, 갭 관통한 대기 지정가/스탑은 '스쳐간 가격' 아닌 개장 틱가로 체결. DAY TIF는 각 거래소 마감(JP는 後場)에 EXPIRED

### 6.4 가격제한·서킷브레이커 (MKT-21)
- **KRX 상하한가:** 유효밴드 `[refPrice×0.70, refPrice×1.30]`(refPrice=전일종가), 밴드 밖 지정가는 REJECT(`PRICE_LIMIT_BREACH`). 시뮬 GBM 산출가도 밴드 하드클램프(상한가/하한가 '락' = 매수벽/매도벽 재현). **VI:** 동적±(2~3%)/정적±10% 이탈 시 2분 단일가 냉각(MKT-09 재사용)
- **JP 値幅制限:** 기준가대별 고정 엔화 밴드 테이블(예: 1,000~1,500엔 → ±300엔). ストップ高/安 도달 시 밴드 클램프+밴드밖 거부. 呼値(tickSize)는 TOPIX100 vs 일반 차등
- **US LULD/MWCB:** 개별종목 5분 이동평균 대비 ±5/10/20% 이탈 시 5분 단일가 정지. 시장전체 S&P 대용지수 −7%/−13%(Lv1·2, 15분)/−20%(Lv3, 당일 폐장) → 전 종목 일괄 HALT

### 6.5 FX 시세 엔진 (MKT-22)
- 통화쌍 **USD/KRW(~1,350), USD/JPY(~150)**, base=USD. 환율=결정론 GBM(저변동 `annualVol_FX≈0.08~0.12` << 주식)+평균회귀(7-요소 앵커 체크포인트, MKT-01). 솔로=클라 결정론, 대회=서버 은닉 시드
- **FX 세션 24/5**(월 06:00 KST~토 06:00 KST 근사), 주말·시장별 공휴일 무관 금 종가 고정. 정수 스케일(1e8 마이크로) 저장
- 크로스레이트(KRW→JPY)는 **USD 경유 삼각환산 1회 곱**
- 환전 스프레드: 리얼 모드 majors 수 bp(USD/JPY 좁고 USD/KRW 넓음), 쉬운 모드 mid 무마찰

### 6.6 환전·자동환전 (ORD-26)
- **FxOrder{fromCcy, toCcy, amountFrom}:** 체결환율 = `fx(from→to,snap)×(1 ∓ spread/2)`. `walletCents[from] −= amountFrom`, `walletCents[to] += round(amountFrom×체결환율)`. 월렛별 `cash≥0` 가드. 스프레드 손실은 매매비용(tradingPL 반영, netCapitalFlows 미차감)
- **auto-FX(at fill):** 외화종목 매수 시 부족분만 USD→외화 원자 환전 후 체결(단일 트랜잭션). 실패 시 전체 롤백. 리얼 OFF·쉬운 ON

### 6.7 크로스마켓 통합 평가
```
equityBaseCents = Σ_ccy 월렛[ccy]×fx(ccy→USD, tSnap)
                + Σ_pos nativeMV(pos)×fx(quoteCcy(pos)→USD, tSnap)
```
- 환산시각 = ACC-10 NAV 스냅샷의 **단일 서버 UTC 시각**(틱마다 재환산 금지 → P&L 떨림·FX 타이밍 게이밍 차단)
- **마감 거래소 포지션은 nativeMV=마지막 종가 고정**(틱 정지), FX는 세션 열려있으면 계속 이동 → 야간·주말 base equity 변동은 순수 FX_ADJ
- 반올림: 원통화 정수 → fx 곱셈 1회 → base 정수 round-half-even. 원장은 원통화 정수 보존, 환산은 표시·성과 계층 전용. `instrumentId = 자산군+심볼+통화`로 다국상장(도요타 TSE vs ADR) 구분

---

## 7. 확장 회계 모델 (ACT-15 · ACC-20~25 · GRF-16)

### 7.1 통합 자기자본 항등식 (ACC-21)
```
equity = cashCents
       + Σ_spot (mark_i × qty_i)                         (부호포함·숏은 음기여)
       + Σ_deriv((mark_j − avgEntry_j) × qty_j × mult_j)  (선물·무기한·레버리지)
       + Σ_optLong(optMark_k × qty_k × mult_k)
       − Σ_optShort(optMark_l × |qty_l| × mult_l)
```
- 파생·숏옵션 개시증거금은 `cashCents` 안에 '구속'으로 잔존 → **이중가산 없음**(ACC-18 'equity기여=IM+unrealized'와 정합). 신규 항 추가만으로 **단조 확장**(기존 현물 항 불변)
- **3버킷 현금관리:** `reservedMargin = Σ_open(initialMargin) + Σ_openOrders(reserve)`, `freeCash = cashCents − reservedMargin`. 매수여력: CASH=freeCash; MARGIN=`equity/imr − usedMargin`(isolated) 또는 `freeCash/imr`. 사전 가드 `reservedMargin ≤ cashCents`(ACC-09 리듀서 내부 검증)

### 7.2 계좌유형 불변식 분기 (ACT-15)
| 불변식 | CASH 계좌 | MARGIN 계좌 |
|---|---|---|
| I1 `cash≥0` | 유지 | **폐기** → I1a `reservedMargin ≤ cash` + I1b `equity ≥ 0`(청산 후 보험흡수 clamp) |
| 대상 | 현물·롱옵션·레버리지/인버스 ETF·ETN | 레버리지·공매도·파생·숏옵션 |

계좌에 `tradingType(CASH|MARGIN)` 부여, 불변식 세트를 유형별 분기 실행(ACC-09 I1 '레버리지 계좌 제외' 주석을 정식 규칙으로 승격).

### 7.3 신규 마진 불변식 (LEV-01 → ACC-21)
- **IM1** `walletBalance ≥ 0` · **IM2** `isolatedMargin_i ≥ 0` · **IM3** `positionEquity_i ≥ 0`(격리) · **IM4** `accountEquity ≥ 0`(계좌 음수 절대 불가) · **IM5** `Σ격리 실현청산손실 ≤ Σ구속증거금`(원금 상한) · **IM6** walletBalance = 원장 합 일치(append-only)

### 7.4 옵션 회계 (ACC-20)
- **AssetClass enum 확장:** `{EQUITY,CRYPTO,ETF,ETN,FX,FUTURES,PERP}`에 **OPTION 추가**(ACC-18 스키마 예약표에 OPTION 행 — MVP 예약, P2 배선)
- **롱 옵션(costBasis 엔진):** BUY_TO_OPEN `premium=round(price×mult×qty)+fees`, `cash−=premium`, `costBasis+=premium`. equity 기여=`mark×mult×qty`(≥0). 만기 OTM→실현=−costBasis(전손), 만기 ITM CASH→`payoff=intrinsic×mult×qty`, 실현=payoff−costBasis
- **숏 옵션(margin-MTM 엔진):** SELL_TO_OPEN `proceeds=round(price×mult×|qty|)−fees`, `cash+=proceeds`(증거금 구속). Reg-T 준용 `initialMargin=(premium + max(0.20·S − OTM, 0.10·S))×mult×|qty|`. equity 기여=`initialMargin+unrealized`. 유지증거금 미달→시장가 강제청산(ACC-22/23). 만기 ITM 배정→`cash−=intrinsic×mult×|qty|`
- **물리결제(PHYSICAL, 상급):** 롱콜 행사→기초 매수(cash−=K×mult×qty, ACC-02 편입), 롱풋→매도, 숏 배정 반대. **게임 MVP 기본은 CASH_SETTLE**
- **행사/배정/만기 = 실현손익 확정** — 전부 tradingPL(SETTLEMENT), CAPITAL 아님(수익률 분모 미차감). ACC-07 class 표에 `OPTION_SETTLE`(SETTLEMENT)·`OPTION_ASSIGN` type 추가
- **세타는 별도 CARRY 현금흐름 불필요** — mark 변화(unrealized)로 자연 흡수(선물 펀딩과 대조)

### 7.5 상품군 회계 이분 불변식 (ACC-25)
- **(A) 현물정산군** {EQUITY·ETF·ETN·CRYPTO현물·FX현물}: 평균원가(ACC-02), `cash≥0`·`equity=cash+Σmark` 성립
- **(B) 증거금MTM군** {현물SHORT·FUTURES·PERP·마진LONG·숏옵션}: MTM(ACC-18), I1 면제, equity기여=IM+unrealized
- **레버리지/인버스 ETF·ETN은 (A)군임을 명문화** → '레버리지=I1붕괴' 오해 차단
- **ETN 조기상환/상장폐지 회계:** ACC-12 delisting 패턴 재사용 — ex-event 지표가치로 강제청산→realizedPL(대개 손실) 확정→현물 매도 회계(A군), `reason=ACCELERATION|DELISTING|ISSUER_CALL`
- **운용보수=현금흐름 아님:** ETF/ETN 운용보수·인버스 캐리는 CashFlow 미기록, mark(NAV)에 잠식 → ACC-06 수익률 분모(netCapitalFlows)에도 영향 없음

### 7.6 크로스마켓 기준통화 정규화·FX 타이밍 공정성 (ACC-24)
- `equityBase = Σ_i (nativeValueCents_i × fxRate(quoteCcy_i→baseCcy, ts_snapshot))`. 고정분모 startingEquity=baseCurrency $100k(전 유저 동일)
- **월렛별 현금원장:** `cash → walletCents[ccy]` per-currency 맵. I1' = `∀ccy walletCents[ccy]≥0`(현물 전제). 통화별 최소단위(KRW=원, JPY=엔, USD=센트) 정수 원장
- **FX 환차손익(FX_ADJ):** 매매 없이 환율변동만으로 발생한 base 증감을 '환차손익'으로 분리 표시(오해 방지)하되, 리더보드 tradingPL에는 포함(베팅 결과). netCapitalFlows(CAPITAL)에는 미포함
- **simpleReturn 불변:** `(equityBase − startingEquity − netCapitalFlows)/startingEquity` 공식 변경 0. 환전은 CAPITAL 아님(환리스크는 실력에 포함)

### 7.7 실현/미실현 원장 확장 (ACC-23)
- 청산은 `Fill{side, qty, price, feeCents(=liqFee), realizedCents, liquidation:true}` 생성, `realizedCents = clamp(−M0 이내)`. 종목별 누적 realizedPL 맵 반영
- 마진이자·펀딩은 매매손익 아닌 **비용 흐름(CARRY)**으로 분류(트레이딩 PnL과 라벨 구분)
- 청산손익·청산수수료·보험흡수는 신규 type(`LIQUIDATION_FEE`·`INSURANCE_ABSORB`·`ADL`)으로 원장 스탬프(감사·재현)
- **부분청산:** 각 스텝이 원자 트랜잭션 + 실현손익 스탬프 + `LIQUIDATION_FEE`(class:SETTLEMENT) + 증거금 해제. 각각 불변식 만족

### 7.8 항등식·불변식 보존
- **I5** `accountDelta == tradingPL + netCapitalFlows`(±최소단위): tradingPL에 청산 실현손익(clamp된 −M0 상한)·청산수수료·마진이자·펀딩 포함. M0 초과 잔손실은 유저 원장 밖(insuranceFundAbsorbed)으로 상각 → 포지션당 최대손실 정확히 −M0
- **텔레스코핑 불변식(ACC-18) 확장:** `Σ VM + 최종청산손익 == (exit − entry) × qty × mult`가 부분청산·강제청산·만기정산에도 성립. property test를 `leverage∈[1,1000]`·부분청산 N단계·옵션 만기까지 확장
- **제로섬 property test:** ①펀딩 Σ롱+Σ숏=0 ②숏배당=롱배당(ACC-12) ③레버리지ETF 다중일 NAV=Π(1+L·r_i)−드래그(경로의존, 단일수익×L 아님)
- **증거금 구속은 외부현금흐름 아님**(계좌 내부 이체, netCapitalFlows 불변). 청산수수료·마진이자는 매매 마찰(ACC-08)의 확장

### 7.9 파산 연동 (ACC-16)
- 교차마진 accountEquity가 파산 임계(시작자본 20%) 이하 또는 0 clamp 도달 시 파산·쿨다운·RESET_BASELINE
- 격리는 개별 포지션만 소멸, 지갑 잔량 임계 이상이면 계좌 존속(부분 손실)
- 파산 정의는 `equity ≤ max(0, 20%)`로 하한 클램프(1000x 즉시청산 시나리오도 이 경로로 흡수)

### 7.10 리더보드 레버리지 형평 (GRF-16)
- 레버리지>임계(예 3x)·파생·옵션매도 계좌는 **하이롤러/고위험 리그 전용 세그**(GRF-06/07). 세그 분리 키 = `mode × 룰셋해시 × leverageTier × instrumentClass`
- 메인 점수 S에 레버리지 페널티 `Plev = w·max(0, peakLeverage−1)` 가산, 위험조정계수 Krisk가 레버리지 부풀린 MDD로 자연 페널티. 노티널정규화 수익률(수익/평균노티널)·샤프 병용
- **NLV(순청산가치) 기반 수익률:** 프로필·리더보드 분자는 확장 equity(§7.1), 분모는 여전히 $100k 고정
- 청산 이벤트는 프로필 리스크지표에 '**청산 횟수·최대 레버리지**'의 **리스크 요약**으로 노출(공개 프로필에서 요약 숨김 불가 — 리스크 투명성). **상세 청산 이력은 기본 비공개**이며 사용자가 명시적으로 공개해도 건수·위험 요약 중심으로 제한한다(SOC-05). NLV가 0 근처·마이너스 근접해도 순위는 손실 그대로 반영(GRF-01 Rz<0 선형)

---

## 8. 소셜·프로필·랭킹 (SOC) — 신규 도메인 #15

기존 GRF(공정성 SSOT) 위에 얹는 **표면·관계·표시 레이어**. GRF를 재정의하지 않고 참조·확장.

- **SOC-01 프로필 표면:** 대표 지표 = 리스크조정 복합스코어(GRF-01 S) + 리그 티어(GRF-05) + TWR 실력지표(GRF-02) + 배지·레벨. 절대수익·절대자산은 대표 자리에서 숨김(ACT-01 계승 — $100k 고정이라 절대액 의미 약함)
- **SOC-02 공개범위:** `profileVisibility ∈ {PUBLIC, FOLLOWERS_ONLY, PRIVATE} × 필드별 토글`(성과지표/보유요약/현재포지션/거래내역/활동). 기본값=**부분공개**(성과·배지 공개 / 실시간 포지션·거래내역 비공개). 서버 RLS(DP-09)로 강제
- **SOC-03 팔로우 그래프:** follow(단방향 구독) vs friend(상호 승인)를 분리. **팔로우는 열람·피드 권한만, 순위·보상에 어떤 가중도 없음**(팔로워 수 ≠ 랭킹 점수)
- **SOC-04 다차원 리더보드:** 시장(US/KR/JP/Coin) × 상품군 × 기간 × 정렬기준의 다축 필터(표시용). 공식 순위·보상·승강은 GRF-01/05/06 그대로. **절대수익 정렬은 하이롤러 격리 리그(GRF-07)에서만**
- **SOC-05 성과 표시:** 리스크조정·TWR·리그 티어 대표 + 레버리지 최대치·청산 이력·파생 위험도 병기, 표본 부족은 N/A
- **SOC-06 카피/herding 방지:** 실시간 포지션 기본 비공개, 공개 시 (a)지연(EOD/15분+) (b)요약(종목·비중구간만) (c)'추천 아님·모의 기록' 라벨. **원클릭 카피트레이드 미제공.** 1000배·옵션 그릭스·선물 펀딩 같은 고위험은 공개 상한 강화(요약만)
- **SOC-07 어뷰징·사칭:** 핸들 유일성+검증배지+시빌 그래프(GRF-10)로 가짜 팔로워·상호팔로우 링·사칭 차단. 배지·티어·청산이력은 서버 권위라 위조 불가
- **SOC-08 미성년 보호:** 강제 최소공개·PII 미표시·프리셋 아바타·상호작용 최소화(DP-13·LEG-13·LEG-05 정합)
- **SOC-09 크로스마켓 프로필:** 3개장+코인 성과를 baseCcy 환산 통합 + 시장별 분해 병기. FX 손익은 externalFlow 성격으로 분리 표시(절대환차익이 실력으로 오인 방지)

> **분산점수(HHI, GRF-01 Bdiv) 확장:** 숏·레버리지·파생은 |비중| 기반, ETF·지수는 look-through 분산. gross exposure 기준(롱숏 상계 왜곡 방지)

---

## 9. MVP 단계 (P1~P4)

> **P1 용어 주의:** 이 섹션의 P1~P4는 상품·시장 도메인 phasing이다. build-ready P1 실행 범위와 IN/OUT은 [p1-scope.md](./p1-scope.md)를 SSOT로 따른다.

오너 확정 순서를 스키마 예약 원칙(ACC-17 마이그레이션 폭발 방지)과 함께 배선한다.

### P1 — 미국장 + 현물 롱/숏 + 레버리지(청산) + 랭킹/프로필
- **상품:** US 현물 롱/숏(ORD-25 로케이트·리콜·buy-in), 레버리지 롱/인버스 1000배(격리마진), **현물 ETF**(MKT-18 현물 부분)
- **엔진:** LEV-01~08 전체(격리마진·청산·부분청산·청산수수료·손실상한·보험기금·마진이자·하이롤러 리그). ADL(LEV-06)·교차마진은 **골격만**(실동작 P2)
- **회계:** ACT-15·ACC-21·ACC-22·ACC-23·GRF-16 필수 탑재. ACC-25 상품군 이분 불변식·ETF 현물
- **소셜:** SOC-01·02·03·05·06·07·08 하드코어 + SOC-04의 레버리지/롱숏 리그 분리
- **예약(값 null/기본, 로직 미배선):** CashFlow.class, Account.tradingType/baseCurrency, Position.avgEntry/initialMargin/tier, 3버킷 필드, AssetClass에 OPTION/FUTURES/PERP enum, FxProvider 인터페이스, ExchangeSpec·SessionSpec(US 단일이지만 관통 배선)

### P2 — 옵션 + 선물/무기한
- **상품:** 옵션(콜/풋, 유럽식 CASH_SETTLE 기본), 선물(CME ES/MES/MNQ), 무기한, 레버리지/인버스 ETF, ETN
- **엔진:** MKT-15(옵션 프라이싱·그릭스·IV), MKT-16(무기한 펀딩/마크), MKT-17(선물), MKT-18(레버리지 ETF·ETN), ORD-24(옵션 주문/행사/배정). **LEV-06 ADL·교차마진·CRY-04 파생 로직 활성**(공유 보험기금)
- **회계:** ACC-20(옵션) 배선. SOC-04 옵션/선물·무기한 리그 축 개방

### P3 — 한국·일본장 + FX
- **상품:** KRX(KOSPI200 선물·KRW 주식), OSE(Nikkei225 선물·JPY 주식). 크로스마켓 통합 평가
- **엔진:** MKT-19(멀티거래소 레지스트리·DST·반일장), MKT-20(세션 상태머신·동시호가·갭), MKT-21(±30% 상하한가·VI·値幅制限), MKT-22(FX 24/5), ORD-26(환전·auto-FX)
- **회계:** ACC-24(멀티월렛·기준통화 정규화·FX_ADJ) 정식 활성. SOC-09 크로스마켓 프로필. CRY-06 김치프리미엄(FX 이후 옵션)

### P4 — 코인
- **상품:** 크립토 현물(24/7) + 무기한 선물
- **엔진:** CRY-01~06 전체. 무기한 펀딩·마크청산·리스크리밋 티어·부분청산은 **P2 파생 엔진 그대로 재사용**(마이그레이션 폭발 없음 — 스키마 P1 예약)
- **참고:** 크립토 거래소 WS 실데이터는 MKT-06에서 'P1부터 저비용 현실성 레버'로 권고되나, 오너 확정 순서(P4) 존중하되 P4 이전 read-only 시세 프리뷰로 선택 도입 여지만 남김

### 단계별 스키마 예약 원칙
ACC-18이 이미 파생 스키마 필드를 예약했으므로 **마이그레이션 폭발 없음.** Holding→(현물)Position / (마진)MarginPosition{isolatedMarginCents, leverage, side, entryE, accruedCost, tier}, Instrument에 옵션·선물·ETF 필드는 **P1에서 예약만** 하고 로직은 해당 P단계에서 배선(ACC-18 스코프&스키마 예약 표와 동일 원칙).

---

## 10. 결정론·감사 정합 (전 상품 공통 마무리)

- **결정론·서버 권위:** 인덱스·마크·펀딩레이트·정산가·SQ·basis·ETN 지표가치·IV·FX레이트·청산가는 모두 결정론 시드(솔로) 또는 서버 권위(대회) 산출, 클라 임의값 금지(MKT-01·MKT-12·ACC-10)
- **절대시각(ACT/365) 캐리:** 펀딩·대차·마진이자·숏배당은 서버 UTC 경계 발생 → 앱-오픈 빈도·타임존 무관(대회 결정론·리더보드 공정성 전제). 크립토는 세션 갭이 없어 이 원칙이 오히려 자연스럽게 성립
- **이벤트소싱 append-only 원장:** 리플레이 재현(ACC-09), 대회 분쟁 시드 재검증(ACC-11)
- **property test CI 게이트:** 텔레스코핑·제로섬·항등식·arbitrage-free IV·round-half-even 정렬 부등호 보존을 CI 게이트로 강제

---

> **번호 충돌 조정 노트:** 원 설계에서 세 저자가 각각 독립 제안한 MKT-15·ACC-20·ORD-24 등 중복 번호를, 기존 policies.md 최댓값(ACT-14·ORD-23·MKT-14·ACC-19·GRF-15) 다음부터 **단일 전역 번호로 재배열**했다(§1). policies.md 편입 시 이 번호를 정본으로 사용하고, 각 정책의 정책문·규칙·근거·사이드이펙트·엣지케이스·의존 6절 포맷을 기존 도메인과 동일하게 채운다.
