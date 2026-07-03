# Trading Simulator — 트래킹 플랜 (Tracking Plan / Event Taxonomy)

> **[성격 고지]** 본 문서는 제품 계측(instrumentation)의 **단일 진실원본(single source of truth)** 이다. PRD §4의 North Star(WAHB)·활성화 퍼널·K-factor·안티메트릭(§4.2, GRF-15), §16의 "각 스텝 독립 계측·A/B로 이탈 스텝 제거" 주장은 **모두 본 문서에 정의된 이벤트 위에서만 관측·검증 가능**하다. 이벤트가 여기에 없으면 그 지표는 존재하지 않는다.
>
> 관련 문서: [PRD.md](./PRD.md) · [policies.md](./policies.md)(신규 INST 도메인) · [use-cases.md](./use-cases.md)

---

## 0. 왜 이 문서가 P0인가 (계측 부채의 도미노)

현행 상태: 애널리틱스 SDK 0, 이벤트 스키마 0, 어트리뷰션 0, 실험 프레임워크 0. 즉 **PRD가 선언한 모든 성공지표가 측정 불가**다. Phase 0 회계 하드닝이 "게임화·소셜의 하드 선행 과제"이듯, **경량 텔레메트리 경로는 모든 KPI·A/B·규제증거의 하드 선행 과제**다. 계측 없이 소프트런치하면 첫 코호트(가장 값비싼 학습 데이터)가 영구 소실된다.

원칙: **"계측되지 않은 기능은 미완성 기능이다(Definition of Done에 이벤트 포함)."**

---

## 1. 계측 설계 원칙 (6원칙)

| # | 원칙 | 규칙 |
|---|---|---|
| 1 | **동의-우선(consent-first)** | 동의 전에는 §4의 익명 화이트리스트 이벤트만. PII·user_id는 익명 티어에서 절대 금지(DP-01/DP-10 정합). |
| 2 | **택소노미 우선(schema-first)** | 이벤트는 코드보다 먼저 이 문서(=코드화된 스키마)에 등록. 미등록 이벤트는 CI에서 드롭·경보(INST-01). |
| 3 | **오프라인 내구성** | 이벤트는 로컬 큐에 append-only 저장 후 배치 업로드. 오프라인 완전 작동(§10.2 이벤트소싱 원장 철학과 동일). |
| 4 | **멱등·감사 가능** | 모든 이벤트에 `event_id`(UUID) 부여, 서버 dedup. 안티메트릭·서킷브레이커 발동은 감사 로그로 보존(규제 증거, GRF-15). |
| 5 | **지표는 이벤트에서 파생** | KPI는 대시보드에서 하드코딩하지 않고 §7의 정의 쿼리로만 산출(재현성). NSM 산출 로직 변경은 버전 태깅. |
| 6 | **최소·집계 지향** | 이벤트 속성에 PII·자유텍스트·정확한 금액 원문을 넣지 않음. 금액은 버킷/비율로 익명화(DP-15 정합). |

---

## 2. 명명 규약 (Naming Convention)

- **이벤트명:** `snake_case`, **`객체_동작(과거형)`** 패턴. 예: `order_submitted`, `learning_mission_completed`, `paywall_viewed`. 문장/공백/대문자 금지.
- **속성명:** `snake_case`. 불리언은 `is_`/`has_` 접두. 열거형은 소문자 문자열(`account_mode: "easy"|"real"`).
- **도메인 접두 태그(속성 `category`):** 이벤트를 8도메인으로 분류 — `onboarding | trading | learning | gamification | social | monetization | integrity | system`. policies.md 도메인 코드와 1:1 정렬.
- **버전:** 파괴적 변경 시 이벤트명 유지 + `event_version` 증가(예: 1→2). 속성 삭제/의미변경은 파괴적 변경으로 간주.
- **예약어(공통 속성, §3)** 는 이벤트별 커스텀 속성으로 재정의 금지.
- **금지:** 실시간 시세 원값·정확한 평가금액·종목별 보유수량 원문·이메일·기기 광고ID를 속성으로 전송(익명화/버킷화 필수).

---

## 3. 공통 속성 (Super Properties — 모든 이벤트에 자동 첨부)

| 속성 | 타입 | 설명 | 익명 티어 허용 |
|---|---|---|---|
| `event_id` | uuid | 멱등 dedup 키 | ✅ |
| `event_name` / `event_version` | string / int | 스키마 식별 | ✅ |
| `ts_client` / `ts_server` | ISO8601 | 클라 발생시각 / 서버 수신시각(권위, GRF-04 UTC 단일시계) | ✅ |
| `anonymous_id` | uuid | 기기 스코프. 동의 전 유일 식별자, **로테이션 가능** | ✅ |
| `user_id` | uuid\|null | 계정 식별자. **동의·가입 전 반드시 null** | ❌(T1+) |
| `session_id` | uuid | 앱 세션(30분 무활동 시 갱신) | ✅ |
| `consent_tier` | 0\|1\|2 | 이벤트 발생 시점 동의 등급(§4) | ✅ |
| `app_version` / `build` / `runtime_version` | string | EAS fingerprint(OTA 코호트 분리, §10.1 정합) | ✅ |
| `platform` / `os_version` | enum / string | ios\|android\|web | ✅ |
| `locale` / `region_coarse` | string | 국가 단위(도시 이하 금지, 프라이버시) | ✅ |
| `account_mode` | enum | easy\|real | ✅ |
| `account_id_hash` | string\|null | 다계좌 구분용 해시(원 ID 아님) | ❌(T1+) |
| `feature_flags` | object | 활성 실험 변형 스냅샷(§9) | ✅ |
| `net_status` | enum | online\|offline_queued(업로드 시 재기록) | ✅ |
| `schema_version` | int | 트래킹 플랜 전체 버전 | ✅ |

---

## 4. 동의 전 익명 화이트리스트 (Pre-Consent Anonymous Whitelist)

PRD §7.2의 "30초는 순수 로컬·비수집 경험"과 정합. 동의(T1) 이전 **오직 아래 이벤트만** 발화 가능하며, `user_id`=null·`anonymous_id`만·PII 0·자유텍스트 0을 강제한다. 온보딩 퍼널(§16 "각 스텝 독립 계측")을 측정하려면 이 최소 집합이 반드시 T0에서 허용돼야 한다.

| consent_tier | 명칭 | 범위 |
|---|---|---|
| **T0** | 익명 화이트리스트 | 아래 표의 12개 이벤트만. 집계·비식별. |
| **T1** | 제품 애널리틱스 동의 | 전체 제품 이벤트 + `user_id` 결합 |
| **T2** | 마케팅·어트리뷰션 동의(ATT/CMP) | 설치 어트리뷰션·광고식별자 결합 |

**T0 화이트리스트(12):** `app_opened`, `app_backgrounded`, `onboarding_started`, `onboarding_step_viewed`, `onboarding_guided_trade_completed`, `onboarding_completed`, `first_trade_completed`, `disclaimer_viewed`, `age_gate_viewed`, `app_error`, `perf_slow_frame`, `telemetry_flushed`. → 온보딩 게이트 통과율·첫매수율(§4.2 획득 KPI)은 **동의 없이도** 산출 가능해야 하므로 이 집합이 결정적이다.

---

## 5. 핵심 이벤트 카탈로그

> 표기: **min_tier** = 발화에 필요한 최소 동의 등급. 속성은 대표 키만(전체는 스키마 파일 `analytics/schema/*.json` 참조 예정).

### 5.1 온보딩·활성화 (category=onboarding)
| 이벤트 | 발화 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `app_opened` | 앱 콜드/웜 스타트 | `launch_type`(cold/warm), `is_first_open` | T0 |
| `onboarding_started` | 스플래시 이후 게스트 진입 | `entry_variant` | T0 |
| `onboarding_step_viewed` | 각 온보딩 스텝 노출 | `step_id`, `step_index` | T0 |
| `onboarding_guided_trade_completed` | 가이드 원탭 매수 성공 | `was_prefill_downscaled`(bool) | T0 |
| `onboarding_completed` | 홈 착지 | `duration_ms`, `steps_skipped` | T0 |
| `activation_badge_earned` | '연습 시작' 배지 지급 | `badge_id` | T0 |
| `age_gate_submitted` | 출생연월 제출 | `is_under_threshold`(bool·연월만, 정확생년 금지) | T1 |
| `signup_deferred_prompted` / `signup_completed` | 지연가입 유도/완료 | `trigger`(social/payment/contest), `method` | T1 |

### 5.2 트레이딩 코어 (category=trading)
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `first_trade_completed` | 생애 첫 매수 체결 | `is_tutorial`(bool, ACC-10 origin 태그) | T0 |
| `order_submitted` | 주문 제출 | `order_type`(market/limit/stop/take_profit/oco…), `side`, `notional_bucket`(<100/100-1k/1k-10k/10k+), `is_tutorial` | T1 |
| `order_filled` | 체결(대기주문 포함) | `order_type`, `slippage_bps_bucket`, `is_gap_fill`(bool) | T1 |
| `order_rejected` | 거부 | `reject_code`(ORD-15 코드 매핑) | T1 |
| `order_canceled` | 취소/정정 | `reason` | T1 |
| `position_closed` | 포지션 전량청산 | `realized_pl_sign`(+/-/0), `hold_duration_bucket` | T1 |
| `account_reset` | 파산/수동 리셋 | `trigger`(bankruptcy/manual), `cooldown_active`(bool) | T1 |
| `diversification_milestone_reached` | 분산점수(1−HHI) 임계 달성 | `score_bucket` | T1 |

> **주의(계측 정합):** `notional`·`realized_pl`은 **버킷/부호로만** 전송(개인 금액 원문 금지). 리더보드·회계 정밀 수치는 서버 원장(ACC-13)이 권위이지 애널리틱스 이벤트가 아님.

### 5.3 학습·게임화 (category=learning / gamification) — **NSM 핵심**
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `learning_mission_completed` | 미션 자동판정 성공 | `mission_id`, `track`(T1/T2/T3), `xp_awarded` | T1 |
| `concept_card_viewed` | 개념카드/맥락형 카드 소비 | `card_id`, `surface`(inline/hub) | T1 |
| `quiz_answered` | 퀴즈 응답 | `is_correct`, `node_id` | T1 |
| `scenario_completed` | 시나리오 완주 | `scenario_id`, `objective_met`(bool) | T1 |
| `risk_stop_set` | 손절/익절 **설정(계획)** | `order_type`, `is_first_ever` | T1 |
| `trade_journal_created` | 복기 작성 | `journal_len_bucket` | T1 |
| `streak_extended` / `streak_freeze_used` | 스트릭 유지/프리즈 | `streak_len`, `freeze_source`(free/reward, **paid 금지**) | T1 |
| `badge_earned` | 배지 지급 | `badge_id`, `badge_type`(learning/risk/exploration/journey) | T1 |
| `level_up` | 레벨업 | `new_level` | T1 |

### 5.4 소셜·바이럴 (category=social) — **K-factor 핵심**
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `group_created` | 비공개 대회 개설 | `params_hash`, `is_free_tier` | T1 |
| `invite_sent` | 초대 링크 생성/발송 | `invite_id`, `channel` | T1 |
| `invite_link_opened` | 초대 링크 딥링크 오픈(수신자) | `invite_id`, `is_new_install`(bool, 어트리뷰션) | T2 |
| `invite_accepted` | 초대 수락→그룹 합류 | `invite_id`, `inviter_user_id_hash` | T1 |
| `league_promoted` / `league_relegated` | 승급/강등 | `from_tier`, `to_tier` | T1 |
| `share_card_generated` / `share_card_shared` | 공유 카드 | `card_type`(badge/progress/tier, **절대수익 금지**) | T1 |

> **K-factor 계측 정합:** `invite_link_opened`의 신규설치 연결은 T2(어트리뷰션 동의) 필요. 미동의 시 **딥링크 페이로드의 `invite_id`만으로 서버 조인**(광고식별자 없이) → 비개인화 K-factor 하한 추정 가능(§16 규제마찰 K-factor 하방 대응).

### 5.5 수익화 (category=monetization)
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `paywall_viewed` | 페이월 노출 | `placement`, `trigger_feature`, `experiment_variant` | T1 |
| `trial_started` / `subscription_started` | 체험/구독 시작 | `plan`(plus_m/plus_y…), `price_tier` | T1 |
| `subscription_renewed` / `subscription_canceled` | 갱신/취소 | `plan`, `days_active` | T1 |
| `rewarded_ad_started` / `rewarded_ad_completed` | 리워드 광고 | `reward_type`(cosmetic/booster/cash_refill), `is_personalized`(bool) | T1 |
| `iap_purchased` | 코스메틱/시즌패스 결제 | `sku`, `is_probabilistic`(bool, 확률형 MON-13) | T1 |
| `cash_refill_granted` | 가상현금 리필 | `daily_count`, `hit_guardrail`(bool, ACC-11) | T1 |

### 5.6 건전성·무결성 (category=integrity) — **안티메트릭·서킷브레이커 소스**
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `antimetric_snapshot` | 서버 배치 집계(유저별 일간) | `trades_per_day`, `max_single_position_pct`, `night_use_minutes`, `loss_chase_refill_count` | (서버파생) |
| `circuit_breaker_triggered` | GRF-15 임계 초과 | `metric`, `threshold`, `action`(reduce_exposure/nudge/cooldown), `season_context` | (서버) |
| `wellbeing_nudge_shown` | '잠깐 쉬기' 넛지 | `trigger`(loss_streak/night/frequency) | T1 |
| `integrity_flag_raised` | 시빌/봇/시드예측 의심(GRF-10/11) | `signal`, `score` | (서버) |

### 5.7 시스템·기술 (category=system)
| 이벤트 | 트리거 | 핵심 속성 | min_tier |
|---|---|---|---|
| `app_error` | 처리 예외/렌더 에러 | `error_code`, `screen`(스택·PII 금지) | T0 |
| `perf_slow_frame` | 프레임 드랍/롱태스크 | `screen`, `duration_ms` | T0 |
| `data_provider_failover` | 시세 프록시→시뮬 폴백(MKT-07 서킷브레이커) | `provider`, `reason` | T1 |
| `sync_conflict_resolved` | 오프라인→서버 충돌 해소(DP-08) | `strategy` | T1 |
| `telemetry_flushed` | 오프라인 큐 배치 업로드 | `batch_size`, `queued_ms` | T0 |
| `experiment_exposed` | 실험 변형 노출(§9) | `experiment_key`, `variant` | T1 |
| `feature_flag_evaluated` | 플래그 평가 | `flag_key`, `value` | T1 |

---

## 6. 지표 ↔ 이벤트 역매핑 (KPI Reverse Map)

PRD §4의 각 지표가 어떤 이벤트로 산출되는지 **역으로** 못박는다. 매핑이 비면 그 KPI는 측정 불가 상태다.

| PRD 지표 | 정의(이벤트) | 계측 상태 |
|---|---|---|
| **NSM: WAHB** | 주간 distinct user with (`learning_mission_completed` OR `risk_stop_set` OR `diversification_milestone_reached` OR `trade_journal_created`) ≥1 | §7.1 쿼리 |
| 획득: 게이트통과율×첫매수율 | `onboarding_completed`/`onboarding_started` × `first_trade_completed`/`onboarding_started` | T0로 산출 |
| 활성화: D1 achievement | `activation_badge_earned` 후 D1 `app_opened` 재방문 | T0/T1 |
| 리텐션 D1/D7/D30 | `app_opened` 코호트 리텐션(가입 user_id 기준) | T1 |
| 스트릭 유지(프리즈) | `streak_extended` / `streak_freeze_used` 코호트 | T1 |
| **K-factor** | (`invite_sent` distinct inviter당 초대수) × (`invite_accepted`/`invite_link_opened` 전환율) | T1+T2(§7.3) |
| 인스톨→유료 전환 | `subscription_started`/(설치 코호트) | T1+T2 |
| Trial→Paid | `subscription_started`/`trial_started` | T1 |
| RLTV | 결제자 코호트 `subscription_*`+`iap_purchased` 매출(RevenueCat 조인) | T1 |
| **안티메트릭(거래 상한)** | `antimetric_snapshot.trades_per_day` 분포(중앙값·꼬리) | 서버파생(§7.4) |
| 분산점수·손절사용률 | `diversification_milestone_reached` / `risk_stop_set` 비율 | T1 |
| 하이롤러 유입률 | 하이롤러 리그 join 이벤트/전체(GRF-07) | T1 |

---

## 7. NSM·핵심지표 산출 쿼리 (재현성 원장)

> 스토어: Supabase Postgres `events` 테이블(§10.1). 쿼리는 대시보드가 아닌 이 문서가 권위. 변경 시 버전 태깅(INST-04).

### 7.1 North Star — WAHB(주간 활성 학습·습관 사용자)
```sql
-- WAHB: 주당 학습 OR 리스크관리 행동 1회 이상 수행한 distinct 유저
SELECT date_trunc('week', ts_server) AS wk,
       count(DISTINCT user_id)       AS wahb
FROM   events
WHERE  event_name IN (
         'learning_mission_completed',
         'risk_stop_set',
         'diversification_milestone_reached',
         'trade_journal_created')
  AND  is_tutorial IS NOT TRUE          -- 튜토리얼 격리(ACC-10)
  AND  user_id IS NOT NULL
GROUP  BY 1 ORDER BY 1;
```
> **설계정합:** '거래 수'(`order_filled`)는 **의도적으로 NSM에서 제외**(§4.1 과잉거래 자기모순 회피). 거래 수는 §7.4 안티메트릭에서만 상한 감시 지표로 등장.

### 7.2 활성화 퍼널(게이트 통과율×첫매수율)
```sql
WITH f AS (
  SELECT anonymous_id,
    max((event_name='onboarding_started')::int)              s_start,
    max((event_name='onboarding_guided_trade_completed')::int) s_trade,
    max((event_name='onboarding_completed')::int)            s_done
  FROM events WHERE category='onboarding' GROUP BY 1)
SELECT sum(s_start) started,
       round(sum(s_trade)::num/nullif(sum(s_start),0),3) trade_rate,
       round(sum(s_done )::num/nullif(sum(s_start),0),3) gate_pass_rate
FROM f;   -- 목표 gate_pass × first_buy ≥ 0.70 (§4.2)
```

### 7.3 K-factor(초대 루프 기준)
```sql
-- K = 유저당 평균 초대수 × 초대→가입 전환율
WITH inv AS (
  SELECT count(*) FILTER (WHERE event_name='invite_sent')       sent,
         count(DISTINCT user_id) FILTER (WHERE event_name='invite_sent') inviters,
         count(*) FILTER (WHERE event_name='invite_accepted')   accepted,
         count(*) FILTER (WHERE event_name='invite_link_opened') opened
  FROM events WHERE ts_server >= now() - interval '28 days')
SELECT round((sent::num/nullif(inviters,0)) *
             (accepted::num/nullif(opened,0)), 3) AS k_factor
FROM inv;  -- 목표 ≥0.3(v1), ≥0.5(v2)
```

### 7.4 안티메트릭 서킷브레이커 판정(GRF-15)
```sql
-- 도박화 조기경보: 평균이 아닌 분포(중앙값·상위꼬리)로 감시
SELECT date_trunc('day', ts_server) d,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY trades_per_day)  p50_trades,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY trades_per_day) p95_trades,
       avg(loss_chase_refill_count)                                 avg_loss_chase
FROM   events WHERE event_name='antimetric_snapshot'
GROUP  BY 1
-- 임계(예): p95_trades > 30/day 또는 avg_loss_chase > 3 → circuit_breaker_triggered 발동
HAVING percentile_cont(0.95) WITHIN GROUP (ORDER BY trades_per_day) > 30;
```
> 임계 초과 시 서버가 `circuit_breaker_triggered` 발화 + 노출/넛지/쿨다운 조정(진행 중 대회 산정규칙은 GRF-01대로 불변, 노출만 조정).

---

## 8. 텔레메트리 파이프라인 — MVP 경량 경로 (오프라인 큐 → 익명 배치 업로드)

PRD §5 MVP에 **명시적으로 IN** 되어야 하는 최소 경로(O1 계측 강제). 서버·인증 없이도 작동하도록 §10.2 이벤트소싱·오프라인 우선 철학을 그대로 재사용한다.

```
[클라] track(event) → 공통속성 부착 → consent_tier 게이트(§4)
  → SQLite append-only 로컬 큐(event_id 멱등)
  → 배치 업로더(플러시 조건: 50건 || 60초 || 백그라운드 진입 || 네트워크 복귀)
  → HTTPS 익명 배치 POST(gzip) → [Supabase Edge Function] dedup(event_id) → events 테이블
                                                              ↘ RevenueCat/어트리뷰션 조인(서버측, T2)
```

- **오프라인 내구성:** 미전송 이벤트는 큐에 보존, 앱 종료·크래시 후 재시도. 큐 상한(예: 5,000건) 초과 시 오래된 비필수 이벤트부터 드롭(에러/온보딩/수익화는 우선 보존).
- **동의 게이트:** consent_tier < 이벤트 min_tier면 **큐 진입 자체를 차단**(사후 삭제 아님). T1 동의 획득 시점부터 user_id 결합.
- **PII 스크러버:** 업로드 직전 자유텍스트·금액원문·기기ID 필드 검증(존재 시 드롭+`integrity_flag`).
- **MVP 구현 선택:** 자체 경량 경로가 기본안. 벤더 SDK(PostHog/Amplitude 등) 채택 시에도 **동일 스키마·동일 큐 규약**을 SDK 앞단 어댑터로 강제(벤더 락인·재심사 회피, §10.1 StorageProvider 추상화와 동형).

---

## 9. 실험·피처플래그 계측 (Experimentation)

§16 "A/B로 이탈 스텝 제거"·§17 "2월 수익화 A/B"의 전제.

- **노출 이벤트 필수:** 변형을 **본 순간** `experiment_exposed{experiment_key, variant}` 발화(할당≠노출; 노출 기준으로 분석해야 편향 없음).
- **플래그 스냅샷:** 모든 이벤트 공통속성 `feature_flags`에 활성 변형 동봉 → 사후 세그먼트 분석 가능.
- **가드레일 메트릭 강제:** 모든 실험은 성공지표 + **안티메트릭(§7.4)을 가드레일로 동시 관측**. 가드레일 악화(도박화 신호↑) 시 자동 롤백 후보(GRF-15).
- **결정론 정합:** 실험 버킷팅은 `hash(user_id||experiment_key)`로 결정론적, 세션 간 안정.

---

## 10. 거버넌스·검수 게이트

- **Plan-as-Code:** 본 문서의 이벤트/속성을 `analytics/schema/*.json`으로 코드화. CI가 (a)클라 `track()` 호출을 스키마와 대조, (b)미등록 이벤트/속성 빌드 실패, (c)PII 화이트리스트 위반 실패(INST-01).
- **DoD 통합:** 신규 기능 PR은 관련 이벤트 추가 없이는 머지 불가(리뷰 체크리스트 항목).
- **프라이버시 라벨 동기화:** 수집 이벤트·식별자를 App Store/Play Data safety 라벨과 정확히 일치(DP-10, 불일치=심사 리젝).
- **지표 정의 변경 관리:** NSM/K-factor 등 산출 로직 변경은 `schema_version`·쿼리 버전 태깅 + 과거 코호트 재계산 영향 고지(INST-04).

---

---

# [삽입 블록 A] — PRD.md 수정 지시 (그대로 반영)

### A-1. §10.1 스택 결정 표에 **3행 추가**
```markdown
| 제품 애널리틱스 | **이벤트 파이프라인(자체 경량 텔레메트리 → 벤더 어댑터, 스키마 우선)** | NSM(WAHB)·활성화 퍼널·안티메트릭이 전부 이벤트 위에 존재. tracking-plan.md가 단일 진실원본(계측=DoD) |
| 어트리뷰션·딥링크 | **Expo Router 딥링크 + 설치 어트리뷰션(초대 invite_id 서버 조인, 광고식별자는 T2 동의 후)** | K-factor·인스톨→유료 전환 측정의 전제. 초대 루프가 load-bearing(§8.5) |
| 실험·피처플래그 | **결정론 버킷팅 + 노출이벤트(experiment_exposed) + 가드레일 메트릭 강제** | §16 'A/B로 이탈 스텝 제거'·§17 수익화 A/B의 실행 기반. 안티메트릭을 가드레일로 동시 관측 |
```

### A-2. §10 말미에 **신규 소절 §10.3 추가**
```markdown
### 10.3 계측·텔레메트리 경로 (MVP IN)
- 경량 텔레메트리 경로(오프라인 SQLite 큐 → 익명 배치 업로드 → Edge Function dedup)를 **MVP 스코프에 명시적으로 포함**한다. 서버·인증 없이 작동(§10.2 오프라인 우선 재사용), 첫 코호트 소실을 방지.
- 동의 전에는 tracking-plan.md §4의 **익명 화이트리스트(12 이벤트)만** 발화(user_id=null·PII 0). 온보딩 게이트 통과율·첫매수율은 동의 없이도 산출 가능해야 하므로 이 최소집합이 결정적이다.
- 이벤트 택소노미·NSM 산출 쿼리·지표↔이벤트 역매핑의 단일 진실원본은 [tracking-plan.md](./tracking-plan.md).
```

### A-3. §4.1 NSM 아래 **각주 1줄 추가**
```markdown
> **[계측]** WAHB의 조작적 정의·산출 쿼리는 tracking-plan.md §7.1. NSM은 `learning_mission_completed·risk_stop_set·diversification_milestone_reached·trade_journal_created` 이벤트에서 파생하며, '거래 수'(order_filled)는 NSM에서 의도적으로 제외하고 §7.4 안티메트릭 상한 지표로만 관측한다.
```

### A-4. §18 오픈이슈 **O1 리프레이밍**(계측 강제)
```markdown
| O1 | **서버 도입 시점 조기화 + 계측 경로 확정** — MVP 리텐션 공허화 대응 및 첫 코호트 계측 소실 방지. 경량 텔레메트리(오프라인 큐→익명 배치)를 MVP IN으로 확정할지 | MVP 설계 확정 전 | **경량 텔레메트리는 MVP IN 고정(계측 없이는 어떤 KPI·A/B도 검증 불가)**, 백엔드 집계 조기화는 콘텐츠 진행감 방어와 저울질 |
```
(§14 정책요약·문서 상단 '관련 문서' 링크에 tracking-plan.md 추가)

---

# [삽입 블록 B] — policies.md 신규 도메인 (8번 DP 섹션 뒤에 삽입)

## 9. 계측·애널리틱스 거버넌스 정책 (INST) — 이벤트 택소노미·동의 게이트·텔레메트리 파이프라인·지표 재현성

> 상세 이벤트 카탈로그·명명규약·NSM 쿼리는 [tracking-plan.md](./tracking-plan.md). 본 절은 그 계측을 **규칙·게이트로 강제**한다.

### INST-01 · 이벤트 택소노미·명명·스키마 거버넌스

**정책:** 이벤트는 코드보다 먼저 트래킹 플랜(코드화된 스키마)에 등록되며, 미등록·비규약 이벤트는 CI에서 차단한다.

- **규칙**
  - 명명은 `객체_동작(과거형)` snake_case 단일 규약, `category`로 8도메인(policies 도메인 코드와 정렬) 분류.
  - 신규 기능 PR은 관련 이벤트 등록 없이 머지 불가(계측=Definition of Done).
  - CI가 클라 `track()` 호출을 스키마 JSON과 대조: 미등록 이벤트/속성·타입 불일치·PII 화이트리스트 위반 시 빌드 실패.
  - 파괴적 스키마 변경은 `event_version` 증가로만, 속성 삭제/의미변경은 파괴적 변경으로 간주.
- **근거:** 스키마 없는 계측은 오염된 데이터를 낳아 KPI 신뢰를 붕괴시킨다. 스키마 우선은 첫 코호트(가장 값비싼 데이터)의 품질을 보장한다.
- **⚠️ 사이드이펙트(2차 효과)**
  - 계측 게이트가 기능 개발 속도를 늦춤 → 최소 필수 이벤트만 DoD로, 나머지는 후속.
  - 스키마 경직성이 실험적 이벤트를 억제 → `experimental_` 접두 임시 네임스페이스 허용(정식 승격 전).
- **엣지케이스**
  - 벤더 SDK 자동수집 이벤트가 규약 밖 → 어댑터로 정규화하거나 분석에서 제외.
  - OTA 콘텐츠 갱신으로 신규 미션 ID 발생 → ID는 데이터값이지 스키마 변경 아님(허용).
- **의존/충돌:** tracking-plan.md · DP-04(스키마 마이그레이션) · ACC-10(튜토리얼 격리 태그)

### INST-02 · 동의 전 익명 화이트리스트·계측 동의 게이트

**정책:** 동의(T1) 이전에는 익명 화이트리스트 이벤트만 수집하고, PII·user_id 결합을 원천 차단한다.

- **규칙**
  - T0(동의 전): tracking-plan.md §4의 12개 화이트리스트 이벤트만, `user_id`=null, `anonymous_id`만, PII·자유텍스트·금액원문 0.
  - consent_tier < 이벤트 min_tier이면 **로컬 큐 진입 자체를 차단**(사후 삭제가 아니라 미수집).
  - T1(제품 애널리틱스)·T2(마케팅·어트리뷰션)를 분리 동의(묶음 금지, DP-10 정합), 철회 즉시 반영 및 처리자 삭제 전파.
  - 온보딩 게이트 통과율·첫매수율(§4.2 획득 KPI)은 T0만으로 산출 가능해야 하므로 해당 이벤트를 화이트리스트에 반드시 포함.
- **근거:** PIPA·GDPR·ATT 준수 + "30초는 순수 로컬·비수집"(PRD §7.2) 정합. 스토어 프라이버시 라벨과 실제 수집이 일치해야 심사 리젝을 피한다.
- **⚠️ 사이드이펙트:** 익명 제약으로 초기 퍼널 분석 해상도 저하 → 화이트리스트를 퍼널 측정에 충분하도록 정밀 설계.
- **엣지케이스**
  - 연령게이트 미만 아동 → 행동광고·프로파일링 금지, 분석도 최소 집계만(DP-13).
  - VPN/지역판별 실패 → 가장 엄격한 관할 기준 보수 적용.
  - 게스트→가입 시 익명 이벤트 소급 결합 → 동의 범위 내에서만 anonymous_id↔user_id 스티칭.
- **의존/충돌:** DP-01 · DP-10 · DP-13 · LEG-05 · 수익화(광고 eCPM)

### INST-03 · 텔레메트리 파이프라인·오프라인 큐·배치 무결성

**정책:** 이벤트는 오프라인에서도 유실 없이 로컬 큐에 append-only 저장 후 멱등 배치 업로드된다.

- **규칙**
  - 이벤트마다 `event_id`(UUID) 부여, 서버 dedup으로 중복 제거(재시도·크래시 내성).
  - 플러시 조건: 배치 50건 OR 60초 OR 백그라운드 진입 OR 네트워크 복귀. gzip HTTPS.
  - 큐 상한 초과 시 비필수 이벤트부터 드롭, 에러·온보딩·수익화·무결성 이벤트는 우선 보존.
  - 업로드 직전 PII 스크러버 검증(자유텍스트·금액원문·기기ID 차단), 위반 시 드롭+`integrity_flag`.
  - 서버 수신시각(`ts_server`)을 권위 타임라인으로(GRF-04 UTC 단일시계), 클라시각은 참고.
- **근거:** 오프라인 우선(§10.2)·이벤트소싱 철학 재사용. 배치·멱등은 모바일 네트워크 불안정에서 데이터 완전성을 보장.
- **⚠️ 사이드이펙트:** 배치 지연으로 실시간 대시보드 지연 → 안티메트릭 서킷브레이커는 준실시간 허용오차 내 설계.
- **엣지케이스**
  - 시계 조작 클라 → ts_server 기준 판정, 클라시각 이상치 플래그.
  - 앱 삭제 전 미전송 큐 → 유실 불가피, 필수 이벤트는 조기 플러시로 노출 최소화.
- **의존/충돌:** DP-08(동기화·충돌) · DP-15(로깅 프라이버시) · GRF-04 · GRF-12(멱등)

### INST-04 · 지표 정의 단일원장·NSM 산출 재현성

**정책:** KPI는 대시보드에 하드코딩하지 않고 트래킹 플랜의 정의 쿼리로만 산출하며, 정의 변경은 버전 관리한다.

- **규칙**
  - NSM(WAHB)·활성화 퍼널·K-factor·안티메트릭의 산출 로직은 tracking-plan.md §7의 쿼리가 유일 권위.
  - 정의 변경 시 `schema_version`·쿼리 버전 태깅 + 과거 코호트 재계산 영향 고지(추세 단절 방지).
  - NSM은 학습·리스크관리 이벤트에서만 파생, '거래 수'는 NSM 제외·안티메트릭 상한 지표로만(§4.1 자기모순 회피 강제).
  - 안티메트릭은 평균 단독 금지, 분포(중앙값·상위꼬리)로 감시(헤비유저 왜곡 방지).
- **근거:** 지표 정의가 분산·암묵되면 팀 간 수치 불일치로 의사결정이 오염된다. 단일 원장은 A/B·규제 증거의 재현성을 보장.
- **⚠️ 사이드이펙트:** 정의 경직이 탐색적 분석을 늦춤 → 탐색 쿼리는 자유, 공식 KPI만 원장 고정.
- **엣지케이스**
  - 시즌 오픈발 거래 급증 → 안티메트릭 시즌 컨텍스트 보정(GRF-15).
  - B2B 교실 집중 사용 → 교실 컨텍스트 예외 처리.
- **의존/충돌:** PRD §4 · GRF-15 · GRF-01 · INST-01

### INST-05 · 실험·피처플래그 계측·가드레일 강제

**정책:** 모든 실험은 노출 이벤트를 발화하고 안티메트릭을 가드레일로 동시 관측하며, 도박화 신호 상승 시 롤백을 원칙으로 한다.

- **규칙**
  - 변형을 본 순간 `experiment_exposed{experiment_key, variant}` 발화(할당이 아닌 노출 기준 분석).
  - 모든 이벤트 공통속성 `feature_flags`에 활성 변형 스냅샷 동봉(사후 세그먼트 분석).
  - 버킷팅은 `hash(user_id||experiment_key)` 결정론(세션 간 안정, GRF-11 시드예측 방어 정합).
  - 성공지표와 함께 안티메트릭(과잉거래·loss-chase·심야 과사용)을 가드레일로 필수 관측, 악화 시 자동 롤백 후보.
  - 리그·시즌 보상 가중치 변경 실험은 시즌 중 산정규칙 불변(GRF-01), 시즌 시작 시에만 적용.
- **근거:** §16 'A/B로 이탈 스텝 제거'·§17 수익화 A/B의 실행 기반. 노출 기준·가드레일은 실험이 리텐션을 올리며 규제선을 넘는 것을 방지.
- **⚠️ 사이드이펙트:** 가드레일이 공격적 성장 실험을 억제 → 의도된 트레이드오프(윤리 방어선 우선).
- **엣지케이스**
  - 소규모 표본 실험의 통계 유의성 부족 → 최소 표본·기간 게이트.
  - 플래그 평가 실패(원격 config 미도달) → 안전 기본값(보수적 변형)으로 폴백.
- **의존/충돌:** INST-01 · GRF-15 · GRF-01 · GRF-11 · 수익화(가격·페이월 A/B)