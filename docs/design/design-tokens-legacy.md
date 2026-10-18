# 디자인 토큰 (레거시 — 2026-10-18부터 색은 [design-tokens.md](design-tokens.md)가 기준)

> 상태: 초안 · 최종 수정 2026-10-16
> 코드: [`src/styles/tokens.css`](../../src/styles/tokens.css) · 출처: 레거시 `app/index.html`의 `C` 팔레트와 인라인 스타일
> **색 토큰은 디자인 이식 1단계부터 [design-tokens.md](design-tokens.md)(Figma Make UI Kit 기준)가 단일 기준이다.** 이 문서의 색 섹션은 참고용으로 남겨두고, 반경·그림자·타이포·레이아웃·카테고리 색은 아직 이 문서가 기준이다(이식되면 옮긴다).

토큰은 2층 구조다.

1. `--ts-*` 브랜드 원시 토큰 — 레거시 `C.*` 이름을 kebab-case로 그대로 옮김
2. shadcn 시맨틱 토큰(`--primary` 등) — 1층을 참조

Tailwind 유틸리티 이름은 3열(`bg-primary`, `text-ink` …).

## 색 — 브랜드

| 토큰             | 값        | Tailwind              | 레거시       | 쓰임                           |
| ---------------- | --------- | --------------------- | ------------ | ------------------------------ |
| `--ts-blue`      | `#2F7BE6` | `blue` / `primary`    | `C.blue`     | 주요 액션, 활성 탭             |
| `--ts-blue-deep` | `#164FAE` | `blue-deep`           | `C.blueDeep` | 그라디언트 끝, 강조 숫자       |
| `--ts-ink`       | `#153A52` | `ink` / `foreground`  | `C.ink`      | 본문·제목, Time-Safe 카드 배경 |
| `--ts-gold`      | `#F2B134` | `gold`                | `C.gold`     | "Stay" 워드마크, 체류시간 숫자 |
| `--ts-gold-deep` | `#D9971A` | `gold-deep`           | `C.goldDeep` | 제휴 AD 배지 글자              |
| `--ts-red`       | `#E23B3B` | `red` / `destructive` | `C.red`      | 경고, 복귀 시각, 초과          |
| `--ts-lime`      | `#8DBE36` | `lime`                | `C.lime`     | 실시간 반영 표시               |

## 색 — 표면·텍스트

| 토큰            | 값        | Tailwind                   | 레거시    | 쓰임            |
| --------------- | --------- | -------------------------- | --------- | --------------- |
| `--ts-bg`       | `#F1F5FA` | `background`               | `C.bg`    | 앱 배경         |
| `--ts-card`     | `#FFFFFF` | `card`                     | `C.card`  | 카드            |
| `--ts-tint`     | `#EAF1FB` | `tint` / `secondary`       | `C.tint`  | 칩·선택 배경    |
| `--ts-sub`      | `#5E7185` | `sub` / `muted-foreground` | `C.sub`   | 보조 텍스트     |
| `--ts-faint`    | `#A9B4C4` | `faint`                    | `C.faint` | 캡션, 비활성 탭 |
| `--ts-line`     | `#E3EAF3` | `line` / `border`          | `C.line`  | 구분선, 테두리  |
| `--ts-backdrop` | `#E6ECF6` | `backdrop`                 | (인라인)  | 폰 프레임 바깥  |

## 색 — 상태 (레거시 인라인 값을 토큰화)

| 토큰                            | 값                    | Tailwind              | 쓰임                              |
| ------------------------------- | --------------------- | --------------------- | --------------------------------- |
| `--ts-success`                  | `#2E9E5B`             | `success`             | "실시간", "환승 내 가능", 여유 분 |
| `--ts-success-bg`               | `#E7F7EE`             | `success-bg`          | 위 배지 배경                      |
| `--ts-danger-bg`                | `#FDECEA`             | `danger-bg`           | 경고 박스, 짐 케어 배너           |
| `--ts-disabled`                 | `#C4D2E4`             | `disabled`            | 비활성 버튼                       |
| `--ts-ad-bg` / `--ts-ad-border` | `#FFF3DC` / `#F5D089` | `ad-bg` / `ad-border` | 제휴 AD 배지                      |
| `--ts-overlay`                  | `rgb(16 24 38 / .45)` | —                     | 바텀시트 딤                       |

## 색 — 어두운(ink) 배경 위 (4단계 추가, 레거시 인라인 값)

| 토큰                           | 값                     | Tailwind                  | 쓰임                  |
| ------------------------------ | ---------------------- | ------------------------- | --------------------- |
| `--ts-on-dark`                 | `#CFE0F5`              | `on-dark`                 | 결과 카드 본문        |
| `--ts-on-dark-sub`             | `#BFD3F0`              | `on-dark-sub`             | 카드 머리줄           |
| `--ts-on-dark-muted`           | `#9FB6D4`              | `on-dark-muted`           | 항공편 줄, 안내       |
| `--ts-on-dark-danger` / `-sub` | `#FF8A8A` / `#F0C7C7`  | `on-dark-danger` / `-sub` | 외출 불가 제목 / 설명 |
| `--ts-on-dark-danger-bg`       | `rgb(226 59 59 / .16)` | `on-dark-danger-bg`       | 외출 불가 박스        |

## 색 — 카테고리 (`CAT_META`)

| 카테고리    | 토큰                   | 값                                                            |
| ----------- | ---------------------- | ------------------------------------------------------------- |
| Food        | `--ts-cat-food`        | gold                                                          |
| Massage     | `--ts-cat-massage`     | lime                                                          |
| Shopping    | `--ts-cat-shopping`    | blue                                                          |
| Rest        | `--ts-cat-rest`        | ink                                                           |
| Beauty      | `--ts-cat-beauty`      | red                                                           |
| Sightseeing | `--ts-cat-sightseeing` | lime ⚠ Massage와 같은 색 (레거시 그대로, 구분 필요 여부 미정) |
| Brand       | `--ts-cat-brand`       | gold-deep                                                     |

지도 전용 색(`ROUTE_COLORS` 8색, `POI_COLORS` 7색)은 지도 기능 데이터라 토큰이 아니라 `features/course`에 둔다(4단계).

## 색 역할 규칙 (코스 지도, 2026-10-16)

**색은 역할 하나에만 쓴다. 구간마다 색을 바꾸지 않는다. 색만으로 의미를 전달하지 않는다**(아이콘·글자·선 모양을 함께). 토큰 이름은 색이 아니라 역할.

| 토큰                   | 역할                    | 값                 | Tailwind          | 함께 쓰는 비색 단서                                                     |
| ---------------------- | ----------------------- | ------------------ | ----------------- | ----------------------------------------------------------------------- |
| `--ts-role-place`      | 내가 고른 장소 핀       | = `--ts-blue`      | `role-place`      | 번호(1·2·3)                                                             |
| `--ts-role-base`       | 호텔(거점) 핀           | = `--ts-gold-deep` | `role-base`       | H 아이콘, "호텔(거점)" 글자                                             |
| `--ts-role-route`      | 이동(선·막대 이동 구간) | `#0E8C84` **임시** | `role-route`      | 수단 아이콘, 선 모양                                                    |
| `--ts-role-route-text` | 이동 칩 글자            | `#0B7A73` **임시** | `role-route-text` | 흰 배경 대비 약 5.2:1 (`#0E8C84`는 약 4.1:1이라 작은 글자에 부족)       |
| `--ts-role-return`     | 복귀 구간·초과·경고     | = `--ts-red`       | `role-return`     | "복귀"·"초과" 글자, 긴 파선, ⚠                                          |
| `--ts-role-prep`       | 준비 구간               | = `--ts-faint`     | `role-prep`       | 막대 아래 "준비 N분"                                                    |
| `--ts-role-stay`       | 체류 구간               | `#7FA8E8`          | `role-stay`       | 막대 아래 "체류 N분" — 금색(호텔)과 겹치지 않게 장소 파랑 계열을 연하게 |
| `--ts-role-spare`      | 여유                    | = `--ts-line`      | `role-spare`      | "여유 N분"                                                              |
| `--ts-role-candidate`  | 아직 안 고른 후보 점    | = `--ts-faint`     | `role-candidate`  | 탭하면 이름                                                             |
| `--ts-role-airport`    | 공항 핀                 | = `--ts-ink`       | `role-airport`    | ✈                                                                       |

**임시**: 청록 두 값은 로고 브랜드 색(A13: 앱 Blue/Gold vs 로고 Teal/Coral)이 정해질 때까지 임시. 로고가 Teal로 정해지면 브랜드 색과 같은 계열이 되므로 역할 색을 다시 검토한다.
**코스 화면 카테고리 배지**: 회색(`bg-muted text-sub`) + 카테고리 아이콘·글자 — 카테고리 색(`--ts-cat-*`)을 쓰지 않는다(다른 화면은 유지).

## 선 스타일 규칙 (코스 지도)

| 토큰(CSS)                                               | 구간               | 두께               | 카카오 `strokeStyle`                                    | 색     |
| ------------------------------------------------------- | ------------------ | ------------------ | ------------------------------------------------------- | ------ |
| `--ts-line-transit-width`                               | 대중교통           | 6px                | `solid`                                                 | route  |
| `--ts-line-taxi-width`                                  | 택시(자동차 경로)  | 4px                | `solid`                                                 | route  |
| `--ts-line-walk-width`                                  | 도보               | 3px                | `shortdot`(작은 점, 촘촘)                               | route  |
| `--ts-line-return-width`                                | 공항 복귀          | 4px                | `longdash`(긴 파선 — 도보 점과 크기·간격이 확실히 다름) | return |
| `--ts-line-selected-boost` / `--ts-line-dimmed-opacity` | 선택 구간 / 나머지 | +2px, 불투명 / 0.3 | —                                                       | —      |

카카오맵 `strokeStyle` 문자열은 CSS로 표현할 수 없어 `src/features/course/map-style.ts`에 같은 이름으로 둔다.

## 그라디언트

| 토큰                | 값                                                                     |
| ------------------- | ---------------------------------------------------------------------- |
| `--ts-grad-primary` | `linear-gradient(135deg, blue, blue-deep)` — 헤더, 주요 버튼, 코스 FAB |

## 반경

| 토큰                | 값    | Tailwind                    | 쓰임                       |
| ------------------- | ----- | --------------------------- | -------------------------- |
| `--ts-radius-sm`    | 10px  | `rounded-sm`                | 경고 박스, 작은 버튼       |
| `--ts-radius-md`    | 12px  | `rounded-md`                | 사진, 보조 버튼            |
| `--ts-radius-lg`    | 14px  | `rounded-lg` (= `--radius`) | 주요 버튼, 입력, 선택 카드 |
| `--ts-radius-xl`    | 18px  | `rounded-xl`                | 카드                       |
| `--ts-radius-sheet` | 20px  | `rounded-2xl`               | 바텀시트 상단              |
| `--ts-radius-hero`  | 22px  | `rounded-3xl`               | 홈 헤더 하단               |
| `--ts-radius-panel` | 26px  | `rounded-t-panel`           | 온보딩 본문 패널 상단      |
| `--ts-radius-pill`  | 999px | `rounded-full`              | 칩, 배지                   |

## 그림자

| 토큰                  | 값                               | Tailwind         | 쓰임                  |
| --------------------- | -------------------------------- | ---------------- | --------------------- |
| `--ts-shadow-card`    | `0 2px 14px rgb(40 70 130/.07)`  | `shadow-card`    | 카드                  |
| `--ts-shadow-primary` | `0 6px 16px rgb(47 123 230/.32)` | `shadow-primary` | 주요 버튼             |
| `--ts-shadow-fab`     | `0 6px 16px rgb(47 123 230/.45)` | `shadow-fab`     | 탭바 가운데 코스 버튼 |
| `--ts-shadow-toast`   | `0 6px 16px rgb(0 0 0/.25)`      | —                | 항공편 변경 배너      |
| `--ts-shadow-device`  | `0 20px 60px rgb(30 50 110/.25)` | —                | 데스크톱 폰 프레임    |

## 타이포그래피

폰트: 시스템 스택(`-apple-system, Segoe UI, Roboto`). 레거시는 font-size를 17종(9~36px) 사용 → 8단계로 수렴(3단계 적용, `index.css` `@theme --text-*`).

| Tailwind          | px   | 역할                       | 레거시 px           | 굵기    |
| ----------------- | ---- | -------------------------- | ------------------- | ------- |
| `text-display-lg` | 36   | 온보딩 외출 가능 시간 숫자 | 36                  | 900     |
| `text-display`    | 28   | 홈 외출 가능 시간 숫자     | 28                  | 900     |
| `text-title`      | 22   | 화면 타이틀                | 21 / 26             | 900     |
| `text-section`    | 16   | 섹션·헤더 제목             | 15 / 16 / 17        | 800     |
| `text-emph`       | 14   | 본문 강조, 주요 버튼       | 13 / 13.5 / 14 / 15 | 700–800 |
| `text-body`       | 12.5 | 본문, 칩                   | 12 / 12.5           | 500–600 |
| `text-caption`    | 11   | 캡션                       | 10.5 / 11 / 11.5    | 500–700 |
| `text-micro`      | 10   | 배지·탭 라벨               | 9 / 10              | 700     |

예외: 탭바 가운데 코스 FAB 라벨 8px(레거시 그대로). `cn()`은 이 이름들을 글자 크기로 인식하도록 설정돼 있다(`src/lib/utils.ts`).

## 레이아웃

| 토큰                                       | 값               | 쓰임                                          |
| ------------------------------------------ | ---------------- | --------------------------------------------- |
| `--ts-app-width`                           | 390px            | 앱 최대 폭(데스크톱에선 폰 프레임 800px 높이) |
| `--ts-nav-height`                          | 66px             | 하단 탭바                                     |
| `--ts-fab-size`                            | 56px             | 가운데 코스 버튼(탭바 위로 22px 돌출)         |
| `--ts-page-x`                              | 16px             | 화면 좌우 패딩                                |
| `--ts-device-bezel` / `--ts-device-radius` | `#101826` / 34px | 데스크톱 폰 프레임 테두리                     |

## 미결 사항

| #   | 내용                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `logo/README.md`의 브랜드 컬러(Teal `#22C9B7`·Coral `#FF6B5E`)와 앱 팔레트(Blue·Gold)가 다르다. 현재 토큰은 **실제 앱에 쓰인 Blue·Gold** 기준. 어느 쪽이 공식 브랜드인지 확인 필요. |
| 2   | 다크 모드: 레거시에 없음. 범위 밖으로 둠.                                                                                                                                           |
| 3   | Massage·Sightseeing 카테고리 색 중복.                                                                                                                                               |

## 변경 이력

| 날짜       | 변경                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 2026-10-16 | 레거시에서 추출해 초안 작성                                                               |
| 2026-10-16 | 3단계: 타이포 8단계 스케일 적용, 폰 프레임 토큰 추가                                      |
| 2026-10-16 | 코스 지도: 색 역할 규칙·선 스타일 규칙 토큰(`--ts-role-*`, `--ts-line-*`) 추가. 청록 임시 |
| 2026-10-16 | 4단계 Time-Safe: 어두운 배경 글자색 6개, 패널 반경 추가                                   |
