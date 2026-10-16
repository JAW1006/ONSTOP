# 공통 UI 컴포넌트

> 상태: 초안 · 최종 수정 2026-10-16 · 구현: 3단계 완료
> 위치: [`src/components/ui/`](../../src/components/ui/) · 견본: 개발 서버 `/dev/ui` · 테스트: [`ui.test.tsx`](../../src/components/ui/ui.test.tsx)

규칙: 비즈니스 로직 없음, 문구는 props 또는 `t()`로만, 색·반경·그림자는 [토큰](design-tokens.md)만.

| 레거시 | 새 컴포넌트 | 파일 | 기반 | 변형 / 비고 |
|---|---|---|---|---|
| `PrimaryBtn` + 테두리 버튼 | `Button` | `button.tsx` | Radix Slot + cva | `variant`: primary(그라디언트) · outline · secondary(틴트) · ghost / `size`: lg(전체 폭) · md · sm · icon. 기본 `type="button"` |
| `Card` | `Card` | `card.tsx` | — | `rounded-xl shadow-card` |
| `Chip` | `Chip` | `chip.tsx` | — | `active` → `aria-pressed` |
| (인라인 배지) | `Badge` | `badge.tsx` | cva | success · danger · ad · info · neutral · solid |
| (카테고리 배지) | `CategoryBadge` | `badge.tsx` | — | `category` → `--ts-cat-*` 배경 |
| `SectionHead` | `SectionHeader` | `section-header.tsx` | — | 더보기 = `common.more` |
| `Top` | `PageHeader` | `page-header.tsx` | — | 뒤로 버튼 `aria-label` = `common.back`(새 키) |
| `Photo` | `Photo` | `photo.tsx` | — | 사진 없으면 `tint` + 아이콘. `tint`는 데이터 값(토큰 아님) |
| `Sheet` | `BottomSheet` | `bottom-sheet.tsx` | Radix Dialog | 폰 프레임 안에 포털(`PortalContainerContext`). Esc·딤·닫기(`common.dismiss`)로 닫힘, 제목 = dialog 이름 |
| `Switch` | `Switch` | `switch.tsx` | Radix Switch | 40×24 |
| `Info` / `Line` | `KeyValueRow` | `key-value-row.tsx` | — | `size` sm(예약 확인) / md(결제 내역), `tone` success |
| `Brand` | `BrandLogo` | `brand-logo.tsx` | — | `onDark` |
| `QR` | `FakeQR` | `fake-qr.tsx` | — | 데모용 의사 QR. 레거시와 같은 시드·식(5단계 비교용으로 보정 안 함) |
| `Nav` / `NavItem` | `TabBar` | `src/app/TabBar.tsx` | react-router `Link` | [app-shell](screens/app-shell.md) |
| `FlightNotice` | (4단계) `features/time-safe` | — | — | 기능 컴포넌트 |

## 레거시와 다른 점
| 항목 | 레거시 | 새 컴포넌트 |
|---|---|---|
| 글자 크기 | 9~36px 17종 | 8단계 스케일로 수렴(예: 주요 버튼 15px → 14px `text-emph`) |
| 접근성 | 아이콘 버튼에 이름 없음, 시트는 div | 뒤로·닫기 `aria-label`, 시트 = dialog, 칩 `aria-pressed`, 탭 `aria-current` |
| 국기 이모지 | — | Windows에서는 국기 대신 "US" 같은 글자로 보인다(레거시와 같음, OS 한계) |

## 변경 이력
| 날짜 | 변경 |
|---|---|
| 2026-10-16 | 목록 초안 |
| 2026-10-16 | 3단계 구현 완료, 파일·변형·테스트 기록 |
