# Trading Simulator — Native-grade 카탈로그 (living checklist)

> **목적:** 이 Expo/RN 앱을 최대한 "네이티브급"으로 올릴 수 있는 공식 기법을 하나씩 발굴·적용·기록한다. 출처는 Expo 공식 가이드(building-native-ui / expo-ui 스킬)와 Expo/RN 공식 문서. 새 기법을 찾을 때마다 이 표에 추가하고 상태를 갱신한다.
>
> 상태: ✅ 적용됨 · 🔜 계획(해당 화면 만들 때) · 💡 후보(검토) · ⛔ 우리 방향과 안 맞음
>
> **원칙:** 우리 정체성(프리미엄 다크 핀테크 · 한국식 등락색 · 디자인 토큰)은 유지하되, 그 위에 네이티브 질감·인터랙션·안전영역·성능을 얹는다.

## 1. 내비게이션 (가장 native급 체감 큼)
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **NativeTabs** (`expo-router/unstable-native-tabs`) | 실제 iOS UITabBar / Android 네이티브 탭바. 안전영역 자동, iOS26 liquid glass·블러 | 하단 4탭(마켓·랭킹·내자산·프로필)을 네이티브 탭바로 — JS 탭바의 하단 붕뜸 해결 | 🔜 진행중 |
| **Native Stack + Large Title** (`expo-router/stack`) | 네이티브 대형 타이틀 헤더, 스크롤 시 축소, 블러 배경 | 종목상세·설정 등 push 화면의 헤더를 네이티브로 | 🔜 종목상세 만들 때 |
| **Form Sheet** (`presentation: 'formSheet'`, detents) | 네이티브 바텀시트(디텐트·그래버). iOS26 투명배경=liquid glass | **주문(매수/매도) 티켓**을 커스텀 Modal → 네이티브 formSheet로 | 🔜 주문 개선 시 (현재 커스텀 Modal) |
| **Modal 프레젠테이션** (`presentation: 'modal'`) | 네이티브 모달 전환 | 전체화면 모달류 | 💡 |
| **Context Menu** (`Link.Menu` / `Link.MenuAction`) | 롱프레스 네이티브 컨텍스트 메뉴(공유·차단·삭제 등) | 종목·프로필·거래 롱프레스 메뉴 | 🔜 소셜/종목 |
| **Link Preview** (`Link.Preview`) | iOS 링크 롱프레스 미리보기 | 종목·프로필 카드 미리보기 | 🔜 |
| **Apple Zoom Transition** (`Link.AppleZoom`, iOS18+) | 카드→상세 유체 줌 전환 | 종목 카드 → 종목상세 | 💡 |

## 2. 아이콘·컬러
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **SF Symbols** (`expo-image` `source="sf:name"`) | iOS 네이티브 심볼(적응형·굵기·애니메이션) | **탭바 아이콘**은 SF/Material(NativeTabs). 콘텐츠 아이콘은 Lucide 유지(크로스플랫폼 일관) | 🔜 탭바 |
| **Color API** (`Color` from `expo-router`) | 네이티브 시맨틱 컬러(자동 라이트/다크·접근성) | 우리는 브랜드 다크 토큰 사용이 우선 → 시스템 컬러는 구분선/시스템 UI에만 선택적 | 💡 부분 |

## 3. 안전영역·레이아웃 (공식 권장)
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **`ScrollView contentInsetAdjustmentBehavior="automatic"`** | SafeAreaView 대신 네이티브 인셋 자동 처리(FlatList/SectionList도) | 전 화면 스크롤뷰에 적용 | 🔜 탭 이전과 함께 |
| **`react-native-safe-area-context`** (RN SafeAreaView 금지) | 인셋 훅 | 필요 시 useSafeAreaInsets | 🔜 |
| **`boxShadow` (CSS)** | 레거시 shadow/elevation 대신 CSS 그림자 | 카드 그림자 | 💡 |
| **`borderCurve: 'continuous'`** | 애플식 연속 곡률 라운드 | 카드·버튼 라운드 | 🔜 |

## 4. 네이티브 컨트롤 (iOS 네이티브 위젯)
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **SegmentedControl** (네이티브) | 네이티브 세그먼트 | 마켓펄스 급등/급락/거래대금… · 매수/매도 토글 · 랭킹 세그먼트 | 💡 (현재 커스텀) |
| **Switch / Slider / Picker / DateTimePicker** | 네이티브 입력 위젯(내장 햅틱) | 설정·수량·필터 | 🔜 설정/필터 |
| **@expo/ui** (Host·BottomSheet·List 등) | 진짜 SwiftUI/Jetpack Compose 컴포넌트 | 설정 폼·네이티브 시트 | 💡 |

## 5. 질감·모션·피드백
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **expo-haptics** | 조건부 iOS 햅틱(체결·주문·임계·배지) | design-tokens 햅틱맵(§4)과 연결 — 체결=success 등 | 🔜 매매 피드백 |
| **Reanimated** (entering/exiting/layout/scroll/gesture) | 네이티브 60/120fps 애니 | count-up·펄스·스파크라인 tween·화면전환 | 🔜 주스 반영 |
| **expo-blur** / **expo-glass-effect** | 블러 / iOS26 liquid glass | 헤더·시트·오버레이 배경 | 💡 |
| **experimental_backgroundImage** (CSS 그라디언트, New Arch) | 네이티브 그라디언트 | 히어로·카드 배경 | 💡 |

## 6. 데이터·검색·기타
| 기법 | 무엇 | 우리 적용 | 상태 |
|---|---|---|---|
| **headerSearchBarOptions / useSearch** | 네이티브 검색바(헤더 통합) | 종목 검색·워치리스트 | 🔜 검색 만들 때 |
| **expo-sqlite (+Drizzle)** | 네이티브 SQLite | 거래이력·캐시 (dev-spec) | 🔜 영속화 고도화 |
| **react-native-mmkv** | 동기 고속 저장(핫패스) | 시세 스냅샷·UI 플래그 (dev client 필요) | 🔜 dev client 시 |
| **Skia / WebGPU+Three** | GPU 차트·3D | 캔들/라인 차트(Skia), 특수 연출(WebGPU) | 🔜 차트 |
| **`<Text selectable />` · `tabular-nums`** | 복사가능 텍스트 · 숫자 정렬 | 가격·손익·수치 | 🔜 |

## 7. 실행/빌드 원칙 (공식)
- **Expo Go 먼저**: 대부분 기능은 Expo Go에서 동작(현재 앱 O). MMKV·커스텀 네이티브 모듈·Apple 타깃 쓸 때만 dev client(`expo run:ios`)/EAS 빌드 필요.
- SDK 56+: `@react-navigation/*` 직접 import 금지 → `expo-router/react-navigation` 사용.
- 네이티브 모듈: `expo-audio`(not expo-av), `expo-video`, `expo-image` 등 최신 패키지 우선.

---
**갱신 로그:** 새 기법 발견/적용 시 이 표에 행 추가 + 상태 갱신. 적용 커밋마다 상태를 ✅로.
