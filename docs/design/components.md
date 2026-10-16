# 공통 UI 컴포넌트

> 상태: 초안 · 최종 수정 2026-10-16 · 구현은 3단계

레거시 `app/index.html`에 있는 공통 조각과 이식 대상. 위치는 `src/components/ui/`.

| 레거시 | 새 컴포넌트 | 기반 | 비고 |
|---|---|---|---|
| `Card` | `Card` | shadcn Card | radius-xl, shadow-card |
| `Chip` | `Chip` | shadcn Toggle | active=blue / 기본=tint |
| `PrimaryBtn` | `Button variant="primary"` | shadcn Button | grad-primary, shadow-primary, disabled=disabled 색 |
| (인라인 테두리 버튼) | `Button variant="outline"` | shadcn Button | 1.5px blue 테두리 |
| `SectionHead` | `SectionHeader` | — | 제목·부제·더보기 |
| `Top` | `PageHeader` | — | 뒤로가기 + 제목/부제 |
| `Photo` | `Photo` | — | 이미지 없으면 tint + 아이콘, 좌상단 배지 |
| `Sheet` | `BottomSheet` | shadcn Sheet(Radix Dialog) | max-h 80%, overlay 딤 |
| `Switch` | `Switch` | shadcn Switch | |
| `Info` / `Line` | `KeyValueRow` | — | 좌 라벨 / 우 값 |
| (인라인 배지 다수) | `Badge` | shadcn Badge | success / danger / ad / category 변형 |
| `Brand` | `BrandLogo` | — | 로고 마크 + Time/Stay 워드마크 |
| `QR` | `FakeQR` | — | 데모용 의사 QR (실제 QR 아님) |
| `Nav` / `NavItem` | `app/TabBar` | — | 홈/짐 케어/코스(FAB)/예약/마이 |
| `FlightNotice` | `features/time-safe/FlightNotice` | — | 기능 컴포넌트로 분류 |

## 변경 이력
| 날짜 | 변경 |
|---|---|
| 2026-10-16 | 목록 초안 |
