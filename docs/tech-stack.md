# Trading Simulator — 확정 기술 스택 (Tech Stack)

> **기준일: 2026-07-04** · 대상: iOS + Android (+ 웹 옵션) · Expo(React Native) + TypeScript, **Expo 관리형 워크플로우 우선**
> 제품 성격: 재미로 하는 가짜 돈 주식 시뮬레이션 게임 — 실시간(2초) 시세 틱, 매매 UI, 포트폴리오, 게임화(레벨·배지·대회·리더보드), 향후 백엔드·차트.

---

## 1. 요약

2026-07-04 기준 최신 안정 **Expo SDK는 57**(최신 패치 **57.0.1**)이며 SDK 58은 미출시입니다. SDK 57의 공식 조합은 **React Native 0.86 + React 19.2**이고, 현재 프로젝트(SDK 57 / RN 0.86 / React 19)는 **이미 최신 코어 런타임 위에 있으므로 대규모 업그레이드가 불필요**합니다 — 패치 라인 정렬(`expo@57.0.1`)과 React를 정확히 `19.2.x`로 고정하는 정도면 충분합니다. SDK 55(RN 0.83)부터 **New Architecture가 항상 활성화**되어 비활성화 옵션이 없고 SDK 57도 New Arch 전용이며, **Hermes가 기본이자 사실상 유일한 JS 엔진**입니다. 이 전제 위에서 각 레이어를 다음과 같이 확정합니다: 내비게이션은 **Expo Router 57**(SDK 56부터 React Navigation에서 분기·디커플링되어 관리형의 사실상 표준), 로컬 저장은 **AsyncStorage로 시작 → 핫패스는 MMKV 4 + 구조화 데이터는 expo-sqlite + Drizzle**의 2단계 전략, 백엔드/실시간은 **Supabase**(순수 JS라 Expo Go 호환), 애니메이션은 공식 번들 3종 셋 **Reanimated 4.5 + Worklets 0.10 + Gesture Handler 2.32**, UI 킷은 **NativeWind v4(+ Gluestack v3 선택)**, 차트는 **@shopify/react-native-skia 2.6**, 품질/배포는 **jest-expo 57 + Jest 29 + RNTL 14 + ESLint 9 + Prettier 3.9 + TypeScript 6 + EAS CLI 20 + Maestro(E2E)**입니다. 모든 패키지는 반드시 `npx expo install`로 설치해 SDK 57이 검증한 버전으로 고정해야 상호 호환이 보장됩니다. **불확실 표기**: Hermes 개별 버전(RN에 번들, 미공표), Maestro 정확 semver(npm 미배포), Skia 차트 영역 리서치 근거 부족(아래 §5·§6 참조), react-native-safe-area-context는 SDK 권장(~5.7.0)과 npm 최신(5.8.0)이 상이.

---

## 2. 확정 스택 표

> 원칙: **버전은 `npx expo install` 산출물(SDK 57 고정값)을 단일 출처로** 함. 아래 숫자는 2026-07-04 npm/Expo 확인값이며, 설치 직전 패치가 미세하게 다를 수 있음.

### 코어 런타임
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| SDK | `expo` | **57.0.1** | 최신 안정 SDK. 현재 프로젝트가 이미 57 → 패치만 정렬. SDK 58 미출시 |
| 프레임워크 | `react-native` | **0.86.0** | SDK 57 공식 매칭. 0.85→0.86 breaking change 없음. New Arch 전용 |
| 런타임 | `react` / `react-dom` | **19.2.x** | SDK 56·57 공통 React. '19'를 정확히 19.2.x로 고정 |
| JS 엔진 | Hermes | RN 0.86 번들 *(개별 버전 미공표)* | RN 0.82+ 유일/기본 엔진(JSC 제거). 별도 설치·설정 불필요 |

### 내비게이션
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| 라우팅 | `expo-router` | **57.0.3** | SDK 57 동기화. 파일 기반 탭+스택+모달, 웹/SSR/딥링크 기본, Expo Go/EAS 완전 호환 |
| 네이티브 스택 | `react-native-screens` | **4.25.2** | expo-router peer(^4.25.2). 네이티브 화면 최적화 |
| 세이프에어리어 | `react-native-safe-area-context` | **~5.7.0** *(npm 최신 5.8.0)* | Android 15+ edge-to-edge 필수. 관리형은 expo install 값 사용 |
| 제스처 | `react-native-gesture-handler` | **2.32.0** | 스택/모달 스와이프. 애니메이션 셋과 공유(아래) |
| 딥링크 | `expo-linking` | **57.0.1** | expo-router peer. 리더보드·대회 공유 링크/웹 URL |

### 로컬 저장·DB
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| KV(MVP 시작) | `@react-native-async-storage/async-storage` | **3.1.1** | 순수 Expo Go 유지용 시작점(비동기·비암호화). 핫패스엔 부적합 → MMKV로 이관 |
| KV(핫패스) | `react-native-mmkv` | **4.3.2** | 동기(JSI), AsyncStorage 대비 ~30배. 2초 틱·포트폴리오·게임화 상태. **Expo Go 불가, dev client 필요** |
| KV(핫패스 의존) | `react-native-nitro-modules` | MMKV 4 peer | MMKV 4.x는 Nitro 기반 → New Arch 전용(SDK 57 충족) |
| 관계형 DB | `expo-sqlite` | **57.0.0** | SDK 57 번들. WAL·async·변경 리스너. 거래 이력·리더보드/대회 캐시. Expo Go/New Arch 지원 |
| ORM | `drizzle-orm` | **0.45.2** | 타입세이프 ORM. `useLiveQuery` 리액티브. 순수 JS라 Expo Go 로드 가능 |
| 마이그레이션 | `drizzle-kit` | **0.31.10** | 빌드타임 CLI(devDependency) |

### 백엔드·인증·실시간
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| BaaS(1순위) | `@supabase/supabase-js` | **2.110.0** | 순수 JS→Expo Go/EAS 동작. auth+realtime+postgres+storage+functions 통합. 서브패키지 전부 2.110.0로 잠김 |
| 세션 저장 | `@react-native-async-storage/async-storage` | **3.1.1** | supabase-js RN 세션 영속화(필수) |
| 폴리필 | `react-native-url-polyfill` | **3.0.0** | supabase-js가 RN에서 URL API 필요(필수) |
| 보안 저장(선택) | `expo-secure-store` | **57.0.0** | 세션 토큰을 Keychain/Keystore에 암호화 저장 시 커스텀 storage 어댑터 |

### 애니메이션·제스처·UI
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| 애니메이션 | `react-native-reanimated` | **4.5.x** | SDK 57 공식 번들. 레이아웃/공유요소전환, 60/120fps, 틱 값 애니메이션. New Arch 전용 |
| 워클릿 런타임 | `react-native-worklets` | **0.10.x** | Reanimated 4 필수 분리 의존성. 없으면 동작 불가. 4.5 ↔ 0.10 짝 고정 |
| 제스처 | `react-native-gesture-handler` | **2.32.x** | 매매 스와이프/드래그. Expo Go 위해 번들 2.32 유지(3.0.2는 dev build 전용) |
| UI 킷(스타일) | `nativewind` | **4.2.6** | Tailwind 유틸리티, iOS/Android/웹 공통. v5는 pre-release |
| UI 킷(컴포넌트, 선택) | `@gluestack-ui/*` | **v3** | NativeWind 기반 copy-paste, 접근성 컴포넌트. v5는 alpha |

### 차트·그래픽
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| 그래픽 토대 | `@shopify/react-native-skia` | **2.6.6** | GPU 가속 저수준 그래픽 토대(캔들/라인 차트 커스텀 렌더). Expo SDK 57 = RN 0.86 / React 19 호환 확인 |

> ⚠️ **차트 영역 주의**: 원본 리서치가 이 영역에 대해 근거가 부족("test")했고 Skia 단일 항목만 확정 근거를 제시했습니다. Skia는 **저수준 렌더 토대**일 뿐 차트 컴포넌트 라이브러리가 아니므로, 실제 차트 UI는 (a) Skia 위에 직접 구현하거나 (b) `victory-native`(XL, Skia 기반) 등 고수준 라이브러리 채택 여부를 **별도 리서치로 SDK 57/RN 0.86/New Arch 호환 확인 후 확정**해야 합니다. 현재는 Skia만 확정, 상위 차트 킷은 **미확정**으로 표기.

### 빌드·배포·테스트·품질
| 레이어 | 패키지 | 버전 | 선택 이유 |
|---|---|---|---|
| 배포 | `eas-cli` | **20.5.1** | EAS Build/Update/Submit. 클라우드 빌드·OTA·스토어 제출 |
| 테스트 프리셋 | `jest-expo` | **57.0.1** | SDK 57 전용. peer `@react-native/jest-preset ^0.86.0` |
| 테스트 러너 | `jest` | **29.7.0** | jest-expo 57 내부 의존성이 Jest 29 계열 → 30 아님 |
| 컴포넌트 테스트 | `@testing-library/react-native` | **14.0.1** | React 19 async 렌더링 대응(render/fireEvent가 Promise 반환→await) |
| 타입 | `@types/jest` | **29.5.14** | 런타임 jest 29에 맞춤(30.0.0 불일치) |
| 린트 | `eslint` | **9.39.4** | Expo Flat config 검증판. 10.6.0은 config-expo 지원 미확인 |
| 린트 설정 | `eslint-config-expo` | **57.0.0** | Expo 공식. JSX·TS·플랫폼 글로벌·.ios/.android/.web 인지 |
| 포맷 | `prettier` | **3.9.4** | eslint-config-expo/flat 연동 |
| 타입스크립트 | `typescript` | **6.0.3** | SDK 57 템플릿 채택값. TS 7.0(Go 재작성)은 beta/rc |
| React 타입 | `@types/react` | **19.2.2** | SDK 57 템플릿값, React 19.2 정합 |
| E2E | `maestro` | 설치 시점 최신 *(npm 미배포, semver 미특정)* | 관리형 마찰 적음, YAML, 계측 불필요. Detox는 0.86 미검증 후순위 |

---

## 3. 버전 호환 매트릭스

| 기준 | Expo SDK | React Native | React | 비고 |
|---|---|---|---|---|
| **확정(본 프로젝트)** | **57 (57.0.1)** | **0.86** | **19.2** | New Arch 전용, Hermes 기본, 최소 iOS 15.1 / Android API 24 |
| 직전 | 56 | 0.85 | 19.2 | SDK 57은 RN만 0.85→0.86, React 동일 |
| 차기 | 58 | — | — | 2026-07-04 미출시(연 3회 릴리스), **정보 없음** |

### SDK 57 정합 라이브러리 (핵심)
| 라이브러리 | SDK 57 정합 버전 | New Arch | Expo Go |
|---|---|---|---|
| expo-router | 57.0.3 | 필수(전제 충족) | O |
| react-native-screens | 4.25.2 | O | O |
| react-native-safe-area-context | ~5.7.0 | O | O |
| react-native-gesture-handler | 2.32.x | O | O (3.0은 X) |
| react-native-reanimated | 4.5.x | **전용** | O(번들값만) |
| react-native-worklets | 0.10.x | **전용** | O(번들값만) |
| expo-sqlite | 57.0.0 | O | O |
| react-native-mmkv | 4.3.2 | **전용** | **X (dev client)** |
| @supabase/supabase-js | 2.110.0 | 무관(순수 JS) | O |
| @shopify/react-native-skia | 2.6.6 | O | O |
| jest-expo | 57.0.1 | — | — |

> **핵심 짝 고정 규칙**: Reanimated 4.5 ↔ Worklets 0.10은 compatibility table 짝을 반드시 맞추고 네이티브 리빌드. supabase-js는 메타패키지 하나만 관리(서브패키지 개별 핀 금지).

---

## 4. 현재 스택 업그레이드 판단 (올릴지 / 유지할지)

| 항목 | 현재 | 판단 | 조치 |
|---|---|---|---|
| Expo SDK | 57 | **유지** | 패치만 `57.0.1`로 정렬 |
| React Native | 0.86 | **유지** | 이미 SDK 57 매칭값. 직접 설치 금지, `expo install` |
| React | 19 (불명확) | **고정** | 정확히 `19.2.x`로 핀 |
| New Architecture | 활성(강제) | **그대로** | 비활성 옵션 없음 → 모든 네이티브 의존성 New Arch 지원 필수 |
| Hermes | 기본 | **그대로** | 별도 설정 불필요 |
| AsyncStorage | 사용 중 | **단계적 이관** | MVP는 유지, 핫패스는 MMKV(dev client)로 이관 |

**결론: 코어 런타임 업그레이드는 불필요.** SDK 57이 최신이므로 "패치 정렬 + React 19.2 핀 + `npx expo install --fix`로 나머지 패키지 SDK 정합"만 수행하면 됩니다. 라이브러리 추가는 위 확정표대로 신규 설치.

---

## 5. 영역별 선택 근거 · 탈락 대안

**내비게이션 — Expo Router 57 채택.** SDK 56부터 Expo Router가 React Navigation에서 분기(fork)해 자체 코어 `standard-navigation`으로 완전 디커플링됨 → 앱 코드에서 `@react-navigation/*` 직접 import 비권장(진입점 `expo-router/react-navigation`, `expo-router/js-top-tabs`로 대체). 탈락: **순정 React Navigation 7**(`@react-navigation/native 7.3.6`)은 RN 0.86/React 19와 기술적으로 호환되나 SDK 57 관리형에서 통합 마찰·중복 의존성 발생 → 명령형 설정이 꼭 필요한 경우에만. 기존 코드 마이그레이션은 codemod `npx expo-codemod sdk-56-expo-router-react-navigation-replace`.

**로컬 저장 — 2단계 전략.** MVP는 AsyncStorage(순수 Expo Go), 성능 임계 시 MMKV(dev client) + expo-sqlite/Drizzle. 탈락/유보: MMKV를 초기부터 쓰면 **Expo Go 포기**(dev build 필수) → 관리형 우선 목표와 트레이드오프. 게임 저장은 비민감 데이터라 **암호화 불필요**(필요 시 MMKV encryptionKey 또는 토큰만 expo-secure-store 분리).

**백엔드 — Supabase 채택.** 순수 JS→Expo Go 즉시 동작, auth+realtime+postgres를 한 SDK로. 탈락: **Convex 1.42.1**(리액티브 쿼리로 리더보드 이상적이나 공식 Auth `@convex-dev/auth 0.0.94` 프리-1.0 → 인증은 Clerk 외부 조합 필요), **react-native-firebase 25.1.0**(네이티브 모듈 → Expo Go 불가, FCM/구글 생태계 핵심일 때만), **PocketBase 0.27.0**(셀프호스팅 저비용이나 realtime에 react-native-sse 폴리필 필요·매니지드 확장성 약함).

**애니메이션/UI — 공식 번들 3종 + NativeWind v4.** Reanimated 4.5 + Worklets 0.10 + Gesture Handler 2.32는 SDK 57 changelog 확정 셋. UI는 NativeWind v4.2.6(stable, 웹 옵션에 유리) + Gluestack v3(선택). 탈락: **Tamagui v2**(2.0.0-rc, SDK 57 검증 미확인 → RC 리스크), **NativeWind v5·Gluestack v5·Gesture Handler 3.0**(pre-release/alpha 또는 Expo Go 비호환 → dev build 전용).

**품질/배포 — Expo 공식 경로.** jest-expo 57(Jest 29 페어링 강제) + RNTL 14(async) + ESLint 9 + Prettier 3.9 + TS 6 + EAS CLI 20. E2E는 **Maestro 1순위**(관리형 마찰 적음). 탈락: **Jest 30**(jest-expo 57이 29에 묶임), **ESLint 10 / TS 7**(config-expo 미검증 / Go 재작성 beta), **Detox 20.51.4**(공식 테스트 RN 0.84.x까지 + dev build 필요 → 후순위).

---

## 6. 리스크 · 주의사항

- **New Architecture 전용(강제).** SDK 55+/RN 0.86은 New Arch 비활성 불가 → 모든 서드파티 네이티브 모듈(차트/매매/백엔드)이 New Arch 지원인지 채택 전 확인 필수. 일부 라이브러리(예: Sentry)는 SDK 57 지원이 진행 중일 수 있음.
- **Expo Go vs dev client 트레이드오프.** MMKV·Firebase·Gesture Handler 3.0·Detox는 Expo Go 비호환 → 채택 시 EAS dev build 전환 불가피. "가능한 한 Expo Go 유지" 목표와 충돌.
- **Reanimated Android 메모리.** RN 0.85+ Hermes 변경으로 import만으로 메모리 25~30% 증가 가능 → 상시 애니메이션 게임 특성상 **worklets bundle mode 활성화** + 성능 프로파일링 필수.
- **Supabase Realtime 한도.** 동시연결 Free 200 / Pro 500. 대회 피크 트래픽 초과 시 연결 거부·과금 → 순위는 무제한 Postgres Changes 구독보다 **Broadcast 채널 집계 또는 주기 스냅샷/폴링**으로 설계.
- **버전 짝 어긋남.** Reanimated↔Worklets, supabase-js 서브패키지, jest-expo↔Jest는 짝이 어긋나면 런타임 오류 → 개별 npm install/resolutions 핀 금지, `npx expo install`만 사용.
- **Drizzle 마이그레이션 번들링.** metro.config.js에 `sql` 확장자 추가 누락 시 런타임 에러 흔함 → 초기 셋업 문서 정확히 따를 것.
- **RNTL 14 async 마이그레이션.** 기존 동기 테스트는 render/fireEvent/renderHook/act에 `await` 추가 필요. Node ^22.13 || >=24 요구.
- **미확인 항목(명시).** Hermes 개별 버전(RN 번들, 미공표) · Maestro 정확 semver(npm 미배포) · safe-area-context SDK권장(~5.7.0)≠npm최신(5.8.0) · 상위 차트 라이브러리(Skia 위 고수준 킷) · SDK 58 출시 시기 · react-native-firebase 25.x의 RN 0.86 New Arch 실사용 검증.
- **EAS Update runtimeVersion.** 정책 어긋나면 OTA가 잘못된 빌드에 배포 → SDK 업그레이드 시 재확인.

---

## 7. 설치 명령

> **철칙: 버전을 직접 지정하지 말고 `npx expo install`로 SDK 57 고정값 설치.** 마지막에 `npx expo install --fix`로 전체 정합.

```bash
# 0) 신규 프로젝트라면 (expo-router 기본 포함)
npx create-expo-app@latest trading-simulator

# 1) 코어 런타임 정렬 (기존 프로젝트)
npx expo install expo@^57.0.0
npx expo install react react-dom react-native
npx expo install --fix        # 나머지 패키지를 SDK 57 정합 버전으로 정렬

# 2) 내비게이션
npx expo install expo-router react-native-screens \
  react-native-safe-area-context react-native-gesture-handler expo-linking
# app.json에 scheme 설정, entry point = "expo-router/entry"
# (기존 RN Navigation 코드 이관)
npx expo-codemod sdk-56-expo-router-react-navigation-replace 'src/**/*.{ts,tsx}'

# 3) 로컬 저장 — MVP (순수 Expo Go)
npx expo install @react-native-async-storage/async-storage
# 구조화 데이터
npx expo install expo-sqlite
npm install drizzle-orm
npm install -D drizzle-kit
# 핫패스 KV (dev client 필요 — Expo Go 불가)
npx expo install react-native-mmkv react-native-nitro-modules

# 4) 백엔드 (Supabase)
npx expo install @supabase/supabase-js \
  @react-native-async-storage/async-storage react-native-url-polyfill
npx expo install expo-secure-store   # 선택(토큰 보안 저장)
# 진입점 최상단: import 'react-native-url-polyfill/auto';
# createClient auth: { storage: AsyncStorage, autoRefreshToken:true,
#   persistSession:true, detectSessionInUrl:false }

# 5) 애니메이션 / UI
npx expo install react-native-reanimated react-native-worklets \
  react-native-gesture-handler
npx expo install nativewind && npm install -D tailwindcss
# 앱 루트를 <GestureHandlerRootView>로 감쌀 것
# Gluestack v3(선택): CLI로 필요한 컴포넌트만 add

# 6) 차트 (토대만 확정)
npx expo install @shopify/react-native-skia
# 상위 차트 킷(victory-native 등)은 SDK57/New Arch 호환 확인 후 별도 확정

# 7) 품질 / 테스트 / 린트 / 타입
npx expo install jest-expo
npm install -D jest@^29.7.0 @types/jest@^29.5.14 \
  @testing-library/react-native@^14.0.1
npx expo install eslint eslint-config-expo
npm install -D prettier
npx expo install typescript @types/react

# 8) 배포 / E2E
npm install -g eas-cli            # 또는 npx eas
eas build:configure
# Maestro (npm 미배포 — curl 설치)
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 9) 상시 점검
npx expo-doctor
npx expo lint
```

> **MMKV·Skia·Reanimated 등 네이티브 모듈은 dev client 빌드 필요:**
> `npx expo prebuild` → `eas build --profile development` (또는 `--profile preview`). MMKV 채택 시점부터 Expo Go 대신 dev client 사용.

---

## 8. 확인 출처

> 아래는 리서치가 참조한 1차 출처 유형. **npm registry 실측값과 Expo 공식 changelog/템플릿을 단일 출처로 사용**했으며, 블로그·AI 요약이 SDK 57의 RN 버전을 0.75/0.85로 잘못 표기한 사례가 있어 배제함.

- **Expo 공식 문서 / SDK 57 changelog** — `https://docs.expo.dev` (SDK↔RN↔React 매트릭스, New Arch 정책, Router 디커플링, worklets bundle mode)
- **npm registry (`npm view <pkg> version|dependencies|peerDependencies`)** — expo 57.0.1, expo-router 57.0.3, react-native-screens 4.25.2, react-native-mmkv 4.3.2, @supabase/supabase-js 2.110.0(서브패키지 잠금 확인), reanimated/worklets/gesture-handler, jest-expo 57.0.1, nativewind 4.2.6 등 버전·의존성 실측
- **React Native 0.86 릴리스 노트** — 0.85→0.86 변경, 최소 타깃 iOS 15.1 / Android API 24, Hermes 단일 엔진
- **Supabase 공식 문서** — RN 셋업(url-polyfill / AsyncStorage / detectSessionInUrl) 및 Realtime 요금·동시연결 한도
- **Drizzle ORM 문서** — expo-sqlite 연동, useLiveQuery, metro sql transformer 마이그레이션
- **rnfirebase.io / Convex / PocketBase 공식 문서** — 탈락 대안의 Expo Go 호환·인증 상태(0.0.x/0.x) 확인
- **Maestro 공식(get.maestro.mobile.dev)** — npm 미배포·curl 설치, RN New Arch 영향 적음

> **미확인 사항은 본문에서 명시적으로 표기**했습니다(Hermes 개별 버전, Maestro semver, safe-area-context 권장/최신 불일치, 상위 차트 라이브러리, SDK 58, react-native-firebase의 RN 0.86 New Arch 실검증). 이 값들은 설치·채택 직전 재확인을 권장합니다.


---

## ⚠️ 보강 필요 (Round 후속)
이 문서는 8개 영역 리서치 중 일부가 미완이라 아래를 보강해야 확정됩니다:
- **상태관리**: 리서치 에이전트 실패로 미확정 → Zustand / Redux Toolkit / Jotai / TanStack Query 최신·호환 재조사 필요.
- **차트 라이브러리**: Skia(토대)만 확정, 상위 캔들/라인 차트 킷(victory-native XL 등) SDK 57/New Arch 호환 재조사 필요.
- **데이터 소스(신규 스코프)**: 한국장(KRX)·미국장·일본장 3개 시장 + 코인 + 파생(옵션·선물) 시세/체결 데이터 소스, 그리고 **현실적 파생 계산**(옵션 블랙숄즈·그릭스, 마진·청산·펀딩) 라이브러리/자체구현 조사 필요.
