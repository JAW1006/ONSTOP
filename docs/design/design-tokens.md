# 디자인 토큰

> 상태: 초안 · 최종 수정 2026-10-16
> 코드: [`src/styles/tokens.css`](../../src/styles/tokens.css) · 출처: 레거시 `app/index.html`의 `C` 팔레트와 인라인 스타일

토큰은 2층 구조다.
1. `--ts-*` 브랜드 원시 토큰 — 레거시 `C.*` 이름을 kebab-case로 그대로 옮김
2. shadcn 시맨틱 토큰(`--primary` 등) — 1층을 참조

Tailwind 유틸리티 이름은 3열(`bg-primary`, `text-ink` …).

## 색 — 브랜드
| 토큰 | 값 | Tailwind | 레거시 | 쓰임 |
|---|---|---|---|---|
| `--ts-blue` | `#2F7BE6` | `blue` / `primary` | `C.blue` | 주요 액션, 활성 탭 |
| `--ts-blue-deep` | `#164FAE` | `blue-deep` | `C.blueDeep` | 그라디언트 끝, 강조 숫자 |
| `--ts-ink` | `#153A52` | `ink` / `foreground` | `C.ink` | 본문·제목, Time-Safe 카드 배경 |
| `--ts-gold` | `#F2B134` | `gold` | `C.gold` | "Stay" 워드마크, 체류시간 숫자 |
| `--ts-gold-deep` | `#D9971A` | `gold-deep` | `C.goldDeep` | 제휴 AD 배지 글자 |
| `--ts-red` | `#E23B3B` | `red` / `destructive` | `C.red` | 경고, 복귀 시각, 초과 |
| `--ts-lime` | `#8DBE36` | `lime` | `C.lime` | 실시간 반영 표시 |

## 색 — 표면·텍스트
| 토큰 | 값 | Tailwind | 레거시 | 쓰임 |
|---|---|---|---|---|
| `--ts-bg` | `#F1F5FA` | `background` | `C.bg` | 앱 배경 |
| `--ts-card` | `#FFFFFF` | `card` | `C.card` | 카드 |
| `--ts-tint` | `#EAF1FB` | `tint` / `secondary` | `C.tint` | 칩·선택 배경 |
| `--ts-sub` | `#5E7185` | `sub` / `muted-foreground` | `C.sub` | 보조 텍스트 |
| `--ts-faint` | `#A9B4C4` | `faint` | `C.faint` | 캡션, 비활성 탭 |
| `--ts-line` | `#E3EAF3` | `line` / `border` | `C.line` | 구분선, 테두리 |
| `--ts-backdrop` | `#E6ECF6` | `backdrop` | (인라인) | 폰 프레임 바깥 |

## 색 — 상태 (레거시 인라인 값을 토큰화)
| 토큰 | 값 | Tailwind | 쓰임 |
|---|---|---|---|
| `--ts-success` | `#2E9E5B` | `success` | "실시간", "환승 내 가능", 여유 분 |
| `--ts-success-bg` | `#E7F7EE` | `success-bg` | 위 배지 배경 |
| `--ts-danger-bg` | `#FDECEA` | `danger-bg` | 경고 박스, 짐 케어 배너 |
| `--ts-disabled` | `#C4D2E4` | `disabled` | 비활성 버튼 |
| `--ts-ad-bg` / `--ts-ad-border` | `#FFF3DC` / `#F5D089` | `ad-bg` / `ad-border` | 제휴 AD 배지 |
| `--ts-overlay` | `rgb(16 24 38 / .45)` | — | 바텀시트 딤 |

## 색 — 카테고리 (`CAT_META`)
| 카테고리 | 토큰 | 값 |
|---|---|---|
| Food | `--ts-cat-food` | gold |
| Massage | `--ts-cat-massage` | lime |
| Shopping | `--ts-cat-shopping` | blue |
| Rest | `--ts-cat-rest` | ink |
| Beauty | `--ts-cat-beauty` | red |
| Sightseeing | `--ts-cat-sightseeing` | lime ⚠ Massage와 같은 색 (레거시 그대로, 구분 필요 여부 미정) |
| Brand | `--ts-cat-brand` | gold-deep |

지도 전용 색(`ROUTE_COLORS` 8색, `POI_COLORS` 7색)은 지도 기능 데이터라 토큰이 아니라 `features/course`에 둔다(4단계).

## 그라디언트
| 토큰 | 값 |
|---|---|
| `--ts-grad-primary` | `linear-gradient(135deg, blue, blue-deep)` — 헤더, 주요 버튼, 코스 FAB |

## 반경
| 토큰 | 값 | Tailwind | 쓰임 |
|---|---|---|---|
| `--ts-radius-sm` | 10px | `rounded-sm` | 경고 박스, 작은 버튼 |
| `--ts-radius-md` | 12px | `rounded-md` | 사진, 보조 버튼 |
| `--ts-radius-lg` | 14px | `rounded-lg` (= `--radius`) | 주요 버튼, 입력, 선택 카드 |
| `--ts-radius-xl` | 18px | `rounded-xl` | 카드 |
| `--ts-radius-sheet` | 20px | `rounded-2xl` | 바텀시트 상단 |
| `--ts-radius-hero` | 22px | `rounded-3xl` | 홈 헤더 하단 |
| `--ts-radius-pill` | 999px | `rounded-full` | 칩, 배지 |

## 그림자
| 토큰 | 값 | Tailwind | 쓰임 |
|---|---|---|---|
| `--ts-shadow-card` | `0 2px 14px rgb(40 70 130/.07)` | `shadow-card` | 카드 |
| `--ts-shadow-primary` | `0 6px 16px rgb(47 123 230/.32)` | `shadow-primary` | 주요 버튼 |
| `--ts-shadow-fab` | `0 6px 16px rgb(47 123 230/.45)` | `shadow-fab` | 탭바 가운데 코스 버튼 |
| `--ts-shadow-toast` | `0 6px 16px rgb(0 0 0/.25)` | — | 항공편 변경 배너 |
| `--ts-shadow-device` | `0 20px 60px rgb(30 50 110/.25)` | — | 데스크톱 폰 프레임 |

## 타이포그래피
폰트: 시스템 스택(`-apple-system, Segoe UI, Roboto`). 레거시는 font-size를 17종(9~36px) 사용 → 8단계로 수렴(3단계 적용, `index.css` `@theme --text-*`).

| Tailwind | px | 역할 | 레거시 px | 굵기 |
|---|---|---|---|---|
| `text-display-lg` | 36 | 온보딩 외출 가능 시간 숫자 | 36 | 900 |
| `text-display` | 28 | 홈 외출 가능 시간 숫자 | 28 | 900 |
| `text-title` | 22 | 화면 타이틀 | 21 / 26 | 900 |
| `text-section` | 16 | 섹션·헤더 제목 | 15 / 16 / 17 | 800 |
| `text-emph` | 14 | 본문 강조, 주요 버튼 | 13 / 13.5 / 14 / 15 | 700–800 |
| `text-body` | 12.5 | 본문, 칩 | 12 / 12.5 | 500–600 |
| `text-caption` | 11 | 캡션 | 10.5 / 11 / 11.5 | 500–700 |
| `text-micro` | 10 | 배지·탭 라벨 | 9 / 10 | 700 |

예외: 탭바 가운데 코스 FAB 라벨 8px(레거시 그대로). `cn()`은 이 이름들을 글자 크기로 인식하도록 설정돼 있다(`src/lib/utils.ts`).

## 레이아웃
| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--ts-app-width` | 390px | 앱 최대 폭(데스크톱에선 폰 프레임 800px 높이) |
| `--ts-nav-height` | 66px | 하단 탭바 |
| `--ts-fab-size` | 56px | 가운데 코스 버튼(탭바 위로 22px 돌출) |
| `--ts-page-x` | 16px | 화면 좌우 패딩 |
| `--ts-device-bezel` / `--ts-device-radius` | `#101826` / 34px | 데스크톱 폰 프레임 테두리 |

## 미결 사항
| # | 내용 |
|---|---|
| 1 | `logo/README.md`의 브랜드 컬러(Teal `#22C9B7`·Coral `#FF6B5E`)와 앱 팔레트(Blue·Gold)가 다르다. 현재 토큰은 **실제 앱에 쓰인 Blue·Gold** 기준. 어느 쪽이 공식 브랜드인지 확인 필요. |
| 2 | 다크 모드: 레거시에 없음. 범위 밖으로 둠. |
| 3 | Massage·Sightseeing 카테고리 색 중복. |

## 변경 이력
| 날짜 | 변경 |
|---|---|
| 2026-10-16 | 레거시에서 추출해 초안 작성 |
| 2026-10-16 | 3단계: 타이포 8단계 스케일 적용, 폰 프레임 토큰 추가 |
