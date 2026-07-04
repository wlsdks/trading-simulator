# 📈 Trading Simulator

가짜(시뮬레이션) 시세와 **100% 가상 회사**로 주식 매매를 게임처럼 즐기는 fun-first 가짜 돈 트레이딩 게임입니다.
**Expo (React Native) + TypeScript** 로 만들어 iOS · Android · Web 어디서나 돌아갑니다.

> 현재 제품 포지셔닝은 "교육용 앱"이 아니라 **재미 우선, 실제 돈/체결 없는 주식 게임**입니다.

## 기능

- **마켓** — 12개 종목의 시세가 2초마다 랜덤워크로 움직입니다. 탭하면 주문 창이 열려요.
- **매수 / 매도** — 수량 입력 후 주문. 현금·보유수량 검증과 MAX 버튼 포함.
- **내 자산** — 총 자산, 평가손익(금액·%), 현금/주식 비중, 종목별 손익, 최근 거래 내역.
- **자동 저장** — 현금·보유·거래내역이 기기에 저장(AsyncStorage)되어 앱을 껐다 켜도 유지됩니다.
- **초기화** — 언제든 시작 자산($100,000)으로 리셋.

> 실제 시세가 아닌 시뮬레이션 데이터입니다. 나중에 실시간 무료 API(Finnhub 등)로 교체할 수 있도록
> 가격 엔진(`src/engine/priceEngine.ts`)이 분리되어 있습니다.

## 문서

- `docs/policies.md` — 16개 도메인 / 215개 정책의 정책 카탈로그.
- `docs/use-cases.md` — 49개 유즈케이스 명세.
- `docs/PRD.md` — fun-first, 100% fictional companies 포지셔닝과 제품 스코프.

## 시작하기

```bash
npm install
npm start        # Expo 개발 서버 실행
```

- **iOS/Android 실기기**: 폰에 [Expo Go](https://expo.dev/go) 앱을 설치하고, 터미널에 뜬 QR 코드를 스캔하세요.
- **iOS 시뮬레이터**: `npm run ios`
- **Android 에뮬레이터**: `npm run android`
- **웹**: `npm run web`

## 구조

```
App.tsx                        탭 네비게이션 + 전역 Provider + 주문 모달
src/
├─ data/stocks.ts              종목 시드 데이터 · 시작 자산
├─ engine/priceEngine.ts       시세 시뮬레이터 (평균회귀 랜덤워크)
├─ context/PortfolioContext.tsx 현금·보유·거래 상태, 매수/매도 로직, 영속화
├─ screens/
│  ├─ MarketScreen.tsx         종목 리스트 + 실시간 시세
│  └─ PortfolioScreen.tsx      자산 요약 · 보유종목 · 거래내역
├─ components/TradeModal.tsx   매수/매도 주문 바텀시트
├─ theme.ts                    색상·간격·라운드 토큰
└─ utils/format.ts             통화·퍼센트 포매팅
```

## 기술 스택

- Expo SDK 57 / React Native 0.86 / React 19
- TypeScript (strict)
- `@react-native-async-storage/async-storage` 로컬 저장

## 로드맵 아이디어

- [ ] 종목 상세 화면 + 가격 차트
- [ ] 실시간 무료 시세 API 연동
- [ ] 관심종목(워치리스트)
- [ ] 지정가 주문 / 손절·익절
- [ ] 자산 추이 그래프
