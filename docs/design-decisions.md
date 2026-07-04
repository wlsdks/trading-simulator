# Trading Simulator — 디자인 결정 (Design Decisions SSOT)

> 2026-07-04 오너 확정. 빌드(P1/Phase 0~MVP)의 비주얼 SSOT. 포지셔닝: fun-first 가짜 돈 주식 게임.

## 1. 무드 · 비주얼 방향 — **프리미엄 다크 핀테크**
- 검정/딥차콜 배경, 정제된 데이터 밀도, 절제된 모션. "토스·번들·로빈후드" 계열의 진지하고 고급스러운 느낌.
- 게임성은 **연출·마이크로인터랙션·컨페티·배지**로 표현하되, 기본 레이아웃은 차분하고 신뢰감 있게(핀테크). 아케이드/네온 아님.
- **NOT R4 — 상태 피드백과 축하 연출 분리:** 항상-on 숫자 count-up, up/down pulse, sparkline tween, 주문/체결 햅틱은 시장 상태를 읽기 쉽게 만드는 피드백이지 P&L 축하가 아니다. 컨페티·팡파레는 P&L 독립 성취(입성 / 플레이어 탄생, 배지, 레벨, 도감 세트, 좋은 판단 스트릭)에만 사용한다.
- 현재 MVP `src/theme.ts`의 다크 팔레트(bg `#0B0E11`, card `#161B22`, accent `#3B82F6`)가 이 방향과 정합 → 유지·정교화.

## 2. 상승/하락 색 — **상승=빨강 / 하락=파랑 (한국식)**, 설정 토글
- **기본값: 한국식(상승=빨강, 하락=파랑).** KR/JP 관습.
- 설정에서 **서구식(상승=초록, 하락=빨강)** 으로 전환 제공. 지역 로케일로 초기 기본값 자동 선택 가능(KR/JP=한국식, 그 외=서구식).
- 색은 의미 토큰으로 추상화: `colorUp` / `colorDown` (하드코딩 금지). 접근성(A11Y): 색만으로 구분하지 말고 부호(+/−)·화살표 병기.
- ⚠️ **코드 변경 필요**: 현재 `src/theme.ts`는 `up: '#16C784'(초록)`, `down: '#EA3943'(빨강)` = 서구식. → 기본을 한국식(up=빨강, down=파랑)으로 바꾸고 토글 가능한 의미 토큰으로 리팩터.

## 3. 간판(hero) 화면 — **마켓 + 종목 랭킹**
- MVP에서 가장 먼저·가장 공들일 화면. "살아있는 시장"이 첫인상.
- 구성: 실시간 시세 리스트 + **마켓 펄스**(거래대금·거래량·급등락·인기 다차원 랭킹, living-market.md MKT-27) + 속보 티커.
- 자체 UI(토스 카피 아님). 종목=가상 발행사(instruments 유니버스).

## 4. 상태 피드백 — **이벤트 없는 5분도 살아있게**
- 순자산·P&L·랭킹 숫자는 tabular-nums 기반 count-up/down으로 최신값에 수렴한다. up/down color pulse는 방향 상태 전달이며, 손익 축하가 아니다.
- 스파크라인은 새 tick/update에 tween으로 이어진다. 과도한 점멸·화면 흔들림 금지.
- 햅틱 맵: order-accepted=light, fill=success-impact, threshold-cross=selection, badge-earned=success-notification. P&L 실현·손실회복에는 success-notification 금지.
- 설정: reduced-motion은 count-up·pulse·sparkline tween을 즉시 전환/축소하고, reduced-haptics는 모든 햅틱을 끄거나 light로 dampen한다.

## 참고 — 화면 우선순위 (MVP)
1. **마켓 + 랭킹**(간판) → 2. 매매·차트(Skia) → 3. 내 자산·손익 → 4. 온보딩(30초 첫 매수) → 5. 프로필/랭킹.

관련: [PRD.md](./PRD.md) · [p1-scope.md](./p1-scope.md) · [living-market.md](./living-market.md) · [tech-stack.md](./tech-stack.md)
